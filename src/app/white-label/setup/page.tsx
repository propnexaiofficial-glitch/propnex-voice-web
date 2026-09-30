"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, CheckCircle2, Building, Globe, Mail, Phone, Link as LinkIcon, Image as ImageIcon, Loader2 } from "lucide-react";

export default function WhiteLabelSetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    domain: "",
    companyName: "",
    tabTitle: "",
    supportEmail: "",
    supportPhone: "",
    instagramUrl: "",
    linkedinUrl: "",
    logoUrl: "",
    faviconUrl: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "faviconUrl") => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.domain || !formData.companyName || !formData.supportEmail) {
        setError("Please fill in the required fields (Domain, Company Name, Email).");
        return;
      }
      setError("");
      setStep(2);
    }
  };

  const submitForm = async () => {
    if (!formData.logoUrl || !formData.faviconUrl) {
      setError("Please upload both a Logo and a Favicon.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/white-label/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-4">Submission Successful!</h2>
          <p className="text-zinc-400 mb-6">
            Your white-label setup details have been securely transmitted to our administrative team. 
            We will review your details, verify your DNS records, and activate your domain shortly.
          </p>
          <div className="text-sm text-zinc-500">
            If you haven't yet, please ensure your CNAME records are configured correctly.
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-2xl w-full relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">White Label Platform Setup</h1>
          <p className="text-zinc-400">Complete the details below to deploy your custom branded platform.</p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -z-10 -translate-y-1/2" />
            <div className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: step === 2 ? '100%' : '0%' }} />
            
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>1</div>
              <span className="text-xs mt-2 font-medium text-zinc-300">Basic Info</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>2</div>
              <span className="text-xs mt-2 font-medium text-zinc-300">Branding Assets</span>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6">
              {error}
            </motion.div>
          )}

          <div className="overflow-hidden">
            <motion.div
              animate={{ x: step === 1 ? 0 : '-100%' }}
              transition={{ tension: 300, friction: 30 }}
              className="flex"
              style={{ width: '200%' }}
            >
              {/* STEP 1: Basic Info */}
              <div className="w-1/2 pr-4 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" /> Domain Name *
                  </label>
                  <input type="text" name="domain" value={formData.domain} onChange={handleInputChange} placeholder="e.g. platform.yourcompany.com" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-400" /> Company Name *
                  </label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="e.g. Acme Corp" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" /> Support Email *
                    </label>
                    <input type="email" name="supportEmail" value={formData.supportEmail} onChange={handleInputChange} placeholder="support@yourcompany.com" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-400" /> Support Phone
                    </label>
                    <input type="text" name="supportPhone" value={formData.supportPhone} onChange={handleInputChange} placeholder="+1 234 567 890" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                    Next Step <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* STEP 2: Branding */}
              <div className="w-1/2 pl-4 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300">Tab Title (Browser Tab)</label>
                  <input type="text" name="tabTitle" value={formData.tabTitle} onChange={handleInputChange} placeholder="e.g. Acme Dashboard" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-400" /> Main Logo *
                    </label>
                    <div className="relative group rounded-lg border-2 border-dashed border-zinc-700 hover:border-blue-500 transition-colors bg-zinc-950 flex flex-col items-center justify-center p-6 h-32 overflow-hidden">
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "logoUrl")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-zinc-500 mx-auto mb-2 group-hover:text-blue-400 transition-colors" />
                          <span className="text-xs text-zinc-500">Upload Logo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Favicon Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-400" /> Favicon *
                    </label>
                    <div className="relative group rounded-lg border-2 border-dashed border-zinc-700 hover:border-blue-500 transition-colors bg-zinc-950 flex flex-col items-center justify-center p-6 h-32 overflow-hidden">
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "faviconUrl")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {formData.faviconUrl ? (
                        <img src={formData.faviconUrl} alt="Favicon" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-zinc-500 mx-auto mb-2 group-hover:text-blue-400 transition-colors" />
                          <span className="text-xs text-zinc-500">Upload Favicon</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-blue-400" /> Instagram (Optional)
                    </label>
                    <input type="url" name="instagramUrl" value={formData.instagramUrl} onChange={handleInputChange} placeholder="https://instagram.com/..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-blue-400" /> LinkedIn (Optional)
                    </label>
                    <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange} placeholder="https://linkedin.com/..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button onClick={() => setStep(1)} className="text-zinc-400 hover:text-white font-medium px-4 py-2.5 transition-colors">
                    Back
                  </button>
                  <button onClick={submitForm} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      <>Submit Details <CheckCircle2 className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
