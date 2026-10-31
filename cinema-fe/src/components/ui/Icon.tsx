import type { SVGProps } from "react";

const paths = {
  ticket: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7Zm12-2v3m0 3v2m0 3v3",
  film: "M4 3h16v18H4V3Zm4 0v18M16 3v18M4 8h4m-4 8h4m8-8h4m-4 8h4M8 12h8",
  clock: "M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Zm3 10h2m4 0h2m-8 4h2",
  building: "M3 21h18M5 21V9h14v12M3 9l9-6 9 6H3Zm5 3v6m4-6v6m4-6v6",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M13 3a4 4 0 0 1 0 8M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  user: "M20 21v-2a7 7 0 0 0-14 0v2M17 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  tag: "M3 3h8l10 10-8 8L3 11V3Zm4 4h.01",
  news: "M4 3h16v18H4V3Zm4 4h8M8 11h3v4H8v-4Zm7 0h1m-1 4h1m-8 3h8",
  chart: "M3 3v18h18M7 17v-5m5 5V7m5 10v-8",
  logout: "M9 5H3v14h6m6-12 5 5-5 5m-8-5h13",
  refresh: "M20 7v5h-5M4 17v-5h5m-4-5a8 8 0 0 1 13-2l2 2M4 17l2 2a8 8 0 0 0 13-2",
  alert: "m12 3 10 18H2L12 3Zm0 6v5m0 3h.01",
  info: "M12 11v6m0-10h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  crown: "m2 6 5 4 5-7 5 7 5-4-3 14H5L2 6Z",
  graduation: "m2 9 10-5 10 5-10 5L2 9Zm4 2v6l6 3 6-3v-6m4-2v8",
  gift: "M3 8h18v4H3V8Zm2 4v9h14v-9M12 8v13m0-13H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z",
  pin: "m9 3 12 12-5 1-3 5-4-7-6-4 6-7Zm0 11-7 7",
  edit: "m16 3 5 5-12 12H4v-5L16 3Zm-3 3 5 5",
  hourglass: "M6 2h12m-12 20h12M7 2v5l10 10v5M17 2v5L7 17v5",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12M6 18 18 6",
};
export type IconName = keyof typeof paths;
export default function Icon({ name, className = "", ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`inline-block shrink-0 align-middle ${className}`} {...props}><path d={paths[name]} /></svg>;
}
