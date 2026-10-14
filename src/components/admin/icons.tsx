/** Small stroke icons for the admin (24px grid, currentColor). */
const PATHS = {
  overview: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z",
  messages: "M4 5h16v11H8l-4 4zM8 9h8M8 12.5h5",
  conversations: "M7 9H4v9l3-2.5h7V13M10 5h10v8.5L17 11h-7z",
  analytics: "M5 20V10M10 20V4M15 20v-7M20 20v-4",
  posts: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  logs: "M4 6h2M4 12h2M4 18h2M9 6h11M9 12h11M9 18h11",
  settings:
    "M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM19.4 13.5l1.6 1.2-1.8 3.1-1.9-.7a7 7 0 0 1-1.8 1l-.3 2H10.8l-.3-2a7 7 0 0 1-1.8-1l-1.9.7-1.8-3.1 1.6-1.2a7 7 0 0 1 0-2l-1.6-1.2 1.8-3.1 1.9.7a7 7 0 0 1 1.8-1l.3-2h3.4l.3 2a7 7 0 0 1 1.8 1l1.9-.7 1.8 3.1-1.6 1.2a7 7 0 0 1 0 2z",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  panel: "M4 4h16v16H4zM9 4v16",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="adm-icon">
      <path d={PATHS[name]} />
    </svg>
  );
}
