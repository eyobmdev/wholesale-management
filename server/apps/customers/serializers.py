from rest_framework import serializers
from .models import Customer


class CustomerListSerializer(serializers.ModelSerializer):
    current_balance = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True,
        help_text="What customer owes you right now"
    )
    total_sales_amount = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    total_sale_credit_amount = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    total_payments_received = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    last_payment_date = serializers.DateField(
        read_only=True
    )
    last_purchase_date = serializers.DateField(
        read_only=True
    )
    days_since_last_payment = serializers.IntegerField(
        read_only=True,
    )

    balance_status = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id',
            'name',
            'phone',
            'location',
            'initial_credit',
            'initial_credit_currency',
            'opening_date',
            'is_active',
            'current_balance',
            'total_sales_amount',
            'total_sale_credit_amount',
            'total_payments_received',
            'last_payment_date',
            'last_purchase_date',
            'days_since_last_payment',
            'balance_status',
            'created_at',
            'updated_at',
        ]

    def get_balance_status(self, obj):
        balance = obj.current_balance

        if balance > 0:
            # Customer owes you money
            return f"Owes you {balance} {obj.initial_credit_currency}"
        elif balance < 0:
            # Customer overpaid, you owe them
            # abs() removes the negative sign for display
            return f"You owe them {abs(balance)} {obj.initial_credit_currency}"
        else:
            # Perfect, nothing owed
            return "Settled"


class CustomerDetailSerializer(serializers.ModelSerializer):
    current_balance = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    total_sales_amount = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    total_sale_credit_amount = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    total_payments_received = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    last_payment_date = serializers.DateField(read_only=True)
    last_purchase_date = serializers.DateField(read_only=True)
    days_since_last_payment = serializers.IntegerField(read_only=True)
    balance_status = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id',
            'name',
            'phone',
            'location',
            'initial_credit',
            'initial_credit_currency',
            'opening_date',
            'is_active',
            'current_balance',
            'total_sales_amount',
            'total_sale_credit_amount',
            'total_payments_received',
            'last_payment_date',
            'last_purchase_date',
            'days_since_last_payment',
            'balance_status',
            'created_at',
            'updated_at',
        ]

    def get_balance_status(self, obj):
        """Same logic as list serializer."""
        balance = obj.current_balance
        if balance > 0:
            return f"Owes you {balance} {obj.initial_credit_currency}"
        elif balance < 0:
            return f"You owe them {abs(balance)} {obj.initial_credit_currency}"
        return "Settled"


class CustomerCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id',
            'name',
            'phone',
            'location',
            'initial_credit',
            'initial_credit_currency',
            'opening_date',
            'is_active',
        ]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Customer name cannot be empty."
            )
        return value.strip()

    def validate_initial_credit(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Initial credit cannot be negative. "
                "Enter the positive amount the customer owed."
            )
        return value

    def validate_initial_credit_currency(self, value):
        from ..core.models import AppSetting
        settings = AppSetting.get_settings()
        if value not in settings.available_currencies:
            raise serializers.ValidationError(
                f"Currency '{value}' is not available. "
                f"Available: {settings.available_currencies}"
            )
        return value

    def validate_phone(self, value):
        if value and not value.strip():
            raise serializers.ValidationError(
                "Phone number cannot be just spaces."
            )
        return value.strip() if value else value