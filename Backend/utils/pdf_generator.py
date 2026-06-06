from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from datetime import datetime
from io import BytesIO

def generate_invoice_pdf(invoice_data):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    elements = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a472a'),
        spaceAfter=6,
        alignment=1
    )
    
    heading_style = ParagraphStyle(
        'Heading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#1a472a'),
        spaceAfter=6,
        spaceBefore=12
    )

    normal_style = styles['Normal']

    elements.append(Paragraph("VendorBridge", title_style))
    elements.append(Paragraph("INVOICE", title_style))
    elements.append(Spacer(1, 0.2*inch))

    invoice_info_data = [
        ["Invoice Number:", invoice_data['invoice_number'], "Invoice Date:", datetime.now().strftime('%Y-%m-%d')],
        ["PO Reference:", invoice_data['po_number'], "Due Date:", invoice_data['due_date']],
        ["Status:", invoice_data['status'].upper(), "", ""]
    ]
    
    invoice_info_table = Table(invoice_info_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    invoice_info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 2), colors.HexColor('#e8f5e9')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, 2), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))
    elements.append(invoice_info_table)
    elements.append(Spacer(1, 0.3*inch))

    elements.append(Paragraph("Bill To:", heading_style))
    bill_to_data = [
        ["VendorBridge ERP System"],
        ["Ahmedabad, Gujarat"],
        ["India"]
    ]
    bill_to_table = Table(bill_to_data, colWidths=[4*inch])
    bill_to_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4)
    ]))
    elements.append(bill_to_table)
    elements.append(Spacer(1, 0.2*inch))

    elements.append(Paragraph("Vendor Details:", heading_style))
    vendor_data = [
        [f"{invoice_data['company_name']}"],
        [f"Contact: {invoice_data['contact_person']}"],
        [f"Email: {invoice_data['email']}"],
        [f"Phone: {invoice_data['phone']}"]
    ]
    vendor_table = Table(vendor_data, colWidths=[4*inch])
    vendor_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4)
    ]))
    elements.append(vendor_table)
    elements.append(Spacer(1, 0.3*inch))

    elements.append(Paragraph("Items:", heading_style))
    items_data = [["Item", "Qty", "Unit Price", "Total"]]
    
    for item in invoice_data.get('items', []):
        items_data.append([
            item['item_name'],
            str(item['quantity']),
            f"₹{item['unit_price']:.2f}",
            f"₹{item['total']:.2f}"
        ])

    items_table = Table(items_data, colWidths=[2.5*inch, 0.8*inch, 1.2*inch, 1.2*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a472a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6)
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 0.3*inch))

    summary_data = [
        ["Subtotal:", f"₹{invoice_data['subtotal']:.2f}"],
        ["GST (18%):", f"₹{invoice_data['gst_amount']:.2f}"],
        ["Grand Total:", f"₹{invoice_data['total']:.2f}"]
    ]
    
    summary_table = Table(summary_data, colWidths=[4*inch, 1.5*inch])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica'),
        ('FONTNAME', (1, 0), (1, 2), 'Helvetica'),
        ('FONTNAME', (1, 3), (1, 3), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 2), 10),
        ('FONTSIZE', (0, 3), (-1, 3), 12),
        ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#1a472a')),
        ('TEXTCOLOR', (0, 3), (-1, 3), colors.whitesmoke),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 3), (-1, 3), 0.5, colors.black)
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.4*inch))

    footer_text = "Generated by VendorBridge ERP System"
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.grey,
        alignment=1
    )
    elements.append(Paragraph(footer_text, footer_style))

    doc.build(elements)
    return buffer.getvalue()
