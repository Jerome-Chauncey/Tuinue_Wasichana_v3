import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from token_service import generate_reset_token

load_dotenv()

MAILTRAP_USERNAME = os.getenv("MAILTRAP_USERNAME")
MAILTRAP_PASSWORD = os.getenv("MAILTRAP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL")
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = os.getenv("SMTP_PORT")

def send_email(to_email, subject, html_content, plain_text):
    message = MIMEMultipart("alternative")
    message["From"] = FROM_EMAIL
    message["To"] = to_email
    message["Subject"] = subject

    message.attach(MIMEText(plain_text, "plain"))
    message.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(MAILTRAP_USERNAME, MAILTRAP_PASSWORD)
            server.sendmail(FROM_EMAIL, to_email, message.as_string())
            print(f"✅ Email sent to {to_email}")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")

def send_password_reset_email(to_email, reset_token):
    reset_link = f"https://tuinue-wasichana-ui-dw85.onrender.com/reset-password?token={reset_token}"
    subject = "Reset Your Password"

    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
        <div style="background-color: white; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to proceed:</p>
            <p style="text-align: center;">
                <a href="{reset_link}" style="background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
            </p>
            <p>If you didn’t request this, you can ignore this email.</p>
            <p style="color: #888;">Thanks,<br>The Tuinue Wasichana Team</p>
        </div>
    </body>
    </html>
    """

    plain_text = f"""\
Hello,

You requested a password reset. Use the link below to reset your password:

{reset_link}

If you didn’t request this, please ignore this email.

Thanks,
The Tuinue Wasichana Team
"""

    send_email(to_email, subject, html_content, plain_text)