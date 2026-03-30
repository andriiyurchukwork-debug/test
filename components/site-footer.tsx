export function SiteFooter() {
  return (
    <footer className="text-xs text-[var(--muted)] pt-8 border-t border-[var(--border)]">
      Keep API keys only in <code className="text-[var(--accent)]">.env.local</code>. Do not paste them into chats or commit them to a
      repository. If a key was exposed, rotate it in the provider console.
    </footer>
  );
}
