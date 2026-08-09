type ChatActionIconName = 'add' | 'attachment' | 'close' | 'emoji' | 'group' | 'info' | 'pin' | 'reaction' | 'reply' | 'search' | 'send' | 'trash';

const paths: Record<ChatActionIconName, React.ReactNode> = {
  add: <path d="M12 5v14M5 12h14" />,
  attachment: <path d="m20.5 11.5-8.9 8.9a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  emoji: <><circle cx="12" cy="12" r="9" /><path d="M8.5 10h.01M15.5 10h.01M8.5 14.5c1.8 2 5.2 2 7 0" /></>,
  group: <><path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-4A4.5 4.5 0 0 0 3 18.5V20M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M18 8v6M15 11h6" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
  pin: <path d="m9 4 6 0-.8 5 3.3 3.3v1.2h-11v-1.2L9.8 9 9 4ZM12 13.5V21" />,
  reaction: <><circle cx="12" cy="12" r="9" /><path d="M8.5 10h.01M15.5 10h.01M8.5 14.5c1.8 2 5.2 2 7 0M18.5 4.5v4M16.5 6.5h4" /></>,
  reply: <path d="m9 8-5 4 5 4v-3h4.5c3 0 5 1.4 6.5 4-1-5-3.5-7-7-7H9V8Z" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>,
  send: <path d="m3 4 18 8-18 8 3-8-3-8Zm3 8h15" />,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" /></>,
};

export function ChatActionIcon({ name }: { name: ChatActionIconName }) {
  return <svg aria-hidden="true" className="chat-action-icon" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="18">{paths[name]}</svg>;
}
