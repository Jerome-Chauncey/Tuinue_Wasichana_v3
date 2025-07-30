from extensions import db 
from datetime import datetime

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    credits = db.Column(db.Integer, default=0)
    donations = db.relationship('Donation', backref='donor', lazy=True)
    credit_transactions = db.relationship('CreditTransaction', backref='user', lazy=True)

class Charity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    mission_statement = db.Column(db.Text)
    location = db.Column(db.String(100))
    founded_year = db.Column(db.Integer)
    impact_metrics = db.Column(db.Text)
    contact_person = db.Column(db.String(100))
    contact_phone = db.Column(db.String(20))
    website = db.Column(db.String(200))
    photo_url = db.Column(db.String(200))
    approved = db.Column(db.Boolean, default=False)
    rejected = db.Column(db.Boolean, default=False)
    donations = db.relationship('Donation', backref='charity', lazy=True)
    stories = db.relationship('Story', backref='charity', lazy=True)

class Donation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    donor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    charity_id = db.Column(db.Integer, db.ForeignKey('charity.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    is_anonymous = db.Column(db.Boolean, default=False)

class Story(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    charity_id = db.Column(db.Integer, db.ForeignKey('charity.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    photo_url = db.Column(db.String(200))
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class CreditTransaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)