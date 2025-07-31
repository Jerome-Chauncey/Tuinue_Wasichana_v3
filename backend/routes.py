from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models import User, Charity, Donation, Story, CreditTransaction
from datetime import datetime, timedelta
import bcrypt
import re

api = Blueprint('api', __name__)

@api.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data.get('email') or not data.get('password') or not data.get('username') or not data.get('role'):
        return jsonify({'message': 'Missing required fields'}), 400
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', data['email']):
        return jsonify({'message': 'Invalid email format'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
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
        charity_data = data.get('charity', {})
        charity = Charity(
            user_id=user.id,
            name=charity_data.get('name', ''),
            description=charity_data.get('description', ''),
            mission_statement=charity_data.get('mission_statement', ''),
            location=charity_data.get('location', ''),
            founded_year=charity_data.get('founded_year', 0),
            impact_metrics=charity_data.get('impact_metrics', ''),
            contact_person=charity_data.get('contact_person', ''),
            contact_phone=charity_data.get('contact_phone', ''),
            website=charity_data.get('website', ''),
            photo_url=charity_data.get('photo_url', ''),
            approved=False,
            rejected=False
        )
        db.session.add(charity)
        db.session.commit()
        return jsonify({'message': 'Charity registered, pending approval'}), 201
    access_token = create_access_token(identity=user.id)
    return jsonify({'access_token': access_token, 'role': user.role, 'user_id': user.id}), 201

@api.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8')):
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
    response = {'user_id': user.id, 'access_token': access_token, 'role': user.role}
    if user.role == 'charity' and charity:
        response['charity_id'] = charity.id
    return jsonify(response)

@api.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"valid": False, "message": "Invalid token"}), 200
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({"valid": False, "message": "User not found"}), 200
        
        return jsonify({
            "valid": True,
            "role": user.role,
            "user_id": user.id,
            "charity_id": user.charity[0].id if user.role == 'charity' and user.charity else None
        }), 200
    except Exception as e:
        return jsonify({"valid": False, "message": str(e)}), 200

@api.route('/admin-overview', methods=['GET'])
@jwt_required()
def admin_overview():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    total_donors = User.query.filter_by(role='donor').count()
    total_charities = Charity.query.count()
    total_donations = Donation.query.count()
    total_credits_donated = db.session.query(db.func.sum(Donation.amount)).scalar() or 0
    total_stories = Story.query.count()
    today = datetime.utcnow()
    labels = [(today - timedelta(days=30 * i)).strftime('%Y-%m') for i in range(5, -1, -1)]
    donor_data = []
    charity_data = []
    for i in range(6):
        start_date = today - timedelta(days=30 * (i + 1))
        end_date = today - timedelta(days=30 * i)
        donor_sum = db.session.query(db.func.sum(Donation.amount)).filter(
            Donation.date >= start_date,
            Donation.date < end_date
        ).scalar() or 0
        charity_sum = db.session.query(db.func.sum(Donation.amount)).filter(
            Donation.date >= start_date,
            Donation.date < end_date
        ).scalar() or 0
        donor_data.append(donor_sum)
        charity_data.append(charity_sum)
    credit_data = []
    for i in range(6):
        start_date = today - timedelta(days=30 * (i + 1))
        end_date = today - timedelta(days=30 * i)
        credit_sum = db.session.query(db.func.sum(CreditTransaction.amount)).filter(
            CreditTransaction.date >= start_date,
            CreditTransaction.date < end_date
        ).scalar() or 0
        credit_data.append(credit_sum)
    return jsonify({
        'total_donors': total_donors,
        'total_charities': total_charities,
        'total_donations': total_donations,
        'total_credits_donated': total_credits_donated,
        'total_stories': total_stories,
        'donation_graph': {'labels': labels, 'donor_data': donor_data, 'charity_data': charity_data},
        'credit_graph': {'labels': labels, 'data': credit_data}
    })

@api.route('/admin/charities', methods=['GET', 'POST'])
@jwt_required()
def admin_charities():
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
            'location': c.location,
            'photo_url': c.photo_url,
            'approved': c.approved,
            'rejected': c.rejected,
            'donations': [{
                'id': d.id,
                'donor_username': User.query.get(d.donor_id).username if not d.is_anonymous else 'Anonymous',
                'amount': d.amount,
                'date': d.date.isoformat(),
                'is_anonymous': d.is_anonymous
            } for d in c.donations],
            'stories': [{
                'id': s.id,
                'title': s.title,
                'date': s.date.isoformat()
            } for s in c.stories]
        } for c in charities])
    data = request.json
    charity = Charity.query.get(data['charity_id'])
    if not charity:
        return jsonify({'message': 'Charity not found'}), 404
    charity.approved = data.get('approved', charity.approved)
    charity.rejected = data.get('rejected', charity.rejected)
    db.session.commit()
    return jsonify({'message': 'Charity status updated'})

@api.route('/admin/donors', methods=['GET'])
@jwt_required()
def admin_donors():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    donors = User.query.filter_by(role='donor').all()
    return jsonify([{
        'id': d.id,
        'username': d.username,
        'email': d.email,
        'credits': d.credits,
        'donations': [{
            'id': don.id,
            'charity_name': Charity.query.get(don.charity_id).name,
            'amount': don.amount,
            'date': don.date.isoformat(),
            'is_anonymous': don.is_anonymous
        } for don in d.donations],
        'credit_transactions': [{
            'id': t.id,
            'amount': t.amount,
            'date': t.date.isoformat()
        } for t in d.credit_transactions]
    } for d in donors])

@api.route('/credits/purchase', methods=['POST'])
@jwt_required()
def purchase_credits():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'donor':
        return jsonify({'message': 'Access denied'}), 403
    data = request.json
    amount = data.get('amount')
    if not amount or amount <= 0:
        return jsonify({'message': 'Invalid amount'}), 400
    user.credits += amount
    transaction = CreditTransaction(user_id=user.id, amount=amount, date=datetime.utcnow())
    db.session.add(transaction)
    db.session.commit()
    return jsonify({'message': 'Credits purchased', 'new_balance': user.credits})

@api.route('/charities', methods=['GET'])
def get_charities():
    charities = Charity.query.filter_by(approved=True, rejected=False).all()
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
        'photo_url': c.photo_url
    } for c in charities])

@api.route('/charities/<int:id>', methods=['GET'])
def get_charity(id):
    charity = Charity.query.filter_by(id=id, approved=True, rejected=False).first()
    if not charity:
        return jsonify({'message': 'Charity not found or not approved'}), 404
    return jsonify({
        'id': charity.id,
        'name': charity.name,
        'description': charity.description,
        'mission_statement': charity.mission_statement,
        'location': charity.location,
        'founded_year': charity.founded_year,
        'impact_metrics': charity.impact_metrics,
        'contact_person': charity.contact_person,
        'contact_phone': charity.contact_phone,
        'website': charity.website,
        'photo_url': charity.photo_url,
        'donations': [{
            'id': d.id,
            'donor_username': User.query.get(d.donor_id).username if not d.is_anonymous else 'Anonymous',
            'amount': d.amount,
            'date': d.date.isoformat(),
            'is_anonymous': d.is_anonymous
        } for d in charity.donations],
        'stories': [{
            'id': s.id,
            'title': s.title,
            'content': s.content,
            'photo_url': s.photo_url,
            'date': s.date.isoformat()
        } for s in charity.stories]
    })

@api.route('/stories', methods=['GET', 'POST'])
@jwt_required(optional=True)
def stories():
    if request.method == 'GET':
        charity_id = request.args.get('charity_id', type=int)
        if charity_id:
            charity = Charity.query.filter_by(id=charity_id, approved=True, rejected=False).first()
            if not charity:
                return jsonify({'message': 'Charity not found or not approved'}), 404
            stories = Story.query.filter_by(charity_id=charity_id).all()
            if not stories:
                return jsonify([])  # Return empty array instead of 404
        else:
            stories = Story.query.join(Charity).filter(Charity.approved==True, Charity.rejected==False).all()
        return jsonify([{
            'id': s.id,
            'charity_id': s.charity_id,
            'charity_name': Charity.query.get(s.charity_id).name,
            'title': s.title,
            'content': s.content,
            'photo_url': s.photo_url,
            'date': s.date.isoformat()
        } for s in stories])
    
    # POST method requires authentication
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({'message': 'Authentication required'}), 401
    user = User.query.get(user_id)
    if user.role != 'charity':
        return jsonify({'message': 'Access denied'}), 403
    charity = Charity.query.filter_by(user_id=user_id).first()
    if not charity:
        return jsonify({'message': 'Charity not found'}), 404
    if not charity.approved:
        return jsonify({'message': 'Charity not approved'}), 403
    
    data = request.json
    title = data.get('title')
    content = data.get('content')
    photo_url = data.get('photo_url')
    
    if not title or not content:
        return jsonify({'message': 'Title and content are required'}), 400
    if photo_url and not re.match(r'^https?://[^\s<>"]+|www\.[^\s<>"]+$', photo_url):
        return jsonify({'message': 'Invalid photo URL'}), 400
    
    story = Story(
        charity_id=charity.id,
        title=title,
        content=content,
        photo_url=photo_url,
        date=datetime.utcnow()
    )
    db.session.add(story)
    db.session.commit()
    
    return jsonify({
        'message': 'Story created successfully',
        'story': {
            'id': story.id,
            'charity_id': story.charity_id,
            'title': story.title,
            'content': story.content,
            'photo_url': story.photo_url,
            'date': story.date.isoformat()
        }
    }), 201

@api.route('/stories/<int:id>', methods=['PUT'])
@jwt_required()
def update_story(id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'charity':
        return jsonify({'message': 'Access denied'}), 403
    charity = Charity.query.filter_by(user_id=user_id).first()
    if not charity:
        return jsonify({'message': 'Charity not found'}), 404
    story = Story.query.get(id)
    if not story or story.charity_id != charity.id:
        return jsonify({'message': 'Story not found or not owned by this charity'}), 404
    if not charity.approved:
        return jsonify({'message': 'Charity not approved'}), 403
    
    data = request.json
    title = data.get('title')
    content = data.get('content')
    photo_url = data.get('photo_url')
    
    if not title or not content:
        return jsonify({'message': 'Title and content are required'}), 400
    if photo_url and not re.match(r'^https?://[^\s<>"]+|www\.[^\s<>"]+$', photo_url):
        return jsonify({'message': 'Invalid photo URL'}), 400
    
    story.title = title
    story.content = content
    story.photo_url = photo_url
    db.session.commit()
    
    return jsonify({
        'message': 'Story updated successfully',
        'story': {
            'id': story.id,
            'charity_id': story.charity_id,
            'title': story.title,
            'content': story.content,
            'photo_url': story.photo_url,
            'date': story.date.isoformat()
        }
    })

@api.route('/charity/status', methods=['GET'])
@jwt_required()
def charity_status():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'charity':
        return jsonify({'message': 'Access denied'}), 403
    charity = Charity.query.filter_by(user_id=user_id).first()
    if not charity:
        return jsonify({'message': 'Charity not found'}), 404
    return jsonify({
        'id': charity.id,
        'name': charity.name,
        'approved': charity.approved,
        'rejected': charity.rejected
    })

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
    return jsonify([{
        'id': d.id,
        'donor_username': User.query.get(d.donor_id).username if not d.is_anonymous else 'Anonymous',
        'amount': d.amount,
        'date': d.date.isoformat(),
        'is_anonymous': d.is_anonymous
    } for d in charity.donations])


@api.route('/donor/credits', methods=['GET'])
@jwt_required()
def donor_credits():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'donor':
            return jsonify({'message': 'Access denied'}), 403
        
        return jsonify({
            'credits': user.credits,
            'user_id': user.id,
            'username': user.username
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@api.route('/donor/credit-history', methods=['GET'])
@jwt_required()
def donor_credit_history():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'donor':
            return jsonify({'message': 'Access denied'}), 403
        
        transactions = CreditTransaction.query.filter_by(user_id=user_id).all()
        return jsonify([{
            'id': t.id,
            'amount': t.amount,
            'date': t.date.isoformat(),
            'user_id': user_id
        } for t in transactions]), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@api.route('/donor/history', methods=['GET'])
@jwt_required()
def donor_history():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'donor':
            return jsonify({'message': 'Access denied'}), 403
        
        donations = Donation.query.filter_by(donor_id=user_id).all()
        return jsonify([{
            'id': d.id,
            'charity_id': d.charity_id,
            'charity_name': Charity.query.get(d.charity_id).name,
            'amount': d.amount,
            'date': d.date.isoformat(),
            'is_anonymous': d.is_anonymous,
            'user_id': user_id
        } for d in donations]), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@api.route('/donor/donate', methods=['POST'])
@jwt_required()
def donor_donate():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != 'donor':
        return jsonify({'message': 'Access denied'}), 403

    data = request.json
    charity_id = data.get('charity_id')
    amount = data.get('amount')
    is_anonymous = data.get('is_anonymous', False)

    if not charity_id or not amount:
        return jsonify({'message': 'Missing required fields: charity_id and amount'}), 400
    if not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({'message': 'Amount must be a positive number'}), 400

    charity = Charity.query.get(charity_id)
    if not charity:
        return jsonify({'message': 'Charity not found'}), 404
    if not charity.approved or charity.rejected:
        return jsonify({'message': 'Charity not approved for donations'}), 403
    if user.credits < amount:
        return jsonify({'message': 'Insufficient credits'}), 400

    donation = Donation(
        donor_id=user_id,
        charity_id=charity_id,
        amount=amount,
        date=datetime.utcnow(),
        is_anonymous=is_anonymous
    )
    user.credits -= amount
    db.session.add(donation)
    db.session.commit()

    return jsonify({
        'message': 'Donation successful',
        'donation': {
            'id': donation.id,
            'charity_name': charity.name,
            'amount': donation.amount,
            'date': donation.date.isoformat(),
            'is_anonymous': donation.is_anonymous
        },
        'new_balance': user.credits
    }), 201




