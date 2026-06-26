from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        # abstract = True means this model has NO table in database
        # it just shares its fields with every model that inherits it


class AppSetting(models.Model):
    """
    Global settings for the app. Only ONE row ever exists.
    The owner can change these from a settings page.

    We use a SingletonModel pattern:
        → only one row allowed
        → always fetched with AppSetting.get_settings()

    FIELDS:

    business_name
        → Your company/shop name
        → Shown on invoices and reports
        → Example: "Kebede Trading PLC"

    business_phone
        → Your contact number
        → Shown on invoices

    business_address
        → Your location
        → Shown on invoices

    low_stock_alert_percentage
        → When remaining bags drop below X% of purchased bags
          the item is flagged as LOW STOCK on dashboard
        → Default is 20 (meaning 20%)
        → Owner can change to 30, 10, etc from settings page
        → Example: bought 10 bags, 20% threshold = alert when 2 bags left


    default_currency
        → The main currency used
        → Default: ETB
        → Can be changed to USD or any currency in available_currencies

    available_currencies
        → List of currencies the owner has added
        → Stored as JSON array: ["ETB", "USD"]
        → Owner can add more from settings page
        → Example: ["ETB", "USD", "EUR"]
    """
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
        """
        Always returns the one and only settings row.
        If it does not exist yet, creates it with defaults.
        Called anywhere in the app like:
            settings = AppSetting.get_settings()
            threshold = settings.low_stock_alert_percentage
        """
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
    """
    Reusable list of payment methods.
    Used in income, expense, and payment models.
    TextChoices means stored as text in database.

    CASH     → physical money
    TELEBIRR → Ethiopian mobile money
    CBE      → Commercial Bank of Ethiopia transfer
    BOA      → Bank of Abyssinia transfer
    AWASH    → Awash Bank transfer
    OTHER    → anything else (owner writes in notes)
    """
    CASH = 'cash', 'Cash'
    TELEBIRR = 'telebirr', 'Telebirr'
    CBE = 'cbe', 'CBE'
    BOA = 'boa', 'BOA'
    AWASH = 'awash', 'Awash'
    OTHER = 'other', 'Other'
