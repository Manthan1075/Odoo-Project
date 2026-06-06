from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_db_connection
from auth_utils import require_role
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/purchase-orders", tags=["purchase_orders"])

def log_activity(db, user_id, action, module, description):
    cursor = db.cursor()
    cursor.execute("""
    INSERT INTO activity_logs (user_id, action, module, description)
    VALUES (?, ?, ?, ?)
    """, (user_id, action, module, description))
    db.commit()

@router.get("/")
def get_purchase_orders(status: Optional[str] = None,
                       current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    SELECT po.*, v.company_name as vendor_name, r.title as rfq_title FROM purchase_orders po
    JOIN vendors v ON po.vendor_id = v.id
    JOIN quotations q ON po.quotation_id = q.id
    JOIN rfqs r ON q.rfq_id = r.id
    WHERE 1=1
    """
    params = []

    if status:
        query += " AND po.status = ?"
        params.append(status)

    query += " ORDER BY po.created_at DESC"
    cursor.execute(query, params)

    purchase_orders = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return purchase_orders

@router.get("/{po_id}")
def get_purchase_order(po_id: int,
                      current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT po.*, v.*, r.title as rfq_title, r.description as rfq_description FROM purchase_orders po
    JOIN vendors v ON po.vendor_id = v.id
    JOIN quotations q ON po.quotation_id = q.id
    JOIN rfqs r ON q.rfq_id = r.id
    WHERE po.id = ?
    """, (po_id,))

    po = cursor.fetchone()
    if not po:
        conn.close()
        raise HTTPException(status_code=404, detail="Purchase order not found")

    po_dict = dict(po)

    cursor.execute("SELECT * FROM quotation_items WHERE quotation_id = ?", (po['quotation_id'],))
    items = [dict(row) for row in cursor.fetchall()]
    po_dict['items'] = items

    cursor.execute("""
    SELECT a.* FROM approvals a
    JOIN quotations q ON a.quotation_id = q.id
    WHERE q.id = ?
    ORDER BY a.created_at DESC
    """, (po['quotation_id'],))
    approvals = [dict(row) for row in cursor.fetchall()]
    po_dict['approval_history'] = approvals

    conn.close()

    return po_dict
