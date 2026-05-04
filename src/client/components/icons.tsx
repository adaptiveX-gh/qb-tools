import React from "react";

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const Icon: React.FC<IconProps> = ({ children, size = 18, className = "", strokeWidth = 1.6, style }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
    className={className} aria-hidden="true" style={style}
  >
    {children}
  </svg>
);

export const ChevronRight: React.FC<IconProps> = (p) => <Icon {...p}><polyline points="9 18 15 12 9 6" /></Icon>;
export const ChevronDown: React.FC<IconProps> = (p) => <Icon {...p}><polyline points="6 9 12 15 18 9" /></Icon>;
export const ChevronUp: React.FC<IconProps> = (p) => <Icon {...p}><polyline points="18 15 12 9 6 15" /></Icon>;
export const Search: React.FC<IconProps> = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>;
export const Calendar: React.FC<IconProps> = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></Icon>;
export const Copy: React.FC<IconProps> = (p) => <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Icon>;
export const Check: React.FC<IconProps> = (p) => <Icon {...p}><polyline points="20 6 9 17 4 12" /></Icon>;
export const Plus: React.FC<IconProps> = (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>;
export const X: React.FC<IconProps> = (p) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>;
export const ArrowRight: React.FC<IconProps> = (p) => <Icon {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>;
export const Download: React.FC<IconProps> = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Icon>;
export const Eye: React.FC<IconProps> = (p) => <Icon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Icon>;
export const Trash: React.FC<IconProps> = (p) => <Icon {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></Icon>;
export const Lock: React.FC<IconProps> = (p) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>;
export const Sparkle: React.FC<IconProps> = (p) => <Icon {...p}><path d="M12 3l1.9 5.5L19 10l-5.1 1.5L12 17l-1.9-5.5L5 10l5.1-1.5z" /></Icon>;
export const Clock: React.FC<IconProps> = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></Icon>;
export const Mail: React.FC<IconProps> = (p) => <Icon {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,6 12,13 2,6" /></Icon>;

export const Spinner: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" style={{ animation: "spin 800ms linear infinite" }}>
    <path d="M21 12a9 9 0 1 1-6.4-8.6" />
  </svg>
);
