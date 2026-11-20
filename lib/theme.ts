export const GREEN = "#4ade80";
export const PURPLE = "#8b5cf6";
export const CYAN = "#06b6d4";
export const COLORS = [GREEN, PURPLE, CYAN, "#ec4899", "#f59e0b", "#64748b"];
export const GRID = "rgba(255,255,255,0.06)";

export const axisProps = {
  tick: { fill: "#9ca3af", fontSize: 12 },
  tickLine: false,
  axisLine: false,
};

export const tooltipProps = {
  contentStyle: {
    background: "#1b1e25",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
  },
  itemStyle: { color: "#e5e7eb" },
  labelStyle: { color: "#9ca3af" },
  cursor: { fill: "rgba(255,255,255,0.05)" },
};

export const money = (v: unknown) => `$${Number(v).toLocaleString()}`;
export const moneyShort = (v: number) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`);