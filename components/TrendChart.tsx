"use client";
import { ResponsiveContainer, ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { rollingAverage } from "@/lib/analytics";
import { GREEN, PURPLE, GRID, axisProps, tooltipProps, money, moneyShort } from "@/lib/theme";

export default function TrendChart({ labels, values }: { labels: string[]; values: number[] }) {
  const avg = rollingAverage(values, 3);
  const data = labels.map((name, i) => ({ name, revenue: values[i], rolling: Math.round(avg[i]) }));
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <ComposedChart data={data}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis tickFormatter={moneyShort} {...axisProps} />
          <Tooltip {...tooltipProps} formatter={money} />
          <Legend wrapperStyle={{ color: "#9ca3af" }} />
          <Bar dataKey="revenue" name="Revenue" fill={GREEN} radius={[8, 8, 0, 0]} />
          <Line type="monotone" dataKey="rolling" name="3-month avg" stroke={PURPLE} strokeWidth={3} strokeDasharray="5 5" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}