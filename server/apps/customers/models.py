from django.db import models
from server.apps.core.models import TimeStampedModel


class Customer(TimeStampedModel):
    """
    Represents one customer (person or business).

    The customer has a RUNNING BALANCE.
    Think of it like a bank account:
        Positive = customer owes YOU money
        Negative = you owe customer money (they overpaid)
        Zero     = settled, nothing owed

    The balance is NOT stored as a single field.
    It is CALCULATED every time from transaction history.
    This way it is always accurate and cannot go out of sync.

    BALANCE FORMULA:
        balance = initial_credit
                + sum of all (sale_total - paid_at_sale) for this customer
                - sum of all manual payments received from this customer

    FIELDS:

    name
        → Full name or business name
        → Example: "Kebede Wholesale Shop" or "Almaz Retail"
        → Required, cannot be empty

    phone
        → Main contact number
        → Optional (some customers you just know by name)
        → Example: "0911234567"

    location
        → Where the customer is
        → City, area, or specific shop location
        → Example: "Merkato, Addis Ababa" or "Hawassa Main Market"
        → When creating a sale, this auto-fills from here

    initial_credit
        → Debt the customer HAD before you started using this app
        → If Kebede already owed you 5,000 ETB before day one,
          you enter 5,000 here
        → This is added to the balance from day one
        → Default is 0 (new customer, clean slate)
        → Currency field tracks which currency this is in

    initial_credit_currency
        → Which currency the initial_credit is in
        → Example: 'ETB' or 'USD'
        → Must be one of the currencies in AppSetting.available_currencies

    opening_date
        → The date this customer was registered in the app
        → Defaults to today
        → Used for reports like "customers added this month"

    is_active
        → True = normal customer, shows everywhere
        → False = hidden/archived customer
        → We never delete, but we can deactivate
    """
    name = models.CharField(
        max_length=255,
        help_text="Full name or business name"
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Main contact number"
    )
    location = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="City, area, or shop location"
    )
    initial_credit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text=(
            "Debt this customer had BEFORE the app was used. "
            "Added to balance from day one."
        )
    )
    initial_credit_currency = models.CharField(
        max_length=10,
        default='ETB',
        help_text="Currency of the initial credit amount"
    )
    opening_date = models.DateField(
        help_text="Date customer was registered"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="False means archived/hidden, not deleted"
    )

    class Meta:
        ordering = ['name']
        verbose_name = 'Customer'
        verbose_name_plural = 'Customers'

    def __str__(self):
        return self.name

    # ------------------------------------------------------------------ #
    #  BALANCE CALCULATIONS                                                #
    #  These are properties, meaning they are calculated on demand        #
    #  They always reflect the true current state                         #
    # ------------------------------------------------------------------ #

    @property
    def total_sale_credit_amount(self):
        """
        Sum of all UNPAID portions from sales.

        When a sale is made:
            cash sale:    credit portion = 0
            credit sale:  credit portion = full sale amount
            partial sale: credit portion = sale total - paid at sale

        This sum tells us how much the customer owes from purchases.
        """
        from django.db.models import Sum
        result = self.sales.aggregate(total=Sum('credit_amount'))
        return result['total'] or 0

    @property
    def total_payments_received(self):
        """
        Sum of ALL money received from this customer.

        Includes:
            → Cash paid at time of sale (auto income records)
            → Manual payments customer made later

        Does NOT include the credit portion (not paid yet).
        """
        from django.db.models import Sum
        result = self.income_records.aggregate(total=Sum('paid_amount'))
        return result['total'] or 0

    @property
    def current_balance(self):
        """
        THE MAIN BALANCE — what customer owes you RIGHT NOW.

        Formula:
            initial_credit            ← old debt before app
            + total_sale_credit       ← new debt from sales
            - total_payments_received ← money they paid you

        Positive = they owe you
        Negative = you owe them (overpaid)
        Zero     = settled

        Example:
            initial_credit    = 1,000
            credit from sales = 5,120
            payments made     = 4,000
            ─────────────────────────
            balance           = 2,120  (they owe you 2,120)
        """
        return (
                self.initial_credit
                + self.total_sale_credit_amount
                - self.total_payments_received
        )

    @property
    def total_sales_amount(self):
        """Total value of ALL sales to this customer (cash + credit)."""
        from django.db.models import Sum
        result = self.sales.aggregate(total=Sum('total_sale_amount'))
        return result['total'] or 0

    @property
    def last_payment_date(self):
        """Date of most recent payment from this customer."""
        last = self.income_records.order_by('-date').first()
        return last.date if last else None

    @property
    def last_purchase_date(self):
        """Date of most recent sale to this customer."""
        last = self.sales.order_by('-date').first()
        return last.date if last else None

    @property
    def days_since_last_payment(self):
        """
        How many days since this customer last paid.
        Used for the dashboard overdue alerts (7, 15, 30, 60+ days).
        Returns None if customer never paid.
        """
        import datetime
        if self.last_payment_date:
            return (datetime.date.today() - self.last_payment_date).days
        return None