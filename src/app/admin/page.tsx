"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, QrCode, BarChart, ShieldAlert, Loader2 } from "lucide-react";
import { getAdminStats } from "./actions";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalScans: 0,
    proAccounts: 0,
    freeAccounts: 0,
    suspendedAccounts: 0,
    intercepted: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const data = await getAdminStats();
    setStats(data);
    setIsLoading(false);
  };

  const estimatedMRR = stats.proAccounts * 299; // Rs 299 per pro account

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Platform Overview</h1>
        <p className="text-slate-400">Monitor your entire ReviewFlow platform from 30,000 feet.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Registered Users</CardTitle>
            <Users className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-200">{stats.proAccounts + stats.freeAccounts}</div>
            <div className="text-xs text-slate-500 mt-1 flex gap-2">
              <span className="text-emerald-400">{stats.proAccounts} Pro</span> 
              <span>&bull;</span> 
              <span className="text-slate-400">{stats.freeAccounts} Free</span>
              {stats.suspendedAccounts > 0 && (
                <>
                  <span>&bull;</span> 
                  <span className="text-rose-400">{stats.suspendedAccounts} Suspended</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Estimated MRR</CardTitle>
            <BarChart className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">₹{estimatedMRR}</div>
            <p className="text-xs text-slate-500 mt-1">Based on Pro users</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Scans</CardTitle>
            <QrCode className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalScans}</div>
            <p className="text-xs text-slate-500 mt-1">Across all locations</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Bad Reviews Intercepted</CardTitle>
            <Users className="w-4 h-4 text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.intercepted}</div>
            <p className="text-xs text-slate-500 mt-1">Saved from Google</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 shadow-xl min-h-[300px]">
          <CardHeader>
            <CardTitle className="text-white">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-48 text-slate-500">
            Chart coming soon
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 shadow-xl min-h-[300px]">
          <CardHeader>
            <CardTitle className="text-white">Recent Signups</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-48 text-slate-500">
            List coming soon
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
