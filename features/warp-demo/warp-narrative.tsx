import {
  BadgeCheck,
  Boxes,
  Braces,
  Database,
  GitCompareArrows,
  ListFilter,
  RefreshCcw,
  Route,
  UserRoundCheck,
} from "lucide-react";

import {
  ArchitectureNode,
  CardinalityRow,
  Decision,
  FlowArrow,
  FlowNode,
  OrderItem,
  SectionLead,
  Tag,
} from "./components/narrative-primitives";
import { WalkthroughVideo } from "./components/walkthrough-video";

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
            title="How resolution stays deterministic"
            description="Aurex separates eligibility from conflict resolution. Rules determine what matches, category cardinality determines how many results may survive, and deterministic ordering resolves conflicts when only one result may apply."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <article data-reveal className="rounded-md border border-border p-7 sm:p-9">
              <p className="font-mono text-xs uppercase tracking-[.18em] text-primary">Cardinality</p>
              <div className="mt-7 space-y-4">
                <CardinalityRow
                  title="ONE"
                  description="Several policies may match, but only one effective policy survives resolution."
                  selected="one effective result"
                />
                <CardinalityRow
                  title="MANY"
                  description="Multiple eligible policies may remain effective together."
                  selected="multiple results"
                />
              </div>
            </article>
            <article data-reveal className="rounded-md bg-warm-surface p-7 text-warm-surface-foreground sm:p-9">
              <p className="font-mono text-xs uppercase tracking-[.18em]">Deterministic ordering</p>
              <ol className="mt-7 space-y-5">
                <OrderItem number="01" title="Rule priority" copy="Explicit priority participates in conflict resolution." />
                <OrderItem number="02" title="Policy identifier" copy="A stable identifier breaks equal policy priorities." />
                <OrderItem number="03" title="Rule identifier" copy="A stable identifier resolves the final tie." />
              </ol>
              <p className="mt-7 rounded-md border border-current/20 bg-card/60 p-4 text-sm leading-6">Stable tie-breakers ensure the same inputs produce the same result.</p>
            </article>
          </div>
          <p data-reveal className="mt-6 flex items-start gap-3 text-sm text-muted-foreground">
            <Braces className="mt-0.5 size-4 shrink-0 text-primary" />
            <span><strong className="text-foreground">Rules are stored as business data</strong> and evaluated by the resolver rather than represented as application-level conditional branches.</span>
          </p>
        </div>
      </section>

      <section id="reconciliation" className="scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
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
                title="Reconciliation job"
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

export function WarpEnforcementProof() {
  return (
    <section id="enforcement" className="scroll-mt-20 border-y border-border bg-inverse px-5 py-24 text-inverse-foreground sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionLead
          eyebrow="PRODUCT WALKTHROUGH"
          title="See Aurex used end to end."
          description="The sandbox focuses on the policy engine itself. This walkthrough shows how those capabilities fit into the broader Aurex business dashboard—from employees and organizational data through policies, reconciliation and external access."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <div data-reveal className="overflow-hidden rounded-md border border-inverse-foreground/15 bg-inverse-foreground/5">
            <WalkthroughVideo />
          </div>
          <aside data-reveal className="rounded-md border border-inverse-foreground/15 bg-inverse-foreground/5 p-6 sm:p-7">
            <p className="font-mono text-xs uppercase tracking-[.18em] text-primary">Chapters</p>
            <ol className="mt-6 space-y-4">{["Business & employees", "Organizational structure", "Policies & rules", "Reconciliation", "GitHub access & audit"].map((chapter, index) => <li key={chapter} className="flex gap-4 border-b border-inverse-foreground/10 pb-4 last:border-0 last:pb-0"><span className="font-mono text-xs text-primary">0{index + 1}</span><span className="text-sm">{chapter}</span></li>)}</ol>
            <p className="mt-8 border-t border-inverse-foreground/10 pt-5 text-xs text-inverse-foreground/55">Walkthrough narrated by David Okoye</p>
          </aside>
        </div>
      </div>
    </section>
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
          eyebrow="06 · Architecture"
          title="See how Aurex works."
          description="The demo lets you try policy changes in a safe session. Sign up to explore the broader employee, role and policy workspace."
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
              title="Demo page"
              copy="Try it without an account"
            />
            <ArchitectureNode
              icon={<Braces />}
              title="Demo service"
              copy="Session-based changes"
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
          copy="It keeps the public contract small while allowing only the four controlled Maya scenario changes."
          />
          <Decision
            title="Why explanations are first-class"
            copy="A selected policy without its candidates and condition outcomes is difficult to review, debug, or trust."
          />
          <Decision
            title="Full workspace"
          copy="Sign up to use the wider Aurex business dashboard."
          />
        </div>
      </div>
    </section>
  );
}
