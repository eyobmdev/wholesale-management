from rest_framework import serializers
from .models import AppSetting


class AppSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppSetting

        fields = '__all__'

    def validate_low_stock_alert_percentage(self, value):
        if value < 1 or value > 99:
            raise serializers.ValidationError(
                "Low stock alert percentage must be between 1 and 99."
            )
        return value

    def validate_available_currencies(self, value):
        # Check it is actually a list
        if not isinstance(value, list):
            raise serializers.ValidationError(
                "Currencies must be a list. Example: ['ETB', 'USD']"
            )

        # Check list is not empty
        if len(value) == 0:
            raise serializers.ValidationError(
                "At least one currency is required."
            )

        # Check each item is a non-empty string
        for currency in value:
            if not isinstance(currency, str) or not currency.strip():
                raise serializers.ValidationError(
                    f"Each currency must be a non-empty text. "
                    f"Got: {currency}"
                )

        # ETB must always exist
        if 'ETB' not in value:
            raise serializers.ValidationError(
                "ETB must always be in the currency list."
            )

        return value

    def validate_default_currency(self, value):
        # Get the currencies from the request data
        # .get() returns empty list if not found
        available = self.initial_data.get('available_currencies', [])

        if available and value not in available:
            raise serializers.ValidationError(
                f"Default currency '{value}' must be "
                f"in the available currencies list."
            )
        return value