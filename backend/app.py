from flask import Flask
from flask_cors import CORS
from extensions import db, jwt
from routes import api
from config import Config
from reset_routes import reset_bp

app = Flask(__name__)

app.config.from_object(Config)

CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

db.init_app(app)
jwt.init_app(app)

app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(reset_bp, url_prefix='/api/password-reset')

with app.app_context():
    from models import User, Charity, Donation, Story, CreditTransaction
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)