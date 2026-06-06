import sqlite3
from datetime import datetime
import os

DATABASE_PATH = "vendorbridge.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def create_tables():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL CHECK(role IN ('admin','procurement_officer','manager','vendor')),
        country TEXT,
        company_name TEXT,
        address TEXT,
        photo_url TEXT,
        status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive','blocked')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vendor_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vendors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        company_name TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        gst_number TEXT NOT NULL,
        category_id INTEGER REFERENCES vendor_categories(id),
        country TEXT,
        address TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('active','pending','blocked')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rfqs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        deadline DATE NOT NULL,
        status TEXT DEFAULT 'draft' CHECK(status IN ('draft','sent','closed','expired')),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rfq_line_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rfq_id INTEGER REFERENCES rfqs(id) ON DELETE CASCADE,
        item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rfq_vendors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rfq_id INTEGER REFERENCES rfqs(id) ON DELETE CASCADE,
        vendor_id INTEGER REFERENCES vendors(id),
        invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quotations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rfq_id INTEGER REFERENCES rfqs(id),
        vendor_id INTEGER REFERENCES vendors(id),
        delivery_days INTEGER NOT NULL,
        payment_terms TEXT,
        notes TEXT,
        gst_percent REAL DEFAULT 18,
        subtotal REAL NOT NULL,
        gst_amount REAL NOT NULL,
        grand_total REAL NOT NULL,
        status TEXT DEFAULT 'submitted' CHECK(status IN ('draft','submitted','selected','rejected')),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quotation_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quotation_id INTEGER REFERENCES quotations(id) ON DELETE CASCADE,
        item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS approvals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quotation_id INTEGER REFERENCES quotations(id),
        level INTEGER NOT NULL CHECK(level IN (1,2)),
        assigned_to INTEGER REFERENCES users(id),
        action TEXT DEFAULT 'pending' CHECK(action IN ('pending','approved','rejected')),
        remarks TEXT,
        actioned_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS purchase_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        po_number TEXT UNIQUE NOT NULL,
        quotation_id INTEGER REFERENCES quotations(id),
        vendor_id INTEGER REFERENCES vendors(id),
        subtotal REAL NOT NULL,
        gst_amount REAL NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active','completed','cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        po_id INTEGER REFERENCES purchase_orders(id),
        subtotal REAL NOT NULL,
        gst_amount REAL NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'unpaid' CHECK(status IN ('unpaid','paid','overdue')),
        sent_via_email INTEGER DEFAULT 0,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        action TEXT NOT NULL,
        module TEXT NOT NULL CHECK(module IN ('vendors','rfq','quotations','approvals','invoices','purchase_orders','auth')),
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

def init_default_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as count FROM users")
    if cursor.fetchone()['count'] == 0:
        from auth_utils import hash_password
        admin_password = hash_password("admin123")
        cursor.execute("""
        INSERT INTO users (username, first_name, last_name, email, password_hash, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, ("admin", "Admin", "User", "admin@vendorbridge.com", admin_password, "admin", "active"))

    cursor.execute("SELECT COUNT(*) as count FROM vendor_categories")
    if cursor.fetchone()['count'] == 0:
        categories = ["IT", "Logistics", "Furniture", "Construction", "Stationery"]
        for cat in categories:
            cursor.execute("INSERT INTO vendor_categories (name) VALUES (?)", (cat,))

    conn.commit()
    conn.close()
