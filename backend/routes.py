from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
from models import User, Charity, Donation, Story, CreditTransaction
from datetime import datetime
import hashlib
import re

api = Blueprint('api', __name__)

def validate_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def validate_password(password):
    return len(password) >= 8 and any(c.isupper() for c in password) and any(c.isdigit() for c in password)

@api.route('/register', methods=['POST'])
def register():
    data = request.json
    if not validate_email(data['email']):
        return jsonify({'message': 'Invalid email format'}), 400
    if not validate_password(data['password']):
        return jsonify({'message': 'Password must be at least 8 characters with an uppercase letter and a digit'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()
    user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_password,
        role=data['role'],
        credits=0
    )
    db.session.add(user)
    db.session.commit()
    
    if data['role'] == 'charity':
        charity = Charity(
            user_id=user.id,
            name=data['charity']['name'],
            description=data['charity']['description'],
            mission_statement=data['charity']['mission_statement'],
            location=data['charity']['location'],
            founded_year=data['charity']['founded_year'],
            impact_metrics=data['charity']['impact_metrics'],
            contact_person=data['charity']['contact_person'],
            contact_phone=data['charity']['contact_phone'],
            website=data['charity']['website'],
            approved=False,
            rejected=False
        )
        db.session.add(charity)
        db.session.commit()
        return jsonify({
            'message': 'Charity application submitted, pending approval. You will be notified via email.',
            'user_id': user.id,
            'charity_id': charity.id,
            'role': user.role,
            'pending': True
        }), 201
    
    access_token = create_access_token(identity=user.id)
    return jsonify({
        'message': 'User registered',
        'user_id': user.id,
        'access_token': access_token,
        'role': user.role,
        'pending': False
    }), 201

@api.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or hashlib.sha256(data['password'].encode()).hexdigest() != user.password:
        return jsonify({'message': 'Invalid credentials'}), 401
    if user.role == 'charity':
        charity = Charity.query.filter_by(user_id=user.id).first()
        if not charity:
            return jsonify({'message': 'Charity not found'}), 404
        if charity.rejected:
            return jsonify({
                'message': 'We are sorry, your charity application was not approved. Please contact support@tuinuewasichana.org for more details.'
            }), 403
        if not charity.approved:
            return jsonify({'message': 'Charity application pending approval'}), 403
    access_token = create_access_token(identity=user.id)
    return jsonify({'user_id': user.id, 'access_token': access_token, 'role': user.role})

@api.route('/charity/status', methods=['GET'])
@jwt_required()
def check_charity_status():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'charity':
        return jsonify({'message': 'Access denied'}), 403
    charity = Charity.query.filter_by(user_id=user_id).first()
    if not charity:
        return jsonify({'message': 'Charity not found'}), 404
    if charity.rejected:
        return jsonify({'message': 'We are sorry, your charity application was not approved. Please contact support@tuinuewasichana.org for more details.', 'rejected': True})
    return jsonify({'approved': charity.approved, 'rejected': charity.rejected})

@api.route('/charities', methods=['GET'])
def get_charities():
    charities = Charity.query.filter_by(approved=True, rejected=False).all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'description': c.description,
        'mission_statement': c.mission_statement,
        'location': c.location
    } for c in charities])

@api.route('/charities/<int:id>', methods=['GET'])
def get_charity(id):
    charity = Charity.query.get_or_404(id)
    if charity.rejected:
        return jsonify({'message': 'Charity not available'}), 404
    return jsonify({
        'id': charity.id,
        'name': charity.name,
        'description': charity.description,
        'mission_statement': charity.mission_statement,
        'location': charity.location,
        'founded_year': charity.founded_year,
        'impact_metrics': charity.impact_metrics
    })

@api.route('/donate', methods=['POST'])
@jwt_required()
def donate():
    data = request.json
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'donor':
        return jsonify({'message': 'Access denied'}), 403
    if user.credits < data['amount']:
        return jsonify({'message': 'Insufficient credits'}), 400
    charity = Charity.query.get(data['charity_id'])
    if not charity or charity.rejected:
        return jsonify({'message': 'Charity not available'}), 404
    user.credits -= data['amount']
    donation = Donation(
        donor_id=user_id,
        charity_id=data['charity_id'],
        amount=data['amount'],
        is_anonymous=data.get('is_anonymous', False),
        is_recurring=data.get('is_recurring', False),
        recurring_frequency=data.get('recurring_frequency', 'monthly') if data.get('is_recurring') else None
    )
    db.session.add(donation)
    db.session.commit()
    return jsonify({'message': 'Donation successful', 'new_balance': user.credits})

@api.route('/stories', methods=['GET'])
def get_stories():
    charity_id = request.args.get('charity_id')
    stories = Story.query.filter_by(charity_id=charity_id).all()
    return jsonify([{
        'id': s.id,
        'title': s.title,
        'content': s.content,
        'image_url': s.image_url,
        'beneficiary_name': s.beneficiary_name,
        'beneficiary_age': s.beneficiary_age,
        'date': s.date.isoformat()
    } for s in stories])

@api.route('/stories', methods=['POST'])
@jwt_required()
def add_story():
    data = request.json
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'charity':
        return jsonify({'message': 'Access denied'}), 403
    charity = Charity.query.filter_by(user_id=user_id).first()
    if not charity:
        return jsonify({'message': 'Charity not found'}), 404
    if not charity.approved or charity.rejected:
        return jsonify({'message': 'Charity not approved or rejected'}), 403
    story = Story(
        charity_id=charity.id,
        title=data['title'],
        content=data['content'],
        image_url=data.get('image_url', 'https://via.placeholder.com/150?text=Story'),
        beneficiary_name=data['beneficiary_name'],
        beneficiary_age=data['beneficiary_age']
    )
    db.session.add(story)
    db.session.commit()
    return jsonify({'message': 'Story added'}), 201

@api.route('/credits/purchase', methods=['POST'])
@jwt_required()
def purchase_credits():
    data = request.json
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'donor':
        return jsonify({'message': 'Access denied'}), 403
    user.credits += data['amount']
    transaction = CreditTransaction(user_id=user_id, amount=data['amount'])
    db.session.add(transaction)
    db.session.commit()
    return jsonify({'message': 'Credits purchased', 'new_balance': user.credits})

@api.route('/donor/history', methods=['GET'])
@jwt_required()
def donor_history():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'donor':
        return jsonify({'message': 'Access denied'}), 403
    donations = Donation.query.filter_by(donor_id=user_id).all()
    return jsonify([{
        'id': d.id,
        'charity_id': d.charity_id,
        'charity_name': Charity.query.get(d.charity_id).name if Charity.query.get(d.charity_id) else 'Unknown',
        'amount': d.amount,
        'is_anonymous': d.is_anonymous,
        'is_recurring': d.is_recurring,
        'date': d.date.isoformat()
    } for d in donations])

@api.route('/donor/credits', methods=['GET'])
@jwt_required()
def get_credits():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'donor':
        return jsonify({'message': 'Access denied'}), 403
    return jsonify({'credits': user.credits})

@api.route('/donor/credit-history', methods=['GET'])
@jwt_required()
def credit_history():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'donor':
        return jsonify({'message': 'Access denied'}), 403
    transactions = CreditTransaction.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': t.id,
        'amount': t.amount,
        'date': t.date.isoformat()
    } for t in transactions])

@api.route('/charity/donations', methods=['GET'])
@jwt_required()
def charity_donations():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'charity':
        return jsonify({'message': 'Access denied'}), 403
    charity = Charity.query.filter_by(user_id=user_id).first()
    if not charity:
        return jsonify({'message': 'Charity not found'}), 404
    if not charity.approved or charity.rejected:
        return jsonify({'message': 'Charity not approved or rejected'}), 403
    donations = Donation.query.filter_by(charity_id=charity.id).all()
    total_credits = sum(d.amount for d in donations)
    return jsonify({
        'total_credits': total_credits,
        'donations': [{
            'id': d.id,
            'donor_id': d.donor_id,
            'amount': d.amount,
            'is_anonymous': d.is_anonymous,
            'is_recurring': d.is_recurring,
            'date': d.date.isoformat()
        } for d in donations]
    })

@api.route('/admin/charities', methods=['GET', 'POST'])
@jwt_required()
def manage_charities():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    if request.method == 'GET':
        charities = Charity.query.all()
        return jsonify([{
            'id': c.id,
            'name': c.name,
            'description': c.description,
            'mission_statement': c.mission_statement,
            'location': c.location,
            'founded_year': c.founded_year,
            'impact_metrics': c.impact_metrics,
            'contact_person': c.contact_person,
            'contact_phone': c.contact_phone,
            'website': c.website,
            'approved': c.approved,
            'rejected': c.rejected
        } for c in charities])
    elif request.method == 'POST':
        data = request.json
        charity = Charity.query.get(data['charity_id'])
        charity.approved = data.get('approved', charity.approved)
        charity.rejected = data.get('rejected', charity.rejected)
        db.session.commit()
        return jsonify({'message': 'Charity updated'})