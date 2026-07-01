from django.db import models
from ..core.models import TimeStampedModel, PaymentMethod
from ..customers.models import Customer
from ..factories.models import Factory
import datetime


def generate_receipt_number():
    today = datetime.date.today()
    prefix = f"RCP-{today.strftime('%Y%m%d')}"
    last = CustomerIncome.objects.filter(
        receipt_number__startswith=prefix
    ).order_by('-receipt_number').first()
    if last:
        try:
            last_num = int(last.receipt_number.split('-')[-1])
            return f"{prefix}-{last_num + 1:04d}"
        except (ValueError, IndexError):
            pass
    return f"{prefix}-0001"


def generate_payment_number():
    today = datetime.date.today()
    prefix = f"PAY-{today.strftime('%Y%m%d')}"
    last = FactoryPayment.objects.filter(
        payment_number__startswith=prefix
    ).order_by('-payment_number').first()
    if last:
        try:
            last_num = int(last.payment_number.split('-')[-1])
            return f"{prefix}-{last_num + 1:04d}"
        except (ValueError, IndexError):
            pass
    return f"{prefix}-0001"


class CustomerIncome(TimeStampedModel):
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='income_records',
        help_text="Customer who made the payment"
    )
    sale = models.OneToOneField(
        'sales.Sale',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='auto_income',
        help_text=(
            "Linked sale for auto-created records. "
            "Null for manual payments."
        )
    )
    date = models.DateField(
        help_text="Date payment was received"
    )
    paid_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Amount received from customer"
    )
    currency = models.CharField(
        max_length=10,
        default='ETB'
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH
    )
    reference = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Transaction reference or bank slip number"
    )
    is_auto = models.BooleanField(
        default=False,
        help_text=(
            "True = auto-created from sale. "
            "False = manually entered by owner."
        )
    )
    receipt_number = models.CharField(
        max_length=50,
        unique=True,
        default=generate_receipt_number,
        help_text="Auto-generated receipt number"
    )
    notes = models.TextField(
        blank=True,
        null=True
    )

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Customer Income'
        verbose_name_plural = 'Customer Incomes'

    def __str__(self):
        return (
            f"Receipt #{self.receipt_number} | "
            f"{self.customer.name} paid "
            f"{self.paid_amount} {self.currency}"
        )


class FactoryPayment(TimeStampedModel):
    factory = models.ForeignKey(
        Factory,
        on_delete=models.PROTECT,
        related_name='payment_records',
        help_text="Factory that was paid"
    )
    purchase = models.OneToOneField(
        'purchases.Purchase',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='auto_payment',
        help_text=(
            "Linked purchase for auto-created records. "
            "Null for standalone payments."
        )
    )
    date = models.DateField()
    paid_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Amount paid to factory"
    )
    currency = models.CharField(
        max_length=10,
        default='ETB'
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH
    )
    reference = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    is_auto = models.BooleanField(
        default=False,
        help_text=(
            "True = auto-created from purchase. "
            "False = manually entered by owner."
        )
    )
    payment_number = models.CharField(
        max_length=50,
        unique=True,
        default=generate_payment_number,
        help_text="Auto-generated payment number"
    )
    notes = models.TextField(
        blank=True,
        null=True
    )

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Factory Payment'
        verbose_name_plural = 'Factory Payments'

    def __str__(self):
        return (
            f"Payment #{self.payment_number} | "
            f"To {self.factory.name} | "
            f"{self.paid_amount} {self.currency}"
        )


class GeneralExpense(TimeStampedModel):
    date = models.DateField(
        help_text="Date expense was paid"
    )
    description = models.TextField(
        help_text=(
            "What was this expense for? "
            "Write clearly. Example: Monthly warehouse rent"
        )
    )
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Amount spent"
    )
    currency = models.CharField(
        max_length=10,
        default='ETB'
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH
    )
    reference = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Receipt number or reference, optional"
    )
    expense_number = models.CharField(
        max_length=50,
        unique=True,
        help_text="Auto-generated expense reference number"
    )
    notes = models.TextField(
        blank=True,
        null=True
    )

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'General Expense'
        verbose_name_plural = 'General Expenses'

    def __str__(self):
        return (
            f"Expense #{self.expense_number} | "
            f"{self.description[:50]} | "
            f"{self.amount} {self.currency}"
        )

    def save(self, *args, **kwargs):
        if not self.expense_number:
            self.expense_number = self._generate_expense_number()
        super().save(*args, **kwargs)

    def _generate_expense_number(self):
        today = datetime.date.today()
        prefix = f"EXP-{today.strftime('%Y%m%d')}"
        last = GeneralExpense.objects.filter(
            expense_number__startswith=prefix
        ).order_by('-expense_number').first()
        if last:
            try:
                last_num = int(last.expense_number.split('-')[-1])
                return f"{prefix}-{last_num + 1:04d}"
            except (ValueError, IndexError):
                pass
        return f"{prefix}-0001"