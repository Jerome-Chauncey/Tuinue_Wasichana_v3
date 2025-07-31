from email_service import send_password_reset_email
from token_service import generate_reset_token


to_email = "test@example.com"
email = to_email
token = generate_reset_token(email)
send_password_reset_email(email, token)