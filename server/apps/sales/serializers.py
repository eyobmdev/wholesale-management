from rest_framework import serializers
from django.db import transaction
from .models import Sale, SaleItem
from ..inventory.models import StockBatch


class SaleItemReadSerializer(serializers.ModelSerializer):
    selling_price_per_piece = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    profit = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )

    item_code = serializers.CharField(
        source='stock_batch.item_code',
        read_only=True
    )
    product_name = serializers.CharField(
        source='stock_batch.product_name',
        read_only=True
    )
    shipping_code = serializers.CharField(
        source='stock_batch.shipping_code',
        read_only=True
    )
    factory_name = serializers.CharField(
        source='stock_batch.factory.name',
        read_only=True
    )

    class Meta:
        model = SaleItem
        fields = [
            'id',
            'sale',
            'stock_batch',
            'item_code',
            'product_name',
            'shipping_code',
            'factory_name',
            'bags_sold',
            'pcs_per_bag',
            'pieces_sold',
            'sell_price_type',
            'selling_price',
            'selling_price_per_piece',
            'total_line_amount',
            'purchase_cost_per_piece',
            'profit',
            'created_at',
        ]
        read_only_fields = fields


class SaleItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = [
            'id',
            'stock_batch',
            'bags_sold',
            'sell_price_type',
            'selling_price',
        ]

    def validate_bags_sold(self, value):
        """Bags sold must be positive."""
        if value <= 0:
            raise serializers.ValidationError(
                "Bags sold must be greater than 0."
            )
        return value

    def validate_selling_price(self, value):
        """Selling price must be positive."""
        if value <= 0:
            raise serializers.ValidationError(
                "Selling price must be greater than 0."
            )
        return value

    def validate(self, data):
        batch = data.get('stock_batch')
        bags_requested = data.get('bags_sold', 0)

        if batch and bags_requested:
            # If editing existing item, we need to consider old bags
            # self.instance is the existing SaleItem if editing
            # self.instance is None if creating new
            if self.instance:
                # Return old bags to available before checking
                available = batch.remaining_bags + self.instance.bags_sold
            else:
                available = batch.remaining_bags

            if bags_requested > available:
                raise serializers.ValidationError(
                    f"Not enough stock. "
                    f"Batch '{batch.shipping_code}' has "
                    f"{available} bags available. "
                    f"You requested {bags_requested} bags."
                )

            if batch.is_sold_out and not self.instance:
                raise serializers.ValidationError(
                    f"Batch '{batch.shipping_code}' is sold out."
                )

        return data


class SaleReadSerializer(serializers.ModelSerializer):
    # Nested read-only items
    items = SaleItemReadSerializer(
        many=True,
        read_only=True
    )

    # Customer info for display
    customer_name = serializers.CharField(
        source='customer.name',
        read_only=True
    )
    customer_location = serializers.CharField(
        source='customer.location',
        read_only=True
    )
    customer_phone = serializers.CharField(
        source='customer.phone',
        read_only=True
    )
    customer_current_balance = serializers.DecimalField(
        source='customer.current_balance',
        max_digits=15,
        decimal_places=2,
        read_only=True
    )

    # Total profit for this entire sale (sum of all item profits)
    total_profit = serializers.SerializerMethodField()

    # Human readable payment status
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = [
            'id',
            'customer',
            'customer_name',
            'customer_location',
            'customer_phone',
            'customer_current_balance',
            'date',
            'currency',
            'payment_type',
            'amount_paid_now',
            'total_sale_amount',
            'credit_amount',
            'invoice_number',
            'notes',
            'total_profit',
            'payment_status',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'total_sale_amount',
            'credit_amount',
            'invoice_number',
        ]

    def get_total_profit(self, obj):
        return sum(item.profit for item in obj.items.all())

    def get_payment_status(self, obj):
        if obj.payment_type == Sale.PaymentType.CASH:
            return "Fully Paid"
        elif obj.payment_type == Sale.PaymentType.CREDIT:
            return f"Unpaid — owes {obj.credit_amount} {obj.currency}"
        else:
            return (
                f"Partial — paid {obj.amount_paid_now}, "
                f"owes {obj.credit_amount} {obj.currency}"
            )


class SaleCreateSerializer(serializers.ModelSerializer):
    items = SaleItemWriteSerializer(
        many=True,
        write_only=True
    )

    class Meta:
        model = Sale
        fields = [
            'id',
            'customer',
            'date',
            'currency',
            'payment_type',
            'amount_paid_now',
            'notes',
            'items',
            'invoice_number',
            'total_sale_amount',
            'credit_amount',
        ]
        read_only_fields = [
            'invoice_number',
            'total_sale_amount',
            'credit_amount',
        ]

    def validate_amount_paid_now(self, value):
        """Cannot be negative."""
        if value < 0:
            raise serializers.ValidationError(
                "Amount paid cannot be negative."
            )
        return value

    def validate_items(self, value):
        """Must have at least one item."""
        if not value:
            raise serializers.ValidationError(
                "A sale must have at least one item."
            )
        return value

    def validate(self, data):
        payment_type = data.get('payment_type')
        amount_paid = data.get('amount_paid_now', 0)

        if payment_type == Sale.PaymentType.CREDIT and amount_paid > 0:
            raise serializers.ValidationError(
                "Credit sale cannot have an amount paid now. "
                "Set amount paid to 0 or change payment type."
            )

        if payment_type == Sale.PaymentType.PARTIAL and amount_paid <= 0:
            raise serializers.ValidationError(
                "Partial payment must have an amount paid greater than 0."
            )

        return data

    @transaction.atomic
    def create(self, validated_data):
        # Extract items
        items_data = validated_data.pop('items')
        # Create sale header
        sale = Sale.objects.create(**validated_data)

        # Create each item
        for item_data in items_data:
            SaleItem.objects.create(
                sale=sale,
                **item_data
            )
        sale.refresh_from_db()
        return sale


class SaleUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Sale
        fields = [
            'id',
            'customer',
            'date',
            'currency',
            'payment_type',
            'amount_paid_now',
            'notes',
            'invoice_number',
            'total_sale_amount',
            'credit_amount',
        ]
        read_only_fields = [
            'invoice_number',
            'total_sale_amount',
            'credit_amount',
        ]

    def validate(self, data):
        """Same payment type validation as create."""
        payment_type = data.get(
            'payment_type',
            self.instance.payment_type if self.instance else None
        )
        amount_paid = data.get(
            'amount_paid_now',
            self.instance.amount_paid_now if self.instance else 0
        )

        if payment_type == Sale.PaymentType.CREDIT and amount_paid > 0:
            raise serializers.ValidationError(
                "Credit sale cannot have amount paid."
            )
        if payment_type == Sale.PaymentType.PARTIAL and amount_paid <= 0:
            raise serializers.ValidationError(
                "Partial payment must have amount paid greater than 0."
            )
        return data

    @transaction.atomic
    def update(self, instance, validated_data):
        """Update sale and sync the auto income record."""
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        # Sync auto income based on new amount_paid_now
        instance._sync_auto_income()
        instance.refresh_from_db()
        return instance