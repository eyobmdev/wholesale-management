from django.db import models
from ..core.models import TimeStampedModel


class Factory(TimeStampedModel):
    name = models.CharField(
        max_length=255,
        help_text="Supplier or factory name"
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )
    location = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    initial_balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text=(
            "Money you already owed this factory BEFORE using the app. "
            "Positive = you owe them."
        )
    )
    initial_balance_currency = models.CharField(
        max_length=10,
        default='ETB'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Factory'
        verbose_name_plural = 'Factories'

    def __str__(self):
        return self.name


    @property
    def total_purchased_unpaid(self):
        from django.db.models import Sum
        result = self.purchases.aggregate(total=Sum('unpaid_amount'))
        return result['total'] or 0

    @property
    def total_payments_made(self):
        from django.db.models import Sum
        result = self.payment_records.aggregate(total=Sum('paid_amount'))
        return result['total'] or 0

    @property
    def current_balance(self):
        return (
                self.initial_balance
                + self.total_purchased_amount
                - self.total_payments_made
        )

    @property
    def total_purchased_amount(self):
        # Total value of all purchases from this factory
        from django.db.models import Sum
        result = self.purchases.aggregate(total=Sum('total_purchase_amount'))
        return result['total'] or 0

    @property
    def last_purchase_date(self):
        last = self.purchases.order_by('-date').first()
        return last.date if last else None

    @property
    def last_payment_date(self):
        last = self.payment_records.order_by('-date').first()
        return last.date if last else None