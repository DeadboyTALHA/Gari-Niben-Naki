import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    '''
    Send an HTML email via Gmail SMTP.
    Returns True if sent successfully, False otherwise.
    '''
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From']    = settings.mail_from
    msg['To']      = to_email
    msg.attach(MIMEText(html_body, 'html'))

    try:
        with smtplib.SMTP(settings.mail_server, settings.mail_port) as server:
            server.ehlo()
            server.starttls()  # Encrypt the connection
            server.login(settings.mail_username, settings.mail_password)
            server.sendmail(settings.mail_from, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f'Email send error: {e}')  # Log but don't crash the app
        return False


def send_booking_confirmation(to_email: str, booking_ref: str, car_name: str,
                               pickup_date: str, return_date: str, total: float):
    html = f'''
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto;'>
      <h2 style='color: #2563EB;'>Booking Confirmed!</h2>
      <p>Your booking reference: <strong>{booking_ref}</strong></p>
      <table style='width:100%; border-collapse: collapse;'>
        <tr><td style='padding:8px; border:1px solid #eee;'>Car</td>
            <td style='padding:8px; border:1px solid #eee;'>{car_name}</td></tr>
        <tr><td style='padding:8px; border:1px solid #eee;'>Pickup</td>
            <td style='padding:8px; border:1px solid #eee;'>{pickup_date}</td></tr>
        <tr><td style='padding:8px; border:1px solid #eee;'>Return</td>
            <td style='padding:8px; border:1px solid #eee;'>{return_date}</td></tr>
        <tr><td style='padding:8px; border:1px solid #eee;'>Total Paid</td>
            <td style='padding:8px; border:1px solid #eee;'>${total:.2f}</td></tr>
      </table>
      <p style='color: #6B7280; font-size:12px; margin-top:20px;'>
        Gari Niben Naki - Your Trusted Car Rental Platform
      </p>
    </div>
    '''
    send_email(to_email, f'Booking Confirmed - {booking_ref}', html)


def send_welcome_email(to_email: str, full_name: str):
    html = f'''
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto;'>
      <h2 style='color: #2563EB;'>Welcome to Gari Niben Naki, {full_name}!</h2>
      <p>Your account has been created successfully.</p>
      <p>Start browsing available cars today.</p>
      <a href='{settings.frontend_url}/cars'
         style='background:#2563EB; color:white; padding:12px 24px;
                border-radius:6px; text-decoration:none; display:inline-block;'>
        Browse Cars
      </a>
    </div>
    '''
    send_email(to_email, 'Welcome to Gari Niben Naki!', html)