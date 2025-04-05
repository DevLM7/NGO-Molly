from flask import Blueprint, jsonify, request
from app.controllers.social_controller import (
    get_social_feed, create_social_post, get_user_posts,
    like_post, comment_on_post
)
from utils.auth import require_auth

social_bp = Blueprint('social', __name__)

@social_bp.route('/feed', methods=['GET'])
@require_auth
def social_feed():
    """Get social feed for the authenticated user"""
    user_id = request.user_id
    limit = request.args.get('limit', default=20, type=int)
    result, status_code = get_social_feed(user_id, limit)
    return jsonify(result), status_code

@social_bp.route('/posts', methods=['POST'])
@require_auth
def create_post():
    """Create a new social post"""
    data = request.get_json()
    user_id = request.user_id
    result, status_code = create_social_post(user_id, data)
    return jsonify(result), status_code

@social_bp.route('/posts/user/<user_id>', methods=['GET'])
@require_auth
def user_posts(user_id):
    """Get posts by a specific user"""
    limit = request.args.get('limit', default=10, type=int)
    result, status_code = get_user_posts(user_id, limit)
    return jsonify(result), status_code

@social_bp.route('/posts/<post_id>/like', methods=['POST'])
@require_auth
def like_social_post(post_id):
    """Like a social post"""
    user_id = request.user_id
    result, status_code = like_post(post_id, user_id)
    return jsonify(result), status_code

@social_bp.route('/posts/<post_id>/comment', methods=['POST'])
@require_auth
def add_comment(post_id):
    """Add a comment to a social post"""
    data = request.get_json()
    if not data or 'comment' not in data:
        return jsonify({'error': 'Comment is required'}), 400
        
    user_id = request.user_id
    result, status_code = comment_on_post(post_id, user_id, data['comment'])
    return jsonify(result), status_code 