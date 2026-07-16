from django.http import Http404, HttpResponse
from rest_framework.views import APIView
from invoice.utils.public_documents import resolve_public_pdf, PublicDocumentError


class PublicDocumentView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request, token):
        try:
            pdf_bytes, filename = resolve_public_pdf(token)
        except PublicDocumentError as exc:
            raise Http404(str(exc))

        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'inline; filename="{filename}"'
        response["Content-Length"] = len(pdf_bytes)
        return response