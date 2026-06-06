# VendorBridge ERP - Procurement & Vendor Management System

A complete, production-ready FastAPI backend for enterprise-grade procurement and vendor management.

## Features

- **User Management**: Role-based access control (Admin, Procurement Officer, Manager, Vendor)
- **Vendor Management**: Complete vendor lifecycle management with categorization
- **RFQ (Request for Quotation)**: Create and manage RFQs with multiple line items
- **Quotations**: Vendors submit quotations with automatic tax calculations
- **Approval Workflow**: Multi-level approval system for quotations
- **Purchase Orders**: Automatic PO generation with unique numbering
- **Invoicing**: Invoice generation with PDF export and email delivery
- **Dashboard**: Real-time analytics and business intelligence
- **Activity Logging**: Complete audit trail (write-once, never delete)
- **Reports**: Comprehensive spending analysis and CSV exports

## Tech Stack

- **Framework**: FastAPI
- **Database**: SQLite3 (native)
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **PDF Generation**: ReportLab
- **Email**: smtplib (native)
- **CSV Export**: csv module (native)

## Installation

### Prerequisites
- Python 3.8+
- pip

### Setup Steps

1. **Clone/Extract the project**
   ```bash
   cd vendorbridge
   ```

2. **Create virtual environment (optional but recommended)**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Email (Optional)**
   Edit `utils/email_sender.py` and replace:
   - `SENDER_EMAIL`: Your Gmail address
   - `SENDER_PASSWORD`: Your Gmail app password

5. **Run the application**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

6. **Access the API**
   - API Docs: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc
   - Health Check: http://localhost:8000/health

## Default Admin Account

- **Email**: admin@vendorbridge.com
- **Password**: admin123
- **Role**: Admin
- **Status**: Active

## Database

The system automatically creates all tables on first run using SQLite. The database file `vendorbridge.db` is created in the project root.

### Tables Created
- users
- vendor_categories
- vendors
- rfqs
- rfq_line_items
- rfq_vendors
- quotations
- quotation_items
- approvals
- purchase_orders
- invoices
- activity_logs

## API Endpoints Summary

### Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user profile

### Vendors (`/vendors`)
- `GET /vendors` - List all vendors with filtering
- `POST /vendors` - Create vendor (Admin only)
- `GET /vendors/{id}` - Get vendor details
- `PATCH /vendors/{id}` - Update vendor (Admin only)
- `DELETE /vendors/{id}` - Block vendor (soft delete)
- `GET /vendors/categories/list` - List all categories
- `POST /vendors/categories/create` - Create category (Admin only)

### RFQs (`/rfqs`)
- `GET /rfqs` - List RFQs with stats
- `POST /rfqs` - Create RFQ with line items
- `GET /rfqs/{id}` - Get RFQ details
- `PATCH /rfqs/{id}` - Update RFQ
- `POST /rfqs/{id}/invite` - Invite vendors to RFQ

### Quotations
- `POST /rfqs/{rfq_id}/quotations` - Submit quotation (Vendor only)
- `GET /rfqs/{rfq_id}/quotations` - View RFQ quotations
- `GET /rfqs/{rfq_id}/compare` - Compare quotations
- `GET /quotations/{id}` - Get quotation details
- `POST /quotations/{id}/select` - Select quotation

### Approvals (`/approvals`)
- `GET /approvals/pending` - Get pending approvals
- `GET /approvals/all` - Get all approvals
- `POST /approvals/{quotation_id}/approve` - Approve quotation
- `POST /approvals/{quotation_id}/reject` - Reject quotation

### Purchase Orders (`/purchase-orders`)
- `GET /purchase-orders` - List all POs
- `GET /purchase-orders/{id}` - Get PO details
- `PATCH /purchase-orders/{id}/status` - Update PO status
- `GET /purchase-orders/stats/overview` - PO statistics

### Invoices (`/invoices`)
- `POST /invoices` - Create invoice from PO
- `GET /invoices` - List all invoices
- `GET /invoices/{id}` - Get invoice details
- `PATCH /invoices/{id}/status` - Update invoice status
- `GET /invoices/{id}/pdf` - Download invoice PDF
- `POST /invoices/{id}/send-email` - Send invoice via email

### Dashboard (`/dashboard`)
- `GET /dashboard/stats` - Dashboard statistics
- `GET /dashboard/recent-pos` - Last 5 POs
- `GET /dashboard/spending-trend` - 6-month spending trend
- `GET /dashboard/quick-stats` - Quick statistics

### Activity (`/activity`)
- `GET /activity` - Get activity logs with filtering
- `GET /activity/recent` - Get last 10 activities

### Reports (`/reports`)
- `GET /reports/overview` - Spending overview
- `GET /reports/spend-by-category` - Category-wise spending
- `GET /reports/top-vendors` - Top 10 vendors by spend
- `GET /reports/monthly-trend` - 12-month trend
- `GET /reports/export` - Export data as CSV

## Workflow Example

### 1. User Registration & Login
```bash
# Register
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "proc_officer",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@company.com",
    "password": "secure123",
    "role": "procurement_officer",
    "phone": "9876543210"
  }'

# Login
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@company.com",
    "password": "secure123"
  }'
```

### 2. Create Vendor (Admin)
```bash
curl -X POST "http://localhost:8000/vendors/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Tech Supplies Inc",
    "contact_person": "Alice",
    "email": "alice@techsupplies.com",
    "phone": "9876543210",
    "gst_number": "123456789012345",
    "category_id": 1,
    "country": "India",
    "address": "Mumbai"
  }'
```

### 3. Create RFQ (Procurement Officer)
```bash
curl -X POST "http://localhost:8000/rfqs/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Office Supplies Procurement",
    "description": "Monthly office supplies",
    "category": "Stationery",
    "deadline": "2024-01-15",
    "line_items": [
      {"item_name": "Paper A4", "quantity": 100, "unit": "reams"},
      {"item_name": "Pens", "quantity": 500, "unit": "pieces"}
    ],
    "vendor_ids": [1, 2]
  }'
```

### 4. Submit Quotation (Vendor)
```bash
curl -X POST "http://localhost:8000/rfqs/1/quotations" \
  -H "Authorization: Bearer VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"item_name": "Paper A4", "quantity": 100, "unit_price": 250},
      {"item_name": "Pens", "quantity": 500, "unit_price": 10}
    ],
    "delivery_days": 5,
    "payment_terms": "Net 30",
    "notes": "Bulk discount available",
    "cgst_percent": 9,
    "sgst_percent": 9
  }'
```

### 5. Select Quotation (Procurement Officer)
```bash
curl -X POST "http://localhost:8000/quotations/1/select" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Approve Quotation (Manager)
```bash
curl -X POST "http://localhost:8000/approvals/1/approve" \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"remarks": "Approved for procurement"}'
```

### 7. Create Invoice (Procurement Officer)
```bash
curl -X POST "http://localhost:8000/invoices/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"po_id": 1}'
```

### 8. Send Invoice via Email
```bash
curl -X POST "http://localhost:8000/invoices/1/send-email" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient_email": "alice@techsupplies.com"}'
```

## Security Features

- **JWT Authentication**: Secure token-based auth with 24-hour expiry
- **Password Hashing**: bcrypt with automatic salting
- **Role-Based Access Control**: Fine-grained permissions per endpoint
- **Activity Logging**: Complete audit trail (immutable)
- **Input Validation**: Email, phone, GST number, username validation
- **SQL Injection Prevention**: Parameterized queries throughout
- **CORS Enabled**: For frontend integration

## Important Rules

1. **Activity Logs**: NEVER updated or deleted (write-once principle)
2. **Soft Delete**: Vendors are blocked, not permanently deleted
3. **Tax Calculation**: Automatic (9% CGST + 9% SGST by default)
4. **Approval Flow**:
   - Amount ≤ ₹100,000: L1 approval → PO generation
   - Amount > ₹100,000: L1 approval → L2 approval → PO generation
5. **Email Configuration**: Update credentials in `utils/email_sender.py`
6. **Database**: Auto-initialized with default categories and admin user

## Error Handling

All endpoints return proper HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate email/username)
- `500`: Server Error

## Performance Considerations

- SQLite is suitable for small to medium deployments (<1M records)
- For large-scale deployment, migrate to PostgreSQL
- Database connections are properly closed after each request
- Activity logs can be archived periodically (separate from production)

## Deployment

### Development
```bash
uvicorn main:app --reload --port 8000
```

### Production
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### With Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

## File Structure

```
vendorbridge/
├── main.py
├── database.py
├── auth_utils.py
├── requirements.txt
├── routes/
│   ├── __init__.py
│   ├── auth.py
│   ├── vendors.py
│   ├── rfq.py
│   ├── quotations.py
│   ├── approvals.py
│   ├── purchase_orders.py
│   ├── invoices.py
│   ├── dashboard.py
│   ├── activity.py
│   └── reports.py
└── utils/
    ├── __init__.py
    ├── pdf_generator.py
    ├── email_sender.py
    └── auto_number.py
```

## Troubleshooting

### Email Not Sending
- Verify Gmail credentials in `utils/email_sender.py`
- Use app-specific passwords for Gmail (not regular password)
- Check firewall/network access to smtp.gmail.com:587

### Database Locked
- Ensure only one instance is running
- Check if previous process is still running
- Delete `.db-journal` file if exists

### JWT Token Invalid
- Tokens expire after 24 hours
- Generate new token by logging in again
- Check Authorization header format: `Bearer <token>`

## Support & Documentation

- **API Docs**: Available at `/docs` (Swagger UI)
- **OpenAPI Schema**: Available at `/openapi.json`
- **ReDoc**: Available at `/redoc`

## License

Proprietary - VendorBridge ERP System

## Version

Current Version: 1.0.0
Last Updated: 2024
