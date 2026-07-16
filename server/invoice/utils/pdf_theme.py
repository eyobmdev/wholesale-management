from decimal import Decimal, InvalidOperation
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet

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

STATUS_COLORS = {
    "fully paid": SUCCESS,
    "unpaid": DANGER,
    "partial": WARNING,
    "no items": TEXT_MUTED,
}

_base = getSampleStyleSheet()

STYLES = {
    "company": ParagraphStyle("company", parent=_base["Normal"], fontSize=18,
                               textColor=PRIMARY, fontName="Helvetica-Bold", leading=22),
    "title": ParagraphStyle("title", parent=_base["Normal"], fontSize=27,
                             textColor=PRIMARY, fontName="Helvetica-Bold",
                             alignment=TA_RIGHT, leading=32),
    "subtitle": ParagraphStyle("subtitle", parent=_base["Normal"], fontSize=9.5,
                                textColor=TEXT_MUTED, alignment=TA_RIGHT, leading=13),
    "section_label": ParagraphStyle("section_label", parent=_base["Normal"], fontSize=9,
                                     textColor=TEXT_MUTED, fontName="Helvetica-Bold", spaceAfter=4),
    "normal": ParagraphStyle("normal", parent=_base["Normal"], fontSize=10.5,
                              textColor=TEXT_DARK, leading=15),
    "notes": ParagraphStyle("notes", parent=_base["Normal"], fontSize=9.5,
                             textColor=TEXT_MUTED, leading=14),
    "summary_total": ParagraphStyle("summary_total", parent=_base["Normal"], fontSize=13, textColor=PRIMARY),
    "summary_paid": ParagraphStyle("summary_paid", parent=_base["Normal"], fontSize=13, textColor=SUCCESS),
    "grand_total_label": ParagraphStyle("grand_total_label", parent=_base["Normal"], fontName="Helvetica-Bold",
                                         fontSize=11, alignment=TA_RIGHT, textColor=PRIMARY),
    "grand_total_value": ParagraphStyle("grand_total_value", parent=_base["Normal"], fontName="Helvetica-Bold",
                                         fontSize=12, alignment=TA_RIGHT, textColor=PRIMARY),
    "th": ParagraphStyle("th", parent=_base["Normal"], fontSize=9.5,
                          textColor=colors.white, fontName="Helvetica-Bold", alignment=TA_CENTER),
    "td": ParagraphStyle("td", parent=_base["Normal"], fontSize=9.5,
                          textColor=TEXT_DARK, alignment=TA_CENTER),
}
STYLES["td_left"] = ParagraphStyle("td_left", parent=STYLES["td"], alignment=TA_LEFT)
STYLES["td_right"] = ParagraphStyle("td_right", parent=STYLES["td"], alignment=TA_RIGHT)


def safe(value) -> str:
    if value is None:
        return ""
    return escape(str(value))


def fmt_money(value, currency="ETB") -> str:
    try:
        value = Decimal(value)
    except (InvalidOperation, TypeError):
        value = Decimal("0")
    return f"{value:,.2f} {currency}".strip()


def status_color(status: str):
    return STATUS_COLORS.get(str(status).lower(), TEXT_MUTED)


def draw_page_furniture(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.6)
    canvas.line(45, 40, doc.pagesize[0] - 45, 40)
    canvas.setFont("Helvetica", 8.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawCentredString(doc.pagesize[0] / 2, 28, "Thank you for your business.")
    canvas.drawRightString(doc.pagesize[0] - 45, 28, f"Page {doc.page}")
    canvas.restoreState()