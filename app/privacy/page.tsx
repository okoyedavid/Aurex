import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/public/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Aurex privacy policy template.",
};

const sections: LegalSection[] = [
  {
    title: "1. Scope of this policy",
    paragraphs: [
      "This policy explains the types of information Aurex may process when people visit our public website, create an account, or use our business payments software. It is a product-ready placeholder and should be reviewed by qualified legal counsel before launch.",
    ],
  },
  {
    title: "2. Information we collect",
    paragraphs: [
      "We may collect account information such as names, business email addresses, company details, authentication records, and workspace preferences.",
      "When the service is used, we may also process transaction references, invoice and settlement records, support messages, device information, and activity logs required to operate and secure the product.",
    ],
  },
  {
    title: "3. How information is used",
    paragraphs: [
      "Information may be used to provide the service, authenticate users, maintain payment and reconciliation workflows, respond to support requests, improve product reliability, and detect misuse or suspicious activity.",
    ],
  },
  {
    title: "4. Sharing and service providers",
    paragraphs: [
      "Aurex may use vetted infrastructure, analytics, communications, identity, and payment service providers. Information should only be shared to the extent needed for those providers to perform contracted services or where disclosure is required by law.",
    ],
  },
  {
    title: "5. Data security and retention",
    paragraphs: [
      "We use administrative, technical, and organizational safeguards appropriate to the sensitivity of the information processed. No system can guarantee absolute security.",
      "Information should be retained only for as long as necessary to provide the service, satisfy legal obligations, resolve disputes, and enforce agreements.",
    ],
  },
  {
    title: "6. Your choices and rights",
    paragraphs: [
      "Depending on location, individuals may have rights to access, correct, delete, restrict, or export certain personal information. Requests can be submitted through the contact page and may require identity verification.",
    ],
  },
  {
    title: "7. Contact",
    paragraphs: [
      "Questions about this policy or Aurex privacy practices can be submitted through our contact page. Appropriate legal entity details and a privacy contact address should be added before production use.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      description="A clear overview of how information may be collected, used, protected, and retained when using Aurex."
      sections={sections}
    />
  );
}
