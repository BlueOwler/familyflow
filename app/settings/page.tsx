'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'

const PRESET_URLS = [
  { label: 'OpenRouter', value: 'https://openrouter.ai/api/v1' },
  { label: 'OpenAI', value: 'https://api.openai.com/v1' },
  { label: 'Ollama (local)', value: 'http://localhost:11434/v1' },
  { label: 'LiteLLM (local)', value: 'http://localhost:4000/v1' },
]

export default function SettingsPage() {
  const { settings, updateSettings } = useStore()

  const [baseUrl, setBaseUrl] = useState(settings.apiBaseUrl ?? '')
  const [apiKey, setApiKey] = useState(settings.apiKey ?? '')
  const [model, setModel] = useState(settings.model ?? '')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [models, setModels] = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [modelError, setModelError] = useState('')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings({
      apiBaseUrl: baseUrl.trim() || undefined,
      apiKey: apiKey.trim() || undefined,
      model: model.trim() || undefined,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleRefreshModels = async () => {
    const url = baseUrl.trim().replace(/\/$/, '')
    if (!url) { setModelError('Enter a base URL first.'); return }
    setLoadingModels(true)
    setModelError('')
    setModels([])
    try {
      const headers: Record<string, string> = {}
      if (apiKey.trim()) headers['Authorization'] = `Bearer ${apiKey.trim()}`
      const res = await fetch(`${url}/models`, { headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { data?: Array<{ id: string }> }
      const ids = (data.data ?? []).map((m) => m.id).sort()
      if (ids.length === 0) throw new Error('No models returned.')
      setModels(ids)
    } catch (e) {
      setModelError(e instanceof Error ? e.message : 'Failed to fetch models.')
    } finally {
      setLoadingModels(false)
    }
  }

  const inp = (value: string, onChange: (v: string) => void, props: Record<string, unknown> = {}) => (
    <input
      className="w-full px-3 py-2 border border-border rounded-[var(--radius)] text-sm bg-bg text-ink focus:outline-none focus:border-primary font-mono"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  )

  const isConfigured = !!(baseUrl && model)

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Settings</h1>
        <p className="text-sm text-muted mt-0.5">Configure AI suggestions for your household</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 bg-surface rounded-[var(--radius)] border border-border p-5">
        <div>
          <h2 className="text-sm font-semibold text-ink mb-1">AI Suggestions</h2>
          <p className="text-xs text-muted mb-4">
            Works with any OpenAI-compatible API — OpenRouter, Ollama, LiteLLM, OpenAI, or your own proxy.
            Settings are stored in your browser only.
          </p>
        </div>

        {/* Base URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted uppercase tracking-wide block">Base URL</label>
          <div className="flex gap-1.5 flex-wrap">
            {PRESET_URLS.map((p) => (
              <button key={p.value} type="button"
                onClick={() => setBaseUrl(p.value)}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${baseUrl === p.value ? 'bg-primary text-primary-fg border-primary' : 'border-border text-muted hover:border-primary hover:text-ink'}`}>
                {p.label}
              </button>
            ))}
          </div>
          {inp(baseUrl, setBaseUrl, { placeholder: 'https://openrouter.ai/api/v1' })}
        </div>

        {/* API Key */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted uppercase tracking-wide block">API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-... (leave empty for local/no-auth endpoints)"
              className="w-full px-3 py-2 pr-10 border border-border rounded-[var(--radius)] text-sm bg-bg text-ink focus:outline-none focus:border-primary font-mono"
            />
            <button type="button" onClick={() => setShowKey((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors">
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Model */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted uppercase tracking-wide">Model</label>
            <button type="button" onClick={handleRefreshModels} disabled={loadingModels}
              className="flex items-center gap-1 text-xs text-muted hover:text-ink transition-colors disabled:opacity-50">
              <RefreshCw size={12} className={loadingModels ? 'animate-spin' : ''} />
              {loadingModels ? 'Fetching…' : 'Refresh list'}
            </button>
          </div>

          {models.length > 0 ? (
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-[var(--radius)] text-sm bg-bg text-ink focus:outline-none focus:border-primary font-mono">
              <option value="">— select a model —</option>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          ) : (
            inp(model, setModel, { placeholder: 'e.g. openai/gpt-4o-mini or mistral/mistral-7b' })
          )}

          {modelError && <p className="text-xs text-urgent">{modelError}</p>}
        </div>

        {/* Status + Save */}
        <div className="space-y-3 pt-1">
          <div className={`text-xs px-3 py-2 rounded-[var(--radius)] border ${
            isConfigured
              ? 'bg-status-active-bg text-status-active border-status-active'
              : 'bg-surface-2 text-muted border-border'
          }`}>
            {isConfigured
              ? `Ready — using ${model} via ${baseUrl}`
              : 'Enter a base URL and model to enable suggestions.'}
          </div>

          <button type="submit"
            className="w-full py-2 bg-primary text-primary-fg rounded-[var(--radius)] text-sm font-medium hover:bg-primary-hover transition-colors">
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </form>

      <section className="bg-surface rounded-[var(--radius)] border border-border p-5 space-y-2">
        <h2 className="text-sm font-semibold text-ink">About FamilyFlow</h2>
        <p className="text-xs text-muted">All family data is stored locally in your browser. AI suggestion requests are proxied through the app server — your API key is never logged or stored on the server.</p>
        <p className="text-xs text-muted">MVP v0.1 — Next.js, Zustand, Tailwind CSS v4.</p>
      </section>
    </div>
  )
}
