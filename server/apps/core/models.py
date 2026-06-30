from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        # abstract = True means this model has NO table in database
        # it just shares its fields with every model that inherits it


class AppSetting(models.Model):
    business_name = models.CharField(max_length=255,default='My Business')
    business_phone = models.CharField(max_length=20,blank=True,null=True)
    business_address = models.TextField(blank=True,null=True)
    low_stock_alert_percentage = models.PositiveIntegerField(default=20,
                                                             help_text="Alert when remaining stock drops below this % of purchased amount")
    default_currency = models.CharField(max_length=10,default='ETB')
    available_currencies = models.JSONField(
        default=list,
        help_text="List of currencies owner can use. Example: ['ETB', 'USD']")

    class Meta:
        verbose_name = 'App Setting'
        verbose_name_plural = 'App Settings'

    def __str__(self):
        return f"Settings — {self.business_name}"

    @classmethod
    def get_settings(cls):
        obj, created = cls.objects.get_or_create(
            pk=1,
            defaults={
                'business_name': 'My Business',
                'available_currencies': ['ETB', 'USD'],
                'default_currency': 'ETB',
            }
        )
        return obj

    def save(self, *args, **kwargs):
        """Force primary key to always be 1. Only one row allowed."""
        self.pk = 1
        super().save(*args, **kwargs)


class PaymentMethod(models.TextChoices):
    CASH = 'cash', 'Cash'
    TELEBIRR = 'telebirr', 'Telebirr'
    CBE = 'cbe', 'CBE'
    BOA = 'boa', 'BOA'
    AWASH = 'awash', 'Awash'
    OTHER = 'other', 'Other'
