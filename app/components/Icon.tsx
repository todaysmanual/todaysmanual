type IconName =
  | "arrow"
  | "briefcase"
  | "chevron"
  | "close"
  | "compass"
  | "idea"
  | "growth"
  | "instagram"
  | "linkedin"
  | "mail"
  | "menu"
  | "play"
  | "school"
  | "search"
  | "tiktok"
  | "x";

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };

  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h13"/><path d="m14 7 5 5-5 5"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12h18M10 12v2h4v-2"/></>,
    chevron: <path d="m8 10 4 4 4-4"/>,
    close: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="m15.3 8.7-2.1 4.5-4.5 2.1 2.1-4.5 4.5-2.1Z"/></>,
    idea: <><path d="M9 18h6M10 21h4"/><path d="M8.3 14.7A6 6 0 1 1 15.7 14.7C14.8 15.4 14.4 16.1 14.3 17h-4.6c-.1-.9-.5-1.6-1.4-2.3Z"/></>,
    growth: <><path d="M4 19h16"/><path d="m6 15 4-4 3 3 5-7"/><path d="M14 7h4v4"/></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></>,
    linkedin: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7.5v.01M12 17v-4a3 3 0 0 1 6 0v4M12 10v7"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    play: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/></>,
    school: <><path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 12v4.5c3 2 7 2 10 0V12M21 9v6"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></>,
    tiktok: <><path d="M14 4v10.5a4.5 4.5 0 1 1-4-4.47"/><path d="M14 4c.8 2.5 2.3 4 5 4"/></>,
    x: <><path d="M5 4l14 16M19 4 5 20"/></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

