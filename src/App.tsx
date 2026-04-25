/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { generateManifest } from "./lib/manifest";
import { 
  Globe, 
  Smartphone, 
  Settings, 
  Zap, 
  Download, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Plus,
  Layout,
  Palette,
  ShieldCheck,
  Cpu,
  Upload,
  X,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { SiteMetadata, AppConfig, AuditIssue } from "./types";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface CustomIcon {
  id: string;
  src: string;
  sizes: string;
  name: string;
}

export default function App() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<SiteMetadata | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "config" | "audit">("preview");
  const [auditResults, setAuditResults] = useState<AuditIssue[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFetch = async () => {
    if (!url) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.startsWith("http") ? url : `https://${url}` }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMetadata(data);
      setActiveTab("preview");
    } catch (err) {
      console.error(err);
      alert("Failed to analyze website. Please check the URL.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const newIcon: CustomIcon = {
            id: Math.random().toString(36).substr(2, 9),
            src: event.target?.result as string,
            sizes: `${img.width}x${img.height}`,
            name: file.name
          };
          setCustomIcons(prev => [...prev, newIcon]);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeIcon = (id: string) => {
    setCustomIcons(prev => prev.filter(icon => icon.id !== id));
  };

  const runAudit = async () => {
    if (!metadata) return;
    setIsAuditing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this website metadata for mobile app conversion. 
        Title: ${metadata.title}
        Description: ${metadata.description}
        URL: ${metadata.url}
        Theme Color: ${metadata.themeColor}
        
        Suggest 3-5 specific UI/UX improvements to make this website feel more like a native mobile app. 
        Return the result as a JSON array of objects with fields: id, title, description, type (performance/ui/logic), severity (high/medium/low).`,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const results = JSON.parse(response.text);
      setAuditResults(results);
    } catch (err) {
      console.error("Audit failed", err);
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    if (metadata && auditResults.length === 0) {
      runAudit();
    }
  }, [metadata]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-indigo-500 rotate-45 flex items-center justify-center text-white font-bold">
              <div className="-rotate-45">A</div>
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase">Ayotech</span>
          </div>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-white/40">
              <a href="#" className="hover:text-white transition-colors">Solutions</a>
              <a href="#" className="hover:text-white transition-colors">Pricing</a>
              <a href="#" className="hover:text-white transition-colors">Resources</a>
            </nav>
            <button className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {!metadata ? (
          <section className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                Native App Experience
              </div>
              <h1 className="text-7xl font-bold tracking-tight leading-[1.05]">
                Your website, <br/>
                <span className="text-indigo-400">natively optimized.</span>
              </h1>
              <p className="text-xl text-white/40 font-medium leading-relaxed max-w-xl mx-auto">
                Convert any web URL into a high-performance shell in seconds. AI-driven optimization for the perfect mobile bridge.
              </p>
              
              <div className="relative group max-w-xl mx-auto mt-12 w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-[#161616] rounded-2xl border border-white/10 p-2 pr-4 shadow-2xl">
                  <div className="pl-4 pr-3 text-white/20">
                    <Globe className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="https://your-website.com"
                    className="flex-1 bg-transparent py-5 outline-none text-lg font-medium text-white placeholder:text-white/20"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                  />
                  <button 
                    onClick={handleFetch}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Convert Now"}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-12 mt-20 opacity-20 grayscale pointer-events-none text-white font-bold text-2xl">
                <span className="tracking-tighter">STRIPE</span>
                <span className="tracking-tighter uppercase italic">Shopify</span>
                <span className="tracking-tighter font-serif">Linear</span>
                <span className="tracking-tighter font-mono">SUPABASE</span>
              </div>
            </motion.div>
          </section>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-10">
              <div className="bg-[#161616] rounded-[32px] border border-white/5 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                  <button 
                    onClick={() => setMetadata(null)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40"
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                </div>

                <div className="flex items-center gap-5 mb-10">
                   <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center bg-[#0a0a0a] shadow-inner overflow-hidden">
                    {metadata.icons.length > 0 ? (
                      <img src={metadata.icons[0].src} alt="Favicon" className="w-10 h-10 object-contain" />
                    ) : (
                      <Globe className="w-6 h-6 text-white/20" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl truncate max-w-[200px] text-white">{metadata.title}</h3>
                    <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest truncate max-w-[200px] mt-1">{new URL(metadata.url).hostname}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    { id: "preview", label: "Product View", icon: Smartphone },
                    { id: "config", label: "Configuration", icon: Settings },
                    { id: "audit", label: "Semantic Audit", icon: Zap },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all border",
                        activeTab === tab.id 
                          ? "bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20 scale-[1.02]" 
                          : "text-white/40 hover:bg-white/5 border-transparent"
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats/Quick Actions */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "SLA", val: "99.9%" },
                  { label: "SYNC", val: "V2.4" },
                  { label: "NODE", val: "US-E" }
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#161616] py-5 px-4 rounded-3xl border border-white/5 text-center">
                    <div className="text-lg font-black text-white leading-none mb-1">{stat.val}</div>
                    <div className="text-[8px] text-white/20 uppercase font-black tracking-[0.2em]">{stat.label}</div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => {
                  if (metadata) {
                    generateManifest({
                      ...metadata,
                      shortName: metadata.title.split(' ')[0],
                      display: "standalone",
                      orientation: "portrait",
                      backgroundColor: "#0a0a0a",
                      icons: [
                        ...metadata.icons,
                        ...customIcons.map(icon => ({
                          src: icon.src,
                          sizes: icon.sizes,
                          type: "image/png"
                        }))
                      ]
                    });
                  }
                }}
                className="w-full py-6 rounded-3xl bg-white text-black font-black uppercase tracking-tighter text-lg flex items-center justify-center gap-3 hover:bg-white/90 transition-all group active:scale-95 shadow-xl shadow-white/5"
              >
                <Download className="w-6 h-6" />
                Build Package
              </button>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {activeTab === "preview" && (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="flex justify-center"
                  >
                    <div className="relative w-[360px] h-[720px] bg-[#050505] rounded-[60px] border-[12px] border-[#1f1f1f] shadow-[0_0_120px_rgba(0,0,0,0.5)] overflow-hidden">
                      {/* Notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-[#1f1f1f] rounded-b-3xl z-20 flex items-center justify-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#050505] border border-white/5"></div>
                        <div className="w-4 h-1.5 rounded-full bg-[#050505] border border-white/5"></div>
                      </div>
                      
                      {/* Content Screen */}
                      <div className="w-full h-full bg-white relative">
                        <iframe 
                          src={metadata.url} 
                          title="Site Preview"
                          className="w-[300%] h-[300%] scale-[0.3333] origin-top-left pointer-events-auto"
                        />
                      </div>
                      
                      {/* Home Indicator */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/10 rounded-full z-20"></div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "config" && (
                  <motion.div
                    key="config"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-[#161616] rounded-[48px] border border-white/5 p-12 shadow-2xl min-h-[700px] overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-12">
                      <h2 className="text-4xl font-bold tracking-tight">App Configuration</h2>
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    </div>

                    <div className="space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-8">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">App Identity Name</label>
                            <input 
                              type="text" 
                              defaultValue={metadata.title} 
                              className="w-full bg-[#0a0a0a] p-5 rounded-2xl border border-white/10 focus:outline-none focus:border-indigo-500 transition-colors text-white font-bold"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Accent Signature Color</label>
                            <div className="flex items-center gap-4 bg-[#0a0a0a] p-2 rounded-2xl border border-white/10">
                              <input 
                                type="color" 
                                defaultValue={metadata.themeColor} 
                                className="w-12 h-12 rounded-xl bg-transparent cursor-pointer border-0"
                              />
                              <input 
                                type="text" 
                                value={metadata.themeColor} 
                                readOnly
                                className="flex-1 bg-transparent text-white/60 font-mono text-sm outline-none"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Display Architecture</label>
                            <select className="w-full bg-[#0a0a0a] p-5 rounded-2xl border border-white/10 appearance-none text-white font-bold outline-none focus:border-indigo-500 transition-all">
                              <option>Standalone (Immersive)</option>
                              <option>PWA Optimized Shell</option>
                              <option>Hybrid Webview</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="bg-[#0a0a0a] rounded-3xl p-8 border border-white/10 space-y-6">
                           <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                              <BadgeCheck className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-white">System Diagnostics</h4>
                          </div>
                          <div className="space-y-4 text-xs text-white/40 leading-relaxed font-medium">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span>HTTPS Encryption</span>
                              <span className="text-green-500 font-bold">STABLE</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span>Service Worker</span>
                              <span className="text-green-500 font-bold">READY</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span>Manifest Pointer</span>
                              <span className="text-indigo-400 font-bold">DETECTED</span>
                            </div>
                          </div>
                          <div className="pt-2">
                            <div className="flex items-center gap-2 mb-2">
                              <ShieldCheck className="w-3 h-3 text-indigo-400" />
                              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Security Verified</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full w-[94%] bg-indigo-500"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Custom Icon Upload Section */}
                      <div className="space-y-6 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">Custom Resolution Icons</h3>
                            <p className="text-xs text-white/40">Upload high-res icons (up to 1024x1024) for platform-specific rendering.</p>
                          </div>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold transition-all text-white"
                          >
                            <Upload className="w-4 h-4" />
                            Upload Images
                          </button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleIconUpload} 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {customIcons.map((icon) => (
                            <div key={icon.id} className="relative group bg-[#0a0a0a] aspect-square rounded-2xl border border-white/10 p-4 flex flex-col items-center justify-center overflow-hidden">
                              <button 
                                onClick={() => removeIcon(icon.id)}
                                className="absolute top-2 right-2 p-1 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <img src={icon.src} className="w-16 h-16 object-contain mb-3 drop-shadow-lg" />
                              <div className="text-[9px] font-mono text-white/40 uppercase tracking-tighter">
                                {icon.sizes}
                              </div>
                            </div>
                          ))}
                          {customIcons.length === 0 && (
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-square rounded-2xl border-2 border-dashed border-white/5 hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all cursor-pointer flex flex-col items-center justify-center text-white/20 hover:text-indigo-400 gap-3"
                            >
                              <ImageIcon className="w-8 h-8" />
                              <span className="text-[10px] uppercase font-bold tracking-widest">Add Icons</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "audit" && (
                  <motion.div
                    key="audit"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    className="space-y-8"
                  >
                    <div className="bg-[#161616] rounded-[48px] border border-white/5 p-12 shadow-2xl">
                      <div className="flex items-center justify-between mb-12">
                        <div>
                          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-[0.2em] mb-4">
                            Experimental Logic
                          </div>
                          <h2 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-4">
                            Semantic Bridge Audit
                            <Zap className="w-8 h-8 text-amber-400 fill-amber-400" />
                          </h2>
                          <p className="text-white/30 font-medium italic">Gemini-powered heuristic optimization report</p>
                        </div>
                        <button 
                          onClick={runAudit}
                          disabled={isAuditing}
                          className="px-8 py-4 bg-[#0a0a0a] border border-white/10 rounded-2xl text-xs font-bold hover:bg-white/5 text-white transition-all disabled:opacity-50"
                        >
                          {isAuditing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Re-Scan System"}
                        </button>
                      </div>

                      <div className="grid gap-6">
                        {isAuditing && auditResults.length === 0 ? (
                          <div className="py-32 flex flex-col items-center justify-center space-y-6">
                            <div className="relative">
                              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                              <Loader2 className="w-14 h-14 text-indigo-500 animate-spin relative" />
                            </div>
                            <div className="text-center">
                              <p className="text-white font-black tracking-[0.3em] text-[10px] uppercase animate-pulse">Extracting Structural Metadata</p>
                              <p className="text-white/20 text-xs mt-2 font-mono">Waiting for inference stream...</p>
                            </div>
                          </div>
                        ) : auditResults.length > 0 ? (
                          auditResults.map((issue, idx) => (
                            <motion.div 
                              key={issue.id}
                              initial={{ opacity: 0, x: -30 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5, delay: idx * 0.12 }}
                              className="group bg-[#0a0a0a] rounded-[32px] p-8 border border-white/5 hover:border-indigo-500/30 transition-all flex gap-8 items-start relative overflow-hidden"
                            >
                              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/10",
                                issue.type === "ui" ? "bg-[#161616] text-[#FF2D55]" : "bg-[#161616] text-indigo-400"
                              )}>
                                {issue.type === "ui" ? <Layout className="w-7 h-7" /> : <Cpu className="w-7 h-7" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-2">
                                  <h4 className="font-bold text-xl text-white">{issue.title}</h4>
                                  <span className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                    issue.severity === "high" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                  )}>
                                    {issue.severity}
                                  </span>
                                </div>
                                <p className="text-white/40 text-sm leading-relaxed font-medium">{issue.description}</p>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pt-3">
                                <button className="p-3 bg-white/5 rounded-full border border-white/10 hover:bg-indigo-500 text-white transition-all">
                                  <ArrowRight className="w-5 h-5" />
                                </button>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="py-32 text-center bg-[#0a0a0a] rounded-[32px] border border-white/5 border-dashed">
                            <AlertCircle className="w-16 h-16 text-white/10 mx-auto mb-6" />
                            <p className="text-white/20 font-black tracking-widest text-xs uppercase">No Active Insights Detected</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-32 py-16 border-t border-white/5 bg-[#0a0a0a] text-white/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white rotate-45">
               <div className="-rotate-45">A</div>
             </div>
             <p className="text-xs font-bold uppercase tracking-widest leading-loose">
               © 2026 Ayotech Systems. <br/>
               <span className="text-white/10">Cloud Edge Distribution Active</span>
             </p>
          </div>
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-white transition-colors">Infra Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Shell Terms</a>
            <a href="#" className="hover:text-white transition-colors">API Keys</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BadgeCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
