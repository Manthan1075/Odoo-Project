from fastapi import APIRouter, Depends
from database import get_db_connection
from auth_utils import require_role
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as count FROM rfqs WHERE status IN ('draft', 'sent')")
    active_rfqs = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM approvals WHERE action = 'pending'")
    pending_approvals = cursor.fetchone()['count']

    cursor.execute("""
    SELECT SUM(total_amount) as total FROM purchase_orders
    WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    """)
    result = cursor.fetchone()
    po_value_this_month = result['total'] or 0

    cursor.execute("""
    SELECT COUNT(*) as count FROM invoices
    WHERE status = 'overdue' AND due_date < date('now')
    """)
    overdue_invoices = cursor.fetchone()['count']

    conn.close()

    return {
        "active_rfqs": active_rfqs,
        "pending_approvals": pending_approvals,
        "po_value_this_month": po_value_this_month,
        "overdue_invoices": overdue_invoices
    }

@router.get("/recent-pos")
def get_recent_pos(current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT po.id, po.po_number, po.total_amount, po.status, v.company_name
    FROM purchase_orders po
    JOIN vendors v ON po.vendor_id = v.id
    ORDER BY po.created_at DESC
    LIMIT 5
    """)

    pos = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return pos

@router.get("/spending-trend")
def get_spending_trend(current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    trend = []
    for i in range(5, -1, -1):
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

@router.get("/quick-stats")
def get_quick_stats(current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as count FROM vendors")
    total_vendors = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM vendors WHERE status = 'active'")
    active_vendors = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM rfqs")
    total_rfqs = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM invoices")
    total_invoices = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM invoices WHERE status = 'paid'")
    paid_invoices = cursor.fetchone()['count']

    conn.close()

    return {
        "total_vendors": total_vendors,
        "active_vendors": active_vendors,
        "total_rfqs": total_rfqs,
        "total_invoices": total_invoices,
        "paid_invoices": paid_invoices
    }
