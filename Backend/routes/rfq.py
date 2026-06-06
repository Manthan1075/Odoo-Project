from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_db_connection
from auth_utils import require_role
from datetime import datetime, timedelta
from typing import List, Optional

router = APIRouter(prefix="/rfqs", tags=["rfqs"])

class RFQLineItem(BaseModel):
    item_name: str
    quantity: int
    unit: str

class RFQCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    deadline: str
    line_items: List[RFQLineItem]
    vendor_ids: List[int] = []

class VendorInviteRequest(BaseModel):
    vendor_ids: List[int]

def log_activity(db, user_id, action, module, description):
    cursor = db.cursor()
    cursor.execute("""
    INSERT INTO activity_logs (user_id, action, module, description)
    VALUES (?, ?, ?, ?)
    """, (user_id, action, module, description))
    db.commit()

@router.get("/")
def get_rfqs(status: Optional[str] = None,
             current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM rfqs WHERE 1=1"
    params = []

    if status:
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rfqs = [dict(row) for row in cursor.fetchall()]

    enriched_rfqs = []
    for rfq in rfqs:
        cursor.execute("SELECT COUNT(*) as count FROM rfq_vendors WHERE rfq_id = ?", (rfq['id'],))
        vendor_count = cursor.fetchone()['count']

        cursor.execute("SELECT COUNT(*) as count FROM quotations WHERE rfq_id = ?", (rfq['id'],))
        quotation_count = cursor.fetchone()['count']

        deadline = datetime.strptime(rfq['deadline'], '%Y-%m-%d')
        days_remaining = (deadline - datetime.now()).days
        is_expired = days_remaining < 0

        cursor.execute("SELECT u.first_name, u.last_name FROM users u WHERE u.id = ?", (rfq['created_by'],))
        creator = cursor.fetchone()
        creator_name = f"{creator['first_name']} {creator['last_name']}" if creator else "Unknown"

        rfq['created_by_name'] = creator_name
        rfq['vendor_count'] = vendor_count
        rfq['quotation_count'] = quotation_count
        rfq['is_expired'] = is_expired
        rfq['days_remaining'] = days_remaining

        enriched_rfqs.append(rfq)

    conn.close()
    return enriched_rfqs

@router.post("/")
def create_rfq(req: RFQCreate,
              current_user: dict = Depends(require_role("admin", "procurement_officer"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO rfqs (title, description, category, deadline, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (req.title, req.description, req.category, req.deadline,
          "sent" if req.vendor_ids else "draft", current_user['id']))

    conn.commit()
    rfq_id = cursor.lastrowid

    for item in req.line_items:
        cursor.execute("""
        INSERT INTO rfq_line_items (rfq_id, item_name, quantity, unit)
        VALUES (?, ?, ?, ?)
        """, (rfq_id, item.item_name, item.quantity, item.unit))

    for vendor_id in req.vendor_ids:
        cursor.execute("""
        INSERT INTO rfq_vendors (rfq_id, vendor_id)
        VALUES (?, ?)
        """, (rfq_id, vendor_id))

    conn.commit()

    log_activity(conn, current_user['id'], "create", "rfq",
                f"RFQ created: {req.title}")

    conn.close()

    return {
        "id": rfq_id,
        "title": req.title,
        "status": "sent" if req.vendor_ids else "draft",
        "vendor_count": len(req.vendor_ids)
    }

@router.get("/{rfq_id}")
def get_rfq(rfq_id: int,
            current_user: dict = Depends(require_role("admin", "procurement_officer", "manager", "vendor"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM rfqs WHERE id = ?", (rfq_id,))
    rfq = cursor.fetchone()
    if not rfq:
        conn.close()
        raise HTTPException(status_code=404, detail="RFQ not found")

    rfq_dict = dict(rfq)

    cursor.execute("SELECT * FROM rfq_line_items WHERE rfq_id = ?", (rfq_id,))
    line_items = [dict(row) for row in cursor.fetchall()]

    cursor.execute("""
    SELECT rv.*, v.company_name FROM rfq_vendors rv
    JOIN vendors v ON rv.vendor_id = v.id
    WHERE rv.rfq_id = ?
    """, (rfq_id,))
    vendors = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT COUNT(*) as count FROM quotations WHERE rfq_id = ?", (rfq_id,))
    quotation_count = cursor.fetchone()['count']

    deadline = datetime.strptime(rfq['deadline'], '%Y-%m-%d')
    days_remaining = (deadline - datetime.now()).days
    is_expired = days_remaining < 0

    cursor.execute("SELECT u.first_name, u.last_name FROM users u WHERE u.id = ?", (rfq['created_by'],))
    creator = cursor.fetchone()
    creator_name = f"{creator['first_name']} {creator['last_name']}" if creator else "Unknown"

    conn.close()

    return {
        **rfq_dict,
        "line_items": line_items,
        "vendors": vendors,
        "quotation_count": quotation_count,
        "vendor_count": len(vendors),
        "created_by_name": creator_name,
        "days_remaining": days_remaining,
        "is_expired": is_expired
    }

@router.get("/categories/list")
