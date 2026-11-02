"use client";

import { useEffect, useState } from "react";
import { Link } from "@/features/landing/lib/router";
import { useBrand } from "@/components/providers/brand-provider";
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
} from "lucide-react";

// Systems catalog data model
const aiAutomationSystems = [
  {
    id: "smile-clinic",
    name: "Smile Clinic",
    subtitle: "AI Clinical Decision Support & Prescription Safety System",
    category: "Healthcare & Clinical Pharmacology",
    tagline: "Eliminating Adverse Drug Events in Dental Practices with Computer Vision & Pharmacology Models",
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

// Innovation pipeline / upcoming systems in development
const upcomingSystems = [
  {
    title: "FinAudit AI — Autonomous Ledger Reconciliation",
    category: "Finance & FinTech",
    desc: "Autonomous agent reconciling multi-bank ledgers, detecting accounting anomalies, and auditing high-volume transactional flows in real time.",
    status: "In Development",
    icon: DollarSign,
  },
  {
    title: "LexiGuard — Real Estate & Legal Contract AI",
    category: "Legal & Real Estate",
    desc: "Autonomous contract analysis engine redlining high-risk indemnity clauses, regulatory non-compliance, and lease contingencies.",
    status: "In Development",
    icon: Scale,
  },
  {
    title: "Agentic Dispatcher — Multi-Agent Process Router",
    category: "Enterprise Operations",
    desc: "Autonomous orchestrator synchronizing CRM records, telephony call outcomes, and ERP fulfillment pipelines across disparate SaaS tools.",
    status: "In Development",
    icon: Workflow,
  },
];

export default function AIAutomationPage() {
  const brand = useBrand();
  const isCustomDomain = brand?.companyName && brand.companyName !== "PropNex AI";
  const [selectedSystemForModal, setSelectedSystemForModal] = useState(null);

  // Strictly block white-label custom domains: immediately redirect to root
  useEffect(() => {
    if (isCustomDomain) {
      window.location.replace("/");
    }
  }, [isCustomDomain]);

  // Lock scroll when info modal is open
  useEffect(() => {
    if (selectedSystemForModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedSystemForModal]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedSystemForModal(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isCustomDomain) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main>
        {/* HERO SECTION — Matching ProductPage.jsx with Cinematic Background */}
        <section className="relative min-h-[75vh] lg:min-h-[85vh] overflow-hidden pt-20 flex items-center">
          <div className="absolute inset-0 bg-black">
            <img
              src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=2000&q=80"
              alt="AI Automation Background"
              className="absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#010915]/60 to-black" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,rgba(34,211,238,0.25),transparent_70%)]" />
          </div>

          <div className="relative mx-auto flex max-w-7xl flex-col justify-center px-5 py-16 md:px-8 md:py-24">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-md w-fit">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Autonomous Systems & Engineering</span>
            </div>

            <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-[68px]">
              Specialized <span className="text-cyan-400">AI Automation</span> Platforms
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              Beyond conversational agents, PropNex AI engineers purpose-built autonomous engines.
              Explore our portfolio of domain-specific automation systems designed for mission-critical workflows,
              deep clinical pharmacology governance, and verified regulatory compliance.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#systems-catalog"
                className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-black shadow-[0_0_28px_rgba(34,211,238,0.3)] transition hover:bg-cyan-300 active:scale-95"
              >
                Explore Systems Catalog
              </a>
              <Link
                to="/live-demo"
                className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10"
              >
                Schedule AI Consultation
              </Link>
            </div>
          </div>
        </section>

        {/* AI AUTOMATION SYSTEMS CATALOG */}
        <section id="systems-catalog" className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
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

          {/* ACTIVE SYSTEMS LIST */}
          <div className="space-y-16">
            {aiAutomationSystems.map((system) => (
              <div
                key={system.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-6 shadow-2xl backdrop-blur-2xl sm:p-8 lg:p-10 transition duration-300 hover:border-cyan-500/30"
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

        {/* UPCOMING AI AUTOMATION SYSTEMS PIPELINE */}
        <section className="relative mx-auto max-w-7xl px-5 py-12 md:px-8 border-t border-white/10">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-cyan-950/40 border border-cyan-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Future Roadmap
            </span>
            <h3 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Upcoming AI Automation Systems in Pipeline
            </h3>
            <p className="mt-2 text-sm text-white/60 sm:text-base">
              New domain-specific AI automation platforms being engineered for enterprise deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {upcomingSystems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                      {item.status}
                    </span>
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-white">{item.title}</h4>
                  <p className="mt-1 text-xs font-medium text-cyan-400">{item.category}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/60">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="relative mx-auto max-w-7xl px-5 pt-8 pb-16 md:px-8">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-950/40 via-black to-blue-950/40 p-8 text-center sm:p-12">
            <h3 className="text-2xl font-bold text-white sm:text-4xl">
              Have a Custom AI Automation Requirement?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
              From regulated healthcare workflows to multi-agent enterprise task automation, our AI engineers design bespoke systems that scale seamlessly.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/live-demo"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
              >
                Book an Engineering Consultation
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* DETAILED PROJECT POPUP MODAL (OPENED BY "VIEW INFO") */}
      {selectedSystemForModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedSystemForModal(null)}
          />

          {/* Modal Content */}
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/20 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6 shadow-2xl sm:p-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-2xl">
                  🦷
                </span>
                <div>
                  <h3 className="text-xl font-bold text-white sm:text-2xl">
                    {selectedSystemForModal.name} — Complete Project Specification
                  </h3>
                  <p className="text-xs text-white/60 sm:text-sm">
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

            {/* Modal Body */}
            <div className="mt-6 space-y-6 text-sm leading-relaxed text-white/80">
              {/* 1. Project Overview */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h4 className="flex items-center gap-2 text-base font-bold text-cyan-300">
                  <Stethoscope className="h-4 w-4" />
                  1. Project Overview
                </h4>
                <p className="mt-3 text-white/75">
                  Smile Clinic is an end-to-end, multi-device prescription safety and clinical governance platform. It bridges the gap between dental procedures and patient systemic pharmacology, ensuring that every prescribed drug, local anesthetic, and dental intervention is cross-verified against a patient’s full medical profile before dispensing.
                </p>
              </div>

              {/* 2. Key Capabilities & Workflow */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h4 className="flex items-center gap-2 text-base font-bold text-cyan-300">
                  <Layers className="h-4 w-4" />
                  2. Key Capabilities & Workflow
                </h4>

                <div className="mt-4 space-y-4">
                  {selectedSystemForModal.capabilities.map((cap) => (
                    <div key={cap.title} className="border-l-2 border-cyan-400 pl-3">
                      <h5 className="font-semibold text-white">{cap.title}:</h5>
                      <p className="mt-1 text-xs text-white/70">{cap.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Live Access Details */}
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">Test the System Live</h4>
                    <p className="text-xs text-white/60">
                      Access the full Smile Clinic portal in your browser
                    </p>
                  </div>
                  <a
                    href={selectedSystemForModal.tryNowUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-semibold text-black transition hover:bg-cyan-300"
                  >
                    <span>Launch Portal</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-4">
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2 text-xs font-semibold text-black shadow-md transition hover:brightness-110"
              >
                <span>Try Now</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
