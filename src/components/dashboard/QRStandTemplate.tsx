import React, { forwardRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, MessageSquareHeart } from "lucide-react";

interface QRStandTemplateProps {
  businessName: string;
  businessAddress?: string;
  logoUrl?: string | null;
  qrUrl: string;
  color: string;
}

export const QRStandTemplate = forwardRef<HTMLDivElement, QRStandTemplateProps>(
  ({ businessName, businessAddress, logoUrl, qrUrl, color }, ref) => {
    return (
      <div 
        ref={ref}
        className="w-[420px] bg-white rounded-[40px] shadow-2xl relative flex flex-col items-center mx-auto shrink-0 pt-10 pb-8 px-8 border border-slate-100 min-h-[640px]"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Top Logo - Business Logo & Name */}
        <div className="flex flex-col items-center mb-8 w-full">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={businessName} 
              className="w-[84px] h-[84px] object-cover rounded-full border-4 border-slate-50 shadow-md mb-3" 
              crossOrigin="anonymous" 
            />
          ) : (
            <div className="w-[84px] h-[84px] bg-gradient-to-tr from-emerald-100 to-teal-50 rounded-full flex items-center justify-center border-4 border-slate-50 shadow-md mb-3">
              <span className="text-3xl font-extrabold text-emerald-700">{businessName.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight text-center leading-tight max-w-full px-2">
            {businessName}
          </h1>
          {businessAddress && (
            <p className="text-[14px] text-slate-500 font-medium mt-1 text-center truncate max-w-full">
              {businessAddress}
            </p>
          )}
        </div>

        {/* QR Code */}
        <div className="bg-white p-2 mb-6">
          <QRCodeCanvas
            value={qrUrl || "https://reviewflow.example.com"}
            size={240}
            fgColor={color || "#000000"}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Call to action */}
        <div className="flex items-center gap-1.5 mb-auto">
          <p className="text-[16px] text-slate-700 font-bold">Scan to Leave a Review</p>
          <span className="text-yellow-400 text-xl">⭐</span>
        </div>

        {/* Website Name at Bottom */}
        <div className="flex flex-col items-center mt-8 pt-6 border-t border-slate-100 w-full">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest">Powered By</span>
          </div>
          <div className="flex items-center gap-2 text-slate-800">
            <img src="/logo-v2.png" alt="ReviewFlow Logo" className="w-[24px] h-[24px] object-contain" crossOrigin="anonymous" />
            <span className="text-[18px] font-extrabold tracking-tight">ReviewFlow</span>
          </div>
        </div>
      </div>
    );
  }
);
QRStandTemplate.displayName = "QRStandTemplate";
