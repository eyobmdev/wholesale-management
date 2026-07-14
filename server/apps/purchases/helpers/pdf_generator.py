from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.lib import colors
from reportlab.lib.units import mm
from io import BytesIO


# ---- Color Palette ----
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


# ---------------------------------------------------------------------
# Helpers — pull real data straight from the MODEL (not serializer-only fields)
# ---------------------------------------------------------------------
def _get_factory_name(purchase):
    try:
        return purchase.factory.name
    except Exception:
        return "N/A"


def _get_payment_status(purchase):
    """Mirrors PurchaseSerializer.get_payment_status logic."""
    total = purchase.total_purchase_amount or 0
    paid = purchase.amount_paid_now or 0

    if total == 0:
        return "No Items"
    elif paid == 0:
        return "Unpaid"
    elif paid >= total:
        return "Fully Paid"
    else:
        return "Partial"


def _status_color(status):
    status = status.lower()
    if status == "fully paid":
        return SUCCESS
    if status == "unpaid":
        return DANGER
    if status == "partial":
        return WARNING
    return TEXT_MUTED


# ---------------------------------------------------------------------
# Page decoration (footer / page numbers) drawn on EVERY page
# ---------------------------------------------------------------------
def _draw_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.6)
    canvas.line(45, 40, doc.pagesize[0] - 45, 40)

    canvas.setFont('Helvetica', 8.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawCentredString(doc.pagesize[0] / 2, 28, "Thank you for your business.")
    canvas.drawRightString(doc.pagesize[0] - 45, 28, f"Page {doc.page}")
    canvas.restoreState()


# ---------------------------------------------------------------------
# Main generator
# ---------------------------------------------------------------------
def generate_purchase_invoice(purchase):
    try:
        items = purchase.items.all()

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=A4,
            rightMargin=45, leftMargin=45,
            topMargin=45, bottomMargin=55,
        )

        styles = getSampleStyleSheet()

        # ---- Styles ----
        company_style = ParagraphStyle(
            'CompanyName', parent=styles['Normal'],
            fontSize=18, textColor=PRIMARY, fontName='Helvetica-Bold', leading=22,
        )
        # Title + subtitle combined into ONE paragraph => no overlap, controlled leading
        title_style = ParagraphStyle(
            'InvoiceTitle', parent=styles['Normal'],
            fontSize=27, textColor=PRIMARY, fontName='Helvetica-Bold',
            alignment=TA_RIGHT, leading=32, spaceAfter=0,
        )
        subtitle_style = ParagraphStyle(
            'InvoiceSubtitle', parent=styles['Normal'],
            fontSize=9.5, textColor=TEXT_MUTED, alignment=TA_RIGHT, leading=13,
        )
        section_label = ParagraphStyle(
            'SectionLabel', parent=styles['Normal'],
            fontSize=9, textColor=TEXT_MUTED, fontName='Helvetica-Bold', spaceAfter=4,
        )
        normal_style = ParagraphStyle(
            'NormalDark', parent=styles['Normal'],
            fontSize=10.5, textColor=TEXT_DARK, leading=15,
        )
        notes_style = ParagraphStyle(
            'Notes', parent=styles['Normal'], fontSize=9.5, textColor=TEXT_MUTED, leading=14,
        )

        # Resolve real values from the model
        factory_name = _get_factory_name(purchase)
        payment_status = _get_payment_status(purchase)
        currency = getattr(purchase, 'currency', 'ETB')
        shipping_code = getattr(purchase, 'shipping_code', 'N/A')

        elements = []

        # ---------------- HEADER ----------------
        title_block = Table(
            [[
                Paragraph(factory_name, company_style),
                Paragraph("INVOICE", title_style),
            ]],
            colWidths=[280, 210],
        )
        title_block.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        elements.append(title_block)
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(f"Invoice #{shipping_code}", subtitle_style))
        elements.append(Spacer(1, 14))
        elements.append(HRFlowable(width="100%", thickness=1.4, color=ACCENT))
        elements.append(Spacer(1, 20))

        # ---------------- INFO SECTION ----------------
        status_color = _status_color(payment_status)
        status_pill = Paragraph(
            f"<font color='{status_color.hexval()}'><b>{payment_status.upper()}</b></font>",
            normal_style
        )

        info_data = [
            [Paragraph("BILLED TO", section_label),
             Paragraph("DATE", section_label),
             Paragraph("STATUS", section_label)],
            [Paragraph(factory_name, normal_style),
             Paragraph(str(getattr(purchase, 'date', 'N/A')), normal_style),
             status_pill],
        ]
        info_table = Table(info_data, colWidths=[210, 140, 140])
        info_table.setStyle(TableStyle([
            ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
            ('TOPPADDING', (0, 1), (-1, 1), 4),
            ('LINEBELOW', (0, 0), (-1, 0), 0.6, BORDER),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 25))

        # ---------------- PAYMENT SUMMARY ----------------
        total_amt = getattr(purchase, 'total_purchase_amount', 0)
        paid_amt = getattr(purchase, 'amount_paid_now', 0)
        unpaid_amt = getattr(purchase, 'unpaid_amount', 0)

        summary_data = [
            [Paragraph("TOTAL AMOUNT", section_label),
             Paragraph("PAID NOW", section_label),
             Paragraph("BALANCE DUE", section_label)],
            [
                Paragraph(f"<b>{total_amt} {currency}</b>",
                          ParagraphStyle('t', parent=normal_style, fontSize=13, textColor=PRIMARY)),
                Paragraph(f"<b>{paid_amt} {currency}</b>",
                          ParagraphStyle('p', parent=normal_style, fontSize=13, textColor=SUCCESS)),
                Paragraph(f"<b>{unpaid_amt} {currency}</b>",
                          ParagraphStyle('u', parent=normal_style, fontSize=13,
                                         textColor=DANGER if float(unpaid_amt) > 0 else SUCCESS)),
            ],
        ]
        summary_table = Table(summary_data, colWidths=[163, 163, 164])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG),
            ('BOX', (0, 0), (-1, -1), 0.8, BORDER),
            ('INNERGRID', (0, 0), (-1, -1), 0.6, BORDER),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 28))

        # ---------------- ITEMS TABLE ----------------
        header_cell_style = ParagraphStyle(
            'ItemHeader', parent=styles['Normal'], fontSize=9.5,
            textColor=colors.white, fontName='Helvetica-Bold', alignment=TA_CENTER,
        )
        cell_style = ParagraphStyle('ItemCell', parent=styles['Normal'], fontSize=9.5,
                                     textColor=TEXT_DARK, alignment=TA_CENTER)
        cell_style_left = ParagraphStyle('ItemCellLeft', parent=cell_style, alignment=TA_LEFT)
        cell_style_right = ParagraphStyle('ItemCellRight', parent=cell_style, alignment=TA_RIGHT)

        table_data = [[
            Paragraph("Item Code", header_cell_style),
            Paragraph("Product Name", header_cell_style),
            Paragraph("Type", header_cell_style),
            Paragraph("Bags", header_cell_style),
            Paragraph("Pieces", header_cell_style),
            Paragraph("Unit Price", header_cell_style),
            Paragraph("Total", header_cell_style),
        ]]

        for item in items:
            table_data.append([
                Paragraph(str(getattr(item, 'item_code', '')), cell_style_left),
                Paragraph(str(getattr(item, 'product_name', '')), cell_style_left),
                Paragraph(str(getattr(item, 'price_type', '')).replace('_', ' ').title(), cell_style),
                Paragraph(str(getattr(item, 'total_bags_purchased', 0)), cell_style),
                Paragraph(str(getattr(item, 'total_pieces_purchased', 0)), cell_style),
                Paragraph(f"{getattr(item, 'purchase_price', 0)}", cell_style_right),
                Paragraph(f"{getattr(item, 'total_item_amount', 0)} {getattr(item, 'currency', currency)}",
                          cell_style_right),
            ])

        item_table = Table(
            table_data,
            colWidths=[70, 135, 60, 45, 50, 65, 90],
            repeatRows=1,          # 👈 header row repeats on every new page
        )

        table_style_cmds = [
            ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9.5),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, BORDER),
            ('LINEBELOW', (0, -1), (-1, -1), 1, PRIMARY),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]
        for i in range(1, len(table_data)):
            bg = ROW_ALT if i % 2 == 0 else colors.white
            table_style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))

        item_table.setStyle(TableStyle(table_style_cmds))
        elements.append(item_table)

        # ---------------- GRAND TOTAL ----------------
        elements.append(Spacer(1, 12))
        total_table = Table([[
            Paragraph("GRAND TOTAL", ParagraphStyle(
                'gt', parent=normal_style, fontName='Helvetica-Bold',
                fontSize=11, alignment=TA_RIGHT, textColor=PRIMARY)),
            Paragraph(f"{total_amt} {currency}", ParagraphStyle(
                'gv', parent=normal_style, fontName='Helvetica-Bold',
                fontSize=12, alignment=TA_RIGHT, textColor=PRIMARY)),
        ]], colWidths=[425, 90])
        total_table.setStyle(TableStyle([
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        elements.append(total_table)

        # ---------------- NOTES ----------------
        if getattr(purchase, 'notes', None):
            elements.append(Spacer(1, 28))
            elements.append(HRFlowable(width="100%", thickness=0.6, color=BORDER))
            elements.append(Spacer(1, 10))
            elements.append(Paragraph("NOTES", section_label))
            elements.append(Paragraph(purchase.notes, notes_style))

        doc.build(elements, onFirstPage=_draw_footer, onLaterPages=_draw_footer)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

    except Exception:
        import traceback
        traceback.print_exc()
        raise