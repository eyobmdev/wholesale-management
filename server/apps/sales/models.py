from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from ..core.models import TimeStampedModel, PaymentMethod
from ..customers.models import Customer


def generate_invoice_number():
    import datetime
    today = datetime.date.today()
    prefix = f"INV-{today.strftime('%Y%m%d')}"
    last = Sale.objects.filter(
        invoice_number__startswith=prefix
    ).order_by('-invoice_number').first()
    if last:
        try:
            last_num = int(last.invoice_number.split('-')[-1])
            return f"{prefix}-{last_num + 1:04d}"
        except (ValueError, IndexError):
            pass
    return f"{prefix}-0001"


class Sale(TimeStampedModel):
    class PaymentType(models.TextChoices):
        CASH = 'cash', 'Cash'
        CREDIT = 'credit', 'Credit'
        PARTIAL = 'partial', 'Partial Payment'

    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='sales',
        help_text="Customer making the purchase"
    )
    date = models.DateField(
        help_text="Actual sale date"
    )
    currency = models.CharField(
        max_length=10,
        default='ETB'
    )
    payment_type = models.CharField(
        max_length=10,
        choices=PaymentType.choices,
        default=PaymentType.CASH
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        blank=True,
        null=True,
        help_text="Payment method used (CBE, Telebirr, etc.)"
    )
    amount_paid_now = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text=(
            "Cash received at sale time. "
            "0 for full credit. Full amount for cash. "
            "Any amount in between for partial."
        )
    )
    total_sale_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="Sum of all items. Auto-updated when items change."
    )
    credit_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text=(
            "Amount added to customer balance. "
            "= total_sale_amount - amount_paid_now"
        )
    )
    invoice_number = models.CharField(
        max_length=50,
        unique=True,
        default=generate_invoice_number,
        help_text="Auto-generated invoice number"
    )
    notes = models.TextField(
        blank=True,
        null=True
    )

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Sale'
        verbose_name_plural = 'Sales'

    def __str__(self):
        return (
            f"Sale #{self.invoice_number} | "
            f"{self.customer.name} | "
            f"{self.total_sale_amount} {self.currency}"
        )

    def save(self, *args, **kwargs):
        if not self.date:
            self.date = timezone.now().date()

        if self.pk:
            self.recalculate_totals()

        self.payment_type = self.computed_payment_type
        super().save(*args, **kwargs)

    def recalculate_totals(self):
        from django.db.models import Sum

        result = self.items.aggregate(total=Sum('total_line_amount'))

        self.total_sale_amount = result['total'] or 0
        self.credit_amount = self.total_sale_amount - self.amount_paid_now

        if self.credit_amount < 0:
            self.credit_amount = 0


    @property
    def computed_payment_type(self):
        if self.amount_paid_now == self.total_sale_amount:
            return self.PaymentType.CASH
        elif self.amount_paid_now < self.total_sale_amount:
            return self.PaymentType.PARTIAL
        return self.PaymentType.CREDIT


    @property
    def payment_status(self):
        if self.total_sale_amount == 0:
            return "No Items"
        elif self.amount_paid_now == 0:
            return "Unpaid"
        elif  self.amount_paid_now >= self.total_sale_amount:
            return "Fully Paid"
        return "Partial"


class SaleItem(TimeStampedModel):
    class SellPriceType(models.TextChoices):
        PER_PIECE = 'per_piece', 'Price Per Piece'
        PER_BAG = 'per_bag', 'Price Per Bag'

    sale = models.ForeignKey(
        Sale,
        on_delete=models.CASCADE,
        related_name='items',
        help_text="The sale invoice this item belongs to"
    )
    stock_batch = models.ForeignKey(
        'inventory.StockBatch',
        on_delete=models.PROTECT,
        related_name='sale_items',
        help_text="Which stock batch (shipment) is being sold from"
    )
    bags_sold = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Number of bags sold from this batch"
    )
    pcs_per_bag = models.PositiveIntegerField(
        help_text="Copied from batch at sale time. Locked for history."
    )
    pieces_sold = models.PositiveIntegerField(
        default=0,
        help_text="Auto calculated: bags_sold × pcs_per_bag"
    )
    sell_price_type = models.CharField(
        max_length=10,
        choices=SellPriceType.choices,
        default=SellPriceType.PER_PIECE,
        help_text="Is the selling price per piece or per bag?"
    )
    selling_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Selling price per piece OR per bag"
    )
    total_line_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="Auto calculated total for this line"
    )
    purchase_cost_per_piece = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="Snapshot of batch cost per piece at sale time"
    )

    class Meta:
        ordering = ['stock_batch__item_code']
        verbose_name = 'Sale Item'
        verbose_name_plural = 'Sale Items'

    def __str__(self):
        return (
            f"{self.stock_batch.item_code} | "
            f"{self.bags_sold} bags × {self.pcs_per_bag} pcs | "
            f"Sale #{self.sale.invoice_number}"
        )

    def clean(self):
        if not self.stock_batch_id:
            return
        batch = self.stock_batch
        # If editing, give back old quantity before checking
        if self.pk:
            old = SaleItem.objects.get(pk=self.pk)
            available = batch.remaining_bags + old.bags_sold
        else:
            available = batch.remaining_bags

        if self.bags_sold > available:
            raise ValidationError(
                f"Not enough stock in batch {batch.shipping_code}. "
                f"Available: {available} bags. "
                f"You requested: {self.bags_sold} bags."
            )
        if self.bags_sold <= 0:
            raise ValidationError("Bags sold must be greater than 0.")

    def save(self, *args, **kwargs):
        batch = self.stock_batch
        self.pcs_per_bag = batch.pcs_per_bag
        self.purchase_cost_per_piece = batch.cost_per_piece
        self.full_clean()

        # Snapshot batch data

        # Calculate pieces sold
        self.pieces_sold = int(self.bags_sold * self.pcs_per_bag)

        # Calculate line total
        if self.sell_price_type == self.SellPriceType.PER_PIECE:
            self.total_line_amount = self.pieces_sold * self.selling_price
        else:  # PER_BAG
            self.total_line_amount = self.bags_sold * self.selling_price

        # Track old values for stock adjustment on edit
        old_bags = 0
        old_pieces = 0
        if self.pk:
            try:
                old = SaleItem.objects.get(pk=self.pk)
                old_bags = old.bags_sold
                old_pieces = old.pieces_sold
            except SaleItem.DoesNotExist:
                pass

        super().save(*args, **kwargs)

        # Adjust stock batch
        self._adjust_stock(old_bags, old_pieces)

        # Recalculate parent sale totals
        self.sale.recalculate_totals()
        self.sale.save()

    def _adjust_stock(self, old_bags, old_pieces):
        from django.db.models import F
        batch = self.stock_batch
        diff_bags = self.bags_sold - old_bags
        diff_pieces = self.pieces_sold - old_pieces
        StockBatch = batch.__class__
        StockBatch.objects.filter(pk=batch.pk).update(
            sold_bags=F('sold_bags') + diff_bags,
            sold_pieces=F('sold_pieces') + diff_pieces
        )

    def delete(self, *args, **kwargs):
        from django.db.models import F
        batch = self.stock_batch
        batch.__class__.objects.filter(pk=batch.pk).update(
            sold_bags=F('sold_bags') - self.bags_sold,
            sold_pieces=F('sold_pieces') - self.pieces_sold
        )
        sale = self.sale
        super().delete(*args, **kwargs)
        sale.recalculate_totals()
        sale.save()

    @property
    def selling_price_per_piece(self):
        """Normalize selling price to per-piece for profit calculation."""
        if self.sell_price_type == self.SellPriceType.PER_PIECE:
            return self.selling_price
        if self.pcs_per_bag and self.pcs_per_bag > 0:
            return self.selling_price / self.pcs_per_bag
        return 0

    @property
    def profit(self):
        return (
                (self.selling_price_per_piece - self.purchase_cost_per_piece)
                * self.pieces_sold
        )