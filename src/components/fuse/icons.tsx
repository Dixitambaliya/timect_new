import type { ReactNode, SVGProps } from "react";

// Stroke icons matching the Fuse theme's thin 1.5px line icon set.
type IconProps = SVGProps<SVGSVGElement> & { className?: string };

const I = (children: ReactNode, viewBox = "0 0 24 24") =>
  function Icon({ className = "h-6 w-6", ...rest }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={className}
        {...rest}
      >
        {children}
      </svg>
    );
  };

export const MenuIcon = I(<path d="M5 8h14M5 12h14M5 16h14" />);
export const CloseIcon = I(<path d="M6 6l12 12M18 6L6 18" />);
export const SearchIcon = I(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </>,
);
export const ChevronDown = I(<path d="M6 9l6 6 6-6" />);
export const ChevronRight = I(<path d="M9 6l6 6-6 6" />);
export const ArrowRight = I(<path d="M5 12h14M13 6l6 6-6 6" />);
export const ArrowLeft = I(<path d="M19 12H5M11 6l-6 6 6 6" />);
export const ArrowUp = I(<path d="M12 19V5M6 11l6-6 6 6" />);
export const Plus = I(<path d="M12 5v14M5 12h14" />);
export const Minus = I(<path d="M5 12h14" />);
export const QuickViewIcon = I(
  <>
    <path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3" />
    <circle cx="12" cy="12" r="3" />
  </>,
);
export const FilterIcon = I(
  <>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </>,
);
export const SortIcon = I(<path d="M4 7h16M7 12h10M10 17h4" />);
export const Clock = I(
  <>
    <circle cx="12" cy="13" r="7.5" />
    <path d="M12 9.5V13l2 1.5M10 3h4" />
  </>,
);
export const Share = I(
  <>
    <circle cx="17" cy="6" r="2.5" />
    <circle cx="7" cy="12" r="2.5" />
    <circle cx="17" cy="18" r="2.5" />
    <path d="M9.2 10.8l5.6-3.4M9.2 13.2l5.6 3.4" />
  </>,
);
export const Truck = I(
  <>
    <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
    <circle cx="7" cy="17.5" r="1.5" />
    <circle cx="17" cy="17.5" r="1.5" />
  </>,
);
export const Shield = I(
  <>
    <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </>,
);
export const Box = I(
  <>
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
    <path d="M12 12l8-4.5M12 12L4 7.5M12 12v9" />
  </>,
);
export const Check = I(<path d="M5 12.5l4.5 4.5L19 7.5" />);
export const Mail = I(
  <>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="M3.5 7l8.5 6 8.5-6" />
  </>,
);
export const Phone = I(
  <path d="M5 4h3l2 5-2.5 1.5a11 11 0 006 6L15 14l5 2v3a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z" />,
);
export const Gift = I(
  <>
    <rect x="4" y="9" width="16" height="11" rx="1" />
    <path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zM12 9c2-4 6-4 6-1.5S14 9 12 9z" />
  </>,
);
export const Watch = I(
  <>
    <circle cx="12" cy="12" r="5.5" />
    <path d="M12 9.5V12l1.5 1.5M9 7l.8-4h4.4l.8 4M9 17l.8 4h4.4l.8-4" />
  </>,
);
export const Heart = I(
  <path d="M12 20s-6.5-4.2-8.6-8C1.9 9 3 5.8 6.1 5.1 8.2 4.6 10.1 5.6 12 8c1.9-2.4 3.8-3.4 5.9-2.9C21 5.8 22.1 9 20.6 12c-2.1 3.8-8.6 8-8.6 8z" />,
);
export const Ruler = I(
  <>
    <rect x="3" y="8" width="18" height="8" rx="1.5" />
    <path d="M7 8v3M11 8v4M15 8v3M19 8v2" />
  </>,
);

export function Star({ className = "h-4 w-4", filled = true }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.2}>
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5z" />
    </svg>
  );
}

export function Spinner({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} animate-[spin_.8s_linear_infinite]`} aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 00-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Brand glyphs (filled)
export function Facebook({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
    </svg>
  );
}
export function Instagram({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r=".8" fill="currentColor" />
    </svg>
  );
}
export function YouTube({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15V9l5.2 3L10 15z" />
    </svg>
  );
}
export function WhatsApp({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35zM12.05 21.78h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 012.89 7c0 5.45-4.44 9.87-9.88 9.87zm8.41-18.3A11.82 11.82 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L0 24l6.34-1.66a11.88 11.88 0 005.7 1.46h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42z" />
    </svg>
  );
}
