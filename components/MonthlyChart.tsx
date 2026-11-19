"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Props = { labels: string[]; values: number[] };

export default function MonthlyChart({ labels, values }: Props) {
  const data = labels.map((l, i) => ({ month: l, revenue: values[i] }));
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="revenue" stroke="#00aa00" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}