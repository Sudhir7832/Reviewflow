"use server";

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client with Service Role Key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getAdminStats() {
  const [profilesRes, businessesRes, scansRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('*'),
    supabaseAdmin.from('businesses').select('id'),
    supabaseAdmin.from('scans').select('id, action_taken')
  ]);

  const profiles = profilesRes.data || [];
  const businesses = businessesRes.data || [];
  const scans = scansRes.data || [];

  return {
    totalBusinesses: businesses.length,
    totalScans: scans.length,
    proAccounts: profiles.filter(p => p.plan_tier === 'pro').length,
    freeAccounts: profiles.filter(p => p.plan_tier === 'free' || !p.plan_tier).length,
    suspendedAccounts: profiles.filter(p => p.status === 'suspended').length,
    intercepted: scans.filter(s => s.action_taken === 'intercepted').length
  };
}

export async function getAdminProfiles() {
  const { data } = await supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function toggleAdminPlan(id: string, currentPlan: string) {
  const newPlan = currentPlan === 'pro' ? 'free' : 'pro';
  await supabaseAdmin.from('profiles').update({ plan_tier: newPlan }).eq('id', id);
}

export async function toggleAdminStatus(id: string, currentStatus: string) {
  const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
  await supabaseAdmin.from('profiles').update({ status: newStatus }).eq('id', id);
}

export async function deleteAdminProfile(id: string) {
  // First delete from public.profiles
  await supabaseAdmin.from('profiles').delete().eq('id', id);
  // Optional: Also delete the user from auth.users completely using the Admin API
  await supabaseAdmin.auth.admin.deleteUser(id);
}

export async function getAdminUserDetail(userId: string) {
  const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
  const { data: businesses } = await supabaseAdmin.from('businesses').select('*').eq('user_id', userId);
  
  let stats = { totalScans: 0, intercepts: 0 };
  
  if (businesses && businesses.length > 0) {
    const bIds = businesses.map(b => b.id);
    const { data: scans } = await supabaseAdmin.from('scans').select('id, action_taken').in('business_id', bIds);
    if (scans) {
      stats = {
        totalScans: scans.length,
        intercepts: scans.filter(s => s.action_taken === 'intercepted').length
      };
    }
  }

  return { profile, businesses: businesses || [], stats };
}
