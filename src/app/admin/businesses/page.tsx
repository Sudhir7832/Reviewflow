"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, ArrowUpCircle } from "lucide-react";
import Link from "next/link";
import { getAdminProfiles, toggleAdminPlan, toggleAdminStatus, deleteAdminProfile } from "../actions";

export default function AdminBusinessesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setIsLoading(true);
    const data = await getAdminProfiles();
    setProfiles(data);
    setIsLoading(false);
  };

  const togglePlan = async (id: string, currentPlan: string) => {
    await toggleAdminPlan(id, currentPlan);
    fetchProfiles();
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    await toggleAdminStatus(id, currentStatus);
    fetchProfiles();
  };

  const deleteProfile = async (id: string) => {
    if (confirm("Are you sure you want to delete this account? This cannot be undone.")) {
      await deleteAdminProfile(id);
      fetchProfiles();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Owner Management</h1>
        <p className="text-slate-400">View and manage all businesses on your platform.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Account Email</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold">Plan Tier</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    Loading profiles...
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    No accounts found on the platform.
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{p.email || "No Email"}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        p.plan_tier === 'pro' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {p.plan_tier || 'free'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`capitalize ${p.status === 'suspended' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {p.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => togglePlan(p.id, p.plan_tier)}
                          className="h-8 text-xs"
                        >
                          {p.plan_tier === 'pro' ? 'Downgrade' : 'Upgrade'}
                        </Button>
                        <Button 
                          variant={p.status === 'suspended' ? 'default' : 'destructive'} 
                          size="sm"
                          onClick={() => toggleStatus(p.id, p.status)}
                          className="h-8 text-xs"
                        >
                          {p.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </Button>
                        <Link href={`/admin/businesses/${p.id}`}>
                          <Button variant="secondary" size="sm" className="h-8 text-xs">View</Button>
                        </Link>
                        <Button 
                          onClick={() => deleteProfile(p.id)}
                          size="icon" 
                          variant="ghost" 
                          className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
