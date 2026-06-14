"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User as UserIcon, Store, BarChart, ShieldAlert, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAdminUserDetail } from "../../actions";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [userProfile, setUserProfile] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalScans: 0, intercepts: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    const data = await getAdminUserDetail(userId);
    setUserProfile(data.profile);
    setBusinesses(data.businesses);
    setStats(data.stats);
    setIsLoading(false);
  };

  if (isLoading) return <div className="flex items-center justify-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!userProfile) return <div>User not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/businesses">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Overview</h1>
          <p className="text-muted-foreground">{userProfile.email || "No email"}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <UserIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold uppercase">{userProfile.status}</div>
            <p className="text-xs text-muted-foreground">{userProfile.plan_tier} tier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <Store className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businesses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <BarChart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Intercepts</CardTitle>
            <ShieldAlert className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.intercepts}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Locations</CardTitle>
          <CardDescription>All locations managed by this user.</CardDescription>
        </CardHeader>
        <CardContent>
          {businesses.length > 0 ? (
            <div className="divide-y">
              {businesses.map((b) => (
                <div key={b.id} className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{b.name}</h3>
                    <p className="text-sm text-muted-foreground">{b.address}</p>
                  </div>
                  <div className="text-sm border px-3 py-1 rounded-md">{b.gate_enabled ? 'Gate ON' : 'Gate OFF'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No locations created yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
