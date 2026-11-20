"use client";
import { ResponsiveContainer, ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { ScatterPoint } from "@/lib/analytics";
import { COLORS, GRID, axisProps, tooltipProps } from "@/lib/theme";

export default function PriceQtyScatter({ points }: { points: ScatterPoint[] }) {
  const categories = Array.from(new Set(points.map((p) => p.category))).sort();
  return (
    <div style={{ width: "100%", height: 340 }}>
      <ResponsiveContainer>
        <ScatterChart>
          <CartesianGrid stroke={GRID} />
          <XAxis type="number" dataKey="price" name="Price" unit="$" {...axisProps} />
          <YAxis type="number" dataKey="qty" name="Quantity" {...axisProps} />
          <Tooltip {...tooltipProps} cursor={{ strokeDasharray: "3 3" }} />
          <Legend wrapperStyle={{ color: "#9ca3af" }} />
          {categories.map((c, i) => (
            <Scatter
              key={c}
              name={c}
              data={points.filter((p) => p.category === c)}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.75}
              isAnimationActive={false}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}