import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const sales = await prisma.sale.findMany({ orderBy: { orderDate: "asc" } });

  const rows = sales.map((s) => ({
    Product_Name: s.productName,
    Category: s.category,
    Price_USD: s.priceUsd,
    Quantity_Sold: s.quantitySold,
    Total_Sales_USD: s.totalSalesUsd,
    Order_Date: s.orderDate.toISOString().slice(0, 10),
    Customer_City: s.customerCity,
  }));

  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync(path.join("data", "rows.json"), JSON.stringify(rows));
  console.log(`Exported ${rows.length} rows to data/rows.json`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());