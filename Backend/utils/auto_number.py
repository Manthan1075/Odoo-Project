from datetime import datetime

def generate_po_number(db):
    cursor = db.cursor()
    
    current_year = datetime.now().year % 100
    
    cursor.execute("""
    SELECT po_number FROM purchase_orders
    WHERE po_number LIKE ?
    ORDER BY id DESC
    LIMIT 1
    """, (f"PO-{current_year}-%",))
    
    last_po = cursor.fetchone()
    
    if last_po:
        last_number_str = last_po['po_number'].split('-')[-1]
        last_number = int(last_number_str)
        next_number = last_number + 1
    else:
        next_number = 1
    
    po_number = f"PO-{current_year}-{str(next_number).zfill(4)}"
    return po_number

def generate_invoice_number(db):
    cursor = db.cursor()
    
    current_year = datetime.now().year % 100
    
    cursor.execute("""
    SELECT invoice_number FROM invoices
    WHERE invoice_number LIKE ?
    ORDER BY id DESC
    LIMIT 1
    """, (f"INV-{current_year}-%",))
    
    last_invoice = cursor.fetchone()
    
    if last_invoice:
        last_number_str = last_invoice['invoice_number'].split('-')[-1]
        last_number = int(last_number_str)
        next_number = last_number + 1
    else:
        next_number = 1
    
    invoice_number = f"INV-{current_year}-{str(next_number).zfill(4)}"
    return invoice_number
