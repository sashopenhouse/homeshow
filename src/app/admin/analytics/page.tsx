"use client";

import { BarChart, AreaChart, PieChart, TrendingUp, Search, Calendar, ChevronDown } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm">Visualize traffic, signups distribution, and show attendance projections.</p>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="bg-white border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Conversion Rate</span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-foreground">11.8%</h3>
            <p className="text-xs text-muted-foreground">Ratio of site hits to ticket purchases</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Category Demand</span>
            <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5">Remodeling</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-foreground">42%</h3>
            <p className="text-xs text-muted-foreground">General interest in kitchen & bath renovations</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Audience Projection</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5">+24%</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-foreground">24,500</h3>
            <p className="text-xs text-muted-foreground">Estimated visitors based on ticket speed</p>
          </div>
        </div>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Traffic Chart Mock */}
        <div className="bg-white border border-border p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground">Website Traffic (Last 7 Days)</h3>
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">Daily Views</span>
          </div>
          <div className="h-64 flex items-end gap-3 pt-6 border-b border-border pl-6 relative">
            {/* Grid Line lines */}
            <div className="absolute left-0 right-0 top-1/4 border-t border-border/40" />
            <div className="absolute left-0 right-0 top-2/4 border-t border-border/40" />
            <div className="absolute left-0 right-0 top-3/4 border-t border-border/40" />
            
            {/* Bars */}
            {[
              { label: "Mon", height: "h-[35%]" },
              { label: "Tue", height: "h-[45%]" },
              { label: "Wed", height: "h-[40%]" },
              { label: "Thu", height: "h-[65%]" },
              { label: "Fri", height: "h-[85%]" },
              { label: "Sat", height: "h-[95%]" },
              { label: "Sun", height: "h-[75%]" },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 relative z-10 h-full justify-end">
                <div className={`w-full bg-primary ${bar.height} hover:bg-primary/95 transition-all`} />
                <span className="text-xs font-bold text-muted-foreground mt-2">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown Mock */}
        <div className="bg-white border border-border p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-foreground">Exhibitor Category Breakdown</h3>
          <div className="space-y-4 pt-4">
            {[
              { category: "Roofing, Siding & Windows", count: 32, percentage: 38, color: "bg-primary" },
              { category: "Landscaping & Outdoor Living", count: 24, percentage: 28, color: "bg-amber-600" },
              { category: "Kitchen & Interior Design", count: 18, percentage: 21, color: "bg-blue-600" },
              { category: "General Contracting & Services", count: 10, percentage: 13, color: "bg-emerald-600" },
            ].map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-foreground">{item.category}</span>
                  <span className="text-muted-foreground">{item.count} vendors ({item.percentage}%)</span>
                </div>
                <div className="w-full h-3 bg-muted border border-border">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
