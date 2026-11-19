import pandas as pd
import json

df = pd.read_csv("product_sales_dataset.csv")
df["Order_Date"] = pd.to_datetime(df["Order_Date"])

def series(s):
    return {"labels": [str(i) for i in s.index], "values": [int(v) for v in s.values]}

monthly = df.groupby(df["Order_Date"].dt.to_period("M"))["Total_Sales_USD"].sum()
category = df.groupby("Category")["Total_Sales_USD"].sum().sort_values(ascending=False)
top_products = df.groupby("Product_Name")["Total_Sales_USD"].sum().sort_values(ascending=False).head(10)
city = df.groupby("Customer_City")["Total_Sales_USD"].sum().sort_values(ascending=False)

days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
weekday = df.groupby(df["Order_Date"].dt.day_name())["Total_Sales_USD"].sum().reindex(days)

out = {
    "kpis": {
        "total_revenue": int(df["Total_Sales_USD"].sum()),
        "units_sold": int(df["Quantity_Sold"].sum()),
        "avg_price": round(df["Price_USD"].mean(), 2),
        "cities": int(df["Customer_City"].nunique()),
    },
    "monthly_revenue": series(monthly),
    "category_revenue": series(category),
    "top_products": series(top_products),
    "city_revenue": series(city),
    "weekday_revenue": series(weekday),
    "cumulative_revenue": series(monthly.cumsum()),
}

with open("data/data.json", "w") as f:
    json.dump(out, f, indent=2)
print("data.json created")


rows = df.assign(Order_Date=df["Order_Date"].dt.strftime("%Y-%m-%d"))[
    ["Product_Name", "Category", "Price_USD", "Quantity_Sold",
     "Total_Sales_USD", "Order_Date", "Customer_City"]
].to_dict(orient="records")

with open("data/rows.json", "w") as f:
    json.dump(rows, f)
print("rows.json ban gaya")