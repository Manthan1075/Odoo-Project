import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email import encoders

SENDER_EMAIL = "vendorbridge.erp@gmail.com"
SENDER_PASSWORD = "your_app_password"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

def send_invoice_email(recipient_email, invoice_number, total, due_date, pdf_bytes):
    try:
        message = MIMEMultipart()
        message["From"] = SENDER_EMAIL
        message["To"] = recipient_email
        message["Subject"] = f"Invoice {invoice_number} - VendorBridge"

        body = f"""
Dear Vendor,

Please find attached your invoice from VendorBridge Procurement Management System.

Invoice Number: {invoice_number}
Invoice Amount: ₹{total:.2f}
Due Date: {due_date}

If you have any questions about this invoice, please contact our procurement team.

Best regards,
VendorBridge Team
        """

        message.attach(MIMEText(body, "plain"))

        part = MIMEBase("application", "octet-stream")
        part.set_payload(pdf_bytes)
        encoders.encode_base64(part)
        part.add_header(
            "Content-Disposition",
            f"attachment; filename= Invoice_{invoice_number}.pdf"
        )
        message.attach(part)

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(message)
        server.quit()

        return True

    except Exception as e:
        raise Exception(f"Email sending failed: {str(e)}")
