from django.db import models
from ..core.models import TimeStampedModel, AppSetting


class StockBatch(TimeStampedModel):
    purchase_item = models.OneToOneField(
        'purchases.PurchaseItem',
        on_delete=models.CASCADE,
        related_name='stock_batch',
        help_text="The purchase item this stock batch comes from"
    )
    purchase = models.ForeignKey(
        'purchases.Purchase',
        on_delete=models.CASCADE,
        related_name='stock_batches',
        help_text="The purchase order this batch belongs to"
    )
    factory = models.ForeignKey(
        'factories.Factory',
        on_delete=models.PROTECT,
        related_name='stock_batches',
        help_text="Which factory supplied this stock"
    )
    item_code = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Product code — same code can exist in multiple batches"
    )
    product_name = models.CharField(
        max_length=255
    )
    shipping_code = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Groups all batches from the same shipment"
    )
    pcs_per_bag = models.PositiveIntegerField(
        help_text=(
            "Pieces per bag for THIS batch. "
            "Critical for sales: 3 bags × 24 pcs = 72 pieces"
        )
    )
    purchase_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Cost price from purchase (per piece or per bag)"
    )
    price_type = models.CharField(
        max_length=10,
        choices=[('per_piece', 'Per Piece'), ('per_bag', 'Per Bag')],
        default='per_piece'
    )
    currency = models.CharField(
        max_length=10,
        default='ETB'
    )
    total_bags_purchased = models.PositiveIntegerField(
        help_text="Starting bag count — never changes after creation"
    )
    total_pieces_purchased = models.PositiveIntegerField(
        help_text="Starting piece count — never changes after creation"
    )
    sold_bags = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Bags sold so far. Increases with every sale from this batch."
    )
    sold_pieces = models.PositiveIntegerField(
        default=0,
        help_text="Pieces sold so far. Increases with every sale from this batch."
    )

    class Meta:
        ordering = ['-purchase__date', 'item_code']
        verbose_name = 'Stock Batch'
        verbose_name_plural = 'Stock Batches'

    def __str__(self):
        return (
            f"{self.item_code} | {self.shipping_code} | "
            f"{self.remaining_bags} bags left "
            f"({self.pcs_per_bag} pcs/bag)"
        )

    @property
    def remaining_bags(self):
        """Bags still available to sell."""
        return self.total_bags_purchased - self.sold_bags

    @property
    def remaining_pieces(self):
        """Pieces still available to sell."""
        return self.total_pieces_purchased - self.sold_pieces

    @property
    def cost_per_piece(self):
        if self.price_type == 'per_piece':
            return self.purchase_price
        if self.pcs_per_bag and self.pcs_per_bag > 0:
            return self.purchase_price / self.pcs_per_bag
        return 0

    @property
    def stock_value(self):
        """Current value of remaining stock at purchase cost."""
        return self.remaining_pieces * self.cost_per_piece

    @property
    def is_sold_out(self):
        return self.remaining_bags <= 0

    @property
    def is_low_stock(self):
        if self.total_bags_purchased == 0:
            return False
        settings = AppSetting.get_settings()
        threshold = settings.low_stock_alert_percentage / 100
        return (
                not self.is_sold_out
                and (self.remaining_bags / self.total_bags_purchased) < threshold
        )