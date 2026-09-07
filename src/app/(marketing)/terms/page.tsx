"use client";

import PageShell, { PageHero } from "@/features/landing/components/PageShell";

export default function TermsPage() {
  return (
    <PageShell>
      <PageHero
        title="Terms of Service"
        subtitle="The rules that govern our relationship with you."
        eyebrow=""
        image=""
      >
        {null}
      </PageHero>
      <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
        <div className="prose prose-invert max-w-none text-slate-300">
          <p className="mb-8"><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Agreement to Terms</h2>
          <p className="mb-4">
            By accessing or using PropNex AI&apos;s website, products, APIs, and services (collectively, the &quot;Services&quot;),
            you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Services.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Description of Service</h2>
          <p className="mb-4">
            PropNex AI provides an artificial intelligence voice agent platform that enables businesses to automate inbound and outbound phone calls. This includes telephony infrastructure, voice cloning, and AI conversation management tools.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. User Obligations</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>You agree to use the Services only for lawful purposes.</li>
            <li>You are responsible for safeguarding the password and API keys that you use to access the Services.</li>
            <li>You agree not to disclose your password or API keys to any third party.</li>
            <li>You must ensure that any automated calls made using our platform comply with all relevant local and international laws, including but not limited to the TCPA in the United States or equivalent telemarketing regulations in your jurisdiction.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Intellectual Property Rights</h2>
          <p className="mb-4">
            The Services and their original content, features, and functionality are and will remain the exclusive property of PropNex Technology and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of PropNex Technology.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account and bar access to the Services immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Limitation of Liability</h2>
          <p className="mb-4">
            In no event shall PropNex Technology, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Services.
          </p>
          
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at support@propnex-technology.com.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
