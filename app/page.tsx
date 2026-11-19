import { prisma } from "@/lib/prisma";
import Dashboard from "@/components/Dashboard";
import type { Row } from "@/lib/analytics";

export default async function Home() {
  const sales = await prisma.sale.findMany({ orderBy: { orderDate: "asc" } });

  const rows: Row[] = sales.map((s) => ({
    Product_Name: s.productName,
    Category: s.category,
    Price_USD: s.priceUsd,
    Quantity_Sold: s.quantitySold,
    Total_Sales_USD: s.totalSalesUsd,
    Order_Date: s.orderDate.toISOString().slice(0, 10),
    Customer_City: s.customerCity,
  }));

  // Temporary check: SQL ka GROUP BY, server ke terminal me print hoga
  const byCategory = await prisma.sale.groupBy({
    by: ["category"],
    _sum: { totalSalesUsd: true },
    orderBy: { _sum: { totalSalesUsd: "desc" } },
  });
  console.log(byCategory);

  return <Dashboard rows={rows} />;
}