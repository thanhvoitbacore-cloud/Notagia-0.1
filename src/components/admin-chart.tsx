"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DataPoint = { label: string; value: number };

export function AdminAreaChart({ data }: { data: DataPoint[] }) {
  const chartData = data.map((d) => ({ name: d.label, value: d.value }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#71717a", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f0f1a",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "12px",
            color: "#fff",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#colorValue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AdminBarChart({ data }: { data: DataPoint[] }) {
  const chartData = data.map((d) => ({ name: d.label, value: d.value }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#71717a", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f0f1a",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "12px",
            color: "#fff",
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
