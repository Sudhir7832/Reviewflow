const fs = require('fs');

const files = [
  'src/app/dashboard/settings/page.tsx',
  'src/app/dashboard/locations/page.tsx',
  'src/app/dashboard/analytics/page.tsx',
  'src/app/dashboard/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Sidebar Tabs specific in settings
  content = content.replace(/bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/g, 'bg-primary/10 text-primary shadow-sm border border-primary/20');
  content = content.replace(/text-slate-600 hover:bg-slate-50 hover:text-slate-900/g, 'text-muted-foreground hover:bg-muted/50 hover:text-foreground');
  
  // Slate colors -> Semantic colors
  content = content.replace(/border-slate-200/g, 'border-border');
  content = content.replace(/border-slate-100/g, 'border-border/50');
  
  content = content.replace(/bg-slate-50\/50/g, 'bg-muted/10');
  content = content.replace(/bg-slate-50/g, 'bg-muted/30');
  
  content = content.replace(/text-slate-900/g, 'text-foreground');
  content = content.replace(/text-slate-800/g, 'text-foreground');
  content = content.replace(/text-slate-700/g, 'text-foreground/90');
  content = content.replace(/text-slate-600/g, 'text-muted-foreground');
  content = content.replace(/text-slate-500/g, 'text-muted-foreground');
  content = content.replace(/text-slate-400/g, 'text-muted-foreground/70');
  
  // Emerald / specific colors
  content = content.replace(/bg-emerald-100/g, 'bg-primary/20');
  content = content.replace(/text-emerald-700/g, 'text-primary');
  content = content.replace(/text-emerald-600/g, 'text-primary');
  content = content.replace(/text-emerald-500/g, 'text-primary');
  content = content.replace(/border-emerald-200/g, 'border-primary/30');
  content = content.replace(/bg-emerald-50\/50/g, 'bg-primary/5');
  content = content.replace(/hover:bg-emerald-50/g, 'hover:bg-primary/10');
  
  // Backgrounds
  content = content.replace(/bg-white/g, 'bg-card');

  // Specific hardcoded gradients that clash with dark mode
  content = content.replace(/bg-gradient-to-r from-emerald-600 to-teal-500/g, 'bg-gradient-to-r from-primary to-primary/70');
  content = content.replace(/bg-gradient-to-r from-emerald-500 to-teal-600/g, 'bg-gradient-to-r from-primary/80 to-primary');

  fs.writeFileSync(file, content);
  console.log(`Refactored ${file}`);
});
