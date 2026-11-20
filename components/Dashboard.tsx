"use client";
import { useMemo, useState, type ReactNode } from "react";
import { LayoutDashboard, CircleDollarSign, Package, MapPin, TrendingUp } from "lucide-react";
import Chart from "./Chart";
import Heatmap from "./Heatmap";
import PriceQtyScatter from "./PriceQtyScatter";
import TrendChart from "./TrendChart";
import { buildData, buildHeatmap, buildScatter, buildKpiChange, latestTime, type Row } from "@/lib/analytics";

const TABS = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Revenue", icon: CircleDollarSign },
  { name: "Products", icon: Package },
  { name: "Cities", icon: MapPin },
  { name: "Trends", icon: TrendingUp },
] as const;
type Tab = (typeof TABS)[number]["name"];

const field =
  "bg-[#252a34] border border-white/10 rounded-xl px-3 py-1.5 text-sm text-gray-200 [color-scheme:dark]";

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-[#252a34] rounded-3xl p-6 mb-6 shadow-lg shadow-black/30">
      <h3 className="font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Kpi({ label, value, change, days }: { label: string; value: string; change: number | null; days: number }) {
  const up = change !== null && change >= 0;
  return (
    <div className="bg-[#252a34] rounded-3xl p-5 shadow-lg shadow-black/30">
      <p className="text-xs uppercase tracking-wider text-gray-400">{label}</p>
      <b className="block text-2xl mt-2">{value}</b>
      <p className={`text-sm mt-2 ${change === null ? "text-gray-500" : up ? "text-green-400" : "text-red-400"}`}>
        {change === null ? "–" : `${up ? "▲" : "▼"} ${Math.abs(change).toFixed(1)}%`}{" "}
        <span className="text-gray-500">vs prev {days}d</span>
      </p>
    </div>
  );
}

export default function Dashboard({ rows }: { rows: Row[] }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [days, setDays] = useState(30);

  const categories = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.Category))).sort()], [rows]);
  const cities = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.Customer_City))).sort()], [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const month = r.Order_Date.slice(0, 7);
        return (
          (category === "All" || r.Category === category) &&
          (city === "All" || r.Customer_City === city) &&
          (!from || month >= from) &&
          (!to || month <= to)
        );
      }),
    [rows, category, city, from, to]
  );
  const data = useMemo(() => buildData(filtered), [filtered]);
  const k = data.kpis;

  const anchor = useMemo(() => latestTime(filtered), [filtered]);
  const change = useMemo(() => buildKpiChange(filtered, anchor, days), [filtered, anchor, days]);
  const heatmap = useMemo(() => buildHeatmap(filtered), [filtered]);
  const scatter = useMemo(() => buildScatter(filtered), [filtered]);

  return (
    <div className="min-h-screen bg-[#16181d] text-gray-200">
      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 h-16 z-10 flex items-center px-6 bg-[#1b1e25] border-b border-white/5">
        <span className="text-lg font-bold">
          NexusPulse<span className="text-green-400">.</span>
        </span>
        <span className="ml-3 pl-3 border-l border-white/10 text-xs text-gray-500">{tab}</span>
      </header>

      {/* Sidebar (icons) */}
      <nav className="fixed top-16 bottom-0 left-0 w-20 z-10 flex flex-col items-center gap-3 py-6 bg-[#1b1e25]">
        {TABS.map(({ name, icon: Icon }) => (
          <button
            key={name}
            title={name}
            onClick={() => setTab(name)}
            className={`p-3 rounded-2xl transition ${
              tab === name ? "bg-[#16181d] text-green-400 shadow-inner shadow-black/50" : "text-gray-500 hover:text-gray-200"
            }`}
          >
            <Icon size={22} />
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="pt-24 pl-28 pr-8 pb-10">
        <h2 className="text-2xl font-bold mb-4">{tab}</h2>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={field}>
            {cities.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input type="month" value={from} onChange={(e) => setFrom(e.target.value)} className={field} />
          <input type="month" value={to} onChange={(e) => setTo(e.target.value)} className={field} />
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={field}>
            <option value={7}>7d</option>
            <option value={30}>30d</option>
            <option value={90}>90d</option>
          </select>
          <button
            onClick={() => { setCategory("All"); setCity("All"); setFrom(""); setTo(""); }}
            className="text-sm text-gray-400 underline"
          >
            Reset
          </button>
        </div>

        {tab === "Overview" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Kpi label="Revenue" days={days} value={`$${k.total_revenue.toLocaleString()}`} change={change.revenue} />
              <Kpi label="Units" days={days} value={k.units_sold.toLocaleString()} change={change.units} />
              <Kpi label="Avg Price" days={days} value={`$${k.avg_price}`} change={change.avgPrice} />
              <Kpi label="Cities" days={days} value={String(k.cities)} change={change.cities} />
            </div>
            <Card title="Monthly Revenue"><Chart type="line" {...data.monthly_revenue} /></Card>
          </>
        )}

        {tab === "Revenue" && (
          <Card title="Monthly Revenue + 3-month Rolling Avg"><TrendChart {...data.monthly_revenue} /></Card>
        )}

        {tab === "Products" && (
          <Card title="Top 10 Products by Revenue"><Chart type="bar" {...data.top_products} /></Card>
        )}

        {tab === "Cities" && (
          <>
            <Card title="Revenue by City"><Chart type="bar" {...data.city_revenue} /></Card>
            <Card title="City Share"><Chart type="pie" {...data.city_revenue} /></Card>
          </>
        )}

        {tab === "Trends" && (
          <>
            <Card title="Revenue by Weekday"><Chart type="bar" {...data.weekday_revenue} /></Card>
            <Card title="Cumulative Revenue"><Chart type="line" {...data.cumulative_revenue} /></Card>
            <Card title="Revenue Heatmap (Month × Year)"><Heatmap data={heatmap} /></Card>
            <Card title={`Price vs Quantity (correlation r = ${scatter.correlation.toFixed(2)})`}>
              <PriceQtyScatter points={scatter.points} />
            </Card>
          </>
        )}
      </main>
    </div>
  );
}