# API Changes Quick Reference

## Removed Endpoints

### Vendors
```
❌ PATCH /vendors/{vendor_id}           - REMOVED
❌ DELETE /vendors/{vendor_id}          - REMOVED
```

### RFQs
```
❌ PATCH /rfqs/{rfq_id}                 - REMOVED
❌ POST /rfqs/{rfq_id}/invite           - REMOVED
```

### Purchase Orders
```
❌ PATCH /purchase-orders/{po_id}/status        - REMOVED
❌ GET /purchase-orders/stats/overview          - REMOVED
```

---

## Modified Endpoints

### Auth Register
```
POST /auth/register

BEFORE:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure123",
  "first_name": "John",
  "last_name": "Doe",
  "company_name": "ACME Corp",    ← REMOVED
  "country": "India",
  "address": "123 Main St"
}

AFTER:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure123",
  "first_name": "John",
  "last_name": "Doe",
  "country": "India",
  "address": "123 Main St"
}
```

### Create Vendor
```
POST /vendors/

RESPONSE BEFORE:
{
  "id": 1,
  "company_name": "Tech Solutions",
  "email": "info@techsol.com",
  ...
}

RESPONSE AFTER:
{
  "vendor": {
    "id": 1,
    "company_name": "Tech Solutions",
    "email": "info@techsol.com",
    ...
  },
  "vendors_list": [
    {
      "id": 1,
      "company_name": "Tech Solutions",
      "email": "info@techsol.com",
      "status": "pending",
      ...
    },
    {
      "id": 2,
      "company_name": "Another Vendor",
      ...
    }
  ]
}
```

### Create Quotation
```
POST /rfqs/{rfq_id}/quotations

REQUEST BEFORE:
{
  "items": [...],
  "delivery_days": 7,
  "payment_terms": "30 days",
  "cgst_percent": 9,       ← REMOVED
  "sgst_percent": 9        ← REMOVED
}

REQUEST AFTER:
{
  "items": [...],
  "delivery_days": 7,
  "payment_terms": "30 days",
  "gst_percent": 18        ← NEW (single GST)
}

RESPONSE BEFORE:
{
  "id": 1,
  "subtotal": 50000,
  "cgst_amount": 4500,     ← REMOVED
  "sgst_amount": 4500,     ← REMOVED
  "cgst_percent": 9,       ← REMOVED
  "sgst_percent": 9,       ← REMOVED
  "grand_total": 59000,
  ...
}

RESPONSE AFTER:
{
  "id": 1,
  "subtotal": 50000,
  "gst_amount": 9000,      ← NEW (18% of subtotal)
  "gst_percent": 18,       ← NEW
  "grand_total": 59000,
  ...
}
```

### Compare Quotations
```
GET /rfqs/{rfq_id}/compare

RESPONSE BEFORE:
{
  "quotation_id": 1,
  "vendor_name": "Tech Solutions",
  "grand_total": 59000,
  "cgst_percent": 9,       ← REMOVED
  "sgst_percent": 9,       ← REMOVED
  ...
}

RESPONSE AFTER:
{
  "quotation_id": 1,
  "vendor_name": "Tech Solutions",
  "grand_total": 59000,
  "gst_percent": 18,       ← NEW
  ...
}
```

### Invoice Export (CSV)
```
BEFORE:
PO Number, Vendor, Subtotal, CGST, SGST, Total Amount, Status, Created At
PO-2024-0001, Tech Solutions, 50000, 4500, 4500, 59000, active, 2024-01-15

AFTER:
PO Number, Vendor, Subtotal, GST, Total Amount, Status, Created At
PO-2024-0001, Tech Solutions, 50000, 9000, 59000, active, 2024-01-15
```

---

## Database Schema Changes

### quotations Table
```sql
-- REMOVED COLUMNS
cgst_percent REAL
sgst_percent REAL
cgst_amount REAL
sgst_amount REAL

-- ADDED COLUMNS
gst_percent REAL DEFAULT 18
gst_amount REAL
```

### purchase_orders Table
```sql
-- REMOVED COLUMNS
cgst_amount REAL
sgst_amount REAL

-- ADDED COLUMNS
gst_amount REAL
```

### invoices Table
```sql
-- REMOVED COLUMNS
cgst_amount REAL
sgst_amount REAL

-- ADDED COLUMNS
gst_amount REAL
```

---

## Migration Guide (If Upgrading)

1. **Backup current database**
   ```
   cp vendorbridge.db vendorbridge.db.backup
   ```

2. **Delete old database** (if starting fresh)
   ```
   rm vendorbridge.db
   ```

3. **Restart backend**
   ```
   python main.py
   ```
   The tables will be created with the new schema on startup.

4. **Data Migration** (if you have existing data):
   ```sql
   -- Convert old CGST+SGST to single GST
   UPDATE quotations SET 
     gst_percent = 18,
     gst_amount = (cgst_amount + sgst_amount);
   
   UPDATE purchase_orders SET 
     gst_amount = (cgst_amount + sgst_amount);
   
   UPDATE invoices SET 
     gst_amount = (cgst_amount + sgst_amount);
   ```

---

## Testing Checklist

- [ ] Register new user (verify company_name not required)
- [ ] Create vendor (verify vendors_list returned)
- [ ] Create RFQ (verify no update/invite endpoints exist)
- [ ] Submit quotation (verify using single gst_percent)
- [ ] Compare quotations (verify gst_percent shown, not cgst/sgst)
- [ ] Create PO (verify using gst_amount)
- [ ] Create invoice (verify using gst_amount)
- [ ] Generate PDF invoice (verify GST 18% shown)
- [ ] Export CSV (verify GST column instead of CGST/SGST)
- [ ] Try PATCH vendor (should 404)
- [ ] Try DELETE vendor (should 404)
- [ ] Try PATCH RFQ (should 404)
- [ ] Try POST RFQ invite (should 404)
- [ ] Try PATCH PO status (should 404)
- [ ] Try GET PO stats (should 404)

---

## Error Responses to Expect

```
Before attempting removed operations:

❌ PATCH /vendors/1
Response: 404 Not Found

❌ DELETE /vendors/1
Response: 404 Not Found

❌ PATCH /rfqs/1
Response: 404 Not Found

❌ POST /rfqs/1/invite
Response: 404 Not Found

❌ PATCH /purchase-orders/1/status
Response: 404 Not Found

❌ GET /purchase-orders/stats/overview
Response: 404 Not Found
```

---

**All changes are backward compatible with frontend implementations that use the new endpoints only.**
