export default function SettingsPage() {
  const suggestionsConfigured = Boolean(process.env.ANTHROPIC_API_KEY)

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Settings</h1>
        <p className="text-sm text-muted mt-0.5">Configure FamilyFlow for your household</p>
      </div>

      <section className="space-y-4 bg-surface rounded-[var(--radius)] border border-border p-5">
        <div>
          <h2 className="text-sm font-semibold text-ink mb-1">AI Suggestions</h2>
          <p className="text-xs text-muted mb-4">
            Suggestions use the server-side Anthropic key from <code className="font-mono">ANTHROPIC_API_KEY</code>. The key is never stored in the browser.
          </p>
          <div className={`text-xs px-3 py-2 rounded-[var(--radius)] border ${
            suggestionsConfigured
              ? 'bg-status-active-bg text-status-active border-status-active'
              : 'bg-warn-bg text-warn border-warn'
          }`}>
            {suggestionsConfigured ? 'AI suggestions are configured.' : 'Set ANTHROPIC_API_KEY in .env.local to enable suggestions.'}
          </div>
        </div>
      </section>

      <section className="bg-surface rounded-[var(--radius)] border border-border p-5 space-y-2">
        <h2 className="text-sm font-semibold text-ink">About FamilyFlow</h2>
        <p className="text-xs text-muted">
          FamilyFlow stores family plan data locally in your browser. AI suggestion requests send the selected interest context to Anthropic through the app server.
        </p>
        <p className="text-xs text-muted">MVP v0.1 - Built with Next.js, Zustand, and Tailwind CSS.</p>
      </section>
    </div>
  )
}
