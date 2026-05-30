from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        # extra_fields.setdefault("username", email)
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)



class User(AbstractUser):
    email = models.EmailField(blank=False,unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS =["first_name","last_name"]

    class Meta:
        db_table = 'users'

    def __str__(self):
        if self.first_name and self.last_name:
            return f"f{self.first_name} {self.last_name}".strip()
        return self.email
