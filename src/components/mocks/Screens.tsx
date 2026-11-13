import { Check, Lock } from "@/components/ui/Marks";

/**
 * Product visuals built in HTML and CSS. No screenshots, no stock imagery,
 * no AI generated faces.
 */

export function OrderTrackerMock({ compact = false }: { compact?: boolean }) {
  const steps = [
    { label: "Received", state: "done" },
    { label: "In review", state: "done" },
    { label: "Name check", state: "current" },
    { label: "Filed", state: "next" },
    { label: "Awaiting registry", state: "next" },
    { label: "Completed", state: "next" },
  ];

  return (
    <div className={`card overflow-hidden ${compact ? "" : "p-5 sm:p-7"}`}>
      <div className="flex items-center justify-between border-b border-cream-300 px-5 py-4 sm:px-7">
        <div>
          <p className="eyebrow">Example order</p>
          <p className="mt-1 font-display text-[19px] tracking-[-0.02em]">
            Limited company, Nigeria
          </p>
        </div>
        <span className="pill pill-emerald-soft">In progress</span>
      </div>
      <div className="px-5 py-5 sm:px-7 sm:py-6">
        <ol className="relative">
          {steps.map((step, index) => (
            <li key={step.label} className="flex gap-3 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <span
                  className={`mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full border text-[10px] ${
                    step.state === "done"
                      ? "border-navy-900 bg-navy-900 text-cream-100"
                      : step.state === "current"
                        ? "border-danger-600 bg-danger-100 text-danger-600"
                        : "border-cream-300 text-slate-muted"
                  }`}
                >
                  {step.state === "done" ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                {index < steps.length - 1 ? (
                  <span
                    className={`mt-1 w-px flex-1 ${
                      step.state === "done" ? "bg-navy-900/40" : "bg-cream-300"
                    }`}
                  />
                ) : null}
              </div>
              <div className="pb-1">
                <p
                  className={`text-[13.5px] ${
                    step.state === "next" ? "text-slate-muted" : "text-navy-950"
                  }`}
                >
                  {step.label}
                </p>
                {step.state === "current" ? (
                  <p className="mt-0.5 text-[11.5px] text-slate-muted">
                    Names submitted to the registry
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function UploadMock() {
  return (
    <div className="card p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <p className="font-display text-[19px] tracking-[-0.02em]">Documents</p>
        <span className="flex gap-1.5"><span className="pill">Example</span><span className="pill">
          <Lock /> Private
        </span></span>
      </div>
      <div className="mt-5 rounded-[14px] border border-dashed border-navy-900/35 bg-navy-900/[0.04] px-4 py-7 text-center">
        <p className="text-[14px] font-medium">Drop a PDF, JPG, PNG or WEBP</p>
        <p className="mt-1 text-[12px] text-slate-muted">Up to 10 MB per file. Stored privately.</p>
        <span className="mt-4 inline-flex rounded-full border border-navy-950/20 px-3 py-1 text-[11.5px]">
          Choose file
        </span>
      </div>
      <ul className="mt-4 divide-y divide-cream-300">
        {[
          { name: "means-of-id.pdf", state: "Uploaded", size: "1.2 MB" },
          { name: "proof-of-address.jpg", state: "Uploaded", size: "840 KB" },
          { name: "signature.png", state: "Needs re-upload", size: "96 KB" },
        ].map((file) => (
          <li key={file.name} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-[13px]">{file.name}</p>
              <p className="text-[11.5px] text-slate-muted">{file.size}</p>
            </div>
            <span
              className={`pill ${file.state === "Uploaded" ? "pill-emerald-soft" : "border-danger-600/40 text-danger-600"}`}
            >
              {file.state}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DeadlineMock() {
  const deadlines = [
    { label: "Annual returns", date: "30 Jun", state: "In 23 days", tone: "urgent" },
    { label: "Confirmation statement", date: "14 Aug", state: "In 68 days", tone: "calm" },
    { label: "Registered agent renewal", date: "01 Oct", state: "In 116 days", tone: "calm" },
  ];
  return (
    <div className="card p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <p className="font-display text-[19px] tracking-[-0.02em]">Compliance calendar</p>
        <span className="flex gap-1.5"><span className="pill">Example</span><span className="pill">2026</span></span>
      </div>
      <ul className="mt-4 divide-y divide-cream-300">
        {deadlines.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-4 py-3.5">
            <div>
              <p className="text-[13.5px]">{item.label}</p>
              <p className="mono text-[11.5px] text-slate-muted">{item.date}</p>
            </div>
            <span
              className={`text-[11.5px] ${
                item.tone === "urgent" ? "text-danger-600" : "text-slate-muted"
              }`}
            >
              {item.state}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-cream-300 pt-3 text-[11.5px] text-slate-muted">
        Reminders go out 30 and 7 days before each deadline.
      </p>
    </div>
  );
}

export function EnquiryMock() {
  return (
    <div className="card p-5 sm:p-7">
      <p className="eyebrow">Example website enquiry</p>
      <p className="mt-2 font-display text-[21px] tracking-[-0.025em]">
        Tell us about the site you need
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {["Name", "WhatsApp", "Business", "Budget"].map((label) => (
          <div key={label} className="rounded-[10px] border border-cream-300 bg-white/60 px-3 py-2.5">
            <p className="text-[10.5px] uppercase tracking-[0.12em] text-slate-muted">{label}</p>
            <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-navy-950/10" />
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-[10px] border border-cream-300 bg-white/60 px-3 py-2.5">
        <p className="text-[10.5px] uppercase tracking-[0.12em] text-slate-muted">Project type</p>
        <div className="mt-2 flex gap-1.5">
          <span className="pill pill-emerald">Starter site</span>
          <span className="pill">Online store</span>
        </div>
      </div>
      <div className="mt-4 inline-flex h-9 items-center rounded-[10px] bg-navy-900 px-4 text-[12.5px] text-cream-100">
        Send enquiry
      </div>
    </div>
  );
}

export function StatusCard() {
  return (
    <div className="card float-slow w-[230px] p-4 shadow-lift">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Example status</p>
        <span className="h-1.5 w-1.5 rounded-full bg-navy-900" />
      </div>
      <p className="mt-2 text-[13.5px] font-medium">Name check cleared</p>
      <p className="mono mt-1 text-[11px] text-slate-muted">UD-4F2A91C7</p>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-cream-300">
        <div className="h-full w-1/2 bg-navy-900" />
      </div>
      <p className="mt-2 text-[11px] text-slate-muted">3 of 6 stages complete</p>
    </div>
  );
}

export function DeadlineCard() {
  return (
    <div className="card float-slower w-[210px] p-4 shadow-lift">
      <p className="eyebrow">Example deadline</p>
      <p className="mono mt-2 text-[28px] leading-none tracking-[-0.03em]">23 days</p>
      <p className="mt-1 text-[12.5px]">Annual returns, CAC</p>
      <p className="mt-2 text-[11px] text-slate-muted">Reminder set for 30 and 7 days before</p>
    </div>
  );
}
