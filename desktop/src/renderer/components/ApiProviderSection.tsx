import React, { useCallback, useEffect, useState } from 'react';

type ProviderConfig = {
  anthropicApiKey: string;
  anthropicAuthToken: string;
  anthropicBaseUrl: string;
  anthropicModel: string;
  anthropicHaikuModel: string;
  anthropicSonnetModel: string;
  anthropicOpusModel: string;
};

const empty: ProviderConfig = {
  anthropicApiKey: '',
  anthropicAuthToken: '',
  anthropicBaseUrl: '',
  anthropicModel: '',
  anthropicHaikuModel: '',
  anthropicSonnetModel: '',
  anthropicOpusModel: '',
};

// Provider presets matching cc-switch's claudeProviderPresets.ts
type ProviderPreset = {
  name: string;
  baseUrl: string;
  model: string;
  haikuModel: string;
  sonnetModel: string;
  opusModel: string;
  authField: 'apiKey' | 'authToken';
};

const PRESETS: ProviderPreset[] = [
  {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/anthropic',
    model: 'deepseek-v4-pro',
    haikuModel: 'deepseek-v4-flash',
    sonnetModel: 'deepseek-v4-pro',
    opusModel: 'deepseek-v4-pro',
    authField: 'authToken',
  },
  {
    name: 'Zhipu GLM',
    baseUrl: 'https://open.bigmodel.cn/api/anthropic',
    model: 'glm-5',
    haikuModel: 'glm-5',
    sonnetModel: 'glm-5',
    opusModel: 'glm-5',
    authField: 'authToken',
  },
  {
    name: 'Kimi',
    baseUrl: 'https://api.moonshot.cn/anthropic',
    model: 'kimi-k2.6',
    haikuModel: 'kimi-k2.6',
    sonnetModel: 'kimi-k2.6',
    opusModel: 'kimi-k2.6',
    authField: 'authToken',
  },
  {
    name: 'SiliconFlow',
    baseUrl: 'https://api.siliconflow.cn',
    model: 'Pro/MiniMaxAI/MiniMax-M2.7',
    haikuModel: 'Pro/MiniMaxAI/MiniMax-M2.7',
    sonnetModel: 'Pro/MiniMaxAI/MiniMax-M2.7',
    opusModel: 'Pro/MiniMaxAI/MiniMax-M2.7',
    authField: 'authToken',
  },
  {
    name: 'ModelScope',
    baseUrl: 'https://api-inference.modelscope.cn',
    model: 'ZhipuAI/GLM-5',
    haikuModel: 'ZhipuAI/GLM-5',
    sonnetModel: 'ZhipuAI/GLM-5',
    opusModel: 'ZhipuAI/GLM-5',
    authField: 'authToken',
  },
  {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api',
    model: 'anthropic/claude-sonnet-4.6',
    haikuModel: 'anthropic/claude-haiku-4.5',
    sonnetModel: 'anthropic/claude-sonnet-4.6',
    opusModel: 'anthropic/claude-opus-4.7',
    authField: 'authToken',
  },
  {
    name: 'OpenAI Codex',
    baseUrl: 'https://chatgpt.com/backend-api/codex',
    model: 'gpt-5.4',
    haikuModel: 'gpt-5.4-mini',
    sonnetModel: 'gpt-5.4',
    opusModel: 'gpt-5.4',
    authField: 'authToken',
  },
  {
    name: 'LiteLLM / Custom',
    baseUrl: '',
    model: '',
    haikuModel: '',
    sonnetModel: '',
    opusModel: '',
    authField: 'apiKey',
  },
];

/**
 * Anthropic-compatible API provider config.
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
          anthropicAuthToken: typeof p?.anthropicAuthToken === 'string' ? p.anthropicAuthToken : '',
          anthropicBaseUrl: typeof p?.anthropicBaseUrl === 'string' ? p.anthropicBaseUrl : '',
          anthropicModel: typeof p?.anthropicModel === 'string' ? p.anthropicModel : '',
          anthropicHaikuModel: typeof p?.anthropicHaikuModel === 'string' ? p.anthropicHaikuModel : '',
          anthropicSonnetModel: typeof p?.anthropicSonnetModel === 'string' ? p.anthropicSonnetModel : '',
          anthropicOpusModel: typeof p?.anthropicOpusModel === 'string' ? p.anthropicOpusModel : '',
        });
      })
      .catch(() => setCfg(empty))
      .finally(() => setLoaded(true));
  }, []);

  const applyPreset = useCallback((preset: ProviderPreset) => {
    setCfg((c) => ({
      ...c,
      anthropicBaseUrl: preset.baseUrl,
      anthropicModel: preset.model,
      anthropicHaikuModel: preset.haikuModel,
      anthropicSonnetModel: preset.sonnetModel,
      anthropicOpusModel: preset.opusModel,
    }));
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

  const hasConfig = cfg.anthropicBaseUrl && (cfg.anthropicApiKey || cfg.anthropicAuthToken);

  return (
    <section className="border-t border-edge-dim pt-4 mt-1">
      <h3 className="text-[10px] font-medium text-fg-muted tracking-wider uppercase mb-2">Third-party API endpoint</h3>
      <p className="text-[10px] text-fg-faint leading-snug mb-3">
        Use non-Anthropic providers via their Anthropic-compatible endpoints. Set the API key and base URL — new
        sessions pick this up automatically.
      </p>

      {/* Preset selector */}
      <label className="block text-[10px] text-fg-muted uppercase tracking-wide mb-1">Quick setup</label>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => applyPreset(p)}
            className="px-2 py-1 text-[10px] rounded border border-edge-dim bg-inset text-fg-2 hover:bg-well hover:border-edge transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* API key */}
      <label className="block text-[10px] text-fg-muted uppercase tracking-wide mb-1">
        API key <span className="text-fg-faint">(ANTHROPIC_API_KEY)</span>
      </label>
      <input
        type="password"
        autoComplete="off"
        value={cfg.anthropicApiKey}
        onChange={(e) => setCfg((c) => ({ ...c, anthropicApiKey: e.target.value }))}
        placeholder="sk-ant-…"
        className="w-full bg-inset border border-edge-dim rounded px-2 py-1.5 text-[11px] text-fg placeholder:text-fg-faint focus:outline-none focus:border-accent mb-3"
      />

      {/* Auth token (some gateways like DeepSeek use ANTHROPIC_AUTH_TOKEN) */}
      <label className="block text-[10px] text-fg-muted uppercase tracking-wide mb-1">
        Auth token <span className="text-fg-faint">(ANTHROPIC_AUTH_TOKEN)</span>
      </label>
      <input
        type="password"
        autoComplete="off"
        value={cfg.anthropicAuthToken}
        onChange={(e) => setCfg((c) => ({ ...c, anthropicAuthToken: e.target.value }))}
        placeholder="some gateways expect this field"
        className="w-full bg-inset border border-edge-dim rounded px-2 py-1.5 text-[11px] text-fg placeholder:text-fg-faint focus:outline-none focus:border-accent mb-3"
      />

      {/* Base URL */}
      <label className="block text-[10px] text-fg-muted uppercase tracking-wide mb-1">
        Base URL <span className="text-fg-faint">(ANTHROPIC_BASE_URL)</span>
      </label>
      <input
        type="url"
        value={cfg.anthropicBaseUrl}
        onChange={(e) => setCfg((c) => ({ ...c, anthropicBaseUrl: e.target.value }))}
        placeholder="https://your-proxy.example.com"
        className="w-full bg-inset border border-edge-dim rounded px-2 py-1.5 text-[11px] text-fg placeholder:text-fg-faint focus:outline-none focus:border-accent mb-3"
      />

      {/* Model mappings */}
      <details className="mb-3" open={hasConfig}>
        <summary className="text-[10px] text-fg-muted uppercase tracking-wide cursor-pointer hover:text-fg-2 transition-colors select-none mb-2">
          Model overrides
        </summary>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[10px] text-fg-faint">Model</span>
            <input
              type="text"
              value={cfg.anthropicModel}
              onChange={(e) => setCfg((c) => ({ ...c, anthropicModel: e.target.value }))}
              placeholder='e.g. "deepseek-v4-pro"'
              className="w-full bg-inset border border-edge-dim rounded px-2 py-1 text-[11px] text-fg placeholder:text-fg-faint focus:outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-[10px] text-fg-faint">Haiku model</span>
            <input
              type="text"
              value={cfg.anthropicHaikuModel}
              onChange={(e) => setCfg((c) => ({ ...c, anthropicHaikuModel: e.target.value }))}
              placeholder='e.g. "deepseek-v4-flash"'
              className="w-full bg-inset border border-edge-dim rounded px-2 py-1 text-[11px] text-fg placeholder:text-fg-faint focus:outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-[10px] text-fg-faint">Sonnet model</span>
            <input
              type="text"
              value={cfg.anthropicSonnetModel}
              onChange={(e) => setCfg((c) => ({ ...c, anthropicSonnetModel: e.target.value }))}
              placeholder='e.g. "deepseek-v4-pro"'
              className="w-full bg-inset border border-edge-dim rounded px-2 py-1 text-[11px] text-fg placeholder:text-fg-faint focus:outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-[10px] text-fg-faint">Opus model</span>
            <input
              type="text"
              value={cfg.anthropicOpusModel}
              onChange={(e) => setCfg((c) => ({ ...c, anthropicOpusModel: e.target.value }))}
              placeholder='e.g. "deepseek-v4-pro"'
              className="w-full bg-inset border border-edge-dim rounded px-2 py-1 text-[11px] text-fg placeholder:text-fg-faint focus:outline-none focus:border-accent"
            />
          </label>
        </div>
      </details>

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
