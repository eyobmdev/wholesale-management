from server.invoice.utils.public_documents import register_public_document
from server.apps.sales.models import Sale
from .generator import generate_sale_invoice


def _load_sale(pk):
    return (
        Sale.objects
        .select_related('customer')
        .prefetch_related('items', 'items__stock_batch')
        .get(pk=pk)
    )


def _sale_filename(sale):
    return f"invoice_{sale.invoice_number}.pdf"


register_public_document(
    "sale-invoice",
    loader=_load_sale,
    generator=generate_sale_invoice,
    filename=_sale_filename,
)