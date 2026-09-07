import {
  ArrowDown,
  ArrowRight,
  Check,
  ExternalLink,
  Layers3,
  Mail,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { GitHubIcon } from "@/components/icons/github-icon";

const stages = [
  {
    number: "01",
    title: "It started with business payments",
    body: "Aurex originally started as a business payments platform. The goal was to build the surrounding infrastructure for businesses, employees, permissions and financial operations.",
    detail:
      "Progress on the payment layer eventually became constrained by payment providers requiring business verification documents. Those requirements made sense for a production financial product, but were unnecessary for a personal engineering project that was not intended to process real customer funds. Development shifted toward the infrastructure Aurex could meaningfully demonstrate: authentication, role-based access control, permissions, queues and background workers.",
    tags: ["RBAC", "Permissions", "Queues", "Workers"],
  },
  {
    number: "02",
    title: "A real codebase became the constraint",
    body: "When I encountered the assignment, Aurex already had businesses, employees, members, departments, permissions, queues and workers.",
    detail:
      "Rather than create an isolated policy-engine project, I implemented the design inside that existing application. Employees already represented business records, authentication already had its own membership model, and new policy attributes needed to coexist with the existing application. This made the exercise closer to extending an existing codebase than designing an ideal schema from scratch.",
    emphasis:
      "The policy engine had to adapt to Aurex. Aurex was not rebuilt around the policy engine.",
  },
  {
    number: "03",
    title: "Employees could no longer be just rows of data",
    body: "Originally, an employee in Aurex was primarily a business record. Introducing organizational policies created a more complicated requirement: an employee needed to remain usable as business data without necessarily becoming an authenticated Aurex user.",
    detail:
      "The model now supports both an organizational employee record and an optional bridge to an authenticated business member.",
    diagram: ["User Account", "Employee", "Business / Department"],
    bullets: [
      "Create and manage an employee as an organizational record.",
      "Link an existing employee to an Aurex user account.",
      "Allow that linked user to become a member of the business.",
      "Keep department membership without losing employee identity.",
    ],
  },
  {
    number: "04",
    title: "Employees needed policy context",
    body: "Policies cannot be evaluated from a name and department alone. The employee model was extended with organizational context that the resolver can evaluate.",
    detail:
      "Joined date allows tenure to be derived rather than stored as a manually maintained value. Together, these attributes became inputs to policy matching.",
    chips: [
      "Department = Engineering",
      "State = California",
      "Tenure ≥ 12 months",
      "Group = Remote",
    ],
  },
  {
    number: "05",
    title: "Categories introduced cardinality",
    body: "Policies belong to categories, and categories determine how matching policies within that domain are resolved. A category can allow either one effective policy or many.",
    detail:
      "With MANY cardinality, multiple matching policies may apply. With ONE cardinality, Aurex resolves those candidates into a single effective result. Manual assignments take precedence over automatically matched policies, while automatic conflicts use rule priority and deterministic tie-breaking.",
    cardinality: true,
  },
  {
    number: "06",
    title: "Policies, rules and priority",
    body: "Policies define the outcome that may apply to an employee, while rules describe the employee conditions that make a policy eligible.",
    detail:
      "Rules can evaluate department, employee type, groups, state and tenure-related information. When more than one rule or policy can apply, Aurex uses explicit rule priority and deterministic ordering during resolution so the result does not depend on whichever record happened to be processed first.",
    flow: [
      "Employee context",
      "Rule evaluation",
      "Matching policies",
      "Resolution",
    ],
  },
  {
    number: "07",
    title: "Making decisions explainable",
    body: "A policy engine also needs to make its decisions understandable. Aurex records policy activity and exposes it through an audit history.",
    detail:
      "The interface represents policy history as a timeline so changes can be understood chronologically. Organizational permissions were extended alongside the policy work so that policy-management capabilities can remain scoped to the appropriate business roles.",
    icon: "audit",
  },
  {
    number: "08",
    title: "From assignment to external access",
    body: "At this point Aurex could determine which policies should apply. I wanted to explore the next step as well: what happens when a policy decision needs to affect another system?",
    detail:
      "External enforcement is an extension of the assignment, not something Warp explicitly required. For this project I used GitHub as the first enforcement target. A business can install the Aurex GitHub App, map employees to GitHub identities and associate policies with configured GitHub access. When relevant assignments change, reconciliation compares the desired access represented by Aurex with the external state and performs the corresponding grant or revocation workflow.",
    enforcement: true,
  },
  {
    number: "09",
    title: "Where it can go next",
    body: "GitHub provides a concrete example because it exposes a programmable integration surface. Other systems with suitable APIs or command-line interfaces could follow a similar integration model.",
    detail:
      "One area I am interested in exploring further is controlled AI or browser-based execution for systems that do not expose convenient APIs. The policy engine would still determine the desired state; the execution mechanism would be responsible only for carrying out the authorized action.",
    next: true,
  },
] as const;

export function WarpEvolution() {
  return (
    <section
      id="evolution"
      className="scroll-mt-20 border-y border-border bg-card px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[.2em] text-primary">
            05 · Engineering journey
          </p>
          <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-.045em] sm:text-6xl">
            How Aurex Evolved
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Aurex did not start as a policy engine. It evolved into one as the
            constraints of the project changed.
          </p>
        </div>
        <div
          data-reveal
          className="mt-10 max-w-4xl rounded-md border border-primary/25 bg-primary/10 p-6 sm:p-8"
        >
          <p className="font-mono text-xs uppercase tracking-[.18em] text-primary">
            The challenge
          </p>
          <h3 className="mt-3 text-2xl font-semibold">
            An open-ended engineering problem
          </h3>
          <p className="mt-4 leading-7 text-muted-foreground">
            This work began from Warp&apos;s open-ended Policy Assignment System
            engineering problem. The problem asks for a system capable of
            defining employee assignment rules, deterministically resolving
            applicable policies while respecting cardinality, and reconciling
            assignments as employee or rule inputs change.
          </p>
          <p className="mt-3 leading-7 text-muted-foreground">
            The submission format is deliberately broad and can be expressed
            through system design, diagrams, schemas, example code, repositories
            or written analysis. I chose to implement the system inside Aurex
            rather than approach it only as a theoretical design.
          </p>
          <a
            href="https://www.warp.co/eng/problems/assignments"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View the original Warp assignment{" "}
            <ExternalLink className="size-3.5" />
          </a>
        </div>

        <div className="relative mt-16 space-y-8 before:absolute before:bottom-8 before:left-[1.05rem] before:top-8 before:w-px before:bg-border sm:space-y-10 sm:before:left-[1.35rem]">
          {stages.map((stage) => (
            <EvolutionStage key={stage.number} stage={stage} />
          ))}
        </div>

        <BuilderCard />
      </div>
    </section>
  );
}

function EvolutionStage({ stage }: { stage: (typeof stages)[number] }) {
  return (
    <article
      data-reveal
      className="relative grid gap-5 pl-12 sm:grid-cols-[3.5rem_1fr] sm:gap-8 sm:pl-0"
    >
      <div className="absolute left-0 top-0 grid size-[2.15rem] place-items-center rounded-full border border-primary/30 bg-background font-mono text-[10px] font-semibold text-primary sm:static sm:size-[2.7rem]">
        {stage.number}
      </div>
      <div className="rounded-md border border-border bg-background p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary">
              Stage {stage.number}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">
              {stage.title}
            </h3>
          </div>
          {"icon" in stage && stage.icon === "audit" ? (
            <Layers3 className="size-5 text-primary" />
          ) : null}
        </div>
        <p className="mt-5 max-w-4xl text-base leading-7">{stage.body}</p>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
          {stage.detail}
        </p>
        {"emphasis" in stage && stage.emphasis ? (
          <p className="mt-6 rounded-md bg-inverse p-5 text-lg font-medium leading-8 text-inverse-foreground">
            {stage.emphasis}
          </p>
        ) : null}
        {"tags" in stage && stage.tags ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {stage.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        {"bullets" in stage && stage.bullets ? (
          <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {stage.bullets.map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        {"diagram" in stage && stage.diagram ? (
          <div className="mt-7 flex max-w-md flex-col items-start gap-2 font-mono text-xs">
            {stage.diagram.map((item, index) => (
              <div key={item} className="flex flex-col items-start gap-2">
                <span className="rounded-md border border-border bg-card px-3 py-2">
                  {item}
                </span>
                {index < stage.diagram.length - 1 ? (
                  <ArrowDown className="ml-4 size-3 text-primary" />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        {"chips" in stage && stage.chips ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {stage.chips.map((chip) => (
              <span
                key={chip}
                className="rounded-md bg-primary/10 px-3 py-2 font-mono text-[10px] text-primary"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
        {"cardinality" in stage && stage.cardinality ? (
          <CardinalityDiagram />
        ) : null}
        {"flow" in stage && stage.flow ? (
          <div className="mt-7 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground">
            {stage.flow.map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                <span className="rounded-md border border-border bg-card px-2.5 py-2">
                  {item}
                </span>
                {index < stage.flow.length - 1 ? (
                  <ArrowRight className="size-3 text-primary" />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        {"enforcement" in stage && stage.enforcement ? (
          <EnforcementFlow />
        ) : null}
        {"next" in stage && stage.next ? <NextFlow /> : null}
      </div>
    </article>
  );
}

function CardinalityDiagram() {
  return (
    <div className="mt-7 grid gap-4 sm:grid-cols-2">
      <div className="rounded-md border border-border bg-card p-4">
        <p className="font-mono text-[10px] uppercase text-primary">
          Cardinality: Many
        </p>
        <p className="mt-3 text-sm font-medium">Employee matches</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Vacation A · Vacation B · Vacation C
        </p>
        <p className="mt-4 border-t border-border pt-3 text-sm">
          All applicable policies may remain active.
        </p>
      </div>
      <div className="rounded-md border border-primary/25 bg-primary/10 p-4">
        <p className="font-mono text-[10px] uppercase text-primary">
          Cardinality: One
        </p>
        <p className="mt-3 text-sm font-medium">Employee matches</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Vacation A — 30 · Vacation B — 80 · Vacation C — 50
        </p>
        <p className="mt-4 border-t border-primary/20 pt-3 text-sm font-medium">
          Result: Vacation B
        </p>
      </div>
    </div>
  );
}

function EnforcementFlow() {
  return (
    <div className="mt-7 rounded-md bg-inverse p-5 text-inverse-foreground sm:p-6">
      <div className="flex items-center gap-2">
        <GitHubIcon className="size-5" />
        <p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary">
          First enforcement target · GitHub
        </p>
      </div>
      <div className="mt-5 grid gap-3 text-xs sm:grid-cols-5 sm:items-center">
        {[
          "Employee changes",
          "Policy reconciliation",
          "Entitlement decision",
          "GitHub access",
          "Audit event",
        ].map((item, index) => (
          <div key={item} className="flex items-center gap-3">
            <span className="rounded-md border border-inverse-foreground/15 bg-inverse-foreground/5 px-3 py-2">
              {item}
            </span>
            {index < 4 ? (
              <ArrowRight className="hidden size-3 shrink-0 text-primary sm:block" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function NextFlow() {
  return (
    <div className="mt-7 grid max-w-2xl gap-2 text-center text-xs sm:grid-cols-4 sm:items-center">
      <span className="rounded-md border border-border bg-card p-3">
        Policy Engine
      </span>
      <ArrowRight className="mx-auto size-3 text-primary sm:block" />
      <span className="rounded-md border border-border bg-card p-3">
        Desired State
      </span>
      <ArrowRight className="mx-auto size-3 text-primary sm:block" />
      <span className="rounded-md border border-border bg-card p-3">
        Integration / Agent
      </span>
      <ArrowRight className="mx-auto size-3 text-primary sm:block" />
      <span className="rounded-md border border-border bg-card p-3">
        External System
      </span>
    </div>
  );
}

function BuilderCard() {
  return (
    <>
      <div
        data-reveal
        className="mt-16 grid gap-8 rounded-md bg-inverse p-7 text-inverse-foreground sm:p-9 lg:grid-cols-[1fr_1.2fr]"
      >
        <div className="order-2 sm:order-1">
          <div className="mb-6">
            <div className="shrink-0">
              <Image
                src="/profile.png"
                alt="David Okoye"
                width={112}
                height={112}
                className="size-24 rounded-md object-cover object-center sm:size-28"
              />
            </div>
          </div>
          <p className="font-mono text-xs uppercase tracking-[.18em] text-primary">
            The builder
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Built by David Okoye
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-inverse-foreground/70">
            My name is David Okoye, a software engineer from Nigeria completing
            a Bachelor of Science degree in Computer Science.
          </p>
          <p className="mt-3 max-w-xl leading-7 text-inverse-foreground/70">
            Aurex is one of the projects through which I have been exploring
            backend architecture, authorization, asynchronous processing and
            policy-driven systems.
          </p>
          <a
            href="https://okoyedavid.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            okoyedavid.com <ExternalLink className="size-3.5" />
          </a>
        </div>
        <div className="order-1 border-b border-inverse-foreground/10 pb-7 pt-0 sm:order-2 sm:border-b-0 sm:border-t-0 sm:pb-0 sm:pt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs uppercase tracking-[.18em] text-primary">
              Source
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <SourceLink
                label="Frontend"
                href="https://github.com/okoyedavid/aurex"
              />
              <SourceLink
                label="Backend"
                href="https://github.com/okoyedavid/aurex-backend"
              />
            </div>
            <div className="mt-7 border-t border-inverse-foreground/10 pt-5">
              <p className="font-mono text-[10px] uppercase tracking-[.18em] text-inverse-foreground/50">
                Infrastructure
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Infra label="Frontend" name="Vercel" mark={<VercelMark />} />
                <Infra label="Backend" name="Render" mark={<RenderMark />} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="mt-8 rounded-md border border-border bg-background p-6 text-foreground sm:p-8">
        <div className="flex items-start gap-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-5" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              See Something I Could Improve?
            </h3>
            <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
              Aurex was built iteratively, and this policy system was my first
              time designing this kind of engine. If you notice an architectural
              decision, implementation detail, edge case or coding approach that
              could be improved, I would genuinely appreciate the feedback.
            </p>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
              If you have suggestions, corrections or would like to discuss the
              implementation, feel free to reach out.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="mailto:okoyedav7@gmail.com"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Email David <Mail className="size-4" />
              </a>
              <span className="text-sm text-muted-foreground">
                okoyedav7@gmail.com
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SourceLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-md border border-inverse-foreground/15 bg-inverse-foreground/5 p-4 transition hover:border-primary/50"
    >
      <span className="flex items-center gap-3 text-sm">
        <GitHubIcon className="size-4 text-primary" />
        {label}
      </span>
      <ExternalLink className="size-3.5 text-inverse-foreground/50" />
    </a>
  );
}
function Infra({
  label,
  name,
  mark,
}: {
  label: string;
  name: string;
  mark: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-inverse-foreground/10 p-3 text-sm">
      <span className="text-inverse-foreground/55">{label}</span>
      {mark}
      <span>{name}</span>
    </div>
  );
}
function VercelMark() {
  return (
    <span
      aria-label="Vercel"
      className="size-4"
      style={{
        clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
        background: "currentColor",
      }}
    />
  );
}
function RenderMark() {
  return (
    <span
      aria-label="Render"
      className="grid size-4 place-items-center rounded-full border border-current text-[8px] font-bold"
    >
      R
    </span>
  );
}
