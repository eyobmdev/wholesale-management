from datetime import datetime

def generate_shipping_code():
    return f"SHP-{datetime.now():%y%m%d}-{datetime.now():%H%M%S}"

print(generate_shipping_code())