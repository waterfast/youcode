import React, { useCallback, useEffect, useState } from 'react';

type ProviderConfig = {
  anthropicApiKey: string;
  anthropicBaseUrl: string;
};

const empty: ProviderConfig = { anthropicApiKey: '', anthropicBaseUrl: '' };

/**
 * Optional Anthropic-compatible API key + base URL (e.g. LiteLLM / OpenRouter proxy).
 * Persists to ~/.claude-mobile/api-provider.json — same file Android PtyBridge reads.
 */
export default function ApiProviderSection() {
  const [cfg, setCfg] = useState<ProviderConfig>(empty);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const provider = (window as unknown as { claude?: { provider?: { get: () => Promise<ProviderConfig> } } }).claude
      ?.provider;
    if (!provider?.get) {
      setLoaded(true);
      return;
    }
    provider
      .get()
      .then((p: ProviderConfig) => {
        setCfg({
          anthropicApiKey: typeof p?.anthropicApiKey === 'string' ? p.anthropicApiKey : '',
          anthropicBaseUrl: typeof p?.anthropicBaseUrl === 'string' ? p.anthropicBaseUrl : '',
        });
      })
      .catch(() => setCfg(empty))
      .finally(() => setLoaded(true));
  }, []);

  const save = useCallback(() => {
    const provider = (window as unknown as { claude?: { provider?: { set: (u: ProviderConfig) => Promise<boolean> } } })
      .claude?.provider;
    if (!provider?.set) return;
    setStatus(null);
    provider
      .set(cfg)
      .then((ok: boolean) => {
        setStatus(ok ? 'Saved.' : 'Save failed.');
        if (ok) setTimeout(() => setStatus(null), 2500);
      })
      .catch(() => setStatus('Save failed.'));
  }, [cfg]);

  if (!loaded) {
    return <p className="text-[11px] text-fg-muted py-1">Loading API settings…</p>;
  }

  return (
    <section className="border-t border-edge-dim pt-4 mt-1">
      <h3 className="text-[10px] font-medium text-fg-muted tracking-wider uppercase mb-2">Custom API endpoint</h3>
      <p className="text-[10px] text-fg-faint leading-snug mb-3">
        Optional <code className="text-fg-2">ANTHROPIC_API_KEY</code> and{' '}
        <code className="text-fg-2">ANTHROPIC_BASE_URL</code> for an Anthropic-compatible gateway (e.g. LiteLLM). Native
        DeepSeek HTTP is OpenAI-shaped — use a proxy that speaks Anthropic&apos;s API. New sessions pick this up
        automatically.
      </p>
      <label className="block text-[10px] text-fg-muted uppercase tracking-wide mb-1">API key</label>
      <input
        type="password"
        autoComplete="off"
        value={cfg.anthropicApiKey}
        onChange={(e) => setCfg((c) => ({ ...c, anthropicApiKey: e.target.value }))}
        placeholder="sk-…"
        className="w-full bg-inset border border-edge-dim rounded px-2 py-1.5 text-[11px] text-fg placeholder:text-fg-faint focus:outline-none focus:border-accent mb-3"
      />
      <label className="block text-[10px] text-fg-muted uppercase tracking-wide mb-1">Base URL</label>
      <input
        type="url"
        value={cfg.anthropicBaseUrl}
        onChange={(e) => setCfg((c) => ({ ...c, anthropicBaseUrl: e.target.value }))}
        placeholder="https://your-proxy.example.com"
        className="w-full bg-inset border border-edge-dim rounded px-2 py-1.5 text-[11px] text-fg placeholder:text-fg-faint focus:outline-none focus:border-accent mb-2"
      />
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={save}
          className="px-3 py-1.5 text-[11px] font-medium rounded-md bg-accent text-on-accent hover:opacity-90 transition-opacity"
        >
          Save
        </button>
        {status ? <span className="text-[10px] text-fg-muted">{status}</span> : null}
      </div>
    </section>
  );
}
