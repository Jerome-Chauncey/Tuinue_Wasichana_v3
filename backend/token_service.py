import os
from itsdangerous import URLSafeTimedSerializer
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
SECURITY_PASSWORD_SALT = os.getenv("SECURITY_PASSWORD_SALT")

serializer = URLSafeTimedSerializer(SECRET_KEY)

def generate_reset_token(email):
    return serializer.dumps(email, salt=SECURITY_PASSWORD_SALT)

def confirm_reset_token(token, expiration=3600):
    try:
        email = serializer.loads(token, salt=SECURITY_PASSWORD_SALT, max_age=expiration)
        return email
    except Exception:
        return None