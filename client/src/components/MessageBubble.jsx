function MessageBubble({ role, content, created_at }) {
  const isUser = role === "user";
  return (
    <div className={`bubble-row ${isUser ? "bubble-row-user" : ""}`}>
      <div className={`bubble ${isUser ? "bubble-user" : "bubble-bot"}`}>
        <p>{content}</p>
        {created_at && (
          <span className="bubble-time">
            {new Date(created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;