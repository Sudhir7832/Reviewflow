"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Loader2, QrCode as QrIcon, FileText, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { QRStandTemplate } from "@/components/dashboard/QRStandTemplate";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";

type Location = {
  id: string;
  name: string;
  address: string;
  google_url: string;
  logo_url: string | null;
};

export default function QRCodePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocId, setSelectedLocId] = useState<string>("");
  const [color, setColor] = useState("#4f46e5"); // Indigo default
  const [headerColor, setHeaderColor] = useState("#0f172a"); // Dark slate
  const [template, setTemplate] = useState<"classic" | "minimal">("classic");
  const [headingText, setHeadingText] = useState("Love our service?");
  const [subheadingText, setSubheadingText] = useState("Scan to leave a review!");
  const [qrUrl, setQrUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingPNG, setIsGeneratingPNG] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) {
      setLocations(data);
      if (data.length > 0) {
        setSelectedLocId(data[0].id);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (selectedLocId !== "") {
      const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
      setQrUrl(`${baseUrl}/r/${selectedLocId}`);
    } else {
      setQrUrl("");
    }
  }, [selectedLocId]);

  const handleDownloadPNG = async () => {
    if (!printRef.current) return;
    setIsGeneratingPNG(true);

    try {
      // Use pixelRatio: 5 for ultra-sharp resolution
      const dataUrl = await htmlToImage.toPng(printRef.current, { quality: 1.0, pixelRatio: 5 });
      
      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      const selectedLoc = locations.find(l => l.id === selectedLocId);
      downloadLink.download = `ReppulseAI_QR_Stand_${selectedLoc?.name.replace(/\s+/g, '_') || 'Stand'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Failed to generate PNG", err);
      alert(`Failed to generate PNG: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGeneratingPNG(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsGeneratingPDF(true);

    try {
      // Use pixelRatio: 5 for ultra-sharp print resolution (Retina quality)
      const imgData = await htmlToImage.toJpeg(printRef.current, { quality: 1.0, pixelRatio: 5 });
      
      const nodeWidth = printRef.current.offsetWidth;
      const nodeHeight = printRef.current.offsetHeight;
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [nodeWidth, nodeHeight]
      });

      pdf.addImage(imgData, "JPEG", 0, 0, nodeWidth, nodeHeight);
      pdf.save("ReppulseAI_QR_Card.pdf");
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert(`Failed to generate PDF: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const selectedLoc = locations.find(l => l.id === selectedLocId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
        <p>Loading generator...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 pb-2">
          QR Print Studio
        </h1>
        <p className="text-muted-foreground text-lg mt-1">Design and download print-ready counter stands.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-primary/20 shadow-xl bg-background/60 backdrop-blur-md rounded-2xl overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardHeader className="bg-muted/10 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Printer className="w-5 h-5 text-primary" /> Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Target Location</Label>
                <select 
                  className="flex h-12 w-full rounded-xl border border-input/50 bg-background px-4 py-2 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={selectedLocId}
                  onChange={(e) => setSelectedLocId(e.target.value)}
                >
                  {locations.length === 0 && <option value="">No locations found. Add one first.</option>}
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold">QR Code Color</Label>
                <div className="flex gap-4 items-center">
                  <div className="relative overflow-hidden rounded-full w-14 h-14 shadow-inner border-[3px] border-background cursor-pointer hover:scale-105 transition-transform ring-2 ring-primary/20">
                    <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 w-24 h-24 -top-4 -left-4 cursor-pointer p-0 border-0" />
                  </div>
                  <Input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="w-32 font-mono uppercase shadow-sm h-12 rounded-xl" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Header Color</Label>
                <div className="flex gap-4 items-center">
                  <div className="relative overflow-hidden rounded-full w-14 h-14 shadow-inner border-[3px] border-background cursor-pointer hover:scale-105 transition-transform ring-2 ring-primary/20">
                    <Input type="color" value={headerColor} onChange={(e) => setHeaderColor(e.target.value)} className="absolute inset-0 w-24 h-24 -top-4 -left-4 cursor-pointer p-0 border-0" />
                  </div>
                  <Input type="text" value={headerColor} onChange={(e) => setHeaderColor(e.target.value)} className="w-32 font-mono uppercase shadow-sm h-12 rounded-xl" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Stand Design Template</Label>
                <select 
                  className="flex h-12 w-full rounded-xl border border-input/50 bg-background px-4 py-2 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value as "classic" | "minimal")}
                >
                  <option value="classic">Classic (Color Header)</option>
                  <option value="minimal">Minimalist (Pure White)</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Heading Text</Label>
                <Input 
                  type="text" 
                  value={headingText} 
                  onChange={(e) => setHeadingText(e.target.value)} 
                  className="h-12 rounded-xl"
                  maxLength={40}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Subheading Text</Label>
                <Input 
                  type="text" 
                  value={subheadingText} 
                  onChange={(e) => setSubheadingText(e.target.value)} 
                  className="h-12 rounded-xl"
                  maxLength={60}
                />
              </div>

              {qrUrl && (
                <div className="pt-6 border-t border-muted/50">
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={handleDownloadPNG} disabled={isGeneratingPNG} variant="outline" className="h-12 rounded-xl border-primary/20 hover:bg-primary/5">
                      {isGeneratingPNG ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />} 
                      Download PNG Stand
                    </Button>
                    <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="h-12 rounded-xl shadow-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 transition-opacity text-white border-0">
                      {isGeneratingPDF ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                      Print PDF Stand
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 flex flex-col">
          {qrUrl && selectedLoc ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full flex justify-center bg-muted/20 p-8 rounded-3xl border border-muted/50 overflow-hidden"
            >
              <div className="transform scale-[0.6] sm:scale-[0.8] md:scale-[0.9] origin-top flex justify-center py-4">
                <QRStandTemplate 
                  ref={printRef}
                  businessName={selectedLoc.name}
                  businessAddress={selectedLoc.address}
                  logoUrl={selectedLoc.logo_url}
                  qrUrl={qrUrl}
                  color={color}
                  headerColor={headerColor}
                  template={template}
                  headingText={headingText}
                  subheadingText={subheadingText}
                />
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-3xl text-muted-foreground/50">
              <QrIcon className="w-16 h-16 mb-4" />
              <p>Select a location to generate</p>
            </div>
          )}
        </div>
      </div>
      
      {qrUrl && (
        <div className="hidden">
          <QRCodeCanvas id="qr-canvas" value={qrUrl} size={1024} fgColor={color} level="H" includeMargin={true} />
        </div>
      )}
    </div>
  );
}
