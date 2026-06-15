import { PageHero } from "@/components/public/page-hero";

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export function LegalPage({
  eyebrow,
  title,
  description,
  sections,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: LegalSection[];
}) {
  return (
    <main>
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      <article className="bg-background px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="border-b border-border pb-6 text-sm text-muted-foreground">
            Effective date: June 15, 2026
          </p>
          <div className="mt-10 space-y-12">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-bold text-foreground">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm leading-7 text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
