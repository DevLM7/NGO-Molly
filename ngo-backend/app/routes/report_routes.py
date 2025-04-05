from flask import Blueprint, request, jsonify
from app.controllers.report_controller import (
    create_report, get_report, update_report, delete_report,
    get_event_reports, get_user_reports, get_assigned_reports,
    update_report_status, assign_report, get_report_stats
)
from app.utils.auth_middleware import require_auth, require_role

report_bp = Blueprint('reports', __name__)

@report_bp.route('', methods=['POST'])
@require_auth
def create():
    """Create a new report"""
    data = request.get_json()
    return create_report(data, request.user['uid'])

@report_bp.route('/<report_id>', methods=['GET'])
@require_auth
def get(report_id):
    """Get report by ID"""
    return get_report(report_id)

@report_bp.route('/<report_id>', methods=['PUT'])
@require_auth
def update(report_id):
    """Update report"""
    data = request.get_json()
    return update_report(report_id, data, request.user['uid'])

@report_bp.route('/<report_id>', methods=['DELETE'])
@require_auth
def delete(report_id):
    """Delete report"""
    return delete_report(report_id, request.user['uid'])

@report_bp.route('/event/<event_id>', methods=['GET'])
@require_auth
def event_reports(event_id):
    """Get reports for an event"""
    return get_event_reports(event_id)

@report_bp.route('/user/<user_id>', methods=['GET'])
@require_auth
def user_reports(user_id):
    """Get reports by user"""
    return get_user_reports(user_id)

@report_bp.route('/assigned', methods=['GET'])
@require_auth
def assigned_reports():
    """Get reports assigned to user"""
    return get_assigned_reports(request.user['uid'])

@report_bp.route('/<report_id>/status', methods=['PUT'])
@require_auth
def update_status(report_id):
    """Update report status"""
    data = request.get_json()
    if 'status' not in data:
        return jsonify({'error': 'status is required'}), 400
    return update_report_status(report_id, data['status'], request.user['uid'])

@report_bp.route('/<report_id>/assign', methods=['PUT'])
@require_auth
def assign(report_id):
    """Assign report to a user"""
    data = request.get_json()
    if 'assignee_id' not in data:
        return jsonify({'error': 'assignee_id is required'}), 400
    return assign_report(report_id, data['assignee_id'], request.user['uid'])

@report_bp.route('/stats/<ngo_id>', methods=['GET'])
@require_auth
@require_role('ngo')
def stats(ngo_id):
    """Get report statistics for an NGO"""
    return get_report_stats(ngo_id) 