from django.core.cache import cache
from .invoices import generate_purchase_invoice, InvoiceGenerationError

CACHE_TIMEOUT = 60 * 60 * 24  # 24h


def get_cached_invoice_pdf(purchase) -> bytes:
    cache_key = f"invoice_pdf:{purchase.pk}:{purchase.updated_at.timestamp()}"
    pdf_bytes = cache.get(cache_key)
    if pdf_bytes is None:
        pdf_bytes = generate_purchase_invoice(purchase)
        cache.set(cache_key, pdf_bytes, CACHE_TIMEOUT)
    return pdf_bytes