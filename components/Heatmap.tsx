import type { HeatmapYear } from "@/lib/analytics";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Heatmap({ data }: { data: HeatmapYear[] }) {
  const max = Math.max(1, ...data.flatMap((d) => d.months));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-center border-separate border-spacing-1.5">
        <thead>
          <tr>
            <th></th>
            {MONTHS.map((m) => (
              <th key={m} className="font-medium text-gray-500">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(({ year, months }) => (
            <tr key={year}>
              <th className="font-medium pr-2 text-gray-400">{year}</th>
              {months.map((v, i) => (
                <td
                  key={i}
                  className="rounded-xl p-2"
                  title={`${MONTHS[i]} ${year}: $${v.toLocaleString()}`}
                  style={{
                    background: v === 0 ? "#1b1e25" : `rgba(74,222,128,${0.15 + (0.85 * v) / max})`,
                    color: v / max > 0.6 ? "#0b0d10" : "#d1d5db",
                  }}
                >
                  {v === 0 ? "–" : `${Math.round(v / 1000)}k`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}