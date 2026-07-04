from rest_framework import serializers
from .models import Factory


class FactoryListSerializer(serializers.ModelSerializer):
    current_balance = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    total_purchased_amount = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    total_purchased_unpaid = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    total_payments_made = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    last_purchase_date = serializers.DateField(read_only=True)
    last_payment_date = serializers.DateField(read_only=True)

    balance_status = serializers.SerializerMethodField()

    class Meta:
        model = Factory
        fields = [
            'id',
            'name',
            'phone',
            'location',
            'initial_balance',
            'initial_balance_currency',
            'is_active',
            'current_balance',
            'total_purchased_amount',
            'total_purchased_unpaid',
            'total_payments_made',
            'last_purchase_date',
            'last_payment_date',
            'balance_status',
            'created_at',
            'updated_at',
        ]

    def get_balance_status(self, obj):
        balance = obj.current_balance

        if balance > 0:
            return f"You owe {obj.name} {balance} {obj.initial_balance_currency}"
        elif balance < 0:
            return (
                f"{obj.name} owes you "
                f"{abs(balance)} {obj.initial_balance_currency}"
            )
        else:
            return "Settled"


class FactoryDetailSerializer(serializers.ModelSerializer):
    current_balance = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    total_purchased_amount = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    total_purchased_unpaid = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    total_payments_made = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    last_purchase_date = serializers.DateField(read_only=True)
    last_payment_date = serializers.DateField(read_only=True)
    balance_status = serializers.SerializerMethodField()

    class Meta:
        model = Factory
        fields = [
            'id',
            'name',
            'phone',
            'location',
            'initial_balance',
            'initial_balance_currency',
            'is_active',
            'current_balance',
            'total_purchased_amount',
            'total_purchased_unpaid',
            'total_payments_made',
            'last_purchase_date',
            'last_payment_date',
            'balance_status',
            'created_at',
            'updated_at',
            # 'purchases'
        ]

    def get_balance_status(self, obj):
        balance = obj.current_balance
        if balance > 0:
            return f"You owe {obj.name} {balance} {obj.initial_balance_currency}"
        elif balance < 0:
            return (
                f"{obj.name} owes you "
                f"{abs(balance)} {obj.initial_balance_currency}"
            )
        return "Settled"


class FactoryCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Factory
        fields = [
            'id',
            'name',
            'phone',
            'location',
            'initial_balance',
            'initial_balance_currency',
            'is_active',
        ]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Factory name cannot be empty."
            )
        return value.strip()

    def validate_initial_balance(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Initial balance cannot be negative. "
                "Enter the positive amount you owed them."
            )
        return value

    def validate_initial_balance_currency(self, value):
        from ..core.models import AppSetting
        settings = AppSetting.get_settings()
        if value not in settings.available_currencies:
            raise serializers.ValidationError(
                f"Currency '{value}' is not available. "
                f"Available: {settings.available_currencies}"
            )
        return value