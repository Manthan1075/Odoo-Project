from fastapi import APIRouter, Depends
from database import get_db_connection
from auth_utils import require_role
from typing import Optional

router = APIRouter(prefix="/activity", tags=["activity"])

@router.get("/")
def get_activity_logs(module: Optional[str] = None, limit: int = 50,
                     current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    if limit > 200:
        limit = 200

    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    SELECT al.*, u.first_name, u.last_name FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
    """
    params = []

    if module:
        query += " AND al.module = ?"
        params.append(module)

    query += " ORDER BY al.created_at DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)

    logs = []
    for row in cursor.fetchall():
        row_dict = dict(row)
        row_dict['user_name'] = f"{row['first_name']} {row['last_name']}" if row['first_name'] else "System"
        logs.append(row_dict)

    conn.close()

    return logs

@router.get("/recent")
def get_recent_activity(current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT al.*, u.first_name, u.last_name FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT 10
    """)

    logs = []
    for row in cursor.fetchall():
        row_dict = dict(row)
        row_dict['user_name'] = f"{row['first_name']} {row['last_name']}" if row['first_name'] else "System"
        logs.append(row_dict)

    conn.close()

    return logs
