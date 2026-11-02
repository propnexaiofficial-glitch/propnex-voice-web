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
} from "lucide-react";

const CDS_URL = "https://prescription-dentalclinic.pages.dev/";

export default function AIAutomationPage() {
  const brand = useBrand();
  const isCustomDomain = brand?.companyName && brand.companyName !== "PropNex AI";
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Strictly block white-label custom domains: immediately redirect to root
  useEffect(() => {
    if (isCustomDomain) {
      window.location.replace("/");
    }
  }, [isCustomDomain]);

  // Lock scroll when info modal is open
  useEffect(() => {
    if (infoModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [infoModalOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setInfoModalOpen(false);
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

      <main className="relative overflow-hidden pt-24 pb-20">
        {/* Background radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.15),transparent_65%)]" />
        <div className="pointer-events-none absolute top-40 -left-48 h-96 w-96 rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-96 -right-48 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

        {/* HERO SECTION */}
        <section className="relative mx-auto max-w-7xl px-5 pt-8 pb-14 md:px-8 md:pt-14 md:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>PropNex AI Automation Systems</span>
              <span className="h-1 w-1 rounded-full bg-cyan-400" />
              <span className="text-white/60">Clinical & Enterprise</span>
            </div>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Specialized <span className="text-cyan-400">AI Automation</span> for Critical Workflows
            </h1>

            <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
              Beyond conversational agents, PropNex builds domain-specific autonomous engines.
              Our Clinical Decision Support (CDS) platform eliminates medical hazards, automates prescription
              safeguards, and enforces verified regulatory compliance.
            </p>
          </div>

          {/* MAIN SHOWCASE CARD: SMILE CLINIC */}
          <div className="relative mt-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] via-white/[0.02] to-transparent p-6 shadow-2xl backdrop-blur-2xl sm:p-8 lg:p-10">
            {/* Ambient lighting badge */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-2xl shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  🦷
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white sm:text-2xl">Smile Clinic</h2>
                    <span className="rounded-full bg-cyan-400/10 border border-cyan-400/30 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                      Live Production
                    </span>
                  </div>
                  <p className="text-xs text-white/60 sm:text-sm">
                    AI Clinical Decision Support & Prescription Safety System
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  HIPAA Compliant
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-950/40 px-3 py-1 text-xs font-medium text-blue-400">
                  <Lock className="h-3.5 w-3.5 text-blue-400" />
                  SHA-256 Audit Seal
                </span>
              </div>
            </div>

            {/* 2-COLUMN GRID: DETAILS & INTERACTIVE MOCKUP */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Brief & Action Buttons */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="inline-block rounded-md bg-white/5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                    The Short Brief (Elevator Pitch)
                  </div>

                  <h3 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Eliminate Adverse Drug Events in Dental Practices
                  </h3>

                  <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
                    Smile Clinic is a HIPAA-compliant, real-time Clinical Decision Support (CDS) platform designed for dental practices to eliminate adverse drug events. By integrating AI-driven computer vision and clinical pharmacology models, the system extracts handwritten or digital prescription slips, cross-screens medications against patient history and organ clearance thresholds (renal/hepatic), and detects critical drug-drug and dental anesthetic/vasoconstrictor interactions.
                  </p>

                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    When high-risk hazards are flagged, clinicians can instantaneously dispatch certified consultation directives to prescribing doctors with dual attachments (the clinical decision report and original prescription) and an immutable cryptographic audit trail.
                  </p>

                  {/* Highlights Bullet List */}
                  <ul className="mt-6 space-y-2.5 text-xs text-white/80 sm:text-sm">
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
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
                      <span>Real-Time Cross-Device Synchronization (Phones, Tablets, Workstations)</span>
                    </li>
                  </ul>
                </div>

                {/* TWO BUTTONS: VIEW INFO & TRY NOW */}
                <div className="mt-8 flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setInfoModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-lg transition duration-200 hover:border-white/40 hover:bg-white/15 active:scale-95"
                  >
                    <Eye className="h-4 w-4 text-cyan-300" />
                    <span>View Info</span>
                  </button>

                  <a
                    href={CDS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-black shadow-[0_0_30px_rgba(34,211,238,0.35)] transition duration-200 hover:brightness-110 active:scale-95"
                  >
                    <span>Try Now</span>
                    <ExternalLink className="h-4 w-4 text-black" />
                  </a>

                  <span className="text-xs text-white/50">
                    Live Web Portal &bull; Free Demo
                  </span>
                </div>
              </div>

              {/* Right Column: Visual Prescription Analysis Interactive Mockup */}
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl border border-white/15 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
                  {/* Mock Window Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500/80" />
                      <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                      <span className="ml-2 font-mono text-xs text-white/50">Rx_Analysis_Engine_v2.4.log</span>
                    </div>
                    <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                      OCR Conf: 99.8%
                    </span>
                  </div>

                  {/* Patient & Prescription Slip Card */}
                  <div className="mt-4 space-y-3 font-sans">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span>Patient: <strong className="text-white">Farhan K. (52y / M)</strong></span>
                        <span>Organ Threshold: <strong className="text-amber-400">eGFR 68 mL/min (Renal Alert)</strong></span>
                      </div>
                      <div className="mt-2 text-xs text-white/70">
                        <span className="text-white/40">Active Medications:</span> Propranolol (Beta-Blocker 40mg), Metformin 500mg
                      </div>
                    </div>

                    {/* Detected Procedure & Local Anesthetic */}
                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-cyan-300">Proposed Dental Intervention</span>
                        <span className="text-[11px] text-white/50">Scheduled Today</span>
                      </div>
                      <div className="mt-1 text-xs text-white/80">
                        Procedure: <strong>Deep Periodontal Scaling & Root Planing</strong>
                      </div>
                      <div className="text-xs text-white/80">
                        Anesthetic Prescribed: <strong>Lidocaine 2% with 1:100,000 Epinephrine</strong>
                      </div>
                    </div>

                    {/* CDS HAZARD ALERT BOX */}
                    <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-rose-300 uppercase tracking-wider">
                              CRITICAL CONTRAINDICATION FLAGGED
                            </span>
                            <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[10px] text-rose-300 font-mono">
                              HAZARD LEVEL 1
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-white/90">
                            <strong>Epinephrine (Vasoconstrictor)</strong> + <strong>Propranolol (Non-Selective Beta-Blocker)</strong>
                          </p>
                          <p className="mt-1 text-[11px] text-rose-200/80 leading-normal">
                            Risk of severe peripheral vasoconstriction resulting in acute hypertensive crisis and concomitant bradycardia.
                          </p>
                          <div className="mt-2.5 rounded-lg bg-black/40 p-2 text-[11px] text-emerald-300">
                            <strong>AI Clinical Directive:</strong> Replace with 3% Mepivacaine Plain (without epinephrine). Titrate dose based on renal clearance.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Audit Seal & Verification Bar */}
                    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-[11px] font-mono text-white/60">
                      <div className="flex items-center gap-2">
                        <Lock className="h-3 w-3 text-cyan-400" />
                        <span>SHA-256: e3b0c44298fc1c14...</span>
                      </div>
                      <span className="text-emerald-400 font-sans">Timestamped (IST) &bull; Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 CORE CAPABILITIES CARDS */}
        <section className="relative mx-auto max-w-7xl px-5 py-12 md:px-8">
          <div className="mb-10 text-center">
            <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Engineered for Clinical Precision & Governance
            </h3>
            <p className="mt-2 text-sm text-white/60 sm:text-base">
              Explore the four core operational pillars powering the Smile Clinic CDS engine.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-lg transition duration-300 hover:border-cyan-500/30 hover:bg-white/[0.04]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <Scan className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Intelligent Regimen OCR</h4>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Upload multi-page PDF slips, camera photos, or scans. Extracts drug names, dosages, routes, and prescriber details with zero manual entry.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-lg transition duration-300 hover:border-cyan-500/30 hover:bg-white/[0.04]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Activity className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Clinical Interaction CDS</h4>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Evaluates Contraindicated, Major, and Moderate hazards. Safeguards dental-sensitive risks: local anesthetic vasoconstrictors and anticoagulants.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-lg transition duration-300 hover:border-cyan-500/30 hover:bg-white/[0.04]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <MailCheck className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Certified Alerts Memo</h4>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Instantly generates clinical directive memos with safer alternatives, sending certified 2-page verification PDFs directly to the prescribing doctor.
              </p>
            </div>

            {/* Card 4 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-lg transition duration-300 hover:border-cyan-500/30 hover:bg-white/[0.04]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Smartphone className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Cross-Device Sync & Audit</h4>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Real-time syncing across phones, tablets, and desktop workstations with an immutable, IST-timestamped HIPAA audit trail.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="relative mx-auto max-w-7xl px-5 pt-8 md:px-8">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-950/40 via-black to-blue-950/40 p-8 text-center sm:p-12">
            <h3 className="text-2xl font-bold text-white sm:text-4xl">
              Ready to explore Smile Clinic or custom AI Automation?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
              Try the live Smile Clinic Clinical Decision Support portal now, or consult with the PropNex AI engineering team for custom enterprise automation.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href={CDS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
              >
                <span>Launch Smile Clinic Portal</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <Link
                to="/live-demo"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Book an AI Consultation
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* DETAILED PROJECT POPUP MODAL (OPENED BY "VIEW INFO") */}
      {infoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
            onClick={() => setInfoModalOpen(false)}
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
                    Smile Clinic — Complete Project Specification
                  </h3>
                  <p className="text-xs text-white/60 sm:text-sm">
                    AI Clinical Decision Support (CDS) & Prescription Safety Governance
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
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
                  <div className="border-l-2 border-cyan-400 pl-3">
                    <h5 className="font-semibold text-white">Intelligent Regimen Extraction (OCR & AI):</h5>
                    <p className="mt-1 text-xs text-white/70">
                      Upload multi-page PDF prescription slips, camera photos, or scans. Extracts drug names, dosages, frequencies, routes, and prescriber details via AI with zero manual data entry.
                    </p>
                  </div>

                  <div className="border-l-2 border-purple-400 pl-3">
                    <h5 className="font-semibold text-white">Clinical Decision Support (CDS) & Interaction Screening:</h5>
                    <p className="mt-1 text-xs text-white/70">
                      Evaluates combinations for Contraindicated, Major, and Moderate hazards. Specifically safeguards dental-sensitive risks: local anesthetic vasoconstrictors (epinephrine interactions with tricyclic antidepressants/beta-blockers), bleeding risks (anticoagulants), and renal/hepatic dose titration.
                    </p>
                  </div>

                  <div className="border-l-2 border-blue-400 pl-3">
                    <h5 className="font-semibold text-white">Dynamic Knowledge Base & Rules Governance:</h5>
                    <p className="mt-1 text-xs text-white/70">
                      Clinicians can select prior patient histories or clinical guideline PDFs to dynamically build and enforce customized safety profiles across safety checks.
                    </p>
                  </div>

                  <div className="border-l-2 border-amber-400 pl-3">
                    <h5 className="font-semibold text-white">Physician Consultation & Medication Change Alerts:</h5>
                    <p className="mt-1 text-xs text-white/70">
                      When an interaction is detected, clinicians can directly notify the prescribing physician from within the app. Automatically generates a clinical directive memo proposing safer therapeutic alternatives.
                    </p>
                    <p className="mt-1.5 text-xs text-white/70">
                      Dispatches a secure transactional notice to the prescribing doctor containing:
                    </p>
                    <ul className="mt-1 list-disc pl-5 text-xs text-white/60 space-y-0.5">
                      <li>The 2-page certified CDS Verification Report PDF (with cryptographic SHA-256 notary seal).</li>
                      <li>The original uploaded prescription document.</li>
                      <li>An automated confirmation copy sent to the attending dentist with direct contact numbers.</li>
                    </ul>
                  </div>

                  <div className="border-l-2 border-emerald-400 pl-3">
                    <h5 className="font-semibold text-white">Real-Time Cross-Device Synchronization:</h5>
                    <p className="mt-1 text-xs text-white/70">
                      Full real-time synchronization across phones, tablets, and desktop workstations backed by cloud PostgreSQL and WebSockets/REST APIs. Prescribing doctor contact directories autofill automatically across all devices once an alert is dispatched, with instantaneous offline-to-online reconciliation and zero-downtime cache revalidation.
                    </p>
                  </div>

                  <div className="border-l-2 border-rose-400 pl-3">
                    <h5 className="font-semibold text-white">Regulatory Compliance & HIPAA Audit Trails:</h5>
                    <p className="mt-1 text-xs text-white/70">
                      Every safety check, clinician override, and email dispatch is timestamped in Indian Standard Time (IST) and logged into an immutable digital audit registry.
                    </p>
                  </div>
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
                    href={CDS_URL}
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
                onClick={() => setInfoModalOpen(false)}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Close
              </button>
              <a
                href={CDS_URL}
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
