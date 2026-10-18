import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Send, MessageCircle } from "lucide-react";
import { api, useDemo } from "../../lib/demo/store";
import {
  PageHead,
  Avatar,
  Empty,
  ErrorBox,
  useAction,
} from "../../components/ui";
import { dateTime } from "../../lib/format";
export function Messages() {
  const { conversationId } = useParams();
  const s = useDemo();
  const uid = s.currentUserId;
  const chats = s.conversations
    .filter((c) => c.participantIds.includes(uid))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const active = chats.find((c) => c.id === conversationId);
  const [text, setText] = useState("");
  const { error, run } = useAction();
  const other = active?.participantIds.find((v) => v !== uid);
  const name = s.users.find((u) => u.id === other)?.displayName ?? "";
  return (
    <>
      <PageHead
        eyebrow="MESSAGES"
        title="Start a conversation."
        description="Coordinate your exchange or agree on a pickup point."
      />
      {!chats.length ? (
        <Empty
          title="Your inbox is waiting"
          text="Open an item and choose Message seller to start a conversation."
          href="/xchange"
          action="Explore XChange"
        />
      ) : (
        <div className="inbox">
          <aside className="chat-list">
            {chats.map((c) => {
              const person = s.users.find(
                (u) => u.id === c.participantIds.find((v) => v !== uid),
              )!;
              return (
                <Link
                  className={c.id === active?.id ? "active" : ""}
                  to={`/messages/${c.id}`}
                  key={c.id}
                >
                  <Avatar name={person.displayName} />
                  <span>
                    <b>{person.displayName}</b>
                    <small>{c.title}</small>
                  </span>
                </Link>
              );
            })}
          </aside>
          <section className="chat-window">
            {active ? (
              <>
                <div className="chat-header">
                  <Avatar name={name} />
                  <div>
                    <b>{name}</b>
                    <small>{active.title}</small>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => run(() => api.setUserBlock(other!))}
                  >
                    {s.blocks[uid]?.includes(other!) ? "Unblock" : "Block"}
                  </button>
                </div>
                <div className="chat-messages">
                  {s.messages
                    .filter((m) => m.conversationId === active.id)
                    .map((m) => (
                      <div
                        className={
                          "bubble " + (m.senderId === uid ? "mine" : "")
                        }
                        key={m.id}
                      >
                        <p>{m.text}</p>
                        <small>{dateTime(m.createdAt)}</small>
                      </div>
                    ))}
                  {!s.messages.some((m) => m.conversationId === active.id) && (
                    <div className="chat-start">
                      <MessageCircle />
                      <p>Say hello and ask about the details.</p>
                    </div>
                  )}
                </div>
                <ErrorBox message={error} />
                <form
                  className="message-composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(() => {
                      api.sendMessage(active.id, text, crypto.randomUUID());
                      setText("");
                    });
                  }}
                >
                  <input
                    aria-label="Message"
                    placeholder="Write a message…"
                    value={text}
                    maxLength={2000}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <button
                    className="button primary"
                    aria-label="Send message"
                    disabled={!text.trim()}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </>
            ) : (
              <Empty
                title="Choose a conversation"
                text={
                  conversationId
                    ? "This conversation is not available to this account."
                    : "Your messages will appear here."
                }
              />
            )}
          </section>
        </div>
      )}
    </>
  );
}
