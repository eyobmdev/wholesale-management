# Business Management App — Django Backend Design (v3 — Final)

---

## What Changed in v3

| Change | Detail |
|---|---|
| `Product` gets `min_stock` + `min_stock_unit` | Per-product threshold, set in either bags or pieces |
| `SaleItem` clarified | Both `bags` and `pieces_per_bag` always visible; partial-bag sales fully supported |
| `remaining_display` helper added | Shows "2 bags + 10 pieces" when stock has a fractional bag leftover |
| All 3 open questions answered | No more open questions — design is locked |

---

## Django App Structure

```
project/
├── config/                  ← settings, urls, wsgi
└── apps/
    ├── products/
    ├── customers/
    ├── factories/
    ├── purchases/
    ├── sales/
    ├── income/
    ├── expenses/
    └── dashboard/           ← no models, only aggregation views
```

---

## Models

---

### `products` app

> The product registry. Created automatically when a new `item_code` is entered during a purchase. Never created standalone.

```python
class Product(models.Model):
    STOCK_UNIT = [
        ('bags',   'Bags'),
        ('pieces', 'Pieces'),
    ]

    item_code                = models.CharField(max_length=50, unique=True)
    name                     = models.CharField(max_length=200)
    default_quantity_per_bag = models.IntegerField(null=True, blank=True)
    # ^ Used only as a reference/default when creating purchases.
    # Each purchase stores its own quantity_per_bag (can vary per shipment).

    min_stock                = models.IntegerField(default=0)
    min_stock_unit           = models.CharField(max_length=10, choices=STOCK_UNIT, default='bags')
    # ^ Example: min_stock=5, min_stock_unit='bags' → alert when total remaining bags < 5
    # ^ Example: min_stock=20, min_stock_unit='pieces' → alert when total remaining pieces < 20

    notes                    = models.TextField(blank=True)
    created_at               = models.DateTimeField(auto_now_add=True)
```

**Low stock alert logic:**
```python
# Convert threshold to pieces for a unified comparison:
def min_stock_in_pieces(product):
    if product.min_stock_unit == 'pieces':
        return product.min_stock
    else:  # bags — use default_quantity_per_bag as reference
        return product.min_stock * (product.default_quantity_per_bag or 1)

# Alert when:
# SUM(Purchase.remaining_pieces for all batches of this product) < min_stock_in_pieces
```

---

### `customers` app

```python
class Customer(models.Model):
    name       = models.CharField(max_length=200)
    phone      = models.CharField(max_length=30)
    location   = models.CharField(max_length=200)
    notes      = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Computed (no stored columns):
    # total_sales         → SUM(SaleItem.total_amount) for this customer's sales
    # total_credit_sales  → SUM where sale.payment_type in ('credit', 'partial')
    # total_paid          → SUM(Income.amount) for this customer
    # current_balance     → total_credit_sales + partial_unpaid_portions - total_paid
    # last_payment_date   → MAX(Income.date) for this customer
    # last_purchase_date  → MAX(Sale.date) for this customer
```

---

### `factories` app

```python
class Factory(models.Model):
    name            = models.CharField(max_length=200)
    phone           = models.CharField(max_length=30)
    location        = models.CharField(max_length=200)
    initial_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    # ^ Debt that existed before the app started.
    notes           = models.TextField(blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    # Computed:
    # total_purchased    → SUM(Purchase.total_amount) for this factory
    # total_paid         → SUM(Expense.amount) where expense.factory = self
    # remaining_balance  → initial_balance + total_purchased - total_paid
    # last_purchase_date → MAX(Purchase.date)
    # last_payment_date  → MAX(Expense.date where factory = self)
```

---

### `purchases` app

> One record = one shipment batch. Both `total_bags` AND `quantity_per_bag` are **required inputs** — neither is derived from the other. `total_pieces` is the auto-calculated result.

```python
class Purchase(models.Model):
    PRICING = [
        ('per_piece', 'Per Piece'),
        ('per_bag',   'Per Bag'),
    ]

    date             = models.DateField()
    factory          = models.ForeignKey('factories.Factory', on_delete=models.PROTECT)
    product          = models.ForeignKey('products.Product', on_delete=models.PROTECT)
    shipping_code    = models.CharField(max_length=60, unique=True, editable=False)
    # ^ Auto-generated on save. Format: "SHP-YYYYMMDD-XXXX" e.g. "SHP-20250601-0042"

    pricing_type     = models.CharField(max_length=10, choices=PRICING)
    price            = models.DecimalField(max_digits=10, decimal_places=2)
    # ^ Per piece OR per bag, depending on pricing_type. Both are valid purchase inputs.

    quantity_per_bag = models.IntegerField()
    # ^ REQUIRED INPUT — how many pieces fit in one bag for this shipment.
    # e.g. 18, 24, 30, 36. Can differ between shipments of the same product.

    total_bags       = models.IntegerField()
    # ^ REQUIRED INPUT — number of bags received.

    notes            = models.TextField(blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)
```

**Computed values — all derived, never stored:**

| Name | Formula |
|---|---|
| `total_pieces` | `total_bags × quantity_per_bag` |
| `price_per_piece` | `price` if per_piece · `price ÷ quantity_per_bag` if per_bag |
| `price_per_bag` | `price` if per_bag · `price × quantity_per_bag` if per_piece |
| `total_amount` | `price_per_bag × total_bags` |
| `sold_pieces` | `SUM(SaleItem.pieces_sold)` referencing this batch |
| `remaining_pieces` | `total_pieces − sold_pieces` |
| `remaining_full_bags` | `remaining_pieces // quantity_per_bag` (integer division) |
| `leftover_pieces` | `remaining_pieces % quantity_per_bag` |
| `remaining_display` | `"3 bags + 10 pieces"` or `"3 bags"` if no leftover |
| `stock_value` | `remaining_pieces × price_per_piece` |

**Example of `remaining_display`:**
```python
# 1 bag purchased (30 pieces). 20 pieces sold. Remaining = 10 pieces.
remaining_full_bags = 10 // 30  → 0
leftover_pieces     = 10 % 30   → 10
remaining_display   → "0 bags + 10 pieces"

# 5 bags purchased (30 pieces each = 150). 3.5 bags sold (= 105 pieces). Remaining = 45 pieces.
remaining_full_bags = 45 // 30  → 1
leftover_pieces     = 45 % 30   → 15
remaining_display   → "1 bag + 15 pieces"
```

---

### `sales` app

> `Sale` is the invoice header. `SaleItem` is each line. One sale = many items, one invoice.

```python
class Sale(models.Model):
    PAYMENT_TYPE = [
        ('cash',    'Cash'),
        ('credit',  'Credit'),
        ('partial', 'Partial'),
    ]
    PAYMENT_METHOD = [
        ('cash',     'Cash'),
        ('telebirr', 'Telebirr'),
        ('cbe',      'CBE'),
        ('boa',      'BOA'),
        ('awash',    'Awash'),
    ]

    date           = models.DateField()
    customer       = models.ForeignKey('customers.Customer', on_delete=models.PROTECT)
    payment_type   = models.CharField(max_length=10, choices=PAYMENT_TYPE)
    amount_paid    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # ^ 0 for credit | full amount for cash | partial amount for partial
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD, blank=True)
    # ^ Required if payment_type = cash or partial; blank if credit
    notes          = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    # Computed:
    # total_amount  → SUM(SaleItem.total_amount)
    # credit_amount → total_amount - amount_paid
```

```python
class SaleItem(models.Model):
    PRICING = [
        ('per_piece', 'Per Piece'),
        ('per_bag',   'Per Bag'),
    ]

    sale          = models.ForeignKey(Sale, related_name='items', on_delete=models.CASCADE)
    purchase      = models.ForeignKey('purchases.Purchase', on_delete=models.PROTECT)
    # ^ Selecting a purchase batch gives you: item_code, shipping_code,
    #   quantity_per_bag, and purchase cost — all at once.

    pricing_type  = models.CharField(max_length=10, choices=PRICING)
    # ^ Whether THIS sale line is priced per bag or per piece.
    # Independent from how it was purchased.

    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    # ^ Per bag if pricing_type=per_bag | Per piece if pricing_type=per_piece.

    quantity_sold = models.IntegerField()
    # ^ REQUIRED INPUT:
    #   pricing_type=per_bag   → quantity_sold = number of BAGS sold
    #   pricing_type=per_piece → quantity_sold = number of PIECES sold
    #
    # The UI always shows both bags and pieces_per_bag (auto-filled from purchase).
    # Example A: per_bag, quantity_sold=3, purchase.quantity_per_bag=30 → 90 pieces
    # Example B: per_piece, quantity_sold=20, purchase.quantity_per_bag=30 → 0.67 bags (allowed)
```

**Computed values for SaleItem:**

| Name | Formula |
|---|---|
| `pieces_sold` | `quantity_sold × purchase.quantity_per_bag` if per_bag · `quantity_sold` if per_piece |
| `bags_sold` | `quantity_sold` if per_bag · `quantity_sold ÷ purchase.quantity_per_bag` if per_piece |
| `total_amount` | `selling_price × quantity_sold` *(same formula for both types)* |
| `cost_amount` | `purchase.price_per_piece × pieces_sold` |
| `profit` | `total_amount − cost_amount` |

**Stock validation before saving:**
```python
# For each SaleItem being saved:
available_pieces = purchase.total_pieces - SUM(existing_saleitems.pieces_sold for this purchase)
if self.pieces_sold > available_pieces:
    raise ValidationError(f"Only {available_pieces} pieces available in batch {purchase.shipping_code}")
```

**Partial bag sale example (confirmed as valid):**
```
Purchase:  SHP-20250601-0042 | 1 bag | 30 pieces/bag | 30 total pieces
Sale line: pricing_type=per_piece | selling_price=15 | quantity_sold=20
→ pieces_sold = 20
→ total_amount = 15 × 20 = 300
→ remaining in this batch = 30 - 20 = 10 pieces → "0 bags + 10 pieces"
```

---

### `income` app

> Records money received. Auto-created on cash/partial sales. Manually created when a customer pays off existing credit.

```python
class Income(models.Model):
    SOURCE = [
        ('cash_sale',      'Cash Sale'),
        ('partial_sale',   'Partial Sale Payment'),
        ('credit_payment', 'Customer Credit Payment'),
    ]
    PAYMENT_METHOD = [
        ('cash',     'Cash'),
        ('telebirr', 'Telebirr'),
        ('cbe',      'CBE'),
        ('boa',      'BOA'),
        ('awash',    'Awash'),
    ]

    date           = models.DateField()
    customer       = models.ForeignKey('customers.Customer', on_delete=models.PROTECT)
    amount         = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD)
    source         = models.CharField(max_length=20, choices=SOURCE)
    sale           = models.OneToOneField('sales.Sale', null=True, blank=True, on_delete=models.SET_NULL)
    # ^ Auto-linked when source = cash_sale or partial_sale
    notes          = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
```

---

### `expenses` app

> **Rule:** `factory` set → factory payment, reduces factory balance. `factory` null → general expense (rent, transport, salary, etc.).

```python
class Expense(models.Model):
    PAYMENT_METHOD = [
        ('cash',     'Cash'),
        ('telebirr', 'Telebirr'),
        ('cbe',      'CBE'),
        ('boa',      'BOA'),
        ('awash',    'Awash'),
    ]

    date           = models.DateField()
    factory        = models.ForeignKey('factories.Factory', null=True, blank=True, on_delete=models.PROTECT)
    # ^ Set → factory payment | Null → general business expense
    description    = models.CharField(max_length=300)
    amount         = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD)
    notes          = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
```

---

## Business Logic Flows

### Cash Sale
1. `Sale` saved: `payment_type='cash'`, `amount_paid = total_amount`
2. Each `SaleItem` deducts `pieces_sold` from its `Purchase` batch
3. `Income` **auto-created**: `source='cash_sale'`, linked to sale
4. Customer balance: **unchanged**

### Credit Sale
1. `Sale` saved: `payment_type='credit'`, `amount_paid = 0`
2. `SaleItem`(s) created, stock deducted
3. **No Income** created
4. Customer `current_balance` **increases** by `total_amount`

### Partial Sale
1. `Sale` saved: `payment_type='partial'`, `amount_paid = X`
2. `SaleItem`(s) created, stock deducted
3. `Income` **auto-created** for `X`: `source='partial_sale'`
4. Customer `current_balance` **increases** by `(total_amount − X)`

### Customer Pays Off Old Credit
1. `Income` **manually created**: `source='credit_payment'`, no sale linked
2. Customer `current_balance` **decreases** by amount

### Purchase from Factory
1. `Purchase` saved with both `total_bags` + `quantity_per_bag` as required inputs
2. `shipping_code` auto-generated
3. `Product` auto-created via `get_or_create(item_code=...)` — or existing product reused
4. `Product.default_quantity_per_bag` updated if not already set
5. Factory `remaining_balance` **increases** by `total_amount`

### Factory Payment
1. `Expense` saved with `factory` set
2. Factory `remaining_balance` **decreases** by amount

---

## Stock Tracking — Pieces as Base Unit

Pieces are the universal unit internally. Bags are always derived from pieces.

```
# Per purchase batch:
remaining_pieces = (total_bags × quantity_per_bag) − SUM(SaleItem.pieces_sold)

# Display:
remaining_full_bags = remaining_pieces // quantity_per_bag
leftover_pieces     = remaining_pieces % quantity_per_bag

# Per product (all batches combined):
product_total_remaining_pieces = SUM(remaining_pieces) for all batches of this product

# Low stock check:
is_low = product_total_remaining_pieces < product.min_stock_in_pieces
```

Stock can be queried and filtered by:
- **Item code** → via `purchase__product__item_code`
- **Shipping code** → single Purchase record
- **Factory** → via `purchase__factory`
- **Purchase batch** → single Purchase record directly

---

## Dashboard Aggregations

| Card | Formula |
|---|---|
| Total Sales | `SUM(SaleItem.total_amount)` |
| Total Customer Credit (owed to you) | `SUM(Sale.credit_amount across credit + partial sales)` |
| Total Factory Balance (you owe factories) | `SUM(Factory.initial_balance) + SUM(Purchase.total_amount) − SUM(Expense where factory set)` |
| Total Expense | `SUM(Expense.amount)` — all records |
| Gross Profit | `SUM(SaleItem.total_amount − SaleItem.cost_amount)` |
| Total Stock Value | `SUM(remaining_pieces × price_per_piece)` across all batches |
| Low Stock Alerts | Products where `product_total_remaining_pieces < min_stock_in_pieces` |
| Unpaid customers 7/15/30/60+ days | Customers with `current_balance > 0`, bucketed by `(today − last_payment_date)` |

---

## Final Model Summary

| App | Models | Key Fields |
|---|---|---|
| `products` | `Product` | item_code (unique), name, min_stock, min_stock_unit |
| `customers` | `Customer` | name, phone, location |
| `factories` | `Factory` | name, phone, location, initial_balance |
| `purchases` | `Purchase` | factory, product, shipping_code*, pricing_type, price, quantity_per_bag**, total_bags** |
| `sales` | `Sale` | customer, payment_type, amount_paid, payment_method |
| `sales` | `SaleItem` | sale, purchase, pricing_type, selling_price, quantity_sold** |
| `income` | `Income` | customer, amount, payment_method, source, sale? |
| `expenses` | `Expense` | factory?, description, amount, payment_method |

`*` auto-generated &nbsp;&nbsp; `**` required input, not computed &nbsp;&nbsp; `?` optional FK

**Total: 8 models across 7 apps. Design is final.**

---

## Next Step Options

The design is locked. Here is what we can build next:

1. **Start with models** — write all 8 Django model files with `save()` overrides and `@property` computed fields
2. **Add serializers** — DRF serializers with validation logic (stock check, payment method rules, auto-income creation)
3. **Add views/endpoints** — list all API endpoints for each module
4. **Full project setup** — `settings.py`, `urls.py`, app structure, dependencies (`djangorestframework`, `django-filter`, etc.)

---
```
PAYMENT_METHOD = [
    ('cash', 'Cash'),
    ('telebirr', 'Telebirr'),
    ('mpesa', 'M-Pesa'),

    ('abay', 'Abay Bank S.C.'),
    ('addis', 'Addis International Bank S.C.'),
    ('ahadu', 'Ahadu Bank S.C.'),
    ('amhara', 'Amhara Bank S.C.'),
    ('awash', 'Awash Bank S.C.'),
    ('awash_int', 'Awash International Bank S.C.'),
    ('boa', 'Bank of Abyssinia'),
    ('berhan', 'Berhan Bank S.C.'),
    ('berhan_int', 'Berhan International Bank'),
    ('bunna', 'Bunna International Bank S.C.'),
    ('cbe', 'Commercial Bank of Ethiopia'),
    ('coop_oromia', 'Cooperative Bank of Oromia S.C.'),
    ('dashen', 'Dashen Bank S.C.'),
    ('debub', 'Debub Global Bank S.C.'),
    ('dbe', 'Development Bank of Ethiopia'),
    ('enat', 'Enat Bank S.C.'),
    ('gadaa', 'Gadaa Bank S.C.'),
    ('global', 'Global Bank Ethiopia S.C.'),
    ('goh_betoch', 'Goh Betoch Bank S.C.'),
    ('hibret', 'Hibret Bank Share Company'),
    ('hijra', 'Hijra Bank Share Company'),
    ('lion', 'Lion International Bank S.C.'),
    ('nib', 'Nib International Bank S.C.'),
    ('omo', 'Omo Bank Share Company'),
    ('oromia', 'Oromia Bank S.C.'),
    ('oromia_int', 'Oromia International Bank S.C.'),
    ('rammis', 'Rammis Bank Share Company'),
    ('shabelle', 'Shabelle Bank Share Company'),
    ('sidama', 'Sidama Bank S.C.'),
    ('siinqee', 'Siinqee Bank S.C.'),
    ('siket', 'Siket Bank Share Company'),
    ('tsedey', 'Tsedey Bank S.C.'),
    ('tsehay', 'Tsehay Bank Share Company'),
    ('united', 'United Bank Share Company'),
    ('wegagen', 'Wegagen Bank S.C.'),
    ('zamzam', 'Zamzam Bank S.C.'),
    ('zemen', 'Zemen Bank S.C.'),
]
```