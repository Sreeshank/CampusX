import { Link } from "react-router-dom";
import { api, useDemo } from "../../lib/demo/store";
import { PageHead, Empty } from "../../components/ui";
import { dateTime } from "../../lib/format";
export function Notifications() {
  const s = useDemo();
  const items = s.notices.filter((n) => n.uid === s.currentUserId);
  return (
    <>
      <PageHead
        eyebrow="YOUR ACTIVITY"
        title="A little campus catch-up."
        description="Updates on conversations and ride requests."
      />
      {items.length ? (
        items.map((n) => (
          <Link
            className={"panel notification-row " + (!n.read ? "unread" : "")}
            key={n.id}
            to={n.href}
            onClick={() => api.markNotificationRead(n.id)}
          >
            <div>
              <b>{n.title}</b>
              <small>{dateTime(n.createdAt)}</small>
            </div>
            {!n.read && <span className="live-dot" />}
          </Link>
        ))
      ) : (
        <Empty
          title="All quiet for now"
          text="Messages and ride decisions will show up here."
        />
      )}
    </>
  );
}
