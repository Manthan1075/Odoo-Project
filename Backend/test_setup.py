#!/usr/bin/env python3
"""
VendorBridge ERP - System Test Script
Tests all major components and endpoints
"""

import requests
import json
import sys
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@vendorbridge.com"
ADMIN_PASSWORD = "admin123"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")

def test_health():
    """Test health endpoint"""
    print("\n" + "="*50)
    print("Testing Health Check")
    print("="*50)
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print_success("Server is running and healthy")
            print(json.dumps(response.json(), indent=2))
            return True
        else:
            print_error(f"Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Cannot connect to server: {str(e)}")
        print_info("Make sure the server is running: uvicorn main:app --reload --port 8000")
        return False

def test_root():
    """Test root endpoint"""
    print("\n" + "="*50)
    print("Testing Root Endpoint")
    print("="*50)
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        if response.status_code == 200:
            print_success("Root endpoint working")
            return True
        else:
            print_error(f"Root endpoint failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Root endpoint error: {str(e)}")
        return False

def test_login():
    """Test login endpoint"""
    print("\n" + "="*50)
    print("Testing Authentication")
    print("="*50)
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            if token:
                print_success(f"Login successful for {ADMIN_EMAIL}")
                return token
            else:
                print_error("Token not received in response")
                return None
        else:
            print_error(f"Login failed with status {response.status_code}")
            print_info(f"Response: {response.text}")
            return None
    except Exception as e:
        print_error(f"Login error: {str(e)}")
        return None

def test_endpoints(token):
    """Test major endpoints"""
    if not token:
        print_error("No token available, skipping endpoint tests")
        return False
    
    print("\n" + "="*50)
    print("Testing API Endpoints")
    print("="*50)
    
    headers = {"Authorization": f"Bearer {token}"}
    endpoints_tested = 0
    endpoints_passed = 0
    
    # Test endpoints
    test_cases = [
        ("GET", "/auth/me", "Get current user"),
        ("GET", "/vendors/", "List vendors"),
        ("GET", "/vendors/categories/list", "List vendor categories"),
        ("GET", "/rfqs/", "List RFQs"),
        ("GET", "/dashboard/stats", "Get dashboard stats"),
        ("GET", "/dashboard/quick-stats", "Get quick stats"),
        ("GET", "/activity/recent", "Get recent activity"),
    ]
    
    for method, endpoint, description in test_cases:
        endpoints_tested += 1
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=5)
            else:
                response = requests.post(f"{BASE_URL}{endpoint}", headers=headers, timeout=5)
            
            if response.status_code in [200, 201]:
                print_success(f"{method} {endpoint} - {description}")
                endpoints_passed += 1
            else:
                print_warning(f"{method} {endpoint} - {description} (Status: {response.status_code})")
        except Exception as e:
            print_error(f"{method} {endpoint} - {description} ({str(e)})")
    
    print(f"\nPassed: {endpoints_passed}/{endpoints_tested}")
    return endpoints_passed == endpoints_tested

def test_vendor_creation(token):
    """Test creating a vendor"""
    if not token:
        return False
    
    print("\n" + "="*50)
    print("Testing Vendor Creation")
    print("="*50)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    vendor_data = {
        "company_name": f"Test Vendor {datetime.now().timestamp()}",
        "contact_person": "John Doe",
        "email": f"test{int(datetime.now().timestamp())}@example.com",
        "phone": "9876543210",
        "gst_number": "123456789012345",
        "category_id": 1,
        "country": "India",
        "address": "Test Address"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/vendors/", json=vendor_data, headers=headers, timeout=5)
        if response.status_code == 200:
            vendor = response.json()
            print_success(f"Vendor created: {vendor['company_name']} (ID: {vendor['id']})")
            return vendor['id']
        else:
            print_error(f"Vendor creation failed: {response.status_code}")
            print_info(f"Response: {response.text}")
            return None
    except Exception as e:
        print_error(f"Vendor creation error: {str(e)}")
        return None

def test_rfq_creation(token):
    """Test creating an RFQ"""
    if not token:
        return False
    
    print("\n" + "="*50)
    print("Testing RFQ Creation")
    print("="*50)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    rfq_data = {
        "title": f"Test RFQ {datetime.now().timestamp()}",
        "description": "Test RFQ Description",
        "category": "IT",
        "deadline": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
        "line_items": [
            {"item_name": "Test Item 1", "quantity": 10, "unit": "pieces"},
            {"item_name": "Test Item 2", "quantity": 5, "unit": "sets"}
        ],
        "vendor_ids": []
    }
    
    try:
        response = requests.post(f"{BASE_URL}/rfqs/", json=rfq_data, headers=headers, timeout=5)
        if response.status_code == 200:
            rfq = response.json()
            print_success(f"RFQ created: {rfq['title']} (ID: {rfq['id']})")
            return rfq['id']
        else:
            print_error(f"RFQ creation failed: {response.status_code}")
            print_info(f"Response: {response.text}")
            return None
    except Exception as e:
        print_error(f"RFQ creation error: {str(e)}")
        return None

def test_database():
    """Test database connection"""
    print("\n" + "="*50)
    print("Testing Database")
    print("="*50)
    
    try:
        from database import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) as count FROM users")
        user_count = cursor.fetchone()['count']
        print_success(f"Database connected - Found {user_count} users")
        
        cursor.execute("SELECT COUNT(*) as count FROM vendors")
        vendor_count = cursor.fetchone()['count']
        print_info(f"Vendors in database: {vendor_count}")
        
        cursor.execute("SELECT COUNT(*) as count FROM rfqs")
        rfq_count = cursor.fetchone()['count']
        print_info(f"RFQs in database: {rfq_count}")
        
        cursor.execute("PRAGMA integrity_check")
        integrity = cursor.fetchone()[0]
        if integrity == "ok":
            print_success("Database integrity check passed")
        else:
            print_error(f"Database integrity issue: {integrity}")
        
        conn.close()
        return True
    except Exception as e:
        print_error(f"Database error: {str(e)}")
        return False

def test_pdf_generation():
    """Test PDF generation"""
    print("\n" + "="*50)
    print("Testing PDF Generation")
    print("="*50)
    
    try:
        from utils.pdf_generator import generate_invoice_pdf
        
        test_invoice = {
            'invoice_number': 'INV-2024-0001',
            'po_number': 'PO-2024-0001',
            'company_name': 'Test Vendor Inc',
            'contact_person': 'John Doe',
            'email': 'john@test.com',
            'phone': '9876543210',
            'subtotal': 50000,
            'gst_amount': 9000,
            'total': 59000,
            'status': 'unpaid',
            'due_date': (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
            'items': [
                {'item_name': 'Test Item', 'quantity': 10, 'unit_price': 5000, 'total': 50000}
            ]
        }
        
        pdf_bytes = generate_invoice_pdf(test_invoice)
        if len(pdf_bytes) > 0:
            print_success(f"PDF generated successfully ({len(pdf_bytes)} bytes)")
            return True
        else:
            print_error("PDF generation produced empty result")
            return False
    except Exception as e:
        print_error(f"PDF generation error: {str(e)}")
        return False

def test_email_config():
    """Test email configuration"""
    print("\n" + "="*50)
    print("Testing Email Configuration")
    print("="*50)
    
    try:
        from utils.email_sender import SENDER_EMAIL, SMTP_SERVER, SMTP_PORT
        
        print_info(f"SMTP Server: {SMTP_SERVER}")
        print_info(f"SMTP Port: {SMTP_PORT}")
        print_info(f"Sender Email: {SENDER_EMAIL}")
        
        if SENDER_EMAIL == "vendorbridge.erp@gmail.com":
            print_warning("Using default email configuration - Update for production!")
        else:
            print_success("Custom email configuration detected")
        
        return True
    except Exception as e:
        print_error(f"Email configuration error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("VendorBridge ERP - System Test Suite")
    print("="*60)
    print(f"Testing at: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    all_passed = True
    
    # Test database first
    if not test_database():
        all_passed = False
    
    # Test health
    if not test_health():
        print_error("Server is not running. Cannot continue tests.")
        return False
    
    # Test root
    if not test_root():
        all_passed = False
    
    # Test login and get token
    token = test_login()
    if not token:
        all_passed = False
    else:
        # Test endpoints
        if not test_endpoints(token):
            all_passed = False
        
        # Test vendor creation
        vendor_id = test_vendor_creation(token)
        if not vendor_id:
            all_passed = False
        
        # Test RFQ creation
        rfq_id = test_rfq_creation(token)
        if not rfq_id:
            all_passed = False
    
    # Test utilities
    if not test_pdf_generation():
        all_passed = False
    
    if not test_email_config():
        all_passed = False
    
    # Summary
    print("\n" + "="*60)
    if all_passed:
        print_success("All tests passed! System is ready for use.")
        print("Access the application at: http://localhost:8000/docs")
    else:
        print_warning("Some tests failed. Please review the output above.")
    print("="*60 + "\n")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
