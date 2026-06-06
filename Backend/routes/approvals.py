from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_db_connection
from auth_utils import require_role
from utils.auto_number import generate_po_number
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/approvals", tags=["approvals"])

class ApprovalAction(BaseModel):
    remarks: Optional[str] = None

class ApprovalReject(BaseModel):
    remarks: str

def log_activity(db, user_id, action, module, description):
    cursor = db.cursor()
    cursor.execute("""
    INSERT INTO activity_logs (user_id, action, module, description)
    VALUES (?, ?, ?, ?)
    """, (user_id, action, module, description))
    db.commit()

def generate_po(conn, quotation_id, current_user):
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM quotations WHERE id = ?", (quotation_id,))
    quotation = cursor.fetchone()

    cursor.execute("SELECT * FROM rfqs WHERE id = ?", (quotation['rfq_id'],))
    rfq = cursor.fetchone()

    po_number = generate_po_number(conn)

    cursor.execute("""
    INSERT INTO purchase_orders (po_number, quotation_id, vendor_id, subtotal,
                                gst_amount, total_amount, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (po_number, quotation_id, quotation['vendor_id'], quotation['subtotal'],
          quotation['gst_amount'], quotation['grand_total'], "active"))

    conn.commit()

    cursor.execute("SELECT company_name FROM vendors WHERE id = ?", (quotation['vendor_id'],))
    vendor_name = cursor.fetchone()['company_name']

    log_activity(conn, current_user['id'], "create", "purchase_orders",
                f"PO generated: {po_number} for {vendor_name} - {rfq['title']}")

    return po_number

@router.get("/pending")
def get_pending_approvals(current_user: dict = Depends(require_role("admin", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT a.*, q.*, v.company_name, r.title as rfq_title FROM approvals a
    JOIN quotations q ON a.quotation_id = q.id
    JOIN vendors v ON q.vendor_id = v.id
    JOIN rfqs r ON q.rfq_id = r.id
    WHERE a.assigned_to = ? AND a.action = 'pending'
    ORDER BY a.created_at DESC
    """, (current_user['id'],))

    approvals = []
    for row in cursor.fetchall():
        approval_dict = {
            'id': row['id'],
            'quotation_id': row['quotation_id'],
            'level': row['level'],
            'action': row['action'],
            'remarks': row['remarks'],
            'created_at': row['created_at'],
            'quotation': {
                'id': row['id'],
                'rfq_id': row['rfq_id'],
                'vendor_id': row['vendor_id'],
                'grand_total': row['grand_total'],
                'subtotal': row['subtotal'],
                'gst_amount': row['gst_amount'],
                'delivery_days': row['delivery_days'],
                'payment_terms': row['payment_terms'],
                'status': row['status']
            },
            'vendor_name': row['company_name'],
            'rfq_title': row['rfq_title']
        }
        approvals.append(approval_dict)

    conn.close()
    return approvals

@router.get("/all")
def get_all_approvals(current_user: dict = Depends(require_role("admin", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT a.*, q.*, v.company_name, r.title as rfq_title, u.first_name, u.last_name FROM approvals a
    JOIN quotations q ON a.quotation_id = q.id
    JOIN vendors v ON q.vendor_id = v.id
    JOIN rfqs r ON q.rfq_id = r.id
    JOIN users u ON a.assigned_to = u.id
    WHERE a.assigned_to = ? OR ? = 1
    ORDER BY a.created_at DESC
    """, (current_user['id'], 1 if current_user['role'] == 'admin' else 0))

    approvals = []
    for row in cursor.fetchall():
        approval_dict = {
            'id': row['id'],
            'quotation_id': row['quotation_id'],
            'level': row['level'],
            'action': row['action'],
            'remarks': row['remarks'],
            'created_at': row['created_at'],
            'actioned_at': row['actioned_at'],
            'assigned_to_name': f"{row['first_name']} {row['last_name']}",
            'quotation': {
                'grand_total': row['grand_total'],
                'subtotal': row['subtotal'],
                'delivery_days': row['delivery_days']
            },
            'vendor_name': row['company_name'],
            'rfq_title': row['rfq_title']
        }
        approvals.append(approval_dict)

    conn.close()
    return approvals

@router.post("/{quotation_id}/approve")
def approve_quotation(quotation_id: int, req: ApprovalAction,
                     current_user: dict = Depends(require_role("admin", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM quotations WHERE id = ?", (quotation_id,))
    quotation = cursor.fetchone()
    if not quotation:
        conn.close()
        raise HTTPException(status_code=404, detail="Quotation not found")

    cursor.execute("SELECT * FROM approvals WHERE quotation_id = ? AND assigned_to = ?",
                  (quotation_id, current_user['id']))
    approval = cursor.fetchone()
    if not approval:
        conn.close()
        raise HTTPException(status_code=403, detail="Not assigned to this approval")

    cursor.execute("UPDATE approvals SET action = 'approved', remarks = ?, actioned_at = CURRENT_TIMESTAMP WHERE id = ?",
                  (req.remarks, approval['id']))
    conn.commit()

    if approval['level'] == 1 and quotation['grand_total'] > 100000:
        cursor.execute("SELECT u.id FROM users u WHERE u.role = 'admin' LIMIT 1")
        admin = cursor.fetchone()
        if admin:
            cursor.execute("""
            INSERT INTO approvals (quotation_id, level, assigned_to, action)
            VALUES (?, ?, ?, ?)
            """, (quotation_id, 2, admin['id'], "pending"))
            conn.commit()
            log_activity(conn, current_user['id'], "approve", "approvals",
                        f"Level 1 approval granted - Level 2 required for amount: {quotation['grand_total']}")
            conn.close()
            return {
                "status": "L2_required",
                "message": "Level 2 approval required for amount exceeding 100000"
            }
    
    po_number = generate_po(conn, quotation_id, current_user)
    conn.close()

    return {
        "status": "po_generated",
        "po_number": po_number,
        "message": "Purchase order generated successfully"
    }

@router.post("/{quotation_id}/reject")
def reject_quotation(quotation_id: int, req: ApprovalReject,
                    current_user: dict = Depends(require_role("admin", "manager"))):
    if not req.remarks or len(req.remarks.strip()) == 0:
        raise HTTPException(status_code=400, detail="Remarks are required for rejection")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM quotations WHERE id = ?", (quotation_id,))
    quotation = cursor.fetchone()
    if not quotation:
        conn.close()
        raise HTTPException(status_code=404, detail="Quotation not found")

    cursor.execute("SELECT * FROM approvals WHERE quotation_id = ? AND assigned_to = ?",
                  (quotation_id, current_user['id']))
    approval = cursor.fetchone()
    if not approval:
        conn.close()
        raise HTTPException(status_code=403, detail="Not assigned to this approval")

    cursor.execute("UPDATE approvals SET action = 'rejected', remarks = ?, actioned_at = CURRENT_TIMESTAMP WHERE id = ?",
                  (req.remarks, approval['id']))
    cursor.execute("UPDATE quotations SET status = 'rejected' WHERE id = ?", (quotation_id,))
    conn.commit()

    cursor.execute("SELECT title FROM rfqs WHERE id = ?", (quotation['rfq_id'],))
    rfq_title = cursor.fetchone()['title']

    cursor.execute("SELECT company_name FROM vendors WHERE id = ?", (quotation['vendor_id'],))
    vendor_name = cursor.fetchone()['company_name']

    log_activity(conn, current_user['id'], "reject", "approvals",
                f"Quotation rejected for {vendor_name} - {rfq_title}. Reason: {req.remarks}")

    conn.close()

    return {
        "status": "rejected",
        "message": "Quotation rejected successfully"
    }
