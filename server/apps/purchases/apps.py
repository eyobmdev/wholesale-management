from django.apps import AppConfig


class PurchasesConfig(AppConfig):
    name = 'apps.purchases'

    def ready(self):
        from . import public_documents
