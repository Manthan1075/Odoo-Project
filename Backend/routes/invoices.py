from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from database import get_db_connection
from auth_utils import require_role, validate_email
from utils.auto_number import generate_invoice_number
from utils.pdf_generator import generate_invoice_pdf
from utils.email_sender import send_invoice_email
from datetime import datetime, timedelta
from io import BytesIO
from typing import Optional

router = APIRouter(prefix="/invoices", tags=["invoices"])

class InvoiceCreate(BaseModel):
    po_id: int

class InvoiceStatusUpdate(BaseModel):
    status: str

class InvoiceEmailRequest(BaseModel):
    recipient_email: str

def log_activity(db, user_id, action, module, description):
    cursor = db.cursor()
    cursor.execute("""
    INSERT INTO activity_logs (user_id, action, module, description)
    VALUES (?, ?, ?, ?)
    """, (user_id, action, module, description))
    db.commit()

@router.post("/")
def create_invoice(req: InvoiceCreate,
                  current_user: dict = Depends(require_role("admin", "procurement_officer"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM purchase_orders WHERE id = ?", (req.po_id,))
    po = cursor.fetchone()
    if not po:
        conn.close()
        raise HTTPException(status_code=404, detail="Purchase order not found")

    invoice_number = generate_invoice_number(conn)
    due_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')

    cursor.execute("""
    INSERT INTO invoices (invoice_number, po_id, subtotal, gst_amount,
                         total, status, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (invoice_number, req.po_id, po['subtotal'], po['gst_amount'], 
          po['total_amount'], "unpaid", due_date))

    conn.commit()
    invoice_id = cursor.lastrowid

    cursor.execute("SELECT company_name FROM vendors WHERE id = ?", (po['vendor_id'],))
    vendor_name = cursor.fetchone()['company_name']

    log_activity(conn, current_user['id'], "create", "invoices",
                f"Invoice created: {invoice_number} for PO: {po['po_number']}")

    cursor.execute("""
    SELECT i.*, po.po_number, v.company_name FROM invoices i
    JOIN purchase_orders po ON i.po_id = po.id
    JOIN vendors v ON po.vendor_id = v.id
    WHERE i.id = ?
    """, (invoice_id,))
    invoice = dict(cursor.fetchone())
    conn.close()

    return invoice

@router.get("/")
def get_invoices(status: Optional[str] = None,
                current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    SELECT i.*, po.po_number, v.company_name FROM invoices i
    JOIN purchase_orders po ON i.po_id = po.id
    JOIN vendors v ON po.vendor_id = v.id
    WHERE 1=1
    """
    params = []

    if status:
        query += " AND i.status = ?"
        params.append(status)

    query += " ORDER BY i.created_at DESC"
    cursor.execute(query, params)

    invoices = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return invoices

@router.get("/{invoice_id}")
def get_invoice(invoice_id: int,
               current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT i.*, po.*, v.*, r.title as rfq_title FROM invoices i
    JOIN purchase_orders po ON i.po_id = po.id
    JOIN vendors v ON po.vendor_id = v.id
    JOIN quotations q ON po.quotation_id = q.id
    JOIN rfqs r ON q.rfq_id = r.id
    WHERE i.id = ?
    """, (invoice_id,))

    invoice = cursor.fetchone()
    if not invoice:
        conn.close()
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice_dict = dict(invoice)

    cursor.execute("SELECT * FROM quotation_items WHERE quotation_id = ?",
                  (invoice['quotation_id'],))
    items = [dict(row) for row in cursor.fetchall()]
    invoice_dict['items'] = items

    conn.close()
    return invoice_dict

@router.patch("/{invoice_id}/status")
def update_invoice_status(invoice_id: int, req: InvoiceStatusUpdate,
                         current_user: dict = Depends(require_role("admin"))):
    valid_statuses = ["unpaid", "paid", "overdue"]
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,))
    invoice = cursor.fetchone()
    if not invoice:
        conn.close()
        raise HTTPException(status_code=404, detail="Invoice not found")

    cursor.execute("UPDATE invoices SET status = ? WHERE id = ?", (req.status, invoice_id))
    conn.commit()

    log_activity(conn, current_user['id'], "update", "invoices",
                f"Invoice status updated: {invoice['invoice_number']} → {req.status}")

    cursor.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,))
    updated_invoice = dict(cursor.fetchone())
    conn.close()

    return updated_invoice

@router.get("/{invoice_id}/pdf")
def get_invoice_pdf(invoice_id: int,
                   current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT i.*, po.*, v.*, r.title as rfq_title FROM invoices i
    JOIN purchase_orders po ON i.po_id = po.id
    JOIN vendors v ON po.vendor_id = v.id
    JOIN quotations q ON po.quotation_id = q.id
    JOIN rfqs r ON q.rfq_id = r.id
    WHERE i.id = ?
    """, (invoice_id,))

    invoice = cursor.fetchone()
    if not invoice:
        conn.close()
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice_dict = dict(invoice)

    cursor.execute("SELECT * FROM quotation_items WHERE quotation_id = ?",
                  (invoice['quotation_id'],))
    items = [dict(row) for row in cursor.fetchall()]
    invoice_dict['items'] = items

    conn.close()

    pdf_bytes = generate_invoice_pdf(invoice_dict)

    return FileResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        filename=f"Invoice_{invoice_dict['invoice_number']}.pdf"
    )

@router.post("/{invoice_id}/send-email")
def send_invoice_by_email(invoice_id: int, req: InvoiceEmailRequest,
                         current_user: dict = Depends(require_role("admin", "procurement_officer"))):
    if not validate_email(req.recipient_email):
        raise HTTPException(status_code=400, detail="Invalid email address")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT i.*, po.*, v.* FROM invoices i
    JOIN purchase_orders po ON i.po_id = po.id
    JOIN vendors v ON po.vendor_id = v.id
    WHERE i.id = ?
    """, (invoice_id,))

    invoice = cursor.fetchone()
    if not invoice:
        conn.close()
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice_dict = dict(invoice)

    cursor.execute("SELECT * FROM quotation_items WHERE quotation_id = ?",
                  (invoice['quotation_id'],))
    items = [dict(row) for row in cursor.fetchall()]
    invoice_dict['items'] = items

    pdf_bytes = generate_invoice_pdf(invoice_dict)

    try:
        send_invoice_email(
            req.recipient_email,
            invoice['invoice_number'],
            invoice['total'],
            invoice['due_date'],
            pdf_bytes
        )
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    cursor.execute("UPDATE invoices SET sent_via_email = 1 WHERE id = ?", (invoice_id,))
    conn.commit()

    log_activity(conn, current_user['id'], "send", "invoices",
                f"Invoice sent via email: {invoice['invoice_number']} to {req.recipient_email}")

    conn.close()

    return {
        "message": "Invoice sent successfully",
        "invoice_number": invoice['invoice_number'],
        "recipient": req.recipient_email
    }
