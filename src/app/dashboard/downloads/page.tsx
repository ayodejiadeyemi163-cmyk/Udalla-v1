import Link from "next/link";
import { redirect } from "next/navigation";

import { Lock } from "@/components/ui/Marks";
import { getSessionUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export default async function DownloadsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard/downloads");

  const store = getStore();
  const documents = await store.listDocumentsByUser(user.id);

  return (
    <div>
      <h2 className="font-display text-[24px] tracking-[-0.02em]">Downloads</h2>
      <p className="mt-1 text-[13px] text-muted">
        Certificates, registration documents and your uploaded files. Stored privately.
      </p>

      {documents.length === 0 ? (
        <div className="card mt-5 p-8 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-line text-forest">
            <Lock />
          </span>
          <p className="mt-4 font-display text-[20px] tracking-[-0.02em]">
            Nothing to download yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-ink/65">
            Your certificate and documents appear here once the registry issues them. In this
            preview, documents are disabled because no private storage is connected.
          </p>
          <Link href="/services" className="btn btn-outline mt-5">
            Browse services
          </Link>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {documents.map((document) => (
            <li key={document.id} className="flex items-center justify-between gap-4 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-[13.5px]">{document.filename}</p>
                <p className="mono text-[11px] text-muted">
                  {new Date(document.createdAt).toLocaleDateString("en-GB")} ·{" "}
                  {Math.round(document.size / 1024)} KB
                </p>
              </div>
              <a
                href={`/api/documents/${document.id}`}
                className="btn btn-outline h-9 px-3 text-[12px]"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted">
        <Lock /> Signed links expire after 60 seconds. Every access is written to the audit log.
      </p>
    </div>
  );
}
