"""
PDF invoice generation for Purchase records.

Design notes:
- Styles are module-level singletons (created once at import, not per request).
- All user-supplied text is XML-escaped before entering ReportLab Paragraphs
  (prevents crashes/injection from '&', '<', '>' in notes/product names).
- Supports multi-page item tables automatically (repeatRows + page footer
  drawn via onFirstPage/onLaterPages callbacks).
- Raises InvoiceGenerationError on failure so the view can respond cleanly.
"""
import logging
from decimal import Decimal, InvalidOperation
from io import BytesIO
from xml.sax.saxutils import escape

from django.conf import settings
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

logger = logging.getLogger(__name__)


class InvoiceGenerationError(Exception):
    """Raised when a purchase invoice PDF cannot be generated."""


# ----------------------------------------------------------------------
# Palette
# ----------------------------------------------------------------------
PRIMARY = colors.HexColor("#1E3A5F")
ACCENT = colors.HexColor("#2E86AB")
LIGHT_BG = colors.HexColor("#F4F7FA")
ROW_ALT = colors.HexColor("#EAF1F8")
BORDER = colors.HexColor("#D9E2EC")
TEXT_DARK = colors.HexColor("#1A1A1A")
TEXT_MUTED = colors.HexColor("#6B7280")
SUCCESS = colors.HexColor("#2E7D32")
DANGER = colors.HexColor("#C62828")
WARNING = colors.HexColor("#B8860B")

_STATUS_COLORS = {
    "fully paid": SUCCESS,
    "unpaid": DANGER,
    "partial": WARNING,
    "no items": TEXT_MUTED,
}

# ----------------------------------------------------------------------
# Styles — built ONCE at import time (not per request => faster under load)
# ----------------------------------------------------------------------
_base = getSampleStyleSheet()

STYLES = {
    "company": ParagraphStyle(
        "company", parent=_base["Normal"], fontSize=18,
        textColor=PRIMARY, fontName="Helvetica-Bold", leading=22,
    ),
    "title": ParagraphStyle(
        "title", parent=_base["Normal"], fontSize=27,
        textColor=PRIMARY, fontName="Helvetica-Bold",
        alignment=TA_RIGHT, leading=32,
    ),
    "subtitle": ParagraphStyle(
        "subtitle", parent=_base["Normal"], fontSize=9.5,
        textColor=TEXT_MUTED, alignment=TA_RIGHT, leading=13,
    ),
    "section_label": ParagraphStyle(
        "section_label", parent=_base["Normal"], fontSize=9,
        textColor=TEXT_MUTED, fontName="Helvetica-Bold", spaceAfter=4,
    ),
    "normal": ParagraphStyle(
        "normal", parent=_base["Normal"], fontSize=10.5,
        textColor=TEXT_DARK, leading=15,
    ),
    "notes": ParagraphStyle(
        "notes", parent=_base["Normal"], fontSize=9.5,
        textColor=TEXT_MUTED, leading=14,
    ),
    "summary_total": ParagraphStyle(
        "summary_total", parent=_base["Normal"], fontSize=13, textColor=PRIMARY,
    ),
    "summary_paid": ParagraphStyle(
        "summary_paid", parent=_base["Normal"], fontSize=13, textColor=SUCCESS,
    ),
    "grand_total_label": ParagraphStyle(
        "grand_total_label", parent=_base["Normal"], fontName="Helvetica-Bold",
        fontSize=11, alignment=TA_RIGHT, textColor=PRIMARY,
    ),
    "grand_total_value": ParagraphStyle(
        "grand_total_value", parent=_base["Normal"], fontName="Helvetica-Bold",
        fontSize=12, alignment=TA_RIGHT, textColor=PRIMARY,
    ),
    "th": ParagraphStyle(
        "th", parent=_base["Normal"], fontSize=9.5,
        textColor=colors.white, fontName="Helvetica-Bold", alignment=TA_CENTER,
    ),
    "td": ParagraphStyle(
        "td", parent=_base["Normal"], fontSize=9.5,
        textColor=TEXT_DARK, alignment=TA_CENTER,
    ),
}
STYLES["td_left"] = ParagraphStyle("td_left", parent=STYLES["td"], alignment=TA_LEFT)
STYLES["td_right"] = ParagraphStyle("td_right", parent=STYLES["td"], alignment=TA_RIGHT)


# ----------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------
def _safe(value) -> str:
    """Escape user-controlled text before it enters a ReportLab Paragraph."""
    if value is None:
        return ""
    return escape(str(value))


def _fmt_money(value, currency="ETB") -> str:
    try:
        value = Decimal(value)
    except (InvalidOperation, TypeError):
        value = Decimal("0")
    return f"{value:,.2f} {currency}"


def _status_color(status: str):
    return _STATUS_COLORS.get(status.lower(), TEXT_MUTED)


def _draw_page_furniture(canvas, doc):
    """Runs on every page — footer + page number."""
    canvas.saveState()
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.6)
    canvas.line(45, 40, doc.pagesize[0] - 45, 40)

    canvas.setFont("Helvetica", 8.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawCentredString(doc.pagesize[0] / 2, 28, "Thank you for your business.")
    canvas.drawRightString(doc.pagesize[0] - 45, 28, f"Page {doc.page}")
    canvas.restoreState()


# ----------------------------------------------------------------------
# Main entry point
# ----------------------------------------------------------------------
def generate_purchase_invoice(purchase) -> bytes:
    """
    Build a PDF invoice for a Purchase instance.
    Raises InvoiceGenerationError on failure.
    """
    try:
        items = list(purchase.items.all())

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=A4,
            rightMargin=45, leftMargin=45, topMargin=45, bottomMargin=55,
        )

        factory_name = _safe(getattr(purchase.factory, "name", "N/A"))
        payment_status = getattr(purchase, "payment_status", "N/A")
        currency = getattr(purchase, "currency", "ETB")
        shipping_code = _safe(getattr(purchase, "shipping_code", "N/A"))

        elements = []

        # ---- Header ----
        title_block = Table(
            [[Paragraph(factory_name, STYLES["company"]),
              Paragraph("INVOICE", STYLES["title"])]],
            colWidths=[280, 210],
        )
        title_block.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))
        elements.append(title_block)
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(f"Invoice #{shipping_code}", STYLES["subtitle"]))
        elements.append(Spacer(1, 14))
        elements.append(HRFlowable(width="100%", thickness=1.4, color=ACCENT))
        elements.append(Spacer(1, 20))

        # ---- Info row ----
        status_color = _status_color(payment_status)
        status_pill = Paragraph(
            f"<font color='{status_color.hexval()}'><b>{_safe(payment_status).upper()}</b></font>",
            STYLES["normal"],
        )
        info_table = Table(
            [
                [Paragraph("BILLED TO", STYLES["section_label"]),
                 Paragraph("DATE", STYLES["section_label"]),
                 Paragraph("STATUS", STYLES["section_label"])],
                [Paragraph(factory_name, STYLES["normal"]),
                 Paragraph(_safe(getattr(purchase, "date", "N/A")), STYLES["normal"]),
                 status_pill],
            ],
            colWidths=[210, 140, 140],
        )
        info_table.setStyle(TableStyle([
            ("BOTTOMPADDING", (0, 0), (-1, 0), 4),
            ("TOPPADDING", (0, 1), (-1, 1), 4),
            ("LINEBELOW", (0, 0), (-1, 0), 0.6, BORDER),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 25))

        # ---- Payment summary ----
        total_amt = getattr(purchase, "total_purchase_amount", 0)
        paid_amt = getattr(purchase, "amount_paid_now", 0)
        unpaid_amt = getattr(purchase, "unpaid_amount", 0)

        summary_table = Table(
            [
                [Paragraph("TOTAL AMOUNT", STYLES["section_label"]),
                 Paragraph("PAID NOW", STYLES["section_label"]),
                 Paragraph("BALANCE DUE", STYLES["section_label"])],
                [
                    Paragraph(f"<b>{_fmt_money(total_amt, currency)}</b>", STYLES["summary_total"]),
                    Paragraph(f"<b>{_fmt_money(paid_amt, currency)}</b>", STYLES["summary_paid"]),
                    Paragraph(
                        f"<b>{_fmt_money(unpaid_amt, currency)}</b>",
                        ParagraphStyle(
                            "unpaid_dyn", parent=STYLES["normal"], fontSize=13,
                            textColor=DANGER if float(unpaid_amt or 0) > 0 else SUCCESS,
                        ),
                    ),
                ],
            ],
            colWidths=[163, 163, 164],
        )
        summary_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
            ("BOX", (0, 0), (-1, -1), 0.8, BORDER),
            ("INNERGRID", (0, 0), (-1, -1), 0.6, BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 28))

        # ---- Items table ----
        table_data = [[
            Paragraph("Item Code", STYLES["th"]),
            Paragraph("Product Name", STYLES["th"]),
            Paragraph("Type", STYLES["th"]),
            Paragraph("Bags", STYLES["th"]),
            Paragraph("Pieces", STYLES["th"]),
            Paragraph("Unit Price", STYLES["th"]),
            Paragraph("Total", STYLES["th"]),
        ]]

        if not items:
            table_data.append([
                Paragraph("No items in this purchase.", STYLES["td_left"]),
                "", "", "", "", "", "",
            ])
        else:
            for item in items:
                table_data.append([
                    Paragraph(_safe(item.item_code), STYLES["td_left"]),
                    Paragraph(_safe(item.product_name), STYLES["td_left"]),
                    Paragraph(_safe(item.price_type).replace("_", " ").title(), STYLES["td"]),
                    Paragraph(str(item.total_bags_purchased), STYLES["td"]),
                    Paragraph(str(item.total_pieces_purchased), STYLES["td"]),
                    Paragraph(_fmt_money(item.purchase_price, "").strip(), STYLES["td_right"]),
                    Paragraph(_fmt_money(item.total_item_amount, item.currency), STYLES["td_right"]),
                ])

        item_table = Table(
            table_data,
            colWidths=[70, 135, 60, 45, 50, 65, 90],
            repeatRows=1,          # header repeats on every page
        )

        table_cmds = [
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9.5),
            ("TOPPADDING", (0, 0), (-1, 0), 8),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("TOPPADDING", (0, 1), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 6),
            ("LINEBELOW", (0, 0), (-1, -1), 0.5, BORDER),
            ("LINEBELOW", (0, -1), (-1, -1), 1, PRIMARY),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for i in range(1, len(table_data)):
            bg = ROW_ALT if i % 2 == 0 else colors.white
            table_cmds.append(("BACKGROUND", (0, i), (-1, i), bg))

        item_table.setStyle(TableStyle(table_cmds))
        elements.append(item_table)

        # ---- Grand total ----
        elements.append(Spacer(1, 12))
        total_table = Table(
            [[
                Paragraph("GRAND TOTAL", STYLES["grand_total_label"]),
                Paragraph(_fmt_money(total_amt, currency), STYLES["grand_total_value"]),
            ]],
            colWidths=[425, 90],
        )
        total_table.setStyle(TableStyle([
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))
        elements.append(total_table)

        # ---- Notes ----
        if getattr(purchase, "notes", None):
            elements.append(Spacer(1, 28))
            elements.append(HRFlowable(width="100%", thickness=0.6, color=BORDER))
            elements.append(Spacer(1, 10))
            elements.append(Paragraph("NOTES", STYLES["section_label"]))
            elements.append(Paragraph(_safe(purchase.notes), STYLES["notes"]))

        doc.build(elements, onFirstPage=_draw_page_furniture, onLaterPages=_draw_page_furniture)
        return buffer.getvalue()

    except Exception as exc:
        logger.exception("Failed to generate invoice PDF for purchase id=%s", getattr(purchase, "pk", "?"))
        raise InvoiceGenerationError(f"Could not generate invoice: {exc}") from exc
    finally:
        try:
            buffer.close()
        except Exception:
            pass