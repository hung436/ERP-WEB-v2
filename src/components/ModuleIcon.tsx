import type { ReactNode } from 'react';

export type ModuleName = 'home' | 'tasks' | 'documents' | 'calendar' | 'chat' | 'mail' | 'announcements' | 'directory' | 'personnel' | 'requests' | 'cloud' | 'meetings' | 'evaluations' | 'library' | 'experts';

const paths: Record<ModuleName, ReactNode> = {
  home: <><path d="M3.5 10.5 12 3l8.5 7.5" /><path d="M5.5 9.5V21h13V9.5M9 21v-6h6v6" /></>,
  tasks: <><rect x="4" y="3" width="16" height="18" rx="3" /><path d="m8 9 1.5 1.5L12 8M14 9h2.5M8 15l1.5 1.5L12 14M14 15h2.5" /></>,
  documents: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></>,
  calendar: <><rect x="3.5" y="5" width="17" height="16" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" /></>,
  chat: <><path d="M20.5 11.5a8 8 0 0 1-8 8H7l-3.5 2 1-4A8 8 0 1 1 20.5 11.5Z" /><path d="M8.5 11.5h.01M12.5 11.5h.01M16.5 11.5h.01" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4.5 7 7.5 6 7.5-6" /></>,
  announcements: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  directory: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V19M16 6h4M16 10h4M17 14h3" /></>,
  personnel: <><rect x="4" y="3" width="16" height="18" rx="3" /><circle cx="9" cy="9" r="2.5" /><path d="M6.5 16a2.5 2.5 0 0 1 5 0M14 8h3M14 12h3M14 16h3" /></>,
  requests: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" /><path d="M14 3v6h6M8 14h8M8 17h5" /></>,
  cloud: <path d="M17.5 19H6a4 4 0 0 1-.8-7.9A7 7 0 0 1 18.7 9 5 5 0 0 1 17.5 19Z" />,
  meetings: <><rect x="3" y="5" width="14" height="14" rx="2" /><path d="m17 10 4-2v8l-4-2" /></>,
  evaluations: <><path d="M4 20V10M9 20V4M14 20v-7M19 20V7M2 20h20" /></>,
  library: <><path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></>,
  experts: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0M18.5 3.5l.6 1.3 1.4.2-1 .9.3 1.4-1.3-.7-1.2.7.2-1.4-1-.9 1.4-.2Z" /></>,
};

export function ModuleIcon({ module, size = 22, className }: { module: ModuleName; size?: number; className?: string }) {
  return <svg aria-hidden="true" className={className} fill="none" height={size} viewBox="0 0 24 24" width={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">{paths[module]}</svg>;
}
