from django.db import models
from django.contrib.auth.models import AbstractUser,BaseUserManager

class UserManger(BaseUserManager):
    def create_user(self,email,password=None,**extra_fields):
        if not email:
            raise ValueError("Email is required.")
        extra_fields.setdefault("username",email)
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self,email,password=None,**extra_fields):
        extra_fields.setdefault("is_staff",True)
        extra_fields.setdefault("is_superuser",True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(email,password,**extra_fields)


class User(AbstractUser):
    email = models.EmailField(unique=True,null=False)

    first_name = models.CharField(blank=True,max_length=150)
    last_name = models.CharField(blank=True,max_length=150)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []


    objects = UserManger()
    class Meta:
        ordering = ["first_name","last_name"]

    def __str__(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}".strip()
        return self.email

    @property
    def full_name(self):
        full = f"{self.first_name} {self.last_name}".strip()
        return full if full else self.email