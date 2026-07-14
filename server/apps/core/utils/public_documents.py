"""
Generic infrastructure for exposing PDF documents (invoices, receipts, etc.)
via permanent, unauthenticated, signed links.

Currently used by: Purchase invoices.
Designed to be reused by: Sale invoices (register a new doc_type, done).

How it works:
- Each "document type" (e.g. "purchase-invoice") is registered once with:
    - a loader (pk -> model instance, with proper select/prefetch_related)
    - a generator (instance -> pdf bytes)
    - a filename builder (instance -> str)
- A permanent (non-expiring) signed token encodes "doc_type:object_id".
- The public view decodes the token, reloads the object FRESH from the DB
  on every request, and only regenerates the PDF when `updated_at` changes
  (via cache key) -- so it always reflects live data, never stale content.
"""
import logging
from dataclasses import dataclass
from typing import Callable, Dict

from django.core.cache import cache
from django.core.signing import BadSignature, Signer

logger = logging.getLogger(__name__)

_SIGNER = Signer(salt="public-document-v1")  # non-expiring by design
CACHE_TIMEOUT = 60 * 60 * 24  # 24h -- safe to cache since key includes updated_at


class PublicDocumentError(Exception):
    """Raised when a public document link/token is invalid or generation fails."""


@dataclass
class DocumentConfig:
    doc_type: str
    loader: Callable[[int], object]
    generator: Callable[[object], bytes]
    filename: Callable[[object], str]


_REGISTRY: Dict[str, DocumentConfig] = {}


def register_public_document(doc_type: str, *, loader, generator, filename):
    """Call once per document type, typically from an AppConfig.ready()."""
    _REGISTRY[doc_type] = DocumentConfig(
        doc_type=doc_type, loader=loader, generator=generator, filename=filename
    )


def make_public_token(doc_type: str, object_id: int) -> str:
    """Deterministic, permanent token. Same object -> always the same link."""
    return _SIGNER.sign(f"{doc_type}:{object_id}")


def _decode_token(token: str):
    try:
        raw = _SIGNER.unsign(token)
    except BadSignature:
        raise PublicDocumentError("Invalid or tampered link.")
    doc_type, _, object_id = raw.partition(":")
    if not object_id.isdigit():
        raise PublicDocumentError("Malformed link.")
    return doc_type, int(object_id)


def resolve_public_pdf(token: str):
    """
    Returns (pdf_bytes, filename).
    Always reflects the CURRENT state of the record.
    """
    doc_type, object_id = _decode_token(token)

    config = _REGISTRY.get(doc_type)
    if config is None:
        raise PublicDocumentError(f"Unknown document type: {doc_type}")

    try:
        instance = config.loader(object_id)
    except Exception:
        raise PublicDocumentError("Document not found.")

    filename = config.filename(instance)

    updated_at = getattr(instance, "updated_at", None)
    cache_key = f"public_doc:{doc_type}:{object_id}:{updated_at.timestamp() if updated_at else 'na'}"

    pdf_bytes = cache.get(cache_key)
    if pdf_bytes is None:
        try:
            pdf_bytes = config.generator(instance)
        except Exception as exc:
            logger.exception("Failed to generate public document %s#%s", doc_type, object_id)
            raise PublicDocumentError(f"Could not generate document: {exc}") from exc
        cache.set(cache_key, pdf_bytes, CACHE_TIMEOUT)

    return pdf_bytes, filename