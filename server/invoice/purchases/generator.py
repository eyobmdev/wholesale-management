import logging
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

from invoice.utils.pdf_theme import (
    STYLES, PRIMARY, ACCENT, LIGHT_BG, ROW_ALT, BORDER, SUCCESS, DANGER,
    safe, fmt_money, status_color, draw_page_furniture,
)

logger = logging.getLogger(__name__)


class InvoiceGenerationError(Exception):
    """Raised when a purchase invoice PDF cannot be generated."""


def generate_purchase_invoice(purchase) -> bytes:
    try:
        items = list(purchase.items.all())

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=A4,
            rightMargin=45, leftMargin=45, topMargin=45, bottomMargin=55,
        )

        factory_name = safe(getattr(purchase.factory, "name", "N/A"))
        payment_status = getattr(purchase, "payment_status", "N/A")
        currency = getattr(purchase, "currency", "ETB")
        shipping_code = safe(getattr(purchase, "shipping_code", "N/A"))

        elements = []

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

        s_color = status_color(payment_status)
        status_pill = Paragraph(
            f"<font color='{s_color.hexval()}'><b>{safe(payment_status).upper()}</b></font>",
            STYLES["normal"],
        )
        info_table = Table(
            [
                [Paragraph("BILLED TO", STYLES["section_label"]),
                 Paragraph("DATE", STYLES["section_label"]),
                 Paragraph("STATUS", STYLES["section_label"])],
                [Paragraph(factory_name, STYLES["normal"]),
                 Paragraph(safe(getattr(purchase, "date", "N/A")), STYLES["normal"]),
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

        total_amt = getattr(purchase, "total_purchase_amount", 0)
        paid_amt = getattr(purchase, "amount_paid_now", 0)
        unpaid_amt = getattr(purchase, "unpaid_amount", 0)

        from reportlab.lib.styles import ParagraphStyle
        summary_table = Table(
            [
                [Paragraph("TOTAL AMOUNT", STYLES["section_label"]),
                 Paragraph("PAID NOW", STYLES["section_label"]),
                 Paragraph("BALANCE DUE", STYLES["section_label"])],
                [
                    Paragraph(f"<b>{fmt_money(total_amt, currency)}</b>", STYLES["summary_total"]),
                    Paragraph(f"<b>{fmt_money(paid_amt, currency)}</b>", STYLES["summary_paid"]),
                    Paragraph(
                        f"<b>{fmt_money(unpaid_amt, currency)}</b>",
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
                    Paragraph(safe(item.item_code), STYLES["td_left"]),
                    Paragraph(safe(item.product_name), STYLES["td_left"]),
                    Paragraph(safe(item.price_type).replace("_", " ").title(), STYLES["td"]),
                    Paragraph(str(item.total_bags_purchased), STYLES["td"]),
                    Paragraph(str(item.total_pieces_purchased), STYLES["td"]),
                    Paragraph(fmt_money(item.purchase_price, "").strip(), STYLES["td_right"]),
                    Paragraph(fmt_money(item.total_item_amount, item.currency), STYLES["td_right"]),
                ])

        item_table = Table(
            table_data,
            colWidths=[70, 135, 60, 45, 50, 65, 90],
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
            colWidths=[425, 90],
        )
        total_table.setStyle(TableStyle([
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))
        elements.append(total_table)

        if getattr(purchase, "notes", None):
            elements.append(Spacer(1, 28))
            elements.append(HRFlowable(width="100%", thickness=0.6, color=BORDER))
            elements.append(Spacer(1, 10))
            elements.append(Paragraph("NOTES", STYLES["section_label"]))
            elements.append(Paragraph(safe(purchase.notes), STYLES["notes"]))

        doc.build(elements, onFirstPage=draw_page_furniture, onLaterPages=draw_page_furniture)
        return buffer.getvalue()

    except Exception as exc:
        logger.exception("Failed to generate invoice PDF for purchase id=%s", getattr(purchase, "pk", "?"))
        raise InvoiceGenerationError(f"Could not generate invoice: {exc}") from exc
    finally:
        try:
            buffer.close()
        except Exception:
            pass