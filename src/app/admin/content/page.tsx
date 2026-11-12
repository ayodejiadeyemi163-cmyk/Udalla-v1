import { deleteFaq, saveFaq, saveGuide } from "@/app/actions/admin";
import { getStore } from "@/lib/store";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const store = getStore();
  const [faqs, guides] = await Promise.all([store.listFaqs(), store.listGuides()]);

  return (
    <div className="space-y-8">
      {params.error ? (
        <p className="rounded-[10px] bg-clay/10 px-3 py-2 text-[12.5px] text-clay">{params.error}</p>
      ) : null}
      {params.saved ? (
        <p className="rounded-[10px] bg-forest/10 px-3 py-2 text-[12.5px] text-forest">Saved.</p>
      ) : null}

      <section>
        <h2 className="font-display text-[22px] tracking-[-0.02em]">FAQ</h2>
        <p className="mt-1 text-[12.5px] text-muted">
          The first six questions appear on the home page. All of them appear on the FAQ page.
        </p>

        <div className="mt-4 space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="card p-4">
              <form action={saveFaq} className="grid gap-2">
                <input type="hidden" name="id" value={faq.id} />
                <input
                  name="question"
                  defaultValue={faq.question}
                  className="field text-[13px]"
                  aria-label="Question"
                />
                <textarea
                  name="answer"
                  defaultValue={faq.answer}
                  className="field min-h-20 text-[13px]"
                  aria-label="Answer"
                />
                <div className="flex items-end gap-2">
                  <label>
                    <span className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-muted">
                      Order
                    </span>
                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={faq.sortOrder}
                      className="field mono h-9 w-20 py-1 text-[12px]"
                    />
                  </label>
                  <button type="submit" className="btn btn-forest h-9 px-3 text-[11.5px]">
                    Save
                  </button>
                </div>
              </form>
              <form action={deleteFaq} className="mt-2">
                <input type="hidden" name="id" value={faq.id} />
                <button type="submit" className="text-[11.5px] text-clay hover:underline">
                  Delete this question
                </button>
              </form>
            </div>
          ))}
        </div>

        <form action={saveFaq} className="card mt-4 grid gap-2 p-4">
          <p className="text-[12.5px] font-medium">Add a question</p>
          <input name="question" placeholder="Question" className="field text-[13px]" required />
          <textarea name="answer" placeholder="Answer" className="field min-h-20 text-[13px]" required />
          <div className="flex items-end gap-2">
            <label>
              <span className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-muted">
                Order
              </span>
              <input
                name="sortOrder"
                type="number"
                defaultValue={faqs.length + 1}
                className="field mono h-9 w-20 py-1 text-[12px]"
              />
            </label>
            <button type="submit" className="btn btn-primary h-9 px-3 text-[11.5px]">
              Add
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-display text-[22px] tracking-[-0.02em]">Guides</h2>
        <p className="mt-1 text-[12.5px] text-muted">
          Separate paragraphs with a blank line. Start a heading with two hash marks.
        </p>
        <div className="mt-4 space-y-3">
          {guides.map((guide) => (
            <form key={guide.slug} action={saveGuide} className="card grid gap-2 p-4">
              <input type="hidden" name="slug" value={guide.slug} />
              <p className="mono text-[10.5px] text-muted">
                {guide.slug} · {guide.country}
              </p>
              <input name="title" defaultValue={guide.title} className="field text-[13px]" aria-label="Title" />
              <input
                name="excerpt"
                defaultValue={guide.excerpt}
                className="field text-[13px]"
                aria-label="Excerpt"
              />
              <textarea
                name="body"
                defaultValue={guide.body.join("\n\n")}
                className="field min-h-48 font-sans text-[13px]"
                aria-label="Body"
              />
              <button type="submit" className="btn btn-forest h-9 w-fit px-3 text-[11.5px]">
                Save guide
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
