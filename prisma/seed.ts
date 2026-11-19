import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const csvPath = path.join(process.cwd(), "product_sales_dataset.csv");
  const lines = fs
    .readFileSync(csvPath, "utf-8")
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");

  const sales = lines.slice(1).map((line) => {
    // CSV ka Total column skip (, ,), hum khud price * qty calculate karte hain
    const [id, name, category, price, qty, , date, city] = line.split(",");
    const priceUsd = Number(price);
    const quantitySold = Number(qty);
    return {
      productId: id.trim(),
      productName: name.trim(),
      category: category.trim(),
      priceUsd,
      quantitySold,
      totalSalesUsd: priceUsd * quantitySold,
      orderDate: new Date(date.trim() + "T00:00:00Z"), // UTC, timezone ka jhanjhat nahi
      customerCity: city.trim(),
    };
  });

  await prisma.sale.deleteMany(); // dobara chalane par duplicate na bane
  await prisma.sale.createMany({ data: sales });
  console.log(`Seeded ${sales.length} rows`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());