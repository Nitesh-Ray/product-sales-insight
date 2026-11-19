export type Row = {
  Product_Name: string;
  Category: string;
  Price_USD: number;
  Quantity_Sold: number;
  Total_Sales_USD: number;
  Order_Date: string; // "2025-01-24"
  Customer_City: string;
};

export type Series = { labels: string[]; values: number[] };

export type Data = {
  kpis: { total_revenue: number; units_sold: number; avg_price: number; cities: number };
  monthly_revenue: Series;
  category_revenue: Series;
  top_products: Series;
  city_revenue: Series;
  weekday_revenue: Series;
  cumulative_revenue: Series;
};

type Pair = [string, number];

// Python ke groupby().sum() jaisa
function groupSum(rows: Row[], key: (r: Row) => string): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    m.set(k, (m.get(k) ?? 0) + r.Total_Sales_USD);
  }
  return m;
}

function toSeries(pairs: Pair[]): Series {
  return { labels: pairs.map((p) => p[0]), values: pairs.map((p) => p[1]) };
}

const byValueDesc = (a: Pair, b: Pair) => b[1] - a[1];
const byLabel = (a: Pair, b: Pair) => a[0].localeCompare(b[0]);
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function buildData(rows: Row[]): Data {
  const sum = (f: (r: Row) => number) => rows.reduce((s, r) => s + f(r), 0);
  const avgPrice = rows.length ? sum((r) => r.Price_USD) / rows.length : 0;

  const monthly = Array.from(groupSum(rows, (r) => r.Order_Date.slice(0, 7))).sort(byLabel);
  let running = 0;
  const cumulative = monthly.map(([m, v]) => [m, (running += v)] as Pair);

  // getUTCDay: 0 = Sunday, isliye (+6) % 7 se Monday = 0
  const dayTotals = groupSum(rows, (r) => DAYS[(new Date(r.Order_Date).getUTCDay() + 6) % 7]);
  const weekday = DAYS.map((d) => [d, dayTotals.get(d) ?? 0] as Pair);

  return {
    kpis: {
      total_revenue: sum((r) => r.Total_Sales_USD),
      units_sold: sum((r) => r.Quantity_Sold),
      avg_price: Math.round(avgPrice * 100) / 100,
      cities: new Set(rows.map((r) => r.Customer_City)).size,
    },
    monthly_revenue: toSeries(monthly),
    category_revenue: toSeries(Array.from(groupSum(rows, (r) => r.Category)).sort(byValueDesc)),
    top_products: toSeries(Array.from(groupSum(rows, (r) => r.Product_Name)).sort(byValueDesc).slice(0, 10)),
    city_revenue: toSeries(Array.from(groupSum(rows, (r) => r.Customer_City)).sort(byValueDesc)),
    weekday_revenue: toSeries(weekday),
    cumulative_revenue: toSeries(cumulative),
  };
}


// ---------- Heatmap (month x year) ----------
export type HeatmapYear = { year: number; months: number[] }; // months[0] = Jan

export function buildHeatmap(rows: Row[]): HeatmapYear[] {
  const byYear = new Map<number, number[]>();
  for (const r of rows) {
    const year = Number(r.Order_Date.slice(0, 4));
    const month = Number(r.Order_Date.slice(5, 7)) - 1; // 0..11
    if (!byYear.has(year)) byYear.set(year, Array(12).fill(0));
    byYear.get(year)![month] += r.Total_Sales_USD;
  }
  return Array.from(byYear, ([year, months]) => ({ year, months })).sort((a, b) => a.year - b.year);
}

// ---------- Scatter + correlation ----------
export type ScatterPoint = { price: number; qty: number; category: string };

// Pearson correlation: -1 se +1. 0 ke paas = koi relation nahi
export function pearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const a = x[i] - mx, b = y[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? 0 : num / den;
}

export function buildScatter(rows: Row[]) {
  const points: ScatterPoint[] = rows.map((r) => ({
    price: r.Price_USD,
    qty: r.Quantity_Sold,
    category: r.Category,
  }));
  return { points, correlation: pearson(points.map((p) => p.price), points.map((p) => p.qty)) };
}

// ---------- Real KPI change % ----------
const DAY = 86_400_000;
const toTime = (d: string) => Date.parse(d + "T00:00:00Z");

export function latestTime(rows: Row[]): number {
  return rows.reduce((m, r) => Math.max(m, toTime(r.Order_Date)), 0);
}

const pct = (cur: number, prev: number): number | null =>
  prev === 0 ? null : ((cur - prev) / prev) * 100;

export type KpiChange = {
  revenue: number | null;
  units: number | null;
  avgPrice: number | null;
  cities: number | null;
};

// anchor = poore data ki last date. Current = last `days` din, Previous = usse pehle ke `days` din
export function buildKpiChange(rows: Row[], anchor: number, days = 30): KpiChange {
  const inWindow = (from: number, to: number) =>
    rows.filter((r) => {
      const t = toTime(r.Order_Date);
      return t > from && t <= to;
    });
  const cur = buildData(inWindow(anchor - days * DAY, anchor)).kpis;
  const prev = buildData(inWindow(anchor - 2 * days * DAY, anchor - days * DAY)).kpis;
  return {
    revenue: pct(cur.total_revenue, prev.total_revenue),
    units: pct(cur.units_sold, prev.units_sold),
    avgPrice: pct(cur.avg_price, prev.avg_price),
    cities: pct(cur.cities, prev.cities),
  };
}


// Pichle `window` mahino ka average (shuru ke mahino me jitne available hain utne)
export function rollingAverage(values: number[], window = 3): number[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}