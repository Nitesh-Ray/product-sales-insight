import rows from "@/data/rows.json";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return <Dashboard rows={rows} />;
}