from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_db_connection
from auth_utils import require_role, validate_email, validate_phone, validate_gst
from typing import Optional, List

router = APIRouter(prefix="/vendors", tags=["vendors"])

class VendorCreate(BaseModel):
    company_name: str
    contact_person: str
    email: str
    phone: str
    gst_number: str
    category_id: int
    country: str = None
    address: str = None

class CategoryCreate(BaseModel):
    name: str

def log_activity(db, user_id, action, module, description):
    cursor = db.cursor()
    cursor.execute("""
    INSERT INTO activity_logs (user_id, action, module, description)
    VALUES (?, ?, ?, ?)
    """, (user_id, action, module, description))
    db.commit()

@router.get("/")
def get_vendors(status: Optional[str] = None, search: Optional[str] = None, 
                current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    SELECT v.*, vc.name as category_name FROM vendors v
    LEFT JOIN vendor_categories vc ON v.category_id = vc.id
    WHERE 1=1
    """
    params = []

    if status:
        query += " AND v.status = ?"
        params.append(status)
    
    if search:
        search_term = f"%{search}%"
        query += " AND (v.company_name LIKE ? OR v.gst_number LIKE ? OR vc.name LIKE ?)"
        params.extend([search_term, search_term, search_term])

    cursor.execute(query, params)
    vendors = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT COUNT(*) as count FROM vendors")
    total = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM vendors WHERE status = 'active'")
    active = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM vendors WHERE status = 'pending'")
    pending = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM vendors WHERE status = 'blocked'")
    blocked = cursor.fetchone()['count']

    conn.close()

    return {
        "vendors": vendors,
        "counts": {
            "total": total,
            "active": active,
            "pending": pending,
            "blocked": blocked
        }
    }

@router.post("/")
def create_vendor(req: VendorCreate, 
                  current_user: dict = Depends(require_role("admin"))):
    if not validate_email(req.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    if not validate_phone(req.phone):
        raise HTTPException(status_code=400, detail="Phone must be 10 digits")
    
    if not validate_gst(req.gst_number):
        raise HTTPException(status_code=400, detail="GST number must be 15 characters")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM vendors WHERE email = ?", (req.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=409, detail="Email already registered")

    cursor.execute("""
    INSERT INTO vendors (company_name, contact_person, email, phone, gst_number,
                         category_id, country, address, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (req.company_name, req.contact_person, req.email, req.phone, req.gst_number,
          req.category_id, req.country, req.address, "pending"))
    
    conn.commit()
    vendor_id = cursor.lastrowid
    
    log_activity(conn, current_user['id'], "create", "vendors", 
                f"Vendor created: {req.company_name}")
    
    cursor.execute("""
    SELECT v.*, vc.name as category_name FROM vendors v
    LEFT JOIN vendor_categories vc ON v.category_id = vc.id
    WHERE v.id = ?
    """, (vendor_id,))
    vendor = dict(cursor.fetchone())
    
    # Get all vendors list with ids
    cursor.execute("""
    SELECT v.id, v.company_name, v.contact_person, v.email, v.phone, 
           v.gst_number, v.status, vc.name as category_name 
    FROM vendors v
    LEFT JOIN vendor_categories vc ON v.category_id = vc.id
    ORDER BY v.id
    """)
    vendors_list = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return {
        "vendor": vendor,
        "vendors_list": vendors_list
    }

@router.get("/{vendor_id}")
def get_vendor(vendor_id: int,
               current_user: dict = Depends(require_role("admin", "procurement_officer", "manager"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT v.*, vc.name as category_name FROM vendors v
    LEFT JOIN vendor_categories vc ON v.category_id = vc.id
    WHERE v.id = ?
    """, (vendor_id,))
    vendor = cursor.fetchone()
    conn.close()

    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    return dict(vendor)

@router.get("/categories/list")
def get_categories(current_user: dict = Depends(require_role("admin", "procurement_officer", "manager", "vendor"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM vendor_categories ORDER BY name")
    categories = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return categories

@router.post("/categories/create")
def create_category(req: CategoryCreate,
                   current_user: dict = Depends(require_role("admin"))):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM vendor_categories WHERE name = ?", (req.name,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=409, detail="Category already exists")

    cursor.execute("INSERT INTO vendor_categories (name) VALUES (?)", (req.name,))
    conn.commit()
    category_id = cursor.lastrowid

    log_activity(conn, current_user['id'], "create", "vendors",
                f"Category created: {req.name}")

    cursor.execute("SELECT * FROM vendor_categories WHERE id = ?", (category_id,))
    category = dict(cursor.fetchone())
    conn.close()

    return category
