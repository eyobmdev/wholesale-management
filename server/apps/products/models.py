from django.db import models

class Product(models.Model):
    STOCK_UNIT = [
        ('bags',   'Bags'),
        ('pieces', 'Pieces'),
    ]

    item_code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    default_quantity_per_bag = models.IntegerField(null=True, blank=True)
    # ^ Used only as a reference/default when creating purchases.
    # Each purchase stores its own quantity_per_bag (can vary per shipment).

    min_stock = models.IntegerField(default=0)
    min_stock_unit = models.CharField(max_length=10, choices=STOCK_UNIT, default='bags')
    # ^ Example: min_stock=5, min_stock_unit='bags' → alert when total remaining bags < 5
    # ^ Example: min_stock=20, min_stock_unit='pieces' → alert when total remaining pieces < 20

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
