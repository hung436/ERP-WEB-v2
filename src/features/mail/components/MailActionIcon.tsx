type MailActionName = 'archive' | 'trash' | 'unread' | 'star' | 'reply' | 'replyAll' | 'forward' | 'spam' | 'refresh' | 'attachment';

const paths: Record<MailActionName, React.ReactNode> = {
  archive: <><path d="M4 8h16v12H4z"/><path d="M3 4h18v4H3zM9 12h6"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></>,
  unread: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>,
  reply: <><path d="m10 8-5 4 5 4"/><path d="M5 12h8a6 6 0 0 1 6 6"/></>,
  replyAll: <><path d="m8 8-5 4 5 4M13 8l-5 4 5 4"/><path d="M8 12h7a5 5 0 0 1 5 5"/></>,
  forward: <><path d="m14 8 5 4-5 4"/><path d="M19 12h-8a6 6 0 0 0-6 6"/></>,
  spam: <><path d="m8 3-5 5v8l5 5h8l5-5V8l-5-5Z"/><path d="M12 7v6M12 17h.01"/></>,
  refresh: <><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/></>,
  attachment: <path d="m9 12 6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l8-8"/>,
};

export function MailActionIcon({ name, size = 18 }: { name: MailActionName; size?: number }) {
  return <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">{paths[name]}</svg>;
}
