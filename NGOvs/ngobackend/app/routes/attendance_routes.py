from flask import Blueprint, request, jsonify
from app.controllers.attendance_controller import (
    mark_attendance, update_attendance, get_attendance_logs
)
from app.utils.auth_middleware import require_auth, require_role

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('', methods=['POST'])
@require_auth
@require_role('ngo')
def mark():
    """Mark attendance for a volunteer"""
    data = request.get_json()
    return mark_attendance(data, request.user['uid'])

@attendance_bp.route('/<attendance_id>', methods=['PUT'])
@require_auth
@require_role('ngo')
def update(attendance_id):
    """Update attendance record"""
    data = request.get_json()
    return update_attendance(attendance_id, data, request.user['uid'])

@attendance_bp.route('', methods=['GET'])
@require_auth
def logs():
    """Get attendance logs"""
    event_id = request.args.get('event_id')
    volunteer_id = request.args.get('volunteer_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    return get_attendance_logs(
        request.user,
        event_id=event_id,
        volunteer_id=volunteer_id,
        start_date=start_date,
        end_date=end_date
    ) 