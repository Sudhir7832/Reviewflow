"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Settings2 } from "lucide-react";
import { getGlobalSetting, updateGlobalSetting } from "../actions";

export default function AdminSettings() {
  const [interceptLimit, setInterceptLimit] = useState<string>("5");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const limit = await getGlobalSetting("free_plan_intercept_limit", "5");
    setInterceptLimit(limit);
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateGlobalSetting("free_plan_intercept_limit", interceptLimit);
    setIsSaving(false);
    alert("Settings saved successfully!");
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Platform Settings</h1>
        <p className="text-slate-400">Configure global parameters and limits for the application.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-white">
            <Settings2 className="w-5 h-5 text-indigo-400" />
            Plan Limits & Quotas
          </CardTitle>
          <CardDescription className="text-slate-400">
            Adjust the dynamic limits applied to users. Note: Pro accounts automatically bypass these limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
            <div>
              <Label className="text-base text-slate-200">Free Plan - Intercept Limit</Label>
              <p className="text-sm text-slate-400 mb-3">
                The total number of bad reviews a free account can intercept before the gate disables itself.
              </p>
              <div className="flex max-w-sm items-center gap-3">
                <Input 
                  type="number" 
                  min="0"
                  value={interceptLimit} 
                  onChange={(e) => setInterceptLimit(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-800/30 border-t border-slate-800/50 pt-6">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
