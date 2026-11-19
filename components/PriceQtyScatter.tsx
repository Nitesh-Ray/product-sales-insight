"use client";
import { ResponsiveContainer, ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { ScatterPoint } from "@/lib/analytics";

const COLORS = ["#00aa00", "#0088cc", "#ee8800", "#cc3366", "#8855cc", "#888888"];

export default function PriceQtyScatter({ points }: { points: ScatterPoint[] }) {
  const categories = Array.from(new Set(points.map((p) => p.category))).sort();
  return (
    <div style={{ width: "100%", height: 340 }}>
      <ResponsiveContainer>
        <ScatterChart>
          <CartesianGrid />
          <XAxis type="number" dataKey="price" name="Price" unit="$" />
          <YAxis type="number" dataKey="qty" name="Quantity" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Legend />
          {categories.map((c, i) => (
            <Scatter
              key={c}
              name={c}
              data={points.filter((p) => p.category === c)}
              fill={COLORS[i % COLORS.length]}
              isAnimationActive={false}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}