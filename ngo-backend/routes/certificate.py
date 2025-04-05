from flask import Blueprint, jsonify, request, send_file
from app.controllers.certificate_controller import generate_certificate, send_certificate_email
from utils.auth import require_auth, require_role
from utils.firebase import storage
import io

certificate_bp = Blueprint('certificate', __name__)

@certificate_bp.route('/generate/<event_id>', methods=['POST'])
@require_auth
def create_certificate(event_id):
    """Generate a certificate for the authenticated user"""
    user_id = request.user_id
    result, status_code = generate_certificate(event_id, user_id)
    return jsonify(result), status_code

@certificate_bp.route('/download/<certificate_id>', methods=['GET'])
@require_auth
def download_certificate(certificate_id):
    """Download a certificate"""
    try:
        # Get certificate from storage
        blob = storage.blob(f'certificates/{certificate_id}.pdf')
        pdf_data = blob.download_as_bytes()
        
        # Create response
        return send_file(
            io.BytesIO(pdf_data),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'certificate_{certificate_id}.pdf'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@certificate_bp.route('/send/<certificate_id>', methods=['POST'])
@require_auth
def send_certificate(certificate_id):
    """Send a certificate via email"""
    data = request.get_json()
    if not data or 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400
        
    result, status_code = send_certificate_email(certificate_id, data['email'])
    return jsonify(result), status_code 