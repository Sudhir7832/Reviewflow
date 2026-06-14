"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const supabase = createClient();

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Check your email for the magic link!" });
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("your-project") || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      alert("ERROR: You didn't restart the server! Please go to your terminal, press Ctrl+C, and run 'npm run dev' again. The app is still trying to connect to the fake dummy database.");
      return;
    }

    setIsGoogleLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      setMessage({ type: "error", text: error.message });
      setIsGoogleLoading(false);
    } else if (data?.url) {
      // Force the browser to redirect (sometimes Ngrok blocks automatic redirects)
      window.location.href = data.url;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-emerald-100 rounded-2xl overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
        <CardHeader className="space-y-2 pt-8">
          <CardTitle className="text-3xl font-bold tracking-tight text-center text-slate-900">Welcome Back</CardTitle>
          <CardDescription className="text-center text-base">
            Log in to your ReviewFlow dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {message && (
            <div className={`p-4 text-sm rounded-lg font-medium ${message.type === 'error' ? 'text-red-700 bg-red-100' : 'text-emerald-700 bg-emerald-100'}`}>
              {message.text}
            </div>
          )}

          <Button 
            variant="outline" 
            className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 font-medium text-slate-700"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-medium">
              <span className="bg-white px-2 text-slate-400">
                Or use email
              </span>
            </div>
          </div>

          <form onSubmit={handleMagicLinkLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-slate-700">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                className="h-12 rounded-xl bg-slate-50 border-slate-200"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl shadow-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 transition-opacity text-white text-base"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Mail className="w-5 h-5 mr-2" />}
              Send Magic Link
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pb-8">
          <p className="text-center text-sm text-slate-500 w-full">
            Don't have an account?{" "}
            <Link href="/signup" className="text-emerald-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
