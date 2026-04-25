"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { PaymentAnalytics } from "@/lib/invoice-analyzer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function AnalyticsDashboard({ analytics }: { analytics: PaymentAnalytics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Invoiced</CardDescription>
            <CardTitle className="text-2xl">${analytics.summary.totalInvoiced.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Estimated DSO</CardDescription>
            <CardTitle className="text-2xl">{analytics.summary.estimatedDso} days</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>On-Time Payments</CardDescription>
            <CardTitle className="text-2xl">{percent(analytics.summary.onTimeRate)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Late Invoices</CardDescription>
            <CardTitle className="text-2xl">{percent(analytics.summary.lateInvoicesRate)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Collection Trend</CardTitle>
            <CardDescription>Average days to pay by month</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.paymentTimeline}>
                <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: 12
                  }}
                />
                <Line type="monotone" dataKey="averageDaysToPay" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Client Risk</CardTitle>
            <CardDescription>Average days late by client</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.clients.slice(0, 8)} layout="vertical">
                <CartesianGrid stroke="rgba(148,163,184,0.15)" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="clientName"
                  type="category"
                  width={110}
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: 12
                  }}
                />
                <Bar dataKey="averageDaysLate" fill="#f97316" radius={8} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Portfolio Detail</CardTitle>
          <CardDescription>Behavior profile by revenue concentration and payment consistency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-900 text-slate-300">
                <tr>
                  <th className="px-3 py-2 text-left">Client</th>
                  <th className="px-3 py-2 text-left">Invoices</th>
                  <th className="px-3 py-2 text-left">Avg Days Late</th>
                  <th className="px-3 py-2 text-left">On-Time Rate</th>
                  <th className="px-3 py-2 text-left">Variability</th>
                  <th className="px-3 py-2 text-left">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-[#0d1117] text-slate-200">
                {analytics.clients.map((client) => (
                  <tr key={client.clientName}>
                    <td className="px-3 py-2">{client.clientName}</td>
                    <td className="px-3 py-2">{client.invoices}</td>
                    <td className="px-3 py-2">{client.averageDaysLate}</td>
                    <td className="px-3 py-2">{percent(client.onTimeRate)}</td>
                    <td className="px-3 py-2">{client.variabilityScore}</td>
                    <td className="px-3 py-2">${client.totalInvoiced.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
