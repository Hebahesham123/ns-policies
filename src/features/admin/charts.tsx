"use client";

import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const FALLBACK = ["#6366f1", "#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#ec4899"];

export function CategoryPie({ data }: { data: { name: string; value: number; color?: string }[] }) {
  const filtered = data.filter((d) => d.value > 0);
  if (!filtered.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={filtered} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
          {filtered.map((d, i) => (
            <Cell key={i} fill={d.color || FALLBACK[i % FALLBACK.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SearchesBar({ data }: { data: { keyword: string; search_count: number }[] }) {
  if (!data.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 12, right: 12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
        <YAxis type="category" dataKey="keyword" width={100} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          cursor={{ fill: "hsl(var(--accent))" }}
          contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }}
        />
        <Bar dataKey="search_count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart() {
  return <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">لا توجد بيانات بعد</div>;
}
