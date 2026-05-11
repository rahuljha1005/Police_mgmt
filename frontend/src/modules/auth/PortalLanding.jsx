import { Shield, Siren, LockKeyhole, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PortalLanding = () => (
  <main className="min-h-screen bg-[#100c0a] text-white">
    <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-5 py-10">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-police-accent">Police Management & Crime Intelligence</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">Choose Access Portal</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-400 md:text-base">
          A dual-access public safety platform separating citizen services from the secure law-enforcement command network.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <PortalCard
          description="File complaints, send SOS alerts, track case status, and review public safety intelligence."
          href="/civilian/login"
          icon={<Siren className="h-7 w-7" />}
          meta={["Complaint services", "SOS emergency", "Safety awareness"]}
          tone="from-amber-950/40"
          title="Public Safety Portal"
          eyebrow="For citizens and public services"
        />
        <PortalCard
          description="Restricted operational access for authorized police personnel. All sessions are monitored and logged."
          href="/police/login"
          icon={<Shield className="h-7 w-7" />}
          meta={["FIR operations", "Analytics command", "Secure internal network"]}
          tone="from-red-950/30"
          title="Police Secure Access"
          eyebrow="Authorized personnel only"
          secure
        />
      </div>
    </section>
  </main>
);

const PortalCard = ({ description, eyebrow, href, icon, meta, secure, title, tone }) => (
  <Link
    className={`group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br ${tone} to-[#211813] p-6 shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:border-police-accent/50`}
    to={href}
  >
    <div className="absolute right-5 top-5 opacity-10 transition group-hover:opacity-20">
      {secure ? <LockKeyhole className="h-32 w-32" /> : <Siren className="h-32 w-32" />}
    </div>
    <div className="relative">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-police-primary text-police-accent">
        {icon}
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-police-accent">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">{description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {meta.map((item) => (
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-300" key={item}>
            {item}
          </span>
        ))}
      </div>
      <div className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white">
        Continue <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </div>
  </Link>
);

export default PortalLanding;
