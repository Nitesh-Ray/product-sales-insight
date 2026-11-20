"use client";
import type { ReactElement } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import { COLORS, GREEN, GRID, axisProps, tooltipProps, money, moneyShort } from "@/lib/theme";

type Props = {
  type: "line" | "bar" | "pie";
  labels: string[];
  values: number[];
  color?: string;
  horizontal?: boolean;
};

export default function Chart({ type, labels, values, color = GREEN, horizontal = false }: Props) {
  const data = labels.map((name, i) => ({ name, value: values[i] }));
  let chart: ReactElement;

  if (type === "line") {
    chart = (
      <LineChart data={data}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="name" {...axisProps} />
        <YAxis tickFormatter={moneyShort} {...axisProps} />
        <Tooltip {...tooltipProps} formatter={money} />
        <Line type="monotone" dataKey="value" name="Revenue" stroke={color} strokeWidth={3} dot={false} />
      </LineChart>
    );
  } else if (type === "bar" && horizontal) {
    chart = (
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <XAxis type="number" tickFormatter={moneyShort} {...axisProps} />
        <YAxis type="category" dataKey="name" width={90} {...axisProps} />
        <Tooltip {...tooltipProps} formatter={money} />
        <Bar dataKey="value" name="Revenue" fill={color} radius={[0, 8, 8, 0]} />
      </BarChart>
    );
  } else if (type === "bar") {
    chart = (
      <BarChart data={data}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="name" {...axisProps} />
        <YAxis tickFormatter={moneyShort} {...axisProps} />
        <Tooltip {...tooltipProps} formatter={money} />
        <Bar dataKey="value" name="Revenue" fill={color} radius={[8, 8, 0, 0]} />
      </BarChart>
    );
  } else {
    chart = (
      <PieChart>
        <Tooltip {...tooltipProps} formatter={money} />
        <Legend wrapperStyle={{ color: "#9ca3af" }} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3} stroke="none">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
      </PieChart>
    );
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>{chart}</ResponsiveContainer>
    </div>
  );
}