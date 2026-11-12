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
          <p className="text-[13px] text-muted">
            No messages yet. Anything you send reaches the team working on this file.
          </p>
        ) : null}
        {messages.map((message) => {
          const mine = message.authorId === currentUserId;
          return (
            <div
              key={message.id}
              className={`rounded-[12px] border p-4 ${
                mine ? "border-forest/25 bg-forest/[0.04]" : "border-line bg-paper"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12.5px] font-medium">{message.authorName}</p>
                <p className="mono text-[10.5px] text-muted">
                  {new Date(message.at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <p className="mt-1.5 whitespace-pre-line text-[13.5px] leading-relaxed text-ink/80">
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
        {error ? <p className="mt-1 text-[12px] text-clay">{error}</p> : null}
        <button type="submit" className="btn btn-forest mt-3 h-11 px-4 text-[13px]">
          Send message
        </button>
      </form>
    </div>
  );
}
