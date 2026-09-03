import {
  ArrowDown,
  BadgeCheck,
  Boxes,
  Braces,
  Check,
  Database,
  GitCompareArrows,
  ListFilter,
  RefreshCcw,
  Route,
  ShieldQuestion,
  UserRoundCheck,
  X,
} from "lucide-react";

const facts = ["department", "employee type", "state", "tenure", "groups"];

export function WarpNarrative() {
  return (
    <>
      <section
        id="problem"
        className="scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <SectionLead
            eyebrow="01 · Context"
            title="Access changes faster than roles do."
            description="A role says what someone can do. It rarely captures every business fact that changes what they should receive."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            <article
              data-reveal
              className="rounded-md border border-border bg-card p-7 sm:p-9"
            >
              <div className="flex items-center gap-3">
                <Boxes className="size-5 text-primary" />
                <h3 className="text-xl font-semibold">
                  RBAC grants capability
                </h3>
              </div>
              <p className="mt-4 leading-7 text-muted-foreground">
                Roles remain the stable answer to “what actions may this person
                perform?” They are intentionally coarse.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {["Owner", "Admin", "Approver", "Viewer"].map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            </article>
            <article
              data-reveal
              className="rounded-md border border-primary/25 bg-primary/10 p-7 sm:p-9"
            >
              <div className="flex items-center gap-3">
                <ListFilter className="size-5 text-primary" />
                <h3 className="text-xl font-semibold">
                  ABAC resolves entitlement
                </h3>
              </div>
              <p className="mt-4 leading-7 text-muted-foreground">
                Warp evaluates changing employee attributes to answer “which
                policy applies right now?” without creating a role for every
                combination.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {facts.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            </article>
          </div>
          <div
            data-reveal
            className="mt-5 rounded-md bg-inverse p-7 text-inverse-foreground sm:p-9"
          >
            <p className="font-mono text-xs uppercase tracking-[.18em] text-primary">
              The design boundary
            </p>
            <p className="mt-4 max-w-4xl text-2xl font-medium leading-9 tracking-[-.025em]">
              RBAC controls product actions. Warp’s attribute-based policy layer
              determines business entitlements. Neither model is stretched into
              doing the other’s job.
            </p>
          </div>
        </div>
      </section>

      <section
        id="resolution"
        className="scroll-mt-20 border-y border-border bg-card px-5 py-24 sm:px-8 sm:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <SectionLead
            eyebrow="02 · Resolution"
            title="From facts to a defensible answer."
            description="The resolver turns mutable employee data into a stable, inspectable result through five explicit stages."
          />
          <div className="mt-16 grid gap-4 lg:grid-cols-5">
            {[
              [
                "1",
                "Read facts",
                "Snapshot employee attributes at evaluation time.",
              ],
              [
                "2",
                "Match rules",
                "Evaluate every condition without hidden defaults.",
              ],
              [
                "3",
                "Order",
                "Sort matches by priority with deterministic tie-breaks.",
              ],
              ["4", "Constrain", "Apply each category’s ONE or MANY contract."],
              [
                "5",
                "Explain",
                "Return winners, candidates, and suppression reasons.",
              ],
            ].map(([number, title, copy], index) => (
              <article
                key={title}
                data-reveal
                className="relative rounded-md border border-border bg-muted/40 p-5"
              >
                {index < 4 && (
                  <ArrowDown className="absolute -bottom-3 left-1/2 z-10 size-6 rounded-full border bg-card p-1 text-primary lg:-right-3 lg:bottom-auto lg:left-auto lg:top-7 lg:-rotate-90" />
                )}
                <span className="font-mono text-xs text-primary">
                  0{number}
                </span>
                <h3 className="mt-8 font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-20 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <article
              data-reveal
              className="rounded-md border border-border p-7 sm:p-9"
            >
              <p className="font-mono text-xs uppercase tracking-[.18em] text-primary">
                Cardinality is a category invariant
              </p>
              <div className="mt-8 space-y-4">
                <CardinalityRow
                  title="Vacation · ONE"
                  description="Many policies may match; the highest-priority winner is selected."
                  selected="Enhanced Vacation"
                  suppressed="Standard Vacation"
                />
                <CardinalityRow
                  title="Application Access · MANY"
                  description="Every eligible application policy can be assigned together."
                  selected="GitHub + Datadog + Linear"
                />
                <CardinalityRow
                  title="Equipment · capped set"
                  description="Design-space example: a future max-2 constraint would keep the two strongest matches. The current API intentionally ships ONE/MANY."
                  selected="Laptop + Monitor"
                  suppressed="Phone stipend"
                />
              </div>
            </article>
            <article
              data-reveal
              className="rounded-md bg-warm-surface p-7 text-warm-surface-foreground sm:p-9"
            >
              <p className="font-mono text-xs uppercase tracking-[.18em]">
                Deterministic ordering
              </p>
              <ol className="mt-8 space-y-5">
                <OrderItem
                  number="01"
                  title="Rule priority"
                  copy="Higher priority is evaluated first."
                />
                <OrderItem
                  number="02"
                  title="Policy identifier"
                  copy="Stable ascending ID breaks equal policy priorities."
                />
                <OrderItem
                  number="03"
                  title="Rule identifier"
                  copy="Stable ascending ID resolves the final tie."
                />
              </ol>
              <div className="mt-8 rounded-md border border-current/20 bg-card/60 p-5 font-mono text-xs leading-6">
                same input + same policy state
                <br />= same output, every time
              </div>
            </article>
          </div>

          <div className="mt-20 grid gap-5 lg:grid-cols-2">
            <article
              data-reveal
              className="rounded-md border border-border bg-inverse p-7 text-inverse-foreground sm:p-9"
            >
              <div className="flex items-center gap-3">
                <Braces className="size-5 text-primary" />
                <h3 className="text-xl font-semibold">
                  Rules are data, not branches
                </h3>
              </div>
              <pre className="mt-7 overflow-x-auto rounded-md bg-inverse-foreground/5 p-5 font-mono text-xs leading-7 text-inverse-foreground">
                <code>{`IF department equals "Engineering"\nAND employeeType equals "Full-time"\nTHEN candidate = "Enhanced Vacation"\nPRIORITY 100`}</code>
              </pre>
              <p className="mt-5 text-sm leading-6 text-inverse-foreground/65">
                Adding a business rule does not require shipping another nested
                conditional through the application.
              </p>
            </article>
            <article
              data-reveal
              className="rounded-md border border-destructive/25 bg-destructive/10 p-7 sm:p-9"
            >
              <div className="flex items-center gap-3">
                <ShieldQuestion className="size-5 text-destructive" />
                <h3 className="text-xl font-semibold">
                  Negative paths stay visible
                </h3>
              </div>
              <p className="mt-5 text-lg font-medium">
                Why did Priya not receive the benefit?
              </p>
              <div className="mt-6 space-y-3">
                <Condition passed label="department equals Engineering" />
                <Condition
                  passed={false}
                  label="tenureMonths greater than or equal to 12"
                />
              </div>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">
                The explanation preserves the actual value, expected value, and
                failed operator—not just a generic “ineligible” result.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionLead
            eyebrow="03 · Reconciliation"
            title="Correct now, and correct after change."
            description="An assignment engine also needs a reliable path from business events to a converged employee-policy state."
          />
          <div
            data-reveal
            className="mt-14 overflow-hidden rounded-md border border-border bg-card p-6 sm:p-10"
          >
            <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <FlowNode
                icon={<GitCompareArrows />}
                title="Business event"
                copy="Employee or policy changes"
              />
              <FlowArrow />
              <FlowNode
                icon={<RefreshCcw />}
                title="BullMQ worker"
                copy="Retryable reconciliation job"
              />
              <FlowArrow />
              <FlowNode
                icon={<BadgeCheck />}
                title="Converged state"
                copy="Assignments + audit evidence"
              />
            </div>
            <div className="mt-8 grid gap-3 border-t border-border pt-7 text-sm text-muted-foreground sm:grid-cols-3">
              <p>
                <strong className="block text-foreground">Idempotent</strong>
                Repeated jobs produce the same assignment set.
              </p>
              <p>
                <strong className="block text-foreground">Retryable</strong>
                Transient failure does not lose the requested change.
              </p>
              <p>
                <strong className="block text-foreground">Observable</strong>Each
                decision can be traced after reconciliation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function WarpArchitecture() {
  return (
    <section
      id="architecture"
      className="scroll-mt-20 border-t border-border bg-card px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <SectionLead
          eyebrow="05 · Architecture"
          title="A narrow public window into the real system."
          description="The demo uses read-only routes and the same resolver outputs the authenticated product consumes"
        />
        <div
          data-reveal
          className="mt-14 rounded-md border border-border bg-muted/40 p-6 sm:p-10"
        >
          <svg
            className="h-16 w-full text-primary"
            viewBox="0 0 1000 70"
            fill="none"
            aria-hidden="true"
          >
            <path
              data-draw
              d="M80 35H920"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="m910 25 12 10-12 10"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <div className="grid gap-3 md:grid-cols-5">
            <ArchitectureNode
              icon={<Route />}
              title="Public route"
              copy="Next.js case study"
            />
            <ArchitectureNode
              icon={<Braces />}
              title="Demo API"
              copy="Read-only DTOs"
            />
            <ArchitectureNode
              icon={<UserRoundCheck />}
              title="Resolver"
              copy="Rules + priority"
            />
            <ArchitectureNode
              icon={<Database />}
              title="Persistence"
              copy="Policies + audit"
            />
            <ArchitectureNode
              icon={<RefreshCcw />}
              title="Queue"
              copy="Reconciliation"
            />
          </div>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <Decision
            title="Why a dedicated demo API"
            copy="It keeps the public contract small, strips mutation capability, and prevents the case study from depending on an authenticated session."
          />
          <Decision
            title="Why explanations are first-class"
            copy="A selected policy without its candidates and condition outcomes is difficult to review, debug, or trust."
          />
          <Decision
            title="What v1 does not claim"
            copy="It is a seeded, read-only scenario. The shipped cardinality model is ONE or MANY; configurable numeric caps remain a possible extension."
          />
        </div>
      </div>
    </section>
  );
}

function SectionLead({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div data-reveal className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
      <p className="font-mono text-xs uppercase tracking-[.2em] text-primary">
        {eyebrow}
      </p>
      <div>
        <h2 className="text-balance text-4xl font-semibold tracking-[-.045em] sm:text-5xl">
          {title}
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-card/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide">
      {children}
    </span>
  );
}
function Condition({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-card/70 p-3 text-sm">
      {passed ? (
        <Check className="size-4 text-primary" />
      ) : (
        <X className="size-4 text-destructive" />
      )}
      <span>{label}</span>
    </div>
  );
}
function OrderItem({
  number,
  title,
  copy,
}: {
  number: string;
  title: string;
  copy: string;
}) {
  return (
    <li className="grid grid-cols-[2.5rem_1fr] gap-3">
      <span className="font-mono text-xs">{number}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm opacity-80">{copy}</p>
      </div>
    </li>
  );
}
function CardinalityRow({
  title,
  description,
  selected,
  suppressed,
}: {
  title: string;
  description: string;
  selected: string;
  suppressed?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold">{title}</h4>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase text-primary">
          selected · {selected}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      {suppressed && (
        <p className="mt-3 text-xs text-muted-foreground">Suppressed: {suppressed}</p>
      )}
    </div>
  );
}
function FlowNode({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-md bg-muted p-5">
      <div className="mb-5 text-primary [&>svg]:size-5">{icon}</div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
    </div>
  );
}
function FlowArrow() {
  return <ArrowDown className="mx-auto size-5 text-primary md:-rotate-90" />;
}
function ArchitectureNode({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="text-primary [&>svg]:size-4">{icon}</div>
      <p className="mt-5 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{copy}</p>
    </div>
  );
}
function Decision({ title, copy }: { title: string; copy: string }) {
  return (
    <article data-reveal className="rounded-md border border-border p-6">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
    </article>
  );
}
