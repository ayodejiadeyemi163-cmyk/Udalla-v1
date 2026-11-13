"use client";

import { useRef, useState } from "react";
import { skipDocumentsStep } from "@/app/actions/checkout";
import { Upload } from "@/components/checkout/icons";
import type { DraftDocument } from "@/lib/store/types";

export function DocumentsStep({
  draftId,
  serviceName,
  required,
  existing,
  demo,
}: {
  draftId: string;
  serviceName: string;
  required: string[];
  existing: DraftDocument[];
  demo: boolean;
}) {
  const [documents, setDocuments] = useState<DraftDocument[]>(existing);
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setStatus(null);
    const body = new FormData();
    body.set("draftId", draftId);
    body.set("file", file);

    try {
      const response = await fetch("/api/documents/upload", { method: "POST", body });
      const data = (await response.json()) as { ok?: boolean; error?: string; name?: string };
      if (!response.ok || !data.ok) {
        setStatus({ tone: "error", text: data.error ?? "The file could not be uploaded." });
      } else {
        setDocuments((current) => [
          ...current,
          { name: data.name ?? file.name, size: file.size, mime: file.type },
        ]);
        setStatus({ tone: "ok", text: "Uploaded. Stored privately." });
      }
    } catch {
      setStatus({ tone: "error", text: "The upload failed. Try again." });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div
        className={`rounded-[14px] border border-dashed p-6 ${
          demo ? "border-cream-300 bg-cream-100/60" : "border-navy-900/35 bg-navy-900/[0.04]"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-navy-900">
            <Upload />
          </span>
          <div>
            <p className="text-[14px] font-medium">
              {demo ? "Documents are disabled in this preview" : "Upload your documents"}
            </p>
            <p className="mt-1 max-w-lg text-[12.5px] leading-relaxed text-slate-muted">
              {demo
                ? "This preview with demo data accepts no real documents. In the live site, PDF, JPG, PNG and WEBP files up to 10 MB are checked by file signature and stored privately."
                : "PDF, JPG, PNG or WEBP. Up to 10 MB per file. Files are stored privately and every access is logged."}
            </p>
            {!demo ? (
              <>
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  className="sr-only"
                  id="document-file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(file);
                  }}
                />
                <label
                  htmlFor="document-file"
                  className="btn btn-outline mt-4 h-11 cursor-pointer px-4 text-[13px]"
                >
                  {busy ? "Uploading" : "Choose a file"}
                </label>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {status ? (
        <p
          className={`mt-3 rounded-[10px] px-3 py-2 text-[12.5px] ${
            status.tone === "ok" ? "bg-navy-900/10 text-navy-900" : "bg-danger-100 text-danger-600"
          }`}
        >
          {status.text}
        </p>
      ) : null}

      <div className="mt-6">
        <p className="eyebrow">Usually needed for {serviceName}</p>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {required.map((item) => (
            <li key={item} className="text-[13px] text-navy-950/75">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {documents.length > 0 ? (
        <ul className="mt-5 divide-y divide-cream-300 border-y border-cream-300">
          {documents.map((document) => (
            <li key={document.name} className="flex items-center justify-between gap-3 py-3">
              <span className="truncate text-[13px]">{document.name}</span>
              <span className="pill pill-emerald-soft">Uploaded</span>
            </li>
          ))}
        </ul>
      ) : null}

      <form action={skipDocumentsStep} className="mt-6">
        <input type="hidden" name="draftId" value={draftId} />
        <button type="submit" className="btn btn-primary w-full sm:w-auto">
          Continue to review
        </button>
      </form>
      <p className="mt-3 text-[11.5px] text-slate-muted">
        Missing a document? Continue and add it later from the dashboard.
      </p>
    </div>
  );
}
