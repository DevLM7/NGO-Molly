from flask import Blueprint, jsonify, request
from app.controllers.report_controller import (
    create_report, get_report, update_report, delete_report,
    get_event_reports, get_user_reports, get_assigned_reports,
    update_report_status, assign_report, get_report_stats
)
from utils.auth import require_auth, require_role

report_bp = Blueprint('report', __name__)

@report_bp.route('/', methods=['POST'])
@require_auth
def submit_report():
    """Submit a new report or feedback"""
    data = request.get_json()
    user_id = request.user_id
    result, status_code = create_report(data, user_id)
    return jsonify(result), status_code

@report_bp.route('/<report_id>', methods=['GET'])
@require_auth
def view_report(report_id):
    """View a specific report"""
    result, status_code = get_report(report_id)
    return jsonify(result), status_code

@report_bp.route('/<report_id>', methods=['PUT'])
@require_auth
def edit_report(report_id):
    """Update a report"""
    data = request.get_json()
    user_id = request.user_id
    result, status_code = update_report(report_id, data, user_id)
    return jsonify(result), status_code

@report_bp.route('/<report_id>', methods=['DELETE'])
@require_auth
def remove_report(report_id):
    """Delete a report"""
    user_id = request.user_id
    result, status_code = delete_report(report_id, user_id)
    return jsonify(result), status_code

@report_bp.route('/event/<event_id>', methods=['GET'])
@require_auth
def event_reports(event_id):
    """Get all reports for an event"""
    result, status_code = get_event_reports(event_id)
    return jsonify(result), status_code

@report_bp.route('/user/<user_id>', methods=['GET'])
@require_auth
def user_reports(user_id):
    """Get all reports submitted by a user"""
    result, status_code = get_user_reports(user_id)
    return jsonify(result), status_code

@report_bp.route('/assigned/<user_id>', methods=['GET'])
@require_auth
@require_role('ngo')
def assigned_reports(user_id):
    """Get all reports assigned to a user"""
    result, status_code = get_assigned_reports(user_id)
    return jsonify(result), status_code

@report_bp.route('/<report_id>/status', methods=['PUT'])
@require_auth
@require_role('ngo')
def change_status(report_id):
    """Update report status"""
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
        
    user_id = request.user_id
    result, status_code = update_report_status(report_id, data['status'], user_id)
    return jsonify(result), status_code

@report_bp.route('/<report_id>/assign', methods=['PUT'])
@require_auth
@require_role('ngo')
def assign_to_user(report_id):
    """Assign report to a user"""
    data = request.get_json()
    if not data or 'assignee_id' not in data:
        return jsonify({'error': 'Assignee ID is required'}), 400
        
    user_id = request.user_id
    result, status_code = assign_report(report_id, data['assignee_id'], user_id)
    return jsonify(result), status_code

@report_bp.route('/stats/<ngo_id>', methods=['GET'])
@require_auth
@require_role('ngo')
def report_statistics(ngo_id):
    """Get report statistics for an NGO"""
    result, status_code = get_report_stats(ngo_id)
    return jsonify(result), status_code 