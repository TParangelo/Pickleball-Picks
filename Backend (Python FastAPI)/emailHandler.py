from dotenv import load_dotenv
from pydantic import BaseModel
import os
from email.message import EmailMessage
import ssl
import smtplib


load_dotenv()

GMAIL_SENDER = os.getenv("GMAIL_SENDER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")



def send_email(email: str, subject: str, reset_link: str):
    email_message = EmailMessage()
    try:
        email_message['From'] = GMAIL_SENDER
        email_message['To'] = email
        email_message['Subject'] = subject
        
        body = f"""
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background-color: #4CAF50;
                    color: white;
                    text-align: center;
                    padding: 20px;
                    border-radius: 5px 5px 0 0;
                }}
                .content {{
                    background-color: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 5px 5px;
                    border: 1px solid #ddd;
                    color: black;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #4CAF50;
                    color: white !important;
                    text-decoration: none !important;
                    border-radius: 5px;
                    margin: 20px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 12px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p style="color: black;">Hello,</p>
                    <p style="color: black;">We received a request to reset your password for your Pickleball-Picks account.</p>
                    <p style="color: black;">To reset your password, click the button below:</p>
                    <div style="text-align: center;">
                        <a class="button" href="{reset_link}">Reset Your Password</a>
                    </div>
                    <p style="color: black;">If you're having trouble clicking the button, copy and paste this URL into your web browser:</p>
                    <p style="word-break: break-all; font-size: 12px; color: #666;">{reset_link}</p>
                </div>
                <div class="footer">
                    
                    <p>Pickleball-Picks</p>
                </div>
            </div>
        </body>
        </html>
        """
        email_message.set_content(body, subtype='html')

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(GMAIL_SENDER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_SENDER, email, email_message.as_string())
        print(f"Email sent to {email}")
        return True
    except Exception as e:
        print(e)
        return False

