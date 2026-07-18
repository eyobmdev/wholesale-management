import datetime
from apps.customers.models import Customer  # adjust import path

c = Customer.objects.get(id=5)  # Kiya
print("today:", datetime.date.today())
print("last_payment_date:", c.last_payment_date)
print("days_since_last_payment:", repr(c.days_since_last_payment))
print("last_purchase_date:", c.last_purchase_date)
first_sale = c.sales.order_by("date").first()
print("first_sale:", first_sale, "date:", first_sale.date if first_sale else None)
print("current_balance:", c.current_balance)