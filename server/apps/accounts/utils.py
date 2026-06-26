from datetime import timedelta
from decouple import config
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

COOKIE_CONFIG = {
    'key':      'refresh_token',
    'httponly': True,
    'secure':   not settings.DEBUG,
    'samesite': 'Lax',
    'max_age':  timedelta(days=config("REFRESH_TOKEN_EXPIRE_DAYS",cast=int)),
}

def set_auth_cookies(response, refresh_token):
    response.set_cookie(**COOKIE_CONFIG, value=str(refresh_token))
    return response


def send_password_reset_email(user, reset_url):
    if not user.email:
        logger.error("User has no email address")
        return False

    context = {
        "first_name": user.first_name or user.username or "User",
        "reset_url": reset_url,
    }

    subject = "Reset your password"

    # Plain text fallback
    text_body = f"""
    Hi {context['first_name']},

    We received a request to reset your password. 
    Click the link below to choose a new one:

    {reset_url}

    This link will expire in 24 hours.
    If you didn't request this, please ignore this email.
    """

    try:
        html_body = render_to_string('accounts/reset_password_email.html', context)
    except Exception as e:
        logger.error(f"Failed to render reset password template: {e}")
        print(f"Failed to render reset password template: {e}")
        html_body = text_body

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach_alternative(html_body, "text/html")

    try:
        email.send(fail_silently=False)
        print(f"Password reset email sent to {user.email}")
        logger.info(f"Password reset email sent to {user.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user.email}: {e}", exc_info=True)
        print(f"Failed to send password reset email to {user.email}: {e}")
        raise