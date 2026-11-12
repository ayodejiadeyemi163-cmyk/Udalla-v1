import type { Faq } from "@/lib/store/types";

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div>
      {faqs.map((faq) => (
        <details key={faq.id} className="accordion">
          <summary>
            <span>{faq.question}</span>
            <span className="plus" aria-hidden="true" />
          </summary>
          <div className="answer">{faq.answer}</div>
        </details>
      ))}
    </div>
  );
}
