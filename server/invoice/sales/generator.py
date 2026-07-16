import logging
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

from server.invoice.utils.pdf_theme import (
    STYLES, PRIMARY, ACCENT, LIGHT_BG, ROW_ALT, BORDER, SUCCESS, DANGER,
    safe, fmt_money, status_color, draw_page_furniture,
)

logger = logging.getLogger(__name__)


class InvoiceGenerationError(Exception):
    """Raised when a sale invoice PDF cannot be generated."""


def generate_sale_invoice(sale) -> bytes:
    try:
        items = list(sale.items.select_related('stock_batch').all())

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=A4,
            rightMargin=45, leftMargin=45, topMargin=45, bottomMargin=55,
        )

        customer_name = safe(getattr(sale.customer, "name", "N/A"))
        currency = getattr(sale, "currency", "ETB")
        invoice_number = safe(getattr(sale, "invoice_number", "N/A"))
        payment_status = getattr(sale, "payment_status", None) or _fallback_status(sale)

        elements = []

        title_block = Table(
            [[Paragraph("Your Company Name", STYLES["company"]),
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
        elements.append(Paragraph(f"Invoice #{invoice_number}", STYLES["subtitle"]))
        elements.append(Spacer(1, 14))
        elements.append(HRFlowable(width="100%", thickness=1.4, color=ACCENT))
        elements.append(Spacer(1, 20))

        s_color = status_color(payment_status)
        status_pill = Paragraph(
            f"<font color='{s_color.hexval()}'><b>{safe(payment_status).upper()}</b></font>",
            STYLES["normal"],
        )
        info_table = Table(
            [
                [Paragraph("SOLD TO", STYLES["section_label"]),
                 Paragraph("DATE", STYLES["section_label"]),
                 Paragraph("STATUS", STYLES["section_label"])],
                [Paragraph(customer_name, STYLES["normal"]),
                 Paragraph(safe(getattr(sale, "date", "N/A")), STYLES["normal"]),
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

        total_amt = getattr(sale, "total_sale_amount", 0)
        paid_amt = getattr(sale, "amount_paid_now", 0)
        credit_amt = getattr(sale, "credit_amount", 0)

        from reportlab.lib.styles import ParagraphStyle
        summary_table = Table(
            [
                [Paragraph("TOTAL AMOUNT", STYLES["section_label"]),
                 Paragraph("PAID NOW", STYLES["section_label"]),
                 Paragraph("CREDIT (DUE)", STYLES["section_label"])],
                [
                    Paragraph(f"<b>{fmt_money(total_amt, currency)}</b>", STYLES["summary_total"]),
                    Paragraph(f"<b>{fmt_money(paid_amt, currency)}</b>", STYLES["summary_paid"]),
                    Paragraph(
                        f"<b>{fmt_money(credit_amt, currency)}</b>",
                        ParagraphStyle(
                            "credit_dyn", parent=STYLES["normal"], fontSize=13,
                            textColor=DANGER if float(credit_amt or 0) > 0 else SUCCESS,
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

        table_data = [[
            Paragraph("Item Code", STYLES["th"]),
            Paragraph("Product Name", STYLES["th"]),
            Paragraph("Bags", STYLES["th"]),
            Paragraph("Pieces", STYLES["th"]),
            Paragraph("Unit Price", STYLES["th"]),
            Paragraph("Total", STYLES["th"]),
        ]]

        if not items:
            table_data.append([
                Paragraph("No items in this sale.", STYLES["td_left"]), "", "", "", "", "",
            ])
        else:
            for item in items:
                batch = item.stock_batch
                table_data.append([
                    Paragraph(safe(getattr(batch, "item_code", "")), STYLES["td_left"]),
                    Paragraph(safe(getattr(batch, "product_name", "")), STYLES["td_left"]),
                    Paragraph(str(getattr(item, "bags_sold", 0)), STYLES["td"]),
                    Paragraph(str(getattr(item, "pieces_sold", 0)), STYLES["td"]),
                    Paragraph(fmt_money(getattr(item, "selling_price", 0), "").strip(), STYLES["td_right"]),
                    Paragraph(fmt_money(getattr(item, "total_line_amount", 0), currency), STYLES["td_right"]),
                ])

        item_table = Table(
            table_data,
            colWidths=[90, 175, 55, 60, 70, 95],
            repeatRows=1,
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

        elements.append(Spacer(1, 12))
        total_table = Table(
            [[
                Paragraph("GRAND TOTAL", STYLES["grand_total_label"]),
                Paragraph(fmt_money(total_amt, currency), STYLES["grand_total_value"]),
            ]],
            colWidths=[460, 95],
        )
        total_table.setStyle(TableStyle([
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))
        elements.append(total_table)

        if getattr(sale, "notes", None):
            elements.append(Spacer(1, 28))
            elements.append(HRFlowable(width="100%", thickness=0.6, color=BORDER))
            elements.append(Spacer(1, 10))
            elements.append(Paragraph("NOTES", STYLES["section_label"]))
            elements.append(Paragraph(safe(sale.notes), STYLES["notes"]))

        doc.build(elements, onFirstPage=draw_page_furniture, onLaterPages=draw_page_furniture)
        return buffer.getvalue()

    except Exception as exc:
        logger.exception("Failed to generate invoice PDF for sale id=%s", getattr(sale, "pk", "?"))
        raise InvoiceGenerationError(f"Could not generate invoice: {exc}") from exc
    finally:
        try:
            buffer.close()
        except Exception:
            pass


def _fallback_status(sale):
    total = getattr(sale, "total_sale_amount", 0) or 0
    paid = getattr(sale, "amount_paid_now", 0) or 0
    if total == 0:
        return "No Items"
    if paid == 0:
        return "Unpaid"
    if paid >= total:
        return "Fully Paid"
    return "Partial"