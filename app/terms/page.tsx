import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/public/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Aurex terms of service template.",
};

const sections: LegalSection[] = [
  {
    title: "1. Agreement to the terms",
    paragraphs: [
      "These terms describe the rules for accessing and using Aurex. They are placeholder product copy and must be reviewed and completed by qualified legal counsel before the service is offered to customers.",
    ],
  },
  {
    title: "2. Account eligibility and responsibility",
    paragraphs: [
      "Users must provide accurate account information and be authorized to act for the business they represent. Each business is responsible for its users, credentials, permissions, devices, and activity performed through its workspace.",
    ],
  },
  {
    title: "3. Acceptable use",
    paragraphs: [
      "Aurex may not be used for unlawful, fraudulent, abusive, or deceptive activity. Users must not attempt to bypass access controls, disrupt the service, introduce malicious code, or access information they are not authorized to view.",
    ],
  },
  {
    title: "4. Payment and subscription terms",
    paragraphs: [
      "Paid plans may renew automatically according to the selected billing cycle unless cancelled. Pricing, taxes, processing charges, refund rules, and any plan-specific limits should be presented before purchase and incorporated into the final agreement.",
    ],
  },
  {
    title: "5. Customer data",
    paragraphs: [
      "Businesses retain their rights in data submitted to Aurex. They grant Aurex the limited rights necessary to host, process, transmit, and display that data for operating and supporting the service.",
    ],
  },
  {
    title: "6. Service availability and changes",
    paragraphs: [
      "We aim to provide a reliable service but do not guarantee uninterrupted availability. Features may be improved, replaced, or discontinued, and reasonable notice should be provided when a material change affects customer use.",
    ],
  },
  {
    title: "7. Suspension and termination",
    paragraphs: [
      "Access may be suspended or terminated where required to protect users, comply with law, address non-payment, or respond to a material breach of these terms. Data export and deletion rules should be defined in the final customer agreement.",
    ],
  },
  {
    title: "8. Disclaimers and liability",
    paragraphs: [
      "The final terms should include legally appropriate warranty disclaimers, liability limits, indemnity obligations, governing law, and dispute procedures for the jurisdictions where Aurex operates.",
    ],
  },
  {
    title: "9. Contact",
    paragraphs: [
      "Questions about these terms can be submitted through the Aurex contact page. The final document should identify the contracting legal entity and its registered contact details.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      description="The conditions that govern account access and use of the Aurex business payments platform."
      sections={sections}
    />
  );
}
