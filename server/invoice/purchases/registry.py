from server.invoice.utils.public_documents import register_public_document
from server.apps.purchases.models import Purchase
from .generator import generate_purchase_invoice


def _load_purchase(pk):
    return Purchase.objects.select_related('factory').prefetch_related('items').get(pk=pk)


def _purchase_filename(purchase):
    return f"invoice_{purchase.shipping_code}.pdf"


register_public_document(
    "purchase-invoice",
    loader=_load_purchase,
    generator=generate_purchase_invoice,
    filename=_purchase_filename,
)