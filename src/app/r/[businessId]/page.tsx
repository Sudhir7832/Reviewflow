"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Star, CheckCircle2, Copy, MapPin, MessageSquare, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviewScanPage() {
  const { businessId } = useParams();
  const [businessData, setBusinessData] = useState<any>(null);
  const [interceptCount, setInterceptCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  const [reviewDraft, setReviewDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const [scanId, setScanId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    fetchBusiness();
  }, [businessId]);

  const fetchBusiness = async () => {
    if (!businessId) return;
    const { data } = await supabase.from("businesses").select("*").eq("id", businessId).single();
    if (data) setBusinessData(data);
    
    // Check intercept limit for free tier securely using RPC
    const { data: count, error } = await supabase.rpc("get_intercept_count", { b_id: businessId });
    setInterceptCount(count || 0);
    
    setIsLoading(false);
  };

  // Log scan on mount
  useEffect(() => {
    if (businessData && !scanId) {
      logInitialScan();
    }
  }, [businessData]);

  const logInitialScan = async () => {
    // Generate UUID on client so we don't need to .select() which is blocked by strict RLS
    const newScanId = crypto.randomUUID();
    setScanId(newScanId);
    
    await supabase.from('scans').insert([{ 
      id: newScanId,
      business_id: businessData.id, 
      action_taken: 'scanned' 
    }]);
  };

  // Free plan is limited to 5 intercepts (for testing)
  const limitReached = (businessData?.plan_tier === 'free' || !businessData?.plan_tier) && interceptCount >= 5;
  const isIntercepted = rating > 0 && businessData?.gate_enabled && rating <= businessData?.gate_threshold && !limitReached;

  useEffect(() => {
    if (rating > 0 && businessData) {
      generateAIReview(rating);
    }
  }, [rating, businessData]);

  const generateAIReview = async (selectedStars: number) => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessData.name,
          category: businessData.category,
          description: businessData.description,
          stars: selectedStars
        })
      });
      const data = await res.json();
      setReviewDraft(data.review || "I had a great experience here!");
    } catch (e) {
      setReviewDraft("I had a great experience here and highly recommend it!");
    }
    setIsGenerating(false);
    setIsCopied(false);
  };

  const handleCopyAndRedirect = async () => {
    if (reviewDraft) await navigator.clipboard.writeText(reviewDraft);
    setIsCopied(true);
    
    // Update analytics securely via RPC
    if (scanId) {
      await supabase.rpc('update_scan', { 
        s_id: scanId, 
        s_action: 'redirected', 
        s_stars: rating,
        s_feedback: null
      });
    }

    setTimeout(() => {
      window.location.href = businessData.google_url;
    }, 1000);
  };

  const handleSubmitFeedback = async () => {
    setIsSubmitted(true);
    // Update analytics securely via RPC
    if (scanId) {
      await supabase.rpc('update_scan', { 
        s_id: scanId, 
        s_action: 'intercepted', 
        s_stars: rating,
        s_feedback: reviewDraft
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-sm p-8 text-center shadow-lg rounded-3xl border-0">
          <p className="text-slate-500 font-medium">Business not found or invalid QR code.</p>
        </Card>
      </div>
    );
  }

  // Dynamic branding color
  const brandColor = businessData.brand_color || '#10b981';

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col relative overflow-hidden pb-12">
      {/* Premium Background Shapes matching Brand Color */}
      <div 
        className="absolute top-0 left-0 w-full h-[30vh] rounded-b-[40px] shadow-xl z-0" 
        style={{ background: `linear-gradient(135deg, ${brandColor}, #0f172a)` }}
      />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0" />
      
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-[15vh] z-10 flex flex-col items-center">
        
        {/* Logo and Name Plate */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-[32px] shadow-2xl w-full text-center border border-slate-100 mb-6 relative"
        >
          <div className="absolute -top-14 left-1/2 -translate-x-1/2">
            {businessData.logo_url ? (
              <img 
                src={businessData.logo_url} 
                alt={businessData.name} 
                className="w-28 h-28 rounded-full object-cover border-[6px] border-white shadow-lg bg-white"
              />
            ) : (
              <div className="w-28 h-28 rounded-full border-[6px] border-white shadow-lg bg-slate-50 flex items-center justify-center">
                <span className="text-4xl font-extrabold text-slate-800">
                  {businessData.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-14 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">{businessData.name}</h1>
            {businessData.address && (
              <p className="text-sm text-slate-500 flex items-center justify-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 shrink-0" /> <span className="truncate max-w-[250px]">{businessData.address}</span>
              </p>
            )}
          </div>
        </motion.div>

        {/* Dynamic Star Rating */}
        {!isSubmitted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full bg-white p-6 sm:p-8 rounded-[32px] shadow-xl border border-slate-100 mb-6"
          >
            <h2 className="text-center font-extrabold text-slate-800 text-xl sm:text-2xl mb-6">How was your experience?</h2>
            <div className="flex justify-center gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-transform hover:scale-110 active:scale-95 touch-manipulation p-1"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star 
                    className={`w-12 h-12 sm:w-14 sm:h-14 transition-all duration-300 ${
                      (hoverRating || rating) >= star 
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] scale-110" 
                        : "text-slate-200 fill-slate-50 hover:text-slate-300"
                    }`} 
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Panel: AI Review OR Interception */}
        <AnimatePresence mode="wait">
          {rating > 0 && !isSubmitted && (
            <motion.div 
              key="action-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full"
            >
              <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-xl border border-slate-100 relative overflow-hidden">
                
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4" style={{ color: brandColor }}>
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p className="text-base font-bold animate-pulse">AI is writing your review...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {isIntercepted && (
                      <div className="text-center mb-2">
                        <MessageSquare className="w-8 h-8 mx-auto text-rose-500 mb-2" />
                        <h3 className="font-bold text-slate-800 text-lg">We're sorry to hear that.</h3>
                        <p className="text-sm text-slate-500 mt-1">Please edit the feedback below so we know how to improve.</p>
                      </div>
                    )}
                    
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-inner overflow-hidden transition-all relative group">
                      <textarea
                        className="w-full h-36 p-5 bg-transparent border-none resize-none text-slate-700 leading-relaxed text-sm sm:text-base font-medium focus:outline-none"
                        value={reviewDraft}
                        onChange={(e) => {
                          setReviewDraft(e.target.value);
                          setIsCopied(false);
                        }}
                      />
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
                          Editable
                        </span>
                      </div>
                    </div>

                    {isIntercepted ? (
                      <Button 
                        onClick={handleSubmitFeedback} 
                        className="w-full h-16 rounded-2xl text-base sm:text-lg font-bold shadow-lg text-white transition-transform active:scale-95 border-0"
                        style={{ backgroundColor: brandColor }}
                      >
                        <Send className="w-6 h-6 mr-2" />
                        Submit
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={handleCopyAndRedirect} 
                          className={`w-full h-16 rounded-2xl text-base sm:text-lg font-bold shadow-lg transition-all border-0 ${
                            isCopied 
                            ? "bg-green-500 hover:bg-green-600 text-white" 
                            : "text-white hover:opacity-90 hover:-translate-y-1"
                          }`}
                          style={{ backgroundColor: isCopied ? undefined : brandColor }}
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle2 className="w-6 h-6 mr-2" />
                              Copied! Opening Google...
                            </>
                          ) : (
                            <>
                              <Copy className="w-6 h-6 mr-2" />
                              Copy & Continue to Google
                            </>
                          )}
                        </Button>
                        <p className="text-xs sm:text-sm text-center text-slate-400 font-medium px-4">
                          You can easily paste this text on the next screen!
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {isSubmitted && (
            <motion.div 
              key="success-panel"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 text-center"
            >
              <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
              <h3 className="font-extrabold text-slate-800 text-xl mb-2">Thank you!</h3>
              <p className="text-slate-500 text-sm">Your feedback has been submitted directly to our management team. We appreciate you helping us improve.</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Footer Branding */}
        <div className="mt-8 pt-6 pb-2 w-full flex flex-col items-center justify-center opacity-50 hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">Powered by</span>
          <div className="flex items-center gap-1.5">
            <img src="/logo-v2.png" alt="ReppulseAI" className="h-5 w-auto object-contain grayscale" crossOrigin="anonymous" />
            <span className="text-[14px] font-black tracking-tight text-slate-400">ReppulseAI</span>
          </div>
        </div>
      </main>
    </div>
  );
}
