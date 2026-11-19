"use client";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend,
} from "recharts";

const COLORS = ["#00aa00", "#0088cc", "#ee8800", "#cc3366", "#8855cc", "#888888", "#00ccaa", "#aacc00"];

type Props = { type: "line" | "bar" | "pie"; labels: string[]; values: number[] };

export default function Chart({ type, labels, values }: Props) {
  const data = labels.map((name, i) => ({ name, value: values[i] }));
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        {type === "line" ? (
          <LineChart data={data}>
            <XAxis dataKey="name" /><YAxis /><Tooltip />
            <Line type="monotone" dataKey="value" stroke="#00aa00" />
          </LineChart>
        ) : type === "bar" ? (
          <BarChart data={data}>
            <XAxis dataKey="name" /><YAxis /><Tooltip />
            <Bar dataKey="value" fill="#00aa00" />
          </BarChart>
        ) : (
          <PieChart>
            <Tooltip /><Legend />
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={110}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}