from rest_framework import serializers
from django.db import transaction
from .models import Sale, SaleItem


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
    payment_status = serializers.CharField(read_only=True)
    
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
            'payment_method',
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

    # def get_payment_status(self, obj):
    #     if obj.payment_type == Sale.PaymentType.CASH:
    #         return "Fully Paid"
    #     elif obj.payment_type == Sale.PaymentType.CREDIT:
    #         return f"Unpaid — owes {obj.credit_amount} {obj.currency}"
    #     else:
    #         return (
    #             f"Partial — paid {obj.amount_paid_now}, "
    #             f"owes {obj.credit_amount} {obj.currency}"
    #         )


class SaleCreateSerializer(serializers.ModelSerializer):
    items = SaleItemWriteSerializer(many=True, write_only=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'customer', 'date', 'currency', 'amount_paid_now',
            'payment_method', 'notes', 'items',
            'invoice_number', 'total_sale_amount', 'credit_amount', 'payment_type',
        ]
        read_only_fields = [
            'invoice_number', 'total_sale_amount', 'credit_amount', 'payment_type',
        ]

    def validate_amount_paid_now(self, value):
        if value < 0:
            raise serializers.ValidationError("Amount paid cannot be negative.")
        return value

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("A sale must have at least one item.")
        return value

    def validate(self, data):
        # Remove any mistakenly sent payment_type
        data.pop('payment_type', None)

        amount_paid_now = data.get('amount_paid_now', 0)
        total_sale_amount = data.get('total_sale_amount') or 0
        payment_method = data.get('payment_method')

        # Auto determine payment_type
        if amount_paid_now == 0:
            payment_type = Sale.PaymentType.CREDIT
        elif amount_paid_now >= total_sale_amount:
            payment_type = Sale.PaymentType.CASH
        else:
            payment_type = Sale.PaymentType.PARTIAL

        data['payment_type'] = payment_type

        # Force payment_method when there is payment
        if amount_paid_now > 0:
            if not payment_method:
                raise serializers.ValidationError({
                    "payment_method": "Payment method is required when amount_paid_now > 0."
                })
        else:
            data['payment_method'] = None

        return data

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items')

        sale = Sale.objects.create(**validated_data)

        # Create items
        for item_data in items_data:
            SaleItem.objects.create(sale=sale, **item_data)

        # Recalculate totals after items are added
        sale.refresh_from_db()
        sale.recalculate_totals()

        # Create auto income if payment was made
        if sale.amount_paid_now > 0:
            self._create_auto_customer_income(sale)

        return sale

    def _create_auto_customer_income(self, sale):
        from ..payments.models import CustomerIncome
        CustomerIncome.objects.create(
            sale=sale,
            customer=sale.customer,
            date=sale.date,
            paid_amount=sale.amount_paid_now,
            payment_method=sale.payment_method,
            currency=sale.currency,
            is_auto=True,
            notes=f"Auto from sale #{sale.invoice_number}",
        )


class SaleUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = [
            'id', 'customer', 'date', 'currency', 'payment_type',
            'payment_method', 'amount_paid_now', 'notes',
            'invoice_number', 'total_sale_amount', 'credit_amount',
        ]
        read_only_fields = [
            'invoice_number', 'total_sale_amount', 'credit_amount', 'payment_type',
        ]

    def validate_amount_paid_now(self, value):
        if value is None:
            return value

        if value < 0:
            raise serializers.ValidationError(
                "Amount paid now cannot be negative."
            )

        instance = self.instance
        if instance and value > instance.total_sale_amount:
            raise serializers.ValidationError(
                f"Amount paid now ({value:,}) cannot be greater than the total sale amount (₦{instance.total_sale_amount:,})."
            )

        return value

    def validate(self, data):
        instance = self.instance
        amount_paid_now = data.get('amount_paid_now', instance.amount_paid_now)
        payment_method = data.get('payment_method')

        # Force payment_method
        if amount_paid_now and amount_paid_now > 0:
            if not payment_method and not getattr(instance, 'payment_method', None):
                raise serializers.ValidationError({
                    "payment_method": "Payment method is required when amount_paid_now > 0."
                })
        else:
            if payment_method is not None:
                data['payment_method'] = None

        return data

    @transaction.atomic
    def update(self, instance, validated_data):
        old_paid = instance.amount_paid_now

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()

        new_paid = instance.amount_paid_now

        # Sync only if payment amount changed
        if old_paid != new_paid or 'payment_method' in validated_data:
            self._sync_auto_income(instance)

        instance.refresh_from_db()
        return instance

    def _sync_auto_income(self, sale):
        from ..payments.models import CustomerIncome
        if sale.amount_paid_now > 0 and sale.payment_method:
            CustomerIncome.objects.update_or_create(
                sale=sale,
                is_auto=True,
                defaults={
                    'customer': sale.customer,
                    'date': sale.date,
                    'paid_amount': sale.amount_paid_now,
                    'payment_method': sale.payment_method,
                    'currency': sale.currency,
                    'notes': f"Auto from sale #{sale.invoice_number}",
                }
            )
        else:
            CustomerIncome.objects.filter(sale=sale, is_auto=True).delete()
