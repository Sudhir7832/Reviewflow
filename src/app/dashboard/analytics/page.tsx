"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, ShieldAlert, Star, MousePointerClick, MessageSquare, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalScans: 0,
    redirected: 0,
    intercepted: 0,
    avgStars: 0
  });
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: scans } = await supabase
      .from("scans")
      .select("*, businesses!inner(name, user_id)")
      .eq("businesses.user_id", user.id);
      
    if (!scans) return;

    const totalScans = scans.length;
    const redirected = scans.filter(s => s.action_taken === "redirected").length;
    const intercepted = scans.filter(s => s.action_taken === "intercepted").length;
    
    const ratedScans = scans.filter(s => s.stars !== null);
    const avgStars = ratedScans.length > 0 
      ? (ratedScans.reduce((acc, s) => acc + (s.stars || 0), 0) / ratedScans.length).toFixed(1) 
      : 0;

    setStats({ totalScans, redirected, intercepted, avgStars: Number(avgStars) });

    // Pie Chart Data (Action Breakdown)
    setPieData([
      { name: "Sent to Google", value: redirected, color: "#10b981" },
      { name: "Intercepted", value: intercepted, color: "#f43f5e" },
      { name: "Abandoned", value: totalScans - (redirected + intercepted), color: "#cbd5e1" }
    ]);

    // Bar Chart Data (Star Distribution)
    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratedScans.forEach(s => {
      if (starCounts[s.stars as keyof typeof starCounts] !== undefined) {
        starCounts[s.stars as keyof typeof starCounts]++;
      }
    });
    setBarData([
      { name: "1 Star", count: starCounts[1], fill: "#f43f5e" },
      { name: "2 Stars", count: starCounts[2], fill: "#fb923c" },
      { name: "3 Stars", count: starCounts[3], fill: "#facc15" },
      { name: "4 Stars", count: starCounts[4], fill: "#a3e635" },
      { name: "5 Stars", count: starCounts[5], fill: "#10b981" }
    ]);

    const interceptedFeedbacks = scans
      .filter(s => s.action_taken === "intercepted" && s.feedback_text)
      .sort((a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime());
    
    setFeedbacks(interceptedFeedbacks);
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const hasData = stats.totalScans > 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          In-Depth Analytics
        </h1>
        <p className="text-muted-foreground mt-1">Detailed performance tracking and review breakdown.</p>
      </div>

      {/* Upgrade Banner for Free Tier Limits */}
      {stats.intercepted >= 5 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between shadow-sm">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="bg-amber-100 p-3 rounded-full shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900">Intercept Limit Reached (5/5)</h3>
              <p className="text-sm text-amber-700">Your Smart Review Gate has hit its limit on the Free plan. Bad reviews will now go straight to Google.</p>
            </div>
          </div>
          <Link href="/dashboard/settings?tab=upgrade" className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total QR Scans</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalScans}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Google Redirects</CardTitle>
            <MousePointerClick className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.redirected}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border bg-rose-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-rose-600">Reviews Intercepted</CardTitle>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-600">{stats.intercepted}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            <Star className="w-4 h-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.avgStars} <span className="text-lg text-muted-foreground/70">/ 5</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Rating Distribution Bar Chart */}
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>Breakdown of all star ratings received.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} width={70} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground/70">No rating data yet.</div>
            )}
          </CardContent>
        </Card>

        {/* Action Breakdown Pie Chart */}
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Scan Outcomes</CardTitle>
            <CardDescription>What happened after they scanned the code?</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground/70">No scan data yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Private Feedback List */}
      {feedbacks.length > 0 && (
        <Card className="shadow-sm border-border">
          <CardHeader className="bg-muted/10 pb-4 border-b border-border/50">
            <CardTitle className="text-xl flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-500" /> Recent Private Feedback
            </CardTitle>
            <CardDescription>Private reviews intercepted by your Smart Gate.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-bold text-yellow-700 text-sm">{fb.stars} / 5</span>
                      </div>
                      {fb.businesses?.name && (
                        <span className="text-sm font-semibold text-foreground/90 bg-card px-2 py-1 rounded-md border border-border shadow-sm">
                          {fb.businesses.name}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                      {new Date(fb.scanned_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                    <p className="text-foreground/90 whitespace-pre-wrap">{fb.feedback_text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
