from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, jwt
from routes import api
from config import Config
from reset_routes import reset_bp
import os

app = Flask(__name__)
app.config.from_object(Config)

allowed_origins = [
    "https://tuinue-wasichana-v3-1.onrender.com",
    "https://tuinue-wasichana-v3.onrender.com"
]

if os.environ.get('FLASK_ENV') == 'development':
    allowed_origins.extend([
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ])

CORS(app, resources={
    r"/api/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": [
            "Content-Type", 
            "Authorization",
            "X-Requested-With",
            "Accept"
        ],
        "expose_headers": [
            "Content-Disposition",
            "X-Total-Count"
        ],
        "supports_credentials": True,
        "max_age": 86400  
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

if __name__ == '__main__':
    app.run(debug=True)