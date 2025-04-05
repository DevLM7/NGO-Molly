from utils.firebase import db, storage
from app.models.event import Event
from app.models.user import User
from app.models.attendance import Attendance
import uuid
from datetime import datetime
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import io
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

def generate_certificate(event_id, user_id):
    """Generate a certificate for a volunteer"""
    try:
        # Get event and user details
        event = Event.find_by_id(event_id)
        user = User.find_by_id(user_id)
        
        if not event or not user:
            return {'error': 'Event or user not found'}, 404
            
        # Check if attendance exists
        attendance = Attendance.find_by_event_and_volunteer(event_id, user_id)
        if not attendance:
            return {'error': 'No attendance record found for this event'}, 404
            
        # Generate certificate ID
        certificate_id = str(uuid.uuid4())
        
        # Create PDF certificate
        pdf_buffer = create_certificate_pdf(event, user, attendance)
        
        # Upload to Firebase Storage
        blob = storage.blob(f'certificates/{certificate_id}.pdf')
        blob.upload_from_string(pdf_buffer.getvalue(), content_type='application/pdf')
        
        # Save certificate record to Firestore
        db.collection('certificates').document(certificate_id).set({
            'id': certificate_id,
            'event_id': event_id,
            'user_id': user_id,
            'event_name': event.title,
            'user_name': user.name,
            'hours_worked': attendance.hours_worked or 0,
            'generated_at': datetime.now().isoformat(),
            'download_url': f'/api/certificates/download/{certificate_id}'
        })
        
        return {
            'certificate_id': certificate_id,
            'download_url': f'/api/certificates/download/{certificate_id}',
            'message': 'Certificate generated successfully'
        }, 201
        
    except Exception as e:
        return {'error': str(e)}, 500

def create_certificate_pdf(event, user, attendance):
    """Create a PDF certificate"""
    # Create a buffer to store the PDF
    buffer = io.BytesIO()
    
    # Create the PDF document
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Get styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    
    # Create the content
    content = []
    
    # Add title
    content.append(Paragraph("Certificate of Appreciation", title_style))
    content.append(Spacer(1, 12))
    
    # Add recipient name
    content.append(Paragraph(f"This is to certify that", styles['Normal']))
    content.append(Paragraph(f"<b>{user.name}</b>", styles['Heading2']))
    content.append(Spacer(1, 12))
    
    # Add event details
    content.append(Paragraph(f"has volunteered at", styles['Normal']))
    content.append(Paragraph(f"<b>{event.title}</b>", styles['Heading3']))
    content.append(Paragraph(f"on {event.start_date}", styles['Normal']))
    
    # Add hours worked
    if attendance.hours_worked:
        content.append(Paragraph(f"for a total of {attendance.hours_worked} hours", styles['Normal']))
    
    content.append(Spacer(1, 24))
    
    # Add signature line
    content.append(Paragraph("_______________________", styles['Normal']))
    content.append(Paragraph("Event Organizer", styles['Normal']))
    
    # Build the PDF
    doc.build(content)
    
    # Reset buffer position
    buffer.seek(0)
    
    return buffer

def send_certificate_email(certificate_id, email):
    """Send certificate via email"""
    try:
        # Get certificate details
        certificate = db.collection('certificates').document(certificate_id).get()
        if not certificate.exists:
            return {'error': 'Certificate not found'}, 404
            
        certificate_data = certificate.to_dict()
        
        # Get certificate from storage
        blob = storage.blob(f'certificates/{certificate_id}.pdf')
        pdf_data = blob.download_as_bytes()
        
        # Create email
        msg = MIMEMultipart()
        msg['Subject'] = f"Your Certificate for {certificate_data['event_name']}"
        msg['From'] = os.getenv('EMAIL_HOST_USER')
        msg['To'] = email
        
        # Add email body
        body = f"""
        <html>
        <body>
            <p>Dear {certificate_data['user_name']},</p>
            <p>Thank you for volunteering at {certificate_data['event_name']}!</p>
            <p>Please find attached your certificate of appreciation.</p>
            <p>Best regards,<br>The NGO-Volunteer Platform Team</p>
        </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        # Attach the PDF
        pdf_attachment = MIMEApplication(pdf_data, _subtype='pdf')
        pdf_attachment.add_header('Content-Disposition', 'attachment', filename=f'certificate_{certificate_id}.pdf')
        msg.attach(pdf_attachment)
        
        # Send email
        with smtplib.SMTP(os.getenv('EMAIL_HOST'), int(os.getenv('EMAIL_PORT'))) as server:
            if os.getenv('EMAIL_USE_TLS') == 'True':
                server.starttls()
            server.login(os.getenv('EMAIL_HOST_USER'), os.getenv('EMAIL_HOST_PASSWORD'))
            server.send_message(msg)
        
        # Update certificate record
        db.collection('certificates').document(certificate_id).update({
            'sent_at': datetime.now().isoformat(),
            'sent_to': email
        })
        
        return {'message': 'Certificate sent successfully'}, 200
        
    except Exception as e:
        return {'error': str(e)}, 500 