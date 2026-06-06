from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from database import get_db_connection
from auth_utils import require_role
from datetime import datetime, timedelta
from io import StringIO, BytesIO
import csv

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/overview")
def get_report_overview(current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT SUM(total_amount) as total FROM purchase_orders")
    result = cursor.fetchone()
    total_spend = result['total'] or 0

    cursor.execute("SELECT COUNT(*) as count FROM vendors WHERE status = 'active'")
    active_vendors = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM purchase_orders WHERE status = 'completed'")
    completed = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM purchase_orders")
    total = cursor.fetchone()['count']

    po_fulfillment_percent = (completed / total * 100) if total > 0 else 0

    cursor.execute("""
    SELECT COUNT(*) as count FROM invoices
    WHERE status = 'overdue' AND due_date < date('now')
    """)
    overdue_invoices = cursor.fetchone()['count']

    conn.close()

    return {
        "total_spend": total_spend,
        "active_vendors": active_vendors,
        "po_fulfillment_percent": round(po_fulfillment_percent, 2),
        "overdue_invoices": overdue_invoices
    }

@router.get("/spend-by-category")
def get_spend_by_category(current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT vc.name as category_name, SUM(po.total_amount) as total_spend
    FROM purchase_orders po
    JOIN vendors v ON po.vendor_id = v.id
    JOIN vendor_categories vc ON v.category_id = vc.id
    GROUP BY vc.id, vc.name
    ORDER BY total_spend DESC
    """)

    results = cursor.fetchall()
    total_all = sum(row['total_spend'] for row in results) if results else 0

    spending = []
    for row in results:
        percentage = (row['total_spend'] / total_all * 100) if total_all > 0 else 0
        spending.append({
            "category_name": row['category_name'],
            "total_spend": row['total_spend'],
            "percentage": round(percentage, 2)
        })

    conn.close()
    return spending

@router.get("/top-vendors")
def get_top_vendors(current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT v.company_name as vendor_name, SUM(po.total_amount) as total_spend,
           COUNT(po.id) as po_count
    FROM purchase_orders po
    JOIN vendors v ON po.vendor_id = v.id
    GROUP BY v.id, v.company_name
    ORDER BY total_spend DESC
    LIMIT 10
    """)

    vendors = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return vendors

@router.get("/monthly-trend")
def get_monthly_trend(current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    trend = []
    for i in range(11, -1, -1):
        date = datetime.now() - timedelta(days=30*i)
        month = date.strftime('%Y-%m')
        month_label = date.strftime('%B %Y')

        cursor.execute("""
        SELECT SUM(total_amount) as total FROM purchase_orders
        WHERE strftime('%Y-%m', created_at) = ?
        """, (month,))
        result = cursor.fetchone()
        total = result['total'] or 0

        trend.append({
            "month": month_label,
            "amount": total
        })

    conn.close()
    return trend

@router.get("/export")
def export_report(type: str,
                 current_user: dict = Depends(require_role("admin", "procurement_officer"))):
    valid_types = ["vendors", "pos", "invoices"]
    if type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid export type")

    conn = get_db_connection()
    cursor = conn.cursor()

    output = StringIO()
    writer = csv.writer(output)

    if type == "vendors":
        writer.writerow(["ID", "Company Name", "Contact Person", "Email", "Phone", 
                        "GST Number", "Category", "Country", "Status", "Created At"])

        cursor.execute("""
        SELECT v.id, v.company_name, v.contact_person, v.email, v.phone, v.gst_number,
               vc.name as category, v.country, v.status, v.created_at
        FROM vendors v
        LEFT JOIN vendor_categories vc ON v.category_id = vc.id
        ORDER BY v.created_at DESC
        """)

        for row in cursor.fetchall():
            writer.writerow([row['id'], row['company_name'], row['contact_person'],
                           row['email'], row['phone'], row['gst_number'], row['category'],
                           row['country'], row['status'], row['created_at']])

    elif type == "pos":
        writer.writerow(["PO Number", "Vendor", "Subtotal", "GST", 
                        "Total Amount", "Status", "Created At"])

        cursor.execute("""
        SELECT po.po_number, v.company_name, po.subtotal, po.gst_amount,
               po.total_amount, po.status, po.created_at
        FROM purchase_orders po
        JOIN vendors v ON po.vendor_id = v.id
        ORDER BY po.created_at DESC
        """)

        for row in cursor.fetchall():
            writer.writerow([row['po_number'], row['company_name'], row['subtotal'],
                           row['gst_amount'], row['total_amount'],
                           row['status'], row['created_at']])

    elif type == "invoices":
        writer.writerow(["Invoice Number", "PO Number", "Vendor", "Subtotal", "GST",
                        "Total", "Status", "Due Date", "Created At"])

        cursor.execute("""
        SELECT i.invoice_number, po.po_number, v.company_name, i.subtotal, i.gst_amount,
               i.total, i.status, i.due_date, i.created_at
        FROM invoices i
        JOIN purchase_orders po ON i.po_id = po.id
        JOIN vendors v ON po.vendor_id = v.id
        ORDER BY i.created_at DESC
        """)

        for row in cursor.fetchall():
            writer.writerow([row['invoice_number'], row['po_number'], row['company_name'],
                           row['subtotal'], row['gst_amount'],
                           row['total'], row['status'], row['due_date'], row['created_at']])

    conn.close()

    csv_data = output.getvalue()
    date_str = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"vendorbridge_{type}_{date_str}.csv"

    return FileResponse(
        BytesIO(csv_data.encode()),
        media_type="text/csv",
        filename=filename
    )
