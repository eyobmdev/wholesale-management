from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.exceptions import MethodNotAllowed

from .models import AppSetting
from .serializers import AppSettingSerializer
from .pagination import StandardPagination


class AppSettingViewSet(viewsets.ModelViewSet):
    """
    GET  /settings/       → returns the one settings object
    GET  /settings/{id}/  → returns the one settings object
    PUT  /settings/{id}/  → updates settings
    PATCH /settings/{id}/ → partial update settings
    POST and DELETE are disabled because there is always exactly one row.
    """
    serializer_class = AppSettingSerializer
    pagination_class = StandardPagination
    http_method_names = ['get', 'put', 'patch']

    def get_queryset(self):
        return AppSetting.objects.filter(pk=1)

    def get_object(self):
        """Always return the single settings row."""
        return AppSetting.get_settings()

    def list(self, request, *args, **kwargs):
        obj = self.get_object()
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        raise MethodNotAllowed('POST', detail='Settings already exist. Use PUT to update.')

    def destroy(self, request, *args, **kwargs):
        raise MethodNotAllowed('DELETE', detail='Settings cannot be deleted.')
