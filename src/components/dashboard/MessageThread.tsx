import { addMatterMessage, addOrderMessage } from "@/app/actions/messages";
import type { Message } from "@/lib/store/types";

export function MessageThread({
  messages,
  threadId,
  kind,
  currentUserId,
  error,
}: {
  messages: Message[];
  threadId: string;
  kind: "order" | "matter";
  currentUserId: string;
  error?: string;
}) {
  const action = kind === "order" ? addOrderMessage : addMatterMessage;
  const hiddenName = kind === "order" ? "orderId" : "matterId";

  return (
    <div>
      <div className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-[13px] text-slate-muted">
            No messages yet. Anything you send reaches the team working on this file.
          </p>
        ) : null}
        {messages.map((message) => {
          const mine = message.authorId === currentUserId;
          return (
            <div
              key={message.id}
              className={`rounded-[12px] border p-4 ${
                mine ? "border-navy-900/25 bg-navy-900/[0.04]" : "border-cream-300 bg-cream-50"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12.5px] font-medium">{message.authorName}</p>
                <p className="mono text-[10.5px] text-slate-muted">
                  {new Date(message.at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <p className="mt-1.5 whitespace-pre-line text-[13.5px] leading-relaxed text-navy-950/80">
                {message.body}
              </p>
            </div>
          );
        })}
      </div>

      <form action={action} className="mt-4">
        <input type="hidden" name={hiddenName} value={threadId} />
        <label className="label" htmlFor={`message-${threadId}`}>
          Reply
        </label>
        <textarea
          id={`message-${threadId}`}
          name="body"
          className="field min-h-24"
          placeholder="Write a message to the team"
          required
        />
        {error ? <p className="mt-1 text-[12px] text-danger-600">{error}</p> : null}
        <button type="submit" className="btn btn-navy mt-3 h-11 px-4 text-[13px]">
          Send message
        </button>
      </form>
    </div>
  );
}
