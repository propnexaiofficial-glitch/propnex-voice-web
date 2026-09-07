"use client";

import PageShell, { PageHero } from "@/features/landing/components/PageShell";

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHero
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your data."
        eyebrow=""
        image=""
      >
        {null}
      </PageHero>
      <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
        <div className="prose prose-invert max-w-none text-slate-300">
          <p className="mb-8"><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to PropNex AI. We respect your privacy and are committed to protecting your personal data.
            This privacy policy will inform you as to how we look after your personal data when you visit our website
            and tell you about your privacy rights and how the law protects you.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. The Data We Collect About You</h2>
          <p className="mb-4">
            Personal data, or personal information, means any information about an individual from which that person
            can be identified. We may collect, use, store and transfer different kinds of personal data about you which
            we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
            <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. How We Use Your Personal Data</h2>
          <p className="mb-4">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Data Security</h2>
          <p className="mb-4">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Your Legal Rights</h2>
          <p className="mb-4">
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
          </p>
          
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this privacy policy or our privacy practices, please contact us at support@propnex-technology.com.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
