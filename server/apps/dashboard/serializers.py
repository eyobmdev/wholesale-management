from rest_framework import serializers


class SummaryCardSerializer(serializers.Serializer):
    """A single metric card on the dashboard."""
    label = serializers.CharField(help_text="Human readable card title")
    value = serializers.DecimalField(
        max_digits=15, decimal_places=2,
        help_text="The numeric value"
    )
    currency = serializers.CharField(help_text="Currency code, e.g. ETB")
    change_percent = serializers.FloatField(
        allow_null=True,
        help_text="Percentage change vs previous period. Null if no previous data."
    )
    change_direction = serializers.ChoiceField(
        choices=['up', 'down', 'neutral'],
        help_text="Is this metric going up, down, or staying the same vs last period?"
    )
    is_positive = serializers.BooleanField(
        help_text="Is this change good for business? (e.g. sales going up = positive, expenses going up = negative)"
    )


class OverdueBucketSerializer(serializers.Serializer):
    """One bucket in the overdue customers breakdown."""
    label = serializers.CharField(help_text="e.g. '7-15 days', '60+ days'")
    count = serializers.IntegerField(help_text="Number of customers in this bucket")
    total_amount = serializers.DecimalField(
        max_digits=15, decimal_places=2,
        help_text="Total amount owed by customers in this bucket"
    )
    customers = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of customers in this bucket with id, name, amount, days"
    )


class MonthlyComparisonSerializer(serializers.Serializer):
    """This month vs last month comparison for a metric."""
    this_month = serializers.DecimalField(max_digits=15, decimal_places=2)
    last_month = serializers.DecimalField(max_digits=15, decimal_places=2)
    change = serializers.DecimalField(max_digits=15, decimal_places=2)
    change_percent = serializers.FloatField(allow_null=True)


class RecentTransactionSerializer(serializers.Serializer):
    """One recent transaction (sale, payment, expense, etc.)."""
    id = serializers.IntegerField()
    type = serializers.CharField(help_text="sale, income, factory_payment, expense")
    reference = serializers.CharField(help_text="Invoice/receipt/payment number")
    description = serializers.CharField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    currency = serializers.CharField()
    date = serializers.DateField()
    party_name = serializers.CharField(help_text="Customer or factory name")


class AlertItemSerializer(serializers.Serializer):
    """One alert item for the dashboard."""
    id = serializers.IntegerField()
    item_code = serializers.CharField()
    product_name = serializers.CharField()
    shipping_code = serializers.CharField()
    remaining_bags = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_bags = serializers.IntegerField()
    percentage_remaining = serializers.FloatField(help_text="0-100%")
    alert_type = serializers.ChoiceField(
        choices=['sold_out', 'low_stock', 'slow_moving'],
        help_text="What kind of alert is this?"
    )


class MainDashboardSerializer(serializers.Serializer):
    """Full response for the main dashboard endpoint."""
    # ── Summary Cards ──
    cards = serializers.ListField(
        child=SummaryCardSerializer(),
        help_text="All the metric cards at the top of the dashboard"
    )

    # ── Monthly Comparison ──
    monthly_comparison = serializers.DictField(
        help_text="This month vs last month for key metrics"
    )

    # ── Overdue Customers ──
    overdue_customers = serializers.ListField(
        child=OverdueBucketSerializer(),
        help_text="Customers grouped by how long they haven't paid"
    )

    # ── Recent Transactions ──
    recent_transactions = serializers.ListField(
        child=RecentTransactionSerializer(),
        help_text="Last 10 transactions across all types"
    )

    # ── Stock Alerts ──
    stock_alerts = serializers.ListField(
        child=AlertItemSerializer(),
        help_text="Sold out, low stock, and slow-moving items"
    )

    # ── Quick Stats ──
    total_customers = serializers.IntegerField()
    active_customers = serializers.IntegerField()
    total_factories = serializers.IntegerField()
    active_factories = serializers.IntegerField()
    total_products = serializers.IntegerField(help_text="Distinct item codes in stock")
    total_stock_batches = serializers.IntegerField()


# SALES TREND — /api/dashboard/sales-trend/

class SalesTrendPointSerializer(serializers.Serializer):
    """One data point in the sales trend chart."""
    date = serializers.CharField(help_text="Date or period label, e.g. '2024-01-20' or '2024-W03'")
    total_sales = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_cost = serializers.DecimalField(max_digits=15, decimal_places=2, allow_null=True)
    gross_profit = serializers.DecimalField(max_digits=15, decimal_places=2, allow_null=True)
    num_sales = serializers.IntegerField(help_text="Number of sale invoices in this period")
    num_items_sold = serializers.IntegerField(help_text="Total bags sold across all sales")


class SalesTrendSerializer(serializers.Serializer):
    """Full response for sales trend endpoint."""
    period = serializers.ChoiceField(choices=['daily', 'weekly', 'monthly'])
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    currency = serializers.CharField()
    data = serializers.ListField(child=SalesTrendPointSerializer())
    totals = serializers.DictField(help_text="Sum totals across the entire period")


# ──────────────────────────────────────────────────────────────────
# PROFIT TREND — /api/dashboard/profit-trend/
# ──────────────────────────────────────────────────────────────────

class ProfitTrendPointSerializer(serializers.Serializer):
    """One data point in the profit trend chart."""
    date = serializers.CharField()
    gross_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    profit_margin_percent = serializers.FloatField(
        help_text="net_profit / total_sales × 100"
    )


class ProfitTrendSerializer(serializers.Serializer):
    """Full response for profit trend endpoint."""
    period = serializers.ChoiceField(choices=['daily', 'weekly', 'monthly'])
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    currency = serializers.CharField()
    data = serializers.ListField(child=ProfitTrendPointSerializer())
    totals = serializers.DictField()


# ──────────────────────────────────────────────────────────────────
# TOP PRODUCTS — /api/dashboard/top-products/
# ──────────────────────────────────────────────────────────────────

class TopProductSerializer(serializers.Serializer):
    """One product in the top products ranking."""
    item_code = serializers.CharField()
    product_name = serializers.CharField()
    total_bags_sold = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_pieces_sold = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_cost = serializers.DecimalField(max_digits=15, decimal_places=2)
    gross_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    profit_margin_percent = serializers.FloatField()
    num_sales = serializers.IntegerField(help_text="How many sale invoices included this product")
    remaining_bags = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        help_text="Current remaining stock across all batches"
    )
    rank = serializers.IntegerField(help_text="1 = top seller")


class TopProductsSerializer(serializers.Serializer):
    """Full response for top products endpoint."""
    period_label = serializers.CharField(help_text="e.g. 'Last 30 days', 'This year'")
    by = serializers.ChoiceField(
        choices=['revenue', 'profit', 'quantity'],
        help_text="What metric was used to rank"
    )
    products = serializers.ListField(child=TopProductSerializer())


# ──────────────────────────────────────────────────────────────────
# TOP CUSTOMERS — /api/dashboard/top-customers/
# ──────────────────────────────────────────────────────────────────

class TopCustomerSerializer(serializers.Serializer):
    """One customer in the top customers ranking."""
    id = serializers.IntegerField()
    name = serializers.CharField()
    phone = serializers.CharField(allow_null=True)
    location = serializers.CharField(allow_null=True)
    total_purchases = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_paid = serializers.DecimalField(max_digits=15, decimal_places=2)
    current_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    num_sales = serializers.IntegerField()
    last_purchase_date = serializers.DateField(allow_null=True)
    last_payment_date = serializers.DateField(allow_null=True)
    rank = serializers.IntegerField()


class TopCustomersSerializer(serializers.Serializer):
    """Full response for top customers endpoint."""
    period_label = serializers.CharField()
    by = serializers.ChoiceField(choices=['revenue', 'balance', 'frequency'])
    customers = serializers.ListField(child=TopCustomerSerializer())


# ──────────────────────────────────────────────────────────────────
# OVERDUE CUSTOMERS — /api/dashboard/overdue-customers/
# ──────────────────────────────────────────────────────────────────

class OverdueCustomerDetailSerializer(serializers.Serializer):
    """One overdue customer with full details."""
    id = serializers.IntegerField()
    name = serializers.CharField()
    phone = serializers.CharField(allow_null=True)
    location = serializers.CharField(allow_null=True)
    current_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_sales_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_paid = serializers.DecimalField(max_digits=15, decimal_places=2)
    last_payment_date = serializers.DateField(allow_null=True)
    last_purchase_date = serializers.DateField(allow_null=True)
    days_since_last_payment = serializers.IntegerField(allow_null=True)
    bucket = serializers.CharField(help_text="e.g. '7-15 days', '60+ days'")


class OverdueCustomersSerializer(serializers.Serializer):
    """Full response for overdue customers endpoint."""
    total_overdue_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_overdue_customers = serializers.IntegerField()
    buckets = serializers.ListField(child=OverdueBucketSerializer())
    all_overdue = serializers.ListField(
        child=OverdueCustomerDetailSerializer(),
        help_text="Flat list of ALL overdue customers sorted by days descending"
    )


# ──────────────────────────────────────────────────────────────────
# STOCK OVERVIEW — /api/dashboard/stock-overview/
# ──────────────────────────────────────────────────────────────────

class StockByProductSerializer(serializers.Serializer):
    """Stock summary for one item_code across all its batches."""
    item_code = serializers.CharField()
    product_name = serializers.CharField()
    total_bags_purchased = serializers.IntegerField()
    total_bags_sold = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_bags_remaining = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_pieces_purchased = serializers.IntegerField()
    total_pieces_sold = serializers.IntegerField()
    total_pieces_remaining = serializers.IntegerField()
    stock_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    currency = serializers.CharField()
    batch_count = serializers.IntegerField()
    status = serializers.ChoiceField(
        choices=['available', 'low_stock', 'sold_out'],
        help_text="Worst status across all batches for this item"
    )


class StockOverviewSerializer(serializers.Serializer):
    """Full response for stock overview endpoint."""
    total_stock_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_products = serializers.IntegerField(help_text="Distinct item codes")
    total_batches = serializers.IntegerField()
    sold_out_count = serializers.IntegerField(help_text="Batches with 0 remaining")
    low_stock_count = serializers.IntegerField()
    healthy_stock_count = serializers.IntegerField()
    products = serializers.ListField(child=StockByProductSerializer())


# ──────────────────────────────────────────────────────────────────
# PAYMENT METHOD DISTRIBUTION — /api/dashboard/payment-methods/
# ──────────────────────────────────────────────────────────────────

class PaymentMethodBucketSerializer(serializers.Serializer):
    """Breakdown by payment method."""
    payment_method = serializers.CharField()
    count = serializers.IntegerField(help_text="Number of transactions")
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    percentage = serializers.FloatField(help_text="Percentage of total")


class PaymentMethodDistributionSerializer(serializers.Serializer):
    """Full response for payment method distribution."""
    income_by_method = serializers.ListField(
        child=PaymentMethodBucketSerializer(),
        help_text="Customer income breakdown by payment method"
    )
    factory_payments_by_method = serializers.ListField(
        child=PaymentMethodBucketSerializer(),
        help_text="Factory payments breakdown by payment method"
    )
    expenses_by_method = serializers.ListField(
        child=PaymentMethodBucketSerializer(),
        help_text="Expenses breakdown by payment method"
    )


# ──────────────────────────────────────────────────────────────────
# EXPENSE BREAKDOWN — /api/dashboard/expenses-breakdown/
# ──────────────────────────────────────────────────────────────────

class ExpenseCategorySerializer(serializers.Serializer):
    """One expense description/category with totals."""
    description = serializers.CharField(help_text="The expense description (grouped)")
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    count = serializers.IntegerField(help_text="Number of expense records")
    percentage = serializers.FloatField(help_text="Percentage of total expenses")
    last_date = serializers.DateField(help_text="Most recent expense date")


class ExpenseBreakdownSerializer(serializers.Serializer):
    """Full response for expense breakdown."""
    total_expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    categories = serializers.ListField(child=ExpenseCategorySerializer())
    daily_trend = serializers.ListField(
        child=serializers.DictField(),
        help_text="Daily expense totals for charting"
    )


# ──────────────────────────────────────────────────────────────────
# FACTORY BALANCES — /api/dashboard/factory-balances/
# ──────────────────────────────────────────────────────────────────

class FactoryBalanceItemSerializer(serializers.Serializer):
    """One factory with balance info."""
    id = serializers.IntegerField()
    name = serializers.CharField()
    phone = serializers.CharField(allow_null=True)
    location = serializers.CharField(allow_null=True)
    total_purchased = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_paid = serializers.DecimalField(max_digits=15, decimal_places=2)
    current_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    balance_status = serializers.CharField(
        help_text="e.g. 'You owe Addis Textile 5000 ETB' or 'Settled'"
    )
    last_purchase_date = serializers.DateField(allow_null=True)
    last_payment_date = serializers.DateField(allow_null=True)


class FactoryBalancesSerializer(serializers.Serializer):
    """Full response for factory balances overview."""
    total_you_owe = serializers.DecimalField(
        max_digits=15, decimal_places=2,
        help_text="Sum of positive factory balances (money you owe)"
    )
    total_they_owe = serializers.DecimalField(
        max_digits=15, decimal_places=2,
        help_text="Sum of negative factory balances (money they owe you)"
    )
    net_factory_balance = serializers.DecimalField(
        max_digits=15, decimal_places=2,
        help_text="total_you_owe - total_they_owe"
    )
    factories = serializers.ListField(child=FactoryBalanceItemSerializer())


# ──────────────────────────────────────────────────────────────────
# CUSTOMER BALANCES — /api/dashboard/customer-balances/
# ──────────────────────────────────────────────────────────────────

class CustomerBalanceItemSerializer(serializers.Serializer):
    """One customer with balance info."""
    id = serializers.IntegerField()
    name = serializers.CharField()
    phone = serializers.CharField(allow_null=True)
    location = serializers.CharField(allow_null=True)
    total_sales = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_paid = serializers.DecimalField(max_digits=15, decimal_places=2)
    current_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    balance_status = serializers.CharField()
    last_purchase_date = serializers.DateField(allow_null=True)
    last_payment_date = serializers.DateField(allow_null=True)


class CustomerBalancesSerializer(serializers.Serializer):
    """Full response for customer balances overview."""
    total_they_owe = serializers.DecimalField(
        max_digits=15, decimal_places=2,
        help_text="Sum of positive customer balances (money owed to you)"
    )
    total_you_owe = serializers.DecimalField(
        max_digits=15, decimal_places=2,
        help_text="Sum of negative customer balances (you owe them)"
    )
    net_customer_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    settled_count = serializers.IntegerField(help_text="Customers with 0 balance")
    owing_count = serializers.IntegerField(help_text="Customers with positive balance")
    overpaid_count = serializers.IntegerField(help_text="Customers with negative balance")
    customers = serializers.ListField(child=CustomerBalanceItemSerializer())


# ──────────────────────────────────────────────────────────────────
# REVENUE VS EXPENSES — /api/dashboard/revenue-vs-expenses/
# ──────────────────────────────────────────────────────────────────

class RevenueExpensePointSerializer(serializers.Serializer):
    """One data point for the revenue vs expenses chart."""
    date = serializers.CharField()
    revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    cost_of_goods = serializers.DecimalField(
        max_digits=15, decimal_places=2,
        help_text="Purchase cost of items sold"
    )
    gross_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_profit = serializers.DecimalField(max_digits=15, decimal_places=2)


class RevenueVsExpensesSerializer(serializers.Serializer):
    """Full response for revenue vs expenses comparison."""
    period = serializers.ChoiceField(choices=['daily', 'weekly', 'monthly'])
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    currency = serializers.CharField()
    data = serializers.ListField(child=RevenueExpensePointSerializer())
    totals = serializers.DictField()


# ──────────────────────────────────────────────────────────────────
# INVENTORY AGING — /api/dashboard/inventory-aging/
# ──────────────────────────────────────────────────────────────────

class InventoryAgingBucketSerializer(serializers.Serializer):
    """One age bucket for inventory."""
    label = serializers.CharField(help_text="e.g. '0-30 days', '60-90 days', '90+ days'")
    batch_count = serializers.IntegerField()
    total_bags = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    percentage = serializers.FloatField(help_text="Percentage of total inventory value")


class InventoryAgingSerializer(serializers.Serializer):
    """Full response for inventory aging report."""
    total_inventory_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_batches = serializers.IntegerField()
    oldest_batch_date = serializers.DateField(allow_null=True)
    aging_buckets = serializers.ListField(child=InventoryAgingBucketSerializer())


# ──────────────────────────────────────────────────────────────────
# PRODUCT PERFORMANCE — /api/dashboard/product-performance/
# ──────────────────────────────────────────────────────────────────

class ProductPerformanceSerializer(serializers.Serializer):
    """Performance metrics for one product across all its batches."""
    item_code = serializers.CharField()
    product_name = serializers.CharField()
    total_bags_purchased = serializers.IntegerField()
    total_bags_sold = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_bags_remaining = serializers.DecimalField(max_digits=10, decimal_places=2)
    sell_through_rate = serializers.FloatField(
        help_text="Percentage of purchased stock that has been sold. 100% = sold out."
    )
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_cost = serializers.DecimalField(max_digits=15, decimal_places=2)
    gross_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    profit_margin_percent = serializers.FloatField()
    avg_days_to_sell = serializers.FloatField(
        allow_null=True,
        help_text="Average number of days between purchase date and sale date"
    )
    velocity = serializers.ChoiceField(
        choices=['fast', 'medium', 'slow', 'dead'],
        help_text="How fast this product sells. Based on sell-through rate and time."
    )
    status = serializers.ChoiceField(
        choices=['healthy', 'low_stock', 'sold_out', 'overstocked'],
        help_text="Current stock health"
    )


class ProductPerformanceListSerializer(serializers.Serializer):
    """Full response for product performance endpoint."""
    total_products = serializers.IntegerField()
    fast_moving_count = serializers.IntegerField()
    slow_moving_count = serializers.IntegerField()
    dead_stock_count = serializers.IntegerField()
    products = serializers.ListField(child=ProductPerformanceSerializer())
