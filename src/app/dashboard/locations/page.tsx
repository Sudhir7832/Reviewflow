"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Store, Trash2, MapPin, Upload, ImageIcon, Edit2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Location = {
  id: string;
  name: string;
  address: string;
  category: string | null;
  description: string | null;
  google_url: string;
  logo_url: string | null;
  gate_enabled: boolean;
  gate_threshold: number;
  brand_color: string;
  plan_tier?: string;
};

export default function LocationsPage() {
  const supabase = createClient();
  const [locations, setLocations] = useState<Location[]>([]);
  const [profile, setProfile] = useState<{ plan_tier: string } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  
  // Phase 5 settings
  const [gateEnabled, setGateEnabled] = useState(true);
  const [gateThreshold, setGateThreshold] = useState(3);
  const [brandColor, setBrandColor] = useState("#10b981");

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    
    // 1. Get logged in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setUser(user);

    // 2. Get User Profile for Plan Limits
    const { data: profileData } = await supabase
      .from('profiles')
      .select('plan_tier')
      .eq('id', user.id)
      .single();
    
    if (profileData) setProfile(profileData);

    // 3. Get Locations for this user
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) setLocations(data);
    setIsLoading(false);
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null;
    setIsUploading(true);
    
    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, logoFile);

    setIsUploading(false);

    if (uploadError) {
      console.error(uploadError);
      alert("Failed to upload logo. Make sure you created the 'logos' public storage bucket in Supabase.");
      return null;
    }

    const { data } = supabase.storage.from('logos').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleEdit = (loc: Location) => {
    setEditId(loc.id);
    setName(loc.name);
    setAddress(loc.address || "");
    setCategory(loc.category || "");
    setDescription(loc.description || "");
    setGoogleUrl(loc.google_url);
    setGateEnabled(loc.gate_enabled);
    setGateThreshold(loc.gate_threshold);
    setBrandColor(loc.brand_color);
    setLogoFile(null);
    setLogoPreview(loc.logo_url);
    setCurrentLogoUrl(loc.logo_url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setName("");
    setAddress("");
    setCategory("");
    setDescription("");
    setGoogleUrl("");
    setLogoFile(null);
    setLogoPreview(null);
    setCurrentLogoUrl(null);
    setGateEnabled(true);
    setGateThreshold(3);
    setBrandColor("#10b981");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !googleUrl) return;

    setIsSubmitting(true);
    
    let uploadedLogoUrl = currentLogoUrl;
    if (logoFile) {
      uploadedLogoUrl = await uploadLogo() || currentLogoUrl;
    }

    const payload = {
      user_id: user?.id,
      name,
      address,
      category: category || null,
      description: description || null,
      google_url: googleUrl,
      logo_url: uploadedLogoUrl,
      gate_enabled: gateEnabled,
      gate_threshold: gateThreshold,
      brand_color: brandColor,
    };

    if (editId) {
      const { data, error } = await supabase
        .from("businesses")
        .update(payload)
        .eq("id", editId)
        .eq("user_id", user?.id)
        .select();

      if (error) {
        alert("Failed to update location.");
        console.error(error);
      } else if (data) {
        setLocations(locations.map(l => l.id === editId ? data[0] : l));
        handleCancelEdit();
      }
    } else {
      const { data, error } = await supabase
        .from("businesses")
        .insert([payload])
        .select();

      if (error) {
        alert("Failed to save location.");
        console.error(error);
      } else if (data) {
        setLocations([data[0], ...locations]);
        handleCancelEdit();
      }
    }
    
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this location? This action cannot be undone and will break any printed QR codes!")) {
      return;
    }
    await supabase.from("businesses").delete().eq("id", id).eq("user_id", user?.id);
    setLocations(locations.filter(l => l.id !== id));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Business Locations
          </h1>
          <p className="text-muted-foreground mt-1">Manage your physical stores, logos, and Google Review links.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Form Column */}
        <div className="lg:col-span-5">
          <Card className="sticky top-6 border-emerald-100 shadow-xl bg-card rounded-2xl overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary/80 to-primary" />
            <CardHeader className="bg-muted/10 pb-4">
              <CardTitle className="text-xl flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" /> 
                  {editId ? "Edit Location" : "Add New Location"}
                </span>
                {editId && (
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-muted-foreground hover:text-foreground/90 h-8 px-2">
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                )}
              </CardTitle>
              <CardDescription>Enter details to generate AI QR codes</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {(!editId && ((!profile || profile.plan_tier === 'free') ? locations.length >= 1 : (profile?.plan_tier === 'pro' && locations.length >= 5))) ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                  <div className="bg-amber-100 p-4 rounded-full">
                    <Store className="w-8 h-8 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Location Limit Reached</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-[250px]">
                      Your current plan only allows up to {(!profile || profile.plan_tier === 'free') ? '1 location' : '5 locations'}.
                    </p>
                  </div>
                  <a href="/dashboard/settings?tab=upgrade" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-2">
                    Upgrade Plan
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-5">
                
                {/* Logo Upload Dropzone */}
                <div className="space-y-2">
                  <Label className="font-semibold text-foreground/90">Business Logo</Label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors relative overflow-hidden group">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-primary">
                        <Upload className="w-8 h-8 mb-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                        <p className="text-sm font-medium">Click to upload logo</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoSelect} />
                  </label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="font-semibold text-foreground/90">Business Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Joe's Coffee Shop" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    className="h-12 rounded-xl bg-muted/30 border-border focus-visible:ring-emerald-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="font-semibold text-foreground/90">Category</Label>
                    <Input 
                      id="category" 
                      placeholder="e.g. Cafe, Plumber, Dental Clinic" 
                      value={category} 
                      onChange={e => setCategory(e.target.value)} 
                      className="h-12 rounded-xl bg-muted/30 border-border focus-visible:ring-emerald-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address" className="font-semibold text-foreground/90">Address (Optional)</Label>
                    <Input 
                      id="address" 
                      placeholder="e.g. 123 Main St, NY" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)} 
                      className="h-12 rounded-xl bg-muted/30 border-border focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="font-semibold text-foreground/90">Business Description (For AI)</Label>
                  <Input 
                    id="description" 
                    placeholder="e.g. We specialize in artisan coffee and organic pastries." 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="h-12 rounded-xl bg-muted/30 border-border focus-visible:ring-emerald-500"
                  />
                  <p className="text-xs text-muted-foreground">This helps the AI write more specific and accurate reviews.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url" className="font-semibold text-foreground/90">Google Review URL</Label>
                  <Input 
                    id="url" 
                    type="url" 
                    placeholder="https://g.page/r/..." 
                    value={googleUrl} 
                    onChange={e => setGoogleUrl(e.target.value)} 
                    required 
                    className="h-12 rounded-xl bg-muted/30 border-border focus-visible:ring-emerald-500"
                  />
                  <p className="text-xs text-muted-foreground">The direct link where customers write reviews.</p>
                </div>
                
                <div className="pt-4 pb-2 border-t border-border/50">
                  <h3 className="font-semibold text-foreground mb-4">Smart Review Gate</h3>
                  
                  <div className="space-y-5 bg-muted/30 p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base font-semibold">Enable Interception</Label>
                        <p className="text-xs text-muted-foreground">Block bad reviews from going to Google.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={gateEnabled} onChange={(e) => setGateEnabled(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    {gateEnabled && (
                      <div className="space-y-2 pt-2 border-t border-border">
                        <Label className="font-semibold text-foreground/90">Intercept reviews with stars equal or below:</Label>
                        <select 
                          value={gateThreshold} 
                          onChange={(e) => setGateThreshold(Number(e.target.value))}
                          className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value={1}>1 Star</option>
                          <option value={2}>2 Stars and below</option>
                          <option value={3}>3 Stars and below</option>
                          <option value={4}>4 Stars and below</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 pb-2">
                  <h3 className="font-semibold text-foreground mb-4">Branding</h3>
                  <div className="space-y-2">
                    <Label className="font-semibold text-foreground/90">Mobile Page Theme Color</Label>
                    <div className="flex gap-4 items-center">
                      <div className="relative overflow-hidden rounded-full w-12 h-12 shadow-inner border-2 border-border cursor-pointer">
                        <Input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="absolute inset-0 w-20 h-20 -top-4 -left-4 cursor-pointer p-0 border-0" />
                      </div>
                      <span className="font-mono text-sm uppercase text-muted-foreground">{brandColor}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl shadow-lg bg-gradient-to-r from-primary to-primary/70 hover:opacity-90 transition-opacity text-white font-medium text-base mt-2" 
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting || isUploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : (editId ? <Edit2 className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />)}
                  {editId ? "Update Location" : "Save Location"}
                </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* List Column */}
        <div className="lg:col-span-7">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-border/50 bg-muted/10">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Active Locations
              </h2>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : locations.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Store className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">No locations yet</h3>
                  <p className="text-muted-foreground">Add your first business location to generate a QR code.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  <AnimatePresence>
                    {locations.map((loc) => (
                      <motion.div
                        key={loc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="group flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {loc.logo_url ? (
                            <img src={loc.logo_url} alt={loc.name} className="w-12 h-12 rounded-lg object-cover bg-muted/30 border border-border/50 p-1 shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                              <span className="text-primary font-bold text-lg">{loc.name.charAt(0)}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground text-lg truncate">{loc.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              {loc.category && (
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                  {loc.category}
                                </span>
                              )}
                              {loc.address && <p className="text-sm text-muted-foreground truncate">{loc.address}</p>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 self-end sm:self-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            type="button"
                            onClick={() => handleEdit(loc)}
                            className="h-10 w-10 rounded-xl bg-card border-border text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            type="button"
                            onClick={() => handleDelete(loc.id)}
                            className="h-10 w-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
