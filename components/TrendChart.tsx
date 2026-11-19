"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { rollingAverage } from "@/lib/analytics";

export default function TrendChart({ labels, values }: { labels: string[]; values: number[] }) {
  const avg = rollingAverage(values, 3);
  const data = labels.map((name, i) => ({ name, revenue: values[i], rolling: Math.round(avg[i]) }));
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#9ca3af" dot={false} />
          <Line type="monotone" dataKey="rolling" name="3-month avg" stroke="#00aa00" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}