from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError, ParseError
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        # JSON Parse Error
        if isinstance(exc, ParseError):
            response.data = {
                "success": False,
                "status_code": 400,
                "message": "Invalid JSON format. Please check your request body.",
                "errors": None,
            }
            return response

        # Validation Errors
        if isinstance(exc, ValidationError):
            raw_errors = response.data
            errors = {}

            if isinstance(raw_errors, dict):
                for field, field_errors in raw_errors.items():
                    if isinstance(field_errors, list) and field_errors:
                        errors[field] = str(field_errors[0])
                    else:
                        errors[field] = str(field_errors)

                message = next(iter(errors.values())) if errors else "Validation failed"

            elif isinstance(raw_errors, list):
                message = str(raw_errors[0]) if raw_errors else "Validation failed"
                errors = None

            else:
                message = str(raw_errors)
                errors = None

            response.data = {
                "success": False,
                "status_code": response.status_code,
                "message": message,
                "errors": errors,
            }

        # Other DRF errors
        else:
            detail = response.data.get("detail", "Something went wrong")
            if isinstance(detail, list):
                detail = detail[0]

            response.data = {
                "success": False,
                "status_code": response.status_code,
                "message": str(detail),
                "errors": None,
            }

    # Server error (500)
    else:
        response = Response(
            {
                "success": False,
                "status_code": 500,
                "message": "Internal server error. Please try again later.",
                "errors": None,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response