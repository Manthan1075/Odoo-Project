from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_db_connection
from auth_utils import require_role
from datetime import datetime
from typing import List, Optional

router = APIRouter(prefix="", tags=["quotations"])

class QuotationItemRequest(BaseModel):
    item_name: str
    quantity: int
    unit_price: float

class QuotationCreateRequest(BaseModel):
    items: List[QuotationItemRequest]
    delivery_days: int
    payment_terms: Optional[str] = None
    notes: Optional[str] = None
    gst_percent: float = 18

def log_activity(db, user_id, action, module, description):
    cursor = db.cursor()
    cursor.execute("""
    INSERT INTO activity_logs (user_id, action, module, description)
    VALUES (?, ?, ?, ?)
    """, (user_id, action, module, description))
    db.commit()

@router.post("/rfqs/{rfq_id}/quotations")
def create_quotation(rfq_id: int, req: QuotationCreateRequest,
                    current_user: dict = Depends(require_role("vendor"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM rfqs WHERE id = ?", (rfq_id,))
    rfq = cursor.fetchone()
    if not rfq:
        conn.close()
        raise HTTPException(status_code=404, detail="RFQ not found")

    if rfq['status'] != 'sent':
        conn.close()
        raise HTTPException(status_code=400, detail="RFQ is not open for quotations")

    deadline = datetime.strptime(rfq['deadline'], '%Y-%m-%d')
    if deadline < datetime.now():
        conn.close()
        raise HTTPException(status_code=400, detail="RFQ deadline has passed")

    cursor.execute("SELECT id FROM vendors WHERE user_id = ?", (current_user['id'],))
    vendor_row = cursor.fetchone()
    if not vendor_row:
        conn.close()
        raise HTTPException(status_code=400, detail="Vendor profile not found")
    vendor_id = vendor_row['id']

    cursor.execute("SELECT id FROM rfq_vendors WHERE rfq_id = ? AND vendor_id = ?", 
                   (rfq_id, vendor_id))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Vendor not invited for this RFQ")

    cursor.execute("SELECT id FROM quotations WHERE rfq_id = ? AND vendor_id = ? AND status != 'rejected'",
                   (rfq_id, vendor_id))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Quotation already submitted for this RFQ")

    subtotal = sum(item.quantity * item.unit_price for item in req.items)
    gst_amount = subtotal * req.gst_percent / 100
    grand_total = subtotal + gst_amount

    cursor.execute("""
    INSERT INTO quotations (rfq_id, vendor_id, delivery_days, payment_terms, notes,
                           gst_percent, subtotal, gst_amount, grand_total, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (rfq_id, vendor_id, req.delivery_days, req.payment_terms, req.notes,
          req.gst_percent, subtotal, gst_amount, grand_total, "submitted"))

    conn.commit()
    quotation_id = cursor.lastrowid

    for item in req.items:
        item_total = item.quantity * item.unit_price
        cursor.execute("""
        INSERT INTO quotation_items (quotation_id, item_name, quantity, unit_price, total)
        VALUES (?, ?, ?, ?, ?)
        """, (quotation_id, item.item_name, item.quantity, item.unit_price, item_total))

    conn.commit()

    cursor.execute("SELECT company_name FROM vendors WHERE id = ?", (vendor_id,))
    vendor_name = cursor.fetchone()['company_name']

    log_activity(conn, current_user['id'], "submit", "quotations",
                f"Quotation submitted for RFQ: {rfq['title']}")

    cursor.execute("""
    SELECT * FROM quotations WHERE id = ?
    """, (quotation_id,))
    quotation = dict(cursor.fetchone())

    cursor.execute("SELECT * FROM quotation_items WHERE quotation_id = ?", (quotation_id,))
    items = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return {
        **quotation,
        "items": items,
        "vendor_name": vendor_name
    }

@router.get("/rfqs/{rfq_id}/quotations")
def get_quotations(rfq_id: int,
                  current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM rfqs WHERE id = ?", (rfq_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="RFQ not found")

    cursor.execute("""
    SELECT q.*, v.company_name as vendor_name FROM quotations q
    JOIN vendors v ON q.vendor_id = v.id
    WHERE q.rfq_id = ?
    ORDER BY q.grand_total ASC
    """, (rfq_id,))
    quotations = [dict(row) for row in cursor.fetchall()]

    for quotation in quotations:
        cursor.execute("SELECT * FROM quotation_items WHERE quotation_id = ?",
                      (quotation['id'],))
        quotation['items'] = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return quotations

@router.get("/rfqs/{rfq_id}/compare")
def compare_quotations(rfq_id: int,
                      current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM rfqs WHERE id = ?", (rfq_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="RFQ not found")

    cursor.execute("""
    SELECT q.*, v.company_name as vendor_name FROM quotations q
    JOIN vendors v ON q.vendor_id = v.id
    WHERE q.rfq_id = ? AND q.status IN ('submitted', 'selected')
    ORDER BY q.grand_total ASC
    """, (rfq_id,))
    quotations = [dict(row) for row in cursor.fetchall()]

    if not quotations:
        conn.close()
        return []

    min_total = quotations[0]['grand_total']

    comparison = []
    for q in quotations:
        comparison.append({
            "quotation_id": q['id'],
            "vendor_name": q['vendor_name'],
            "grand_total": q['grand_total'],
            "gst_percent": q['gst_percent'],
            "delivery_days": q['delivery_days'],
            "vendor_rating": 4.5,
            "payment_terms": q['payment_terms'],
            "is_lowest": q['grand_total'] == min_total
        })

    conn.close()
    return comparison

@router.get("/quotations/{quotation_id}")
def get_quotation(quotation_id: int,
                 current_user: dict = Depends(require_role("admin", "procurement_officer", "manager", "vendor"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT q.*, v.company_name as vendor_name, r.title as rfq_title FROM quotations q
    JOIN vendors v ON q.vendor_id = v.id
    JOIN rfqs r ON q.rfq_id = r.id
    WHERE q.id = ?
    """, (quotation_id,))
    quotation = cursor.fetchone()
    if not quotation:
        conn.close()
        raise HTTPException(status_code=404, detail="Quotation not found")

    quotation_dict = dict(quotation)

    cursor.execute("SELECT * FROM quotation_items WHERE quotation_id = ?", (quotation_id,))
    items = [dict(row) for row in cursor.fetchall()]

    quotation_dict['items'] = items

    conn.close()
    return quotation_dict

@router.post("/quotations/{quotation_id}/select")
def select_quotation(quotation_id: int,
                    current_user: dict = Depends(require_role("admin", "procurement_officer"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM quotations WHERE id = ?", (quotation_id,))
    quotation = cursor.fetchone()
    if not quotation:
        conn.close()
        raise HTTPException(status_code=404, detail="Quotation not found")

    rfq_id = quotation['rfq_id']

    cursor.execute("UPDATE quotations SET status = 'rejected' WHERE rfq_id = ? AND id != ?",
                  (rfq_id, quotation_id))
    cursor.execute("UPDATE quotations SET status = 'selected' WHERE id = ?", (quotation_id,))
    conn.commit()

    cursor.execute("SELECT u.id FROM users u WHERE u.role = 'manager' LIMIT 1")
    manager = cursor.fetchone()
    if not manager:
        cursor.execute("SELECT u.id FROM users u WHERE u.role = 'admin' LIMIT 1")
        manager = cursor.fetchone()

    if manager:
        cursor.execute("""
        INSERT INTO approvals (quotation_id, level, assigned_to, action)
        VALUES (?, ?, ?, ?)
        """, (quotation_id, 1, manager['id'], "pending"))
        conn.commit()
        approval_id = cursor.lastrowid
    else:
        approval_id = None

    cursor.execute("SELECT v.company_name FROM vendors v WHERE v.id = ?", (quotation['vendor_id'],))
    vendor_name = cursor.fetchone()['company_name']

    cursor.execute("SELECT title FROM rfqs WHERE id = ?", (rfq_id,))
    rfq_title = cursor.fetchone()['title']

    log_activity(conn, current_user['id'], "select", "quotations",
                f"Quotation selected - {vendor_name} for {rfq_title}")

    conn.close()

    return {
        "message": "Quotation selected successfully",
        "approval_id": approval_id,
        "quotation_id": quotation_id
    }
