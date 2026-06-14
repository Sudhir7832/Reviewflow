"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, MousePointerClick, Star, ShieldAlert, Loader2 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalScans: 0,
    redirects: 0,
    avgStars: 0,
    intercepts: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: scans } = await supabase
      .from("scans")
      .select("*, businesses!inner(name, user_id)")
      .eq("businesses.user_id", user.id);
    
    if (scans) {
      const totalScans = scans.length;
      const redirects = scans.filter(s => s.action_taken === "redirected").length;
      const intercepts = scans.filter(s => s.action_taken === "intercepted").length;
      const ratedScans = scans.filter(s => s.stars !== null);
      const avgStars = ratedScans.length > 0 
        ? (ratedScans.reduce((acc, s) => acc + (s.stars || 0), 0) / ratedScans.length).toFixed(1)
        : 0;

      setStats({ totalScans, redirects, avgStars: Number(avgStars), intercepts });

      const grouped = scans.reduce((acc: any, scan) => {
        const date = new Date(scan.scanned_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (!acc[date]) acc[date] = 0;
        acc[date]++;
        return acc;
      }, {});

      const chart = Object.keys(grouped).map(date => ({
        date,
        scans: grouped[date]
      }));
      setChartData(chart);

      const feedbacks = scans
        .filter(s => s.action_taken === "intercepted" && s.feedback_text)
        .sort((a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime())
        .slice(0, 5);
      setRecentFeedback(feedbacks);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
        Dashboard Overview
      </h1>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
            <QrCode className="w-4 h-4 text-muted-foreground/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScans}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Google Redirects</CardTitle>
            <MousePointerClick className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.redirects}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-rose-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-rose-600">Reviews Intercepted</CardTitle>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{stats.intercepts}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Rating</CardTitle>
            <Star className="w-4 h-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgStars} <span className="text-sm text-muted-foreground/70 font-normal">/ 5</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Scan Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pr-6">
            {chartData.length > 0 ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="scans" name="Scans" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScans)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground/70 space-y-2 bg-muted/30 rounded-xl m-4 border border-dashed border-border">
                <QrCode className="w-8 h-8 opacity-50" />
                <p>No scan data yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Private Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {recentFeedback.length > 0 ? (
              <div className="space-y-4">
                {recentFeedback.map((fb) => (
                  <div key={fb.id} className="bg-muted/30 p-4 rounded-xl border border-border/50 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md text-xs font-bold border border-yellow-100">
                        <Star className="w-3.5 h-3.5 fill-yellow-500 mr-1.5" /> {fb.stars} / 5
                      </div>
                      <span className="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-wider">
                        {new Date(fb.scanned_at).toLocaleDateString()}
                      </span>
                    </div>
                    {fb.businesses?.name && (
                      <div className="text-xs font-bold text-foreground mb-1">{fb.businesses.name}</div>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{fb.feedback_text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-muted-foreground/70 space-y-2">
                <ShieldAlert className="w-10 h-10 text-slate-200" />
                <p className="text-sm font-medium">No intercepted reviews yet!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
