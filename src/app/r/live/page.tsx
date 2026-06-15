"use client";

import { useState, useEffect, Suspense } from "react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";

function LiveReviewContent() {
  const searchParams = useSearchParams();
  const [businessData, setBusinessData] = useState<{name: string, googleUrl: string} | null>(null);

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReview, setGeneratedReview] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      try {
        // Decode base64 and then URI component
        const decoded = decodeURIComponent(atob(dataParam));
        setBusinessData(JSON.parse(decoded));
      } catch (e) {
        console.error("Invalid QR data", e);
      }
    }
  }, [searchParams]);

  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating);
    generateReview(selectedRating);
  };

  const generateReview = (stars: number) => {
    setIsGenerating(true);
    // Simulate AI Generation
    setTimeout(() => {
      const name = businessData?.name || "this place";
      const template = stars >= 4 
        ? `I recently visited ${name} and had a fantastic experience. The service was excellent and everything met my expectations. Highly recommended!`
        : `My experience at ${name} was okay, but there is definitely room for improvement. The service could be better.`;
      setGeneratedReview(template);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopyAndRedirect = () => {
    navigator.clipboard.writeText(generatedReview);
    setCopied(true);
    setTimeout(() => {
      if (businessData?.googleUrl) {
        window.location.href = businessData.googleUrl;
      }
    }, 1500);
  };

  if (!businessData) {
    return <div className="p-8 text-center text-muted-foreground">Loading or Invalid QR Code Data...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-none overflow-hidden bg-background/80 backdrop-blur-md">
        <CardContent className="pt-10 pb-8 px-6 flex flex-col items-center text-center space-y-8">
          
          <div className="space-y-2">
            <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary">{businessData.name.charAt(0).toUpperCase()}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight capitalize">{businessData.name}</h1>
            <p className="text-muted-foreground">How was your experience?</p>
          </div>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRatingSelect(star)}
                disabled={isGenerating || generatedReview !== ""}
              >
                <Star
                  className={`w-12 h-12 ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted-foreground/30"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-muted-foreground animate-pulse"
              >
                AI is crafting your review...
              </motion.div>
            )}

            {generatedReview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-6"
              >
                <div className="bg-muted p-4 rounded-lg text-left relative">
                  <p className="text-sm leading-relaxed">{generatedReview}</p>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full h-12 text-lg font-semibold" 
                    onClick={handleCopyAndRedirect}
                    disabled={copied}
                  >
                    {copied ? "Copied! Redirecting..." : "Copy & Go to Google"}
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => generateReview(rating)}>
                    Generate Another
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </CardContent>
      </Card>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          Powered by <Star className="w-3 h-3 fill-primary text-primary" /> ReppulseAI
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <LiveReviewContent />
    </Suspense>
  )
}
