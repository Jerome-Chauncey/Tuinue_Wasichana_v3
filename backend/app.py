from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, jwt
from routes import api
from config import Config
from reset_routes import reset_bp

app = Flask(__name__)

app.config.from_object(Config)

CORS(app, resources={
    r"/api/*": {
        "origins": ["https://tuinue-wasichana-v3-1.onrender.com"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
}) 

db.init_app(app)
jwt.init_app(app)

app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(reset_bp, url_prefix='/api/password-reset')

with app.app_context():
    from models import User, Charity, Donation, Story, CreditTransaction
    db.create_all()

@app.route('/api/test')
def test():
    return {"message": "API is running"}, 200

@app.route('/api/cors-test')
def cors_test():
    return jsonify({'message': 'CORS test'}), 200

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'https://tuinue-wasichana-v3-1.onrender.com')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=True)