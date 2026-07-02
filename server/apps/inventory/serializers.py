from rest_framework import serializers
from .models import StockBatch


class StockBatchSerializer(serializers.ModelSerializer):
    remaining_bags = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    remaining_pieces = serializers.IntegerField(read_only=True)
    cost_per_piece = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    stock_value = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    is_sold_out = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    factory_name = serializers.CharField(
        source='factory.name',
        read_only=True
    )
    purchase_date = serializers.DateField(
        source='purchase.date',
        read_only=True
    )

    class Meta:
        model = StockBatch
        fields = [
            'id',
            'item_code',
            'product_name',
            'factory',
            'factory_name',
            'purchase',
            'purchase_date',
            'shipping_code',
            'pcs_per_bag',
            'purchase_price',
            'price_type',
            'cost_per_piece',
            'currency',
            'total_bags_purchased',
            'total_pieces_purchased',
            'sold_bags',
            'sold_pieces',
            'remaining_bags',
            'remaining_pieces',
            'stock_value',
            'is_sold_out',
            'is_low_stock',
            'created_at',
        ]
        read_only_fields = fields


class StockSummaryByItemSerializer(serializers.Serializer):
    # The product identifier
    item_code = serializers.CharField()
    product_name = serializers.CharField()

    # How many separate batches exist for this item
    batch_count = serializers.IntegerField()

    # Totals across all batches
    total_bags_purchased = serializers.IntegerField()
    total_pieces_purchased = serializers.IntegerField()
    total_sold_bags = serializers.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    total_sold_pieces = serializers.IntegerField()
    total_remaining_bags = serializers.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    total_remaining_pieces = serializers.IntegerField()

    # Total value of remaining stock (sum of all batch values)
    total_stock_value = serializers.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    # If ANY batch is low stock or sold out
    has_low_stock_batch = serializers.BooleanField()
    has_sold_out_batch = serializers.BooleanField()

    # The individual batches for this item
    batches = StockBatchSerializer(many=True)