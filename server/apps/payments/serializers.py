from rest_framework import serializers
from django.db import transaction
from .models import CustomerIncome, FactoryPayment, GeneralExpense


class CustomerIncomeSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(
        source='customer.name',
        read_only=True
    )
    customer_balance_after = serializers.SerializerMethodField()
    is_auto = serializers.BooleanField(read_only=True)

    sale_invoice = serializers.CharField(
        source='sale.invoice_number',
        read_only=True,
        # allow_null=True because manual payments have no linked sale
        default=None
    )

    class Meta:
        model = CustomerIncome
        fields = [
            'id',
            'customer',
            'customer_name',
            'sale',
            'sale_invoice',
            'date',
            'paid_amount',
            'currency',
            'payment_method',
            'reference',
            'is_auto',
            'receipt_number',
            'notes',
            'customer_balance_after',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'receipt_number',
            'is_auto',
            'sale',
            'sale_invoice',
        ]

    def get_customer_balance_after(self, obj):
        return obj.customer.current_balance

    def validate_paid_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Payment amount must be greater than 0."
            )
        return value

    def validate_currency(self, value):
        from ..core.models import AppSetting
        settings = AppSetting.get_settings()
        if value not in settings.available_currencies:
            raise serializers.ValidationError(
                f"Currency '{value}' is not available."
            )
        return value

    def validate(self, data):
        if data.get('sale'):
            raise serializers.ValidationError(
                "You cannot link a manual payment to a sale directly. "
                "Sale payments are created automatically."
            )
        return data

    def create(self, validated_data):
        validated_data['is_auto'] = False
        return super().create(validated_data)


class CustomerIncomeListSerializer(serializers.ModelSerializer):

    customer_name = serializers.CharField(
        source='customer.name',
        read_only=True
    )
    sale_invoice = serializers.CharField(
        source='sale.invoice_number',
        read_only=True,
        default=None
    )

    class Meta:
        model = CustomerIncome
        fields = [
            'id',
            'customer',
            'customer_name',
            'sale_invoice',
            'date',
            'paid_amount',
            'currency',
            'payment_method',
            'is_auto',
            'receipt_number',
            'created_at',
        ]
        read_only_fields = fields


class FactoryPaymentSerializer(serializers.ModelSerializer):
    factory_name = serializers.CharField(
        source='factory.name',
        read_only=True
    )

    # Factory balance after this payment
    factory_balance_after = serializers.SerializerMethodField()

    # Purchase shipping code if this is an auto payment
    purchase_shipping_code = serializers.CharField(
        source='purchase.shipping_code',
        read_only=True,
        default=None
    )

    is_auto = serializers.BooleanField(read_only=True)

    class Meta:
        model = FactoryPayment
        fields = [
            'id',
            'factory',
            'factory_name',
            'purchase',
            'purchase_shipping_code',
            'date',
            'paid_amount',
            'currency',
            'payment_method',
            'reference',
            'is_auto',
            'payment_number',
            'notes',
            'factory_balance_after',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'payment_number',
            'is_auto',
            'purchase',
            'purchase_shipping_code',
        ]

    def get_factory_balance_after(self, obj):
        return obj.factory.current_balance

    def validate_paid_amount(self, value):
        """Payment must be positive."""
        if value <= 0:
            raise serializers.ValidationError(
                "Payment amount must be greater than 0."
            )
        return value

    def validate_currency(self, value):
        """Must be valid currency."""
        from ..core.models import AppSetting
        settings = AppSetting.get_settings()
        if value not in settings.available_currencies:
            raise serializers.ValidationError(
                f"Currency '{value}' is not available."
            )
        return value

    def validate(self, data):
        """Prevent manually setting purchase link."""
        if data.get('purchase'):
            raise serializers.ValidationError(
                "You cannot link a manual factory payment to a purchase. "
                "Purchase payments are created automatically."
            )
        return data

    def create(self, validated_data):
        """Manual factory payment always has is_auto=False."""
        validated_data['is_auto'] = False
        return super().create(validated_data)


class FactoryPaymentListSerializer(serializers.ModelSerializer):
    """
    Lighter version for listing factory payments.
    """
    factory_name = serializers.CharField(
        source='factory.name',
        read_only=True
    )
    purchase_shipping_code = serializers.CharField(
        source='purchase.shipping_code',
        read_only=True,
        default=None
    )

    class Meta:
        model = FactoryPayment
        fields = [
            'id',
            'factory',
            'factory_name',
            'purchase_shipping_code',
            'date',
            'paid_amount',
            'currency',
            'payment_method',
            'is_auto',
            'payment_number',
            'created_at',
        ]
        read_only_fields = fields


class GeneralExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneralExpense
        fields = [
            'id',
            'date',
            'description',
            'amount',
            'currency',
            'payment_method',
            'reference',
            'expense_number',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['expense_number']

    def validate_description(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError(
                "Description is required. "
                "Write what this expense was for."
            )
        return value.strip()

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Expense amount must be greater than 0."
            )
        return value

    def validate_currency(self, value):
        from ..core.models import AppSetting
        settings = AppSetting.get_settings()
        if value not in settings.available_currencies:
            raise serializers.ValidationError(
                f"Currency '{value}' is not available."
            )
        return value


class GeneralExpenseListSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneralExpense
        fields = [
            'id',
            'date',
            'description',
            'amount',
            'currency',
            'payment_method',
            'expense_number',
            'created_at',
        ]
        read_only_fields = fields