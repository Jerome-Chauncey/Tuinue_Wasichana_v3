from flask import Blueprint, request, jsonify
from models import User
from extensions import db
from token_service import generate_reset_token, confirm_reset_token
from email_service import send_password_reset_email
import bcrypt

reset_bp = Blueprint("reset_password", __name__)

@reset_bp.route("/request", methods=["POST"])
def request_password_reset():
    data = request.get_json()
    email = data.get("email")
    user = User.query.filter_by(email=email).first()
    # Always return the same message for security
    if user:
        reset_token = generate_reset_token(user.email)
        send_password_reset_email(user.email, reset_token)
    return jsonify({"message": "If that email exists, a reset link will be sent."}), 200

@reset_bp.route("/confirm/<token>", methods=["POST"])
def reset_password(token):
    data = request.get_json()
    new_password = data.get("password")
    email = confirm_reset_token(token)
    if not email:
        return jsonify({"message": "Invalid or expired token"}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    # Hash the new password
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user.password = hashed_password
    db.session.commit()
    return jsonify({"message": "Password reset successful"}), 200