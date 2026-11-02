"use client";

import { useEffect, useState, useRef } from "react";
import { Link } from "@/features/landing/lib/router";
import { useBrand } from "@/components/providers/brand-provider";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  X,
  Activity,
  Cpu,
  Layers,
  Lock,
  Sparkles,
  Clock,
  ArrowRight,
  Stethoscope,
  Scan,
  Database,
  MailCheck,
  Smartphone,
  ChevronRight,
  Eye,
  Building2,
  Scale,
  DollarSign,
  Workflow,
  Wand2,
  BrainCircuit,
  Binary,
  Check,
  Loader2,
  Send,
  MessageSquare,
  User,
  Mail,
  Phone,
  Briefcase,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Systems catalog data model
const aiAutomationSystems = [
  {
    id: "smile-clinic",
    name: "Smile Clinic",
    subtitle: "AI Clinical Decision Support & Prescription Safety System",
    category: "Healthcare & Clinical Pharmacology",
    tagline: "Eliminating Adverse Drug Events in Dental Practices with Computer Vision & Clinical Pharmacology Models",
    status: "Live Production",
    heroImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80",
    prescriptionImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1600&q=80",
    tryNowUrl: "https://prescription-dentalclinic.pages.dev/",
    compliance: ["HIPAA Compliant", "SHA-256 Notary Seal", "IST Audit Trail"],
    elevatorPitch: `Smile Clinic is a HIPAA-compliant, real-time Clinical Decision Support (CDS) platform designed for dental practices to eliminate adverse drug events. By integrating AI-driven computer vision and clinical pharmacology models, the system extracts handwritten or digital prescription slips, cross-screens medications against patient history and organ clearance thresholds (renal/hepatic), and detects critical drug-drug and dental anesthetic/vasoconstrictor interactions. When high-risk hazards are flagged, clinicians can instantaneously dispatch certified consultation directives to prescribing doctors with dual attachments (the clinical decision report and original prescription) and an immutable cryptographic audit trail.`,
    capabilities: [
      {
        title: "Intelligent Regimen Extraction (OCR & AI)",
        desc: "Upload multi-page PDF slips, photos, or scans. Extracts drug names, dosages, frequencies, and prescriber details via AI with zero manual data entry.",
        icon: Scan,
      },
      {
        title: "Clinical Decision Support & Interaction Screening",
        desc: "Evaluates combinations for Contraindicated, Major, and Moderate hazards. Safeguards dental-sensitive risks: epinephrine vs. beta-blockers, bleeding risks, and organ titration.",
        icon: Activity,
      },
      {
        title: "Dynamic Knowledge Base & Rules Governance",
        desc: "Clinicians can select prior patient histories or clinical guideline PDFs to dynamically build and enforce customized safety profiles across safety checks.",
        icon: Database,
      },
      {
        title: "Physician Consultation & Medication Change Alerts",
        desc: "Instantly notifies prescribing physicians with a certified 2-page CDS Verification Report PDF (SHA-256 sealed), original prescription, and clinical directive memo.",
        icon: MailCheck,
      },
      {
        title: "Real-Time Cross-Device Synchronization",
        desc: "Full real-time synchronization across phones, tablets, and desktop workstations backed by cloud PostgreSQL and WebSockets/REST APIs.",
        icon: Smartphone,
      },
      {
        title: "Regulatory Compliance & HIPAA Audit Trails",
        desc: "Every safety check, clinician override, and email dispatch is timestamped in Indian Standard Time (IST) and logged into an immutable digital audit registry.",
        icon: ShieldCheck,
      },
    ],
  },
];

// Automation Blueprint: How we build AI automation for ANY industry
const automationBlueprint = [
  {
    step: "01",
    title: "Unstructured Data Ingestion (Vision, Voice & Docs)",
    desc: "We build custom ingestion pipelines that process physical handwritten slips, multi-page PDFs, audio voice calls, and legacy databases with zero manual data transcription.",
    icon: Scan,
  },
  {
    step: "02",
    title: "Domain Logic & Real-Time Knowledge Engines",
    desc: "Zero hallucinations. We encode deterministic pharmacology guidelines, contractual indemnity rules, or financial thresholds directly into the AI inference pipeline.",
    icon: BrainCircuit,
  },
  {
    step: "03",
    title: "Autonomous Actions, Directives & Dispatch",
    desc: "The AI doesn't just show dashboards; it takes certified actions: dispatching physician memos, triggering telephony dialers, generating signed reports, and syncing CRMs.",
    icon: Wand2,
  },
  {
    step: "04",
    title: "Cryptographic Audit & Regulatory Governance",
    desc: "Every automated decision, clinician override, and outbound dispatch is timestamped in Indian Standard Time (IST) with SHA-256 hashing for tamper-proof compliance.",
    icon: Lock,
  },
];

export default function AIAutomationPage() {
  const brand = useBrand();
  const isCustomDomain = brand?.companyName && brand.companyName !== "PropNex AI";
  
  // Modals state
  const [selectedSystemForModal, setSelectedSystemForModal] = useState(null);
  const [consultModalOpen, setConsultModalOpen] = useState(false);

  // Consultation Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "Healthcare & Clinical",
    requirement: "",
    timeline: "Immediate (< 1 Month)",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const containerRef = useRef(null);

  // Strictly block white-label custom domains: immediately redirect to root
  useEffect(() => {
    if (isCustomDomain) {
      window.location.replace("/");
    }
  }, [isCustomDomain]);

  // Strictly block background scrolling when either modal is active
  useEffect(() => {
    if (selectedSystemForModal || consultModalOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverscroll = document.body.style.overscrollBehavior;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "contain";
      document.documentElement.style.overscrollBehavior = "contain";

      return () => {
        document.body.style.overflow = originalBodyOverflow || "";
        document.documentElement.style.overflow = originalHtmlOverflow || "";
        document.body.style.overscrollBehavior = originalBodyOverscroll || "";
        document.documentElement.style.overscrollBehavior = "";
      };
    }
  }, [selectedSystemForModal, consultModalOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedSystemForModal(null);
        setConsultModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Form submission handler
  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.requirement.trim()) {
      setFormError("Please fill in your name, email, phone number, and project requirement.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/marketing/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "ENGINEER",
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company: formData.company.trim(),
          industry: formData.industry,
          clients: formData.requirement.trim(), // saved to clients in DB
          volume: formData.timeline,            // saved to volume in DB
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setFormError(data.error || "Failed to submit request. Please try again.");
      }
    } catch (err) {
      setFormError("A network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetConsultForm = () => {
    setSubmitted(false);
    setFormError("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      industry: "Healthcare & Clinical",
      requirement: "",
      timeline: "Immediate (< 1 Month)",
    });
    setConsultModalOpen(false);
  };

  // GSAP Animations matching ProductPage and FeaturesPage
  useGSAP(
    () => {
      gsap.fromTo(
        ".auto-hero > *",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.85,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        ".auto-card",
        { opacity: 0, y: 48, rotateX: 6 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".auto-grid", start: "top 82%" },
        },
      );

      gsap.fromTo(
        ".blueprint-card",
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: ".blueprint-grid", start: "top 82%" },
        },
      );
    },
    { scope: containerRef },
  );

  if (isCustomDomain) {
    return null;
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main>
        {/* HERO SECTION — Specialized AI Automation Platforms with High-Tech Automation Background */}
        <section className="relative min-h-screen overflow-hidden pt-20">
          <div className="absolute inset-0 bg-black">
            <img
              src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=2000&q=80"
              alt="PropNex AI Automation"
              className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#010915]/60 to-black" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,rgba(34,211,238,0.2),transparent_70%)]" />
          </div>

          <div className="auto-hero relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-end px-5 pb-16 md:px-8 md:pb-24">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
              Autonomous Systems & Engineering
            </p>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-[68px]">
              Specialized <span className="text-cyan-400">AI Automation</span> Platforms
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/70 md:text-lg">
              Beyond conversational agents, PropNex AI engineers purpose-built autonomous engines.
              Explore our portfolio of domain-specific automation systems designed for mission-critical workflows,
              deep clinical pharmacology governance, and verified regulatory compliance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#systems-catalog"
                className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_28px_rgba(34,211,238,0.3)] transition hover:bg-cyan-300"
              >
                Explore Systems
              </a>
              <button
                type="button"
                onClick={() => setConsultModalOpen(true)}
                className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Book an AI Consultation
              </button>
            </div>
          </div>
        </section>

        {/* AI AUTOMATION SYSTEMS CATALOG */}
        <section id="systems-catalog" className="auto-grid relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Live & Deployed Engines
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Active AI Automation Systems
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-white/60 sm:text-base">
              Each system is an independent, end-to-end platform engineered for a specific operational or clinical domain.
            </p>
          </div>

          {/* ACTIVE SYSTEMS SHOWCASE */}
          <div className="space-y-16">
            {aiAutomationSystems.map((system) => (
              <div
                key={system.id}
                className="auto-card group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-6 shadow-2xl backdrop-blur-2xl sm:p-8 lg:p-10 transition duration-300 hover:border-cyan-500/30"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-2xl shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                      🦷
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white sm:text-2xl">{system.name}</h3>
                        <span className="rounded-full bg-cyan-400/10 border border-cyan-400/30 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                          {system.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 sm:text-sm">{system.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {system.compliance.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2-Column Showcase */}
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
                  {/* Left Column: Image with Floating Clinical Preview */}
                  <div className="lg:col-span-6 relative">
                    <div className="relative overflow-hidden rounded-2xl border border-white/15 shadow-2xl aspect-[16/10] group">
                      <img
                        src={system.prescriptionImage}
                        alt="Prescription Safety System Analysis"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                      {/* Floating Clinical Notification Overlay */}
                      <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/20 bg-black/80 p-3.5 backdrop-blur-xl">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5" />
                            AI Prescription Screening
                          </span>
                          <span className="rounded bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] text-rose-300 border border-rose-500/30">
                            HAZARD DETECTED
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-white/80 line-clamp-2">
                          <strong>Vasoconstrictor Interaction:</strong> Epinephrine in Local Anesthetic + Patient Beta-Blocker therapy.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Elevator Pitch & The Two Buttons */}
                  <div className="lg:col-span-6 flex flex-col justify-between">
                    <div>
                      <div className="inline-block rounded-md bg-white/5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                        The Short Brief (Elevator Pitch)
                      </div>

                      <h4 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {system.tagline}
                      </h4>

                      <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
                        {system.elevatorPitch}
                      </p>

                      <ul className="mt-6 space-y-2 text-xs text-white/80 sm:text-sm">
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
                          <span>Intelligent Regimen Extraction via Vision OCR (PDFs, Scans, Camera Photos)</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
                          <span>Dental Vasoconstrictor & Anesthetic Hazard Screening (Epinephrine vs. Beta-Blockers)</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
                          <span>Instant Certified Physician Directives with Cryptographic SHA-256 Audit Seal</span>
                        </li>
                      </ul>
                    </div>

                    {/* TWO BUTTONS: VIEW INFO & TRY NOW */}
                    <div className="mt-8 flex flex-wrap items-center gap-4 pt-6 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setSelectedSystemForModal(system)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-lg transition duration-200 hover:border-white/40 hover:bg-white/15 active:scale-95"
                      >
                        <Eye className="h-4 w-4 text-cyan-300" />
                        <span>View Info</span>
                      </button>

                      <a
                        href={system.tryNowUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-black shadow-[0_0_30px_rgba(34,211,238,0.35)] transition duration-200 hover:brightness-110 active:scale-95"
                      >
                        <span>Try Now</span>
                        <ExternalLink className="h-4 w-4 text-black" />
                      </a>

                      <span className="text-xs text-white/50">
                        Live System Portal &bull; Free Access
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: HOW WE BUILD AI AUTOMATION FOR ANY WORKFLOW */}
        <section id="how-we-build" className="blueprint-grid relative mx-auto max-w-7xl px-5 py-16 md:px-8 border-t border-white/10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>The PropNex AI Automation Engine</span>
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              If You Can Envision It, <span className="text-cyan-400">We Can Automate It</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
              From regulated healthcare pharmacology cross-checks to high-volume multi-bank financial reconciliations,
              our engineering team transforms complex human decision trees into deterministic, error-free AI automation.
            </p>
          </div>

          {/* 4-Stage Methodology Cards */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {automationBlueprint.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="blueprint-card group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl transition duration-300 hover:border-cyan-500/40 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400/80 tracking-widest">
                      {item.step}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/60">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Custom Workflow Interactive Box */}
          <div className="mt-10 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 via-black to-blue-950/30 p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-lg font-bold text-white">Have a unique operational bottleneck?</h4>
                <p className="text-xs text-white/60 sm:text-sm">
                  We design custom computer vision, LLM reasoning pipelines, and API actions for your specific enterprise software stack.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConsultModalOpen(true)}
                className="shrink-0 rounded-xl bg-cyan-400 px-5 py-2.5 text-xs sm:text-sm font-semibold text-black transition hover:bg-cyan-300 active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
              >
                Request Custom AI Blueprint
              </button>
            </div>
          </div>
        </section>

        {/* BOTTOM CONSULTATION CTA */}
        <section className="relative mx-auto max-w-7xl px-5 pt-6 pb-20 md:px-8 md:pb-28">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-950/40 via-black to-blue-950/40 p-8 text-center sm:p-12">
            <h3 className="text-2xl font-bold text-white sm:text-4xl">
              Have a Custom AI Automation Requirement?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
              From regulated healthcare workflows to multi-agent enterprise task automation, our AI engineers design bespoke systems that scale seamlessly.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => setConsultModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.25)] active:scale-95"
              >
                Book an Engineering Consultation
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 1. HORIZONTAL WIDE LANDSCAPE POPUP MODAL (OPENED BY "VIEW INFO") */}
      {selectedSystemForModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overscroll-contain"
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Enhanced Backdrop with deep blur */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-2xl transition-opacity overscroll-contain"
            onClick={() => setSelectedSystemForModal(null)}
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />

          {/* Modal Container: Wide Horizontal Layout matching page aesthetic */}
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#070f1e]/95 via-black/95 to-[#050b14]/95 shadow-[0_0_60px_rgba(34,211,238,0.15)] backdrop-blur-2xl flex flex-col overscroll-contain">
            {/* Modal Header */}
            <div
              className="flex items-center justify-between border-b border-white/10 px-6 py-4 sm:px-8 bg-white/[0.02]"
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xl">
                  🦷
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white sm:text-xl">
                      {selectedSystemForModal.name} — Complete Project Specification
                    </h3>
                    <span className="hidden sm:inline-block rounded-full bg-cyan-400/10 border border-cyan-400/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                      Live Production
                    </span>
                  </div>
                  <p className="text-xs text-white/60">
                    {selectedSystemForModal.subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSystemForModal(null)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Horizontal 2-Column Split Pane */}
            <div
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 overflow-y-auto flex-1 overscroll-contain"
              onWheel={(e) => e.stopPropagation()}
            >
              {/* Left Pane (lg:col-span-5): Identity, Preview & Actions */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-5 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-6">
                <div>
                  {/* Visual Preview */}
                  <div className="relative overflow-hidden rounded-2xl border border-white/15 aspect-[16/10] shadow-lg">
                    <img
                      src={selectedSystemForModal.prescriptionImage}
                      alt="Prescription Decision Support"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute bottom-3 inset-x-3 rounded-lg bg-black/80 border border-rose-500/30 p-2.5 backdrop-blur-md">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-rose-300 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          HAZARD LEVEL 1
                        </span>
                        <span className="text-[10px] text-white/50 font-mono">IST Audit Logged</span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-white/80 leading-tight">
                        Epinephrine (Vasoconstrictor) + Propranolol (Beta-Blocker) interaction.
                      </p>
                    </div>
                  </div>

                  {/* Project Overview Paragraph */}
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                      1. Project Overview & Clinical Mission
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-white/75">
                      Smile Clinic is an end-to-end, multi-device prescription safety and clinical governance platform. It bridges the gap between dental procedures and patient systemic pharmacology, ensuring that every prescribed drug, local anesthetic, and dental intervention is cross-verified against a patient’s full medical profile before dispensing.
                    </p>
                  </div>

                  {/* Compliance Badges */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {selectedSystemForModal.compliance.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/80"
                      >
                        <ShieldCheck className="h-3 w-3 text-cyan-400" />
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Launch Callout */}
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Experience Smile Clinic</p>
                      <p className="text-[10px] text-white/60">Live production deployment ready for demo</p>
                    </div>
                    <a
                      href={selectedSystemForModal.tryNowUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-cyan-300 shadow-sm"
                    >
                      <span>Try Now</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Pane (lg:col-span-7): Full Capabilities Grid & Specs */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                    2. Key Capabilities & Workflow
                  </h4>
                  <p className="mt-1 text-xs text-white/60">
                    Comprehensive clinical architecture details and safety features:
                  </p>
                </div>

                {/* 2-Column Capability Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedSystemForModal.capabilities.map((cap) => {
                    const Icon = cap.icon;
                    return (
                      <div
                        key={cap.title}
                        className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 transition hover:border-white/20 hover:bg-white/[0.04]"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                            <Icon className="h-4 w-4" />
                          </div>
                          <h5 className="text-xs font-semibold text-white leading-tight">
                            {cap.title}
                          </h5>
                        </div>
                        <p className="mt-2 text-[11px] leading-relaxed text-white/65">
                          {cap.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Additional Clinical Directive Specifications */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                  <h5 className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Physician Directive Package Attachments
                  </h5>
                  <p className="text-[11px] text-white/70 leading-relaxed">
                    When a high-risk contraindication is flagged, the platform dispatches a secure transactional notice to the prescribing doctor containing:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-white/60 pt-1">
                    <li className="flex items-start gap-1.5">
                      <Check className="h-3 w-3 shrink-0 text-cyan-400 mt-0.5" />
                      <span>Certified 2-Page CDS Verification Report PDF with SHA-256 seal</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="h-3 w-3 shrink-0 text-cyan-400 mt-0.5" />
                      <span>Original high-resolution scanned prescription document attachment</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="h-3 w-3 shrink-0 text-cyan-400 mt-0.5" />
                      <span>Automated confirmation copy with direct attending dentist numbers</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="h-3 w-3 shrink-0 text-cyan-400 mt-0.5" />
                      <span>Immutable digital audit registry timestamped in Indian Standard Time</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="flex flex-wrap items-center justify-between border-t border-white/10 px-6 py-4 bg-white/[0.02]"
              onWheel={(e) => e.stopPropagation()}
            >
              <span className="text-xs text-white/50">
                Smile Clinic CDS &bull; Live Production System
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSystemForModal(null)}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  Close
                </button>
                <a
                  href={selectedSystemForModal.tryNowUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2 text-xs font-semibold text-black shadow-md transition hover:brightness-110 active:scale-95"
                >
                  <span>Try Now</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. HORIZONTAL ENGINEERING CONSULTATION POPUP MODAL */}
      {consultModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 overscroll-contain"
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Enhanced Backdrop with deep blur */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-2xl transition-opacity overscroll-contain"
            onClick={resetConsultForm}
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />

          {/* Modal Container: Wide Horizontal Layout matching page aesthetic */}
          <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-[#070f1e]/98 via-black/98 to-[#050b14]/98 shadow-[0_0_60px_rgba(34,211,238,0.2)] backdrop-blur-2xl flex flex-col overscroll-contain">
            {/* Modal Header */}
            <div
              className="flex items-center justify-between border-b border-white/10 px-6 py-4 sm:px-8 bg-white/[0.02]"
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-lg">
                  ⚙️
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white sm:text-xl">
                    Book an AI Engineering Consultation
                  </h3>
                  <p className="text-xs text-white/60">
                    Bespoke Autonomous Architecture & System Design
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={resetConsultForm}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Horizontal 2-Column Split Pane */}
            <div
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 overflow-y-auto flex-1 overscroll-contain"
              onWheel={(e) => e.stopPropagation()}
            >
              {/* Left Column (5 cols): Architecture Studio Overview */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3 py-1 text-[11px] font-medium text-cyan-300">
                    <Sparkles className="h-3 w-3 text-cyan-400" />
                    PropNex AI Architecture Studio
                  </div>

                  <h4 className="text-2xl font-bold tracking-tight text-white">
                    Let's Engineer Your Vision
                  </h4>

                  <p className="text-xs sm:text-sm leading-relaxed text-white/75">
                    Speak directly with our senior AI architects. We take your business workflows, proprietary datasets, and decision rules to engineer deterministic, production-grade autonomous systems.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-2.5 text-xs text-white/80">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-cyan-500/10 text-cyan-400">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span><strong>Feasibility Blueprint:</strong> We map inputs, models, and outputs for your exact operational stack.</span>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-white/80">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-cyan-500/10 text-cyan-400">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span><strong>Zero-Leakage Security:</strong> Built with HIPAA, SOC-2, and cryptographic audit compliance.</span>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-white/80">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-cyan-500/10 text-cyan-400">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span><strong>24-Hour Review:</strong> Our senior engineering team reviews every request within 24 hours.</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/60">
                  <span className="font-semibold text-white">Direct Engineering Channel:</span> Submissions automatically notify our lead architects and are logged in the PropNex Platform Admin Vault.
                </div>
              </div>

              {/* Right Column (7 cols): Consultation Form / Confirmation */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                {submitted ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-bold text-white">Consultation Request Received!</h4>
                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-md mx-auto">
                      Thank you, <strong className="text-white">{formData.name}</strong>. Our senior AI architects have received your requirements, and a confirmation email has been dispatched to <strong className="text-cyan-300">{formData.email}</strong>.
                    </p>
                    <p className="text-xs text-white/60">
                      We will review your specifications and contact you at <strong className="text-white">{formData.phone}</strong> within 24 hours to schedule your architecture call.
                    </p>
                    <button
                      type="button"
                      onClick={resetConsultForm}
                      className="mt-4 rounded-xl bg-cyan-400 px-6 py-2.5 text-xs font-semibold text-black transition hover:bg-cyan-300"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleConsultSubmit} className="space-y-4">
                    {formError && (
                      <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">
                        {formError}
                      </div>
                    )}

                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Full Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Dr. Alex Mercer"
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Work Email <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="alex@organization.com"
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        />
                      </div>
                    </div>

                    {/* Phone & Company Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Phone / WhatsApp <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Company / Practice Name
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="e.g. Mercer Dental Network"
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        />
                      </div>
                    </div>

                    {/* Industry & Timeline Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Industry / Domain
                        </label>
                        <select
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        >
                          <option value="Healthcare & Clinical">Healthcare & Clinical Pharmacology</option>
                          <option value="Real Estate & PropTech">Real Estate & PropTech</option>
                          <option value="Finance & FinTech">Finance & Accounting</option>
                          <option value="Legal & Compliance">Legal & Compliance</option>
                          <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                          <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                          <option value="Enterprise SaaS">Enterprise SaaS & Operations</option>
                          <option value="Other">Other Industry</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Target Launch Timeline
                        </label>
                        <select
                          value={formData.timeline}
                          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        >
                          <option value="Immediate (< 1 Month)">Immediate (&lt; 1 Month)</option>
                          <option value="1–3 Months">1–3 Months</option>
                          <option value="3–6 Months">3–6 Months</option>
                          <option value="Exploring & R&D">Exploring &amp; R&amp;D</option>
                        </select>
                      </div>
                    </div>

                    {/* What do you want to build? */}
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">
                        What do you want to build or automate? <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.requirement}
                        onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                        placeholder="Describe your workflow, source inputs (e.g. handwritten slips, PDF reports, phone calls, databases), and what decisions or actions the AI should automate..."
                        className="w-full rounded-xl border border-white/15 bg-white/5 p-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-white/50">
                        🔒 Confidential &bull; Protected under NDA
                      </span>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-2.5 text-xs font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-50 active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Engineering Request</span>
                            <Send className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
