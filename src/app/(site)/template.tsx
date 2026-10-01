/** Re-mounts on every navigation so the Fuse page-enter animation replays. */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
