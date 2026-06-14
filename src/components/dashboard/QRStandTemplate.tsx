import React, { forwardRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRStandTemplateProps {
  businessName: string;
  businessAddress?: string;
  logoUrl?: string | null;
  qrUrl: string;
  color: string;
  headerColor?: string;
  headingText?: string;
  subheadingText?: string;
  template?: "classic" | "minimal";
}

export const QRStandTemplate = forwardRef<HTMLDivElement, QRStandTemplateProps>(
  ({ 
    businessName, 
    businessAddress, 
    logoUrl, 
    qrUrl, 
    color,
    headerColor = "#0f172a",
    headingText = "Love our service?",
    subheadingText = "Scan to leave a review!",
    template = "classic"
  }, ref) => {
    
    return (
      <div 
        ref={ref}
        className={`w-[440px] relative flex flex-col items-center mx-auto shrink-0 overflow-hidden min-h-[720px] box-border border-[3px] border-slate-200 bg-white`}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {template === "classic" && (
          <>
            {/* Top Solid/Gradient Header */}
            <div 
              className="w-full pt-10 pb-[74px] px-8 flex flex-col items-center relative overflow-visible"
              style={{ backgroundColor: headerColor }}
            >
              {/* Decorative Backgrounds (Clipped) */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              </div>
              
              {/* ReviewFlow Branding on Top */}
              <div className="flex items-center gap-2.5 z-10 mb-6 bg-black/20 px-5 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-inner">
                <div className="bg-white p-1 rounded-md flex items-center justify-center shadow-sm">
                  <img src="/logo-v2.png" alt="ReviewFlow" className="w-5 h-5 object-contain" crossOrigin="anonymous" />
                </div>
                <span className="text-[14px] font-extrabold tracking-widest uppercase text-white">ReviewFlow Powered</span>
              </div>

              <h1 className="text-[36px] font-black text-white tracking-tight text-center leading-[1.1] max-w-[360px] z-10 drop-shadow-md">
                {businessName}
              </h1>
              {businessAddress && (
                <p className="text-[16px] text-white/80 font-medium mt-3 text-center truncate max-w-[340px] z-10">
                  {businessAddress}
                </p>
              )}

              {/* Overlapping Logo */}
              <div className="absolute -bottom-[55px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-full">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={businessName} 
                    className="w-[110px] h-[110px] object-cover rounded-[24px] border-[6px] border-white shadow-xl bg-white" 
                    crossOrigin="anonymous" 
                  />
                ) : (
                  <div className="w-[110px] h-[110px] bg-gradient-to-tr from-slate-100 to-slate-50 rounded-[24px] flex items-center justify-center border-[6px] border-white shadow-xl">
                    <span className="text-4xl font-extrabold text-slate-800">{businessName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Content Area */}
        <div className={`flex flex-col items-center px-8 pb-8 w-full flex-1 ${template === 'classic' ? 'pt-20 bg-[#f8fafc]' : 'pt-16 bg-white'}`}>
          
          {template === "minimal" && (
             <div className="flex flex-col items-center mb-10 w-full relative pt-12">
               {/* ReviewFlow Branding on Top */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10 bg-slate-100 px-5 py-2 rounded-full border border-slate-200">
                 <img src="/logo-v2.png" alt="ReviewFlow" className="w-7 h-7 object-contain" crossOrigin="anonymous" />
                 <span className="text-[14px] font-extrabold tracking-widest uppercase text-slate-600">ReviewFlow Powered</span>
               </div>
               
               {logoUrl ? (
                 <img 
                   src={logoUrl} 
                   alt={businessName} 
                   className="w-[90px] h-[90px] object-cover rounded-[20px] shadow-sm bg-white mb-6" 
                   crossOrigin="anonymous" 
                 />
               ) : (
                 <div className="w-[90px] h-[90px] bg-slate-100 rounded-[20px] flex items-center justify-center mb-6">
                   <span className="text-3xl font-extrabold text-slate-800">{businessName.charAt(0).toUpperCase()}</span>
                 </div>
               )}
               <h1 className="text-[28px] font-black text-slate-900 tracking-tight text-center leading-[1.1] max-w-[360px]">
                 {businessName}
               </h1>
             </div>
          )}

          <div className="flex gap-1.5 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} className="w-9 h-9 text-[#FFB800] drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          <h2 className="text-[32px] font-black text-slate-900 tracking-tight text-center mb-1 max-w-[360px] leading-[1.1]">
            {headingText}
          </h2>
          <p className="text-[18px] text-slate-500 font-medium text-center mb-8 max-w-[360px]">
            {subheadingText}
          </p>

          {/* QR Code Container */}
          <div className={`p-5 mb-10 relative ${template === 'classic' ? 'bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200' : 'bg-transparent'}`}>
            <QRCodeCanvas
              value={qrUrl || "https://reviewflow.example.com"}
              size={220}
              fgColor={color || "#0f172a"}
              level="H"
              includeMargin={false}
              className="rounded-xl"
            />
            {/* Optional central dot for design */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                    <img src="/logo-v2.png" className="w-6 h-6 object-contain opacity-90" crossOrigin="anonymous"/>
                </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
);
QRStandTemplate.displayName = "QRStandTemplate";
