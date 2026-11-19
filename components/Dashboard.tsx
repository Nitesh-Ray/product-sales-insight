"use client";
import { useMemo, useState, type ReactNode } from "react";
import Chart from "./Chart";
// import { buildData, type Row } from "@/lib/analytics";

import Heatmap from "./Heatmap";
import PriceQtyScatter from "./PriceQtyScatter";
import { buildData, buildHeatmap, buildScatter, buildKpiChange, latestTime, type Row } from "@/lib/analytics";

import TrendChart from "./TrendChart";

const TABS = ["Overview", "Revenue", "Products", "Cities", "Trends"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Kpi({ label, value, change, days }: { label: string; value: string; change: number | null; days: number }) {
  const up = change !== null && change >= 0;
  return (
    <div className="bg-white p-4 rounded shadow">
      <p>{label}</p>
      <b className="text-xl">{value}</b>
      <p className={`text-sm ${change === null ? "text-gray-400" : up ? "text-green-600" : "text-red-600"}`}>
        {change === null ? "–" : `${up ? "▲" : "▼"} ${Math.abs(change).toFixed(1)}%`}{" "}
        <span className="text-gray-400">vs prev {days}d</span>
      </p>
    </div>
  );
}

export default function Dashboard({ rows }: { rows: Row[] }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All");
  const [from, setFrom] = useState(""); // "2025-03" jaisa
  const [to, setTo] = useState("");
  const [days, setDays] = useState(30);

  const categories = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.Category))).sort()], [rows]);
  const cities = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.Customer_City))).sort()], [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const month = r.Order_Date.slice(0, 7); // "2025-01"
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
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      {/* Menu */}
      <nav className="w-52 bg-white shadow p-4">
        <h1 className="text-xl font-bold mb-6">Sales Insight</h1>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`block w-full text-left px-3 py-2 rounded mb-1 ${tab === t ? "bg-green-600 text-white" : "hover:bg-gray-100"
              }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{tab}</h2>
          <div className="flex gap-3 items-center">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded px-2 py-1 bg-white">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="border rounded px-2 py-1 bg-white">
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input type="month" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-2 py-1 bg-white" />
            <input type="month" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-2 py-1 bg-white" />
            <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="border rounded px-2 py-1 bg-white">
              <option value={7}>7d</option>
              <option value={30}>30d</option>
              <option value={90}>90d</option>
            </select>
            <button onClick={() => { setCategory("All"); setCity("All"); setFrom(""); setTo(""); }} className="text-sm underline">              Reset
            </button>
          </div>
        </div>

        {tab === "Overview" && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Kpi label="Revenue" days={days} value={`$${k.total_revenue.toLocaleString()}`} change={change.revenue} />
              <Kpi label="Units" days={days} value={k.units_sold.toLocaleString()} change={change.units} />
              <Kpi label="Avg Price" days={days} value={`$${k.avg_price}`} change={change.avgPrice} />
              <Kpi label="Cities" days={days} value={String(k.cities)} change={change.cities} />
            </div>
            <Card title="Monthly Revenue"><Chart type="line" {...data.monthly_revenue} /></Card>
          </>
        )}

        {tab === "Revenue" && (
          <>
            <Card title="Monthly Revenue + 3-month Rolling Avg"><TrendChart {...data.monthly_revenue} /></Card>
          </>
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