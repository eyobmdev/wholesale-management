from datetime import timedelta
from decouple import config
from django.conf import settings

COOKIE_CONFIG = {
    'key':      'refresh_token',
    'httponly': True,
    'secure':   not settings.DEBUG,
    'samesite': 'Lax',
    'max_age':  timedelta(days=config("REFRESH_TOKEN_EXPIRE_DAYS",cast=int)),
}

def set_auth_cookies(response, refresh_token):
    response.set_cookie(**COOKIE_CONFIG, value=str(refresh_token))
    response['X-Refresh-Token'] = str(refresh_token)
    return response