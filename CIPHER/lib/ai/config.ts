/**
 * CIPHER AI Assistant Central Configuration
 * Supports Ollama GPT-OSS 120B Cloud (gpt-oss:120b-cloud)
 * Configurable via local proxy (http://localhost:11434) or direct cloud API
 */

export interface AIConfig {
  provider: string;
  model: string;
  baseUrl: string;
  apiKey?: string;
  temperature: number;
}

export const aiConfig: AIConfig = {
  provider: process.env.AI_PROVIDER || "ollama",
  model: process.env.OLLAMA_MODEL || "gpt-oss:120b-cloud",
  baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  apiKey: process.env.OLLAMA_API_KEY || undefined,
  temperature: 0.2, // Low temperature for factual forensic intelligence
};

export async function checkOllamaConnection(): Promise<{
  connected: boolean;
  model: string;
  provider: string;
  version?: string;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (aiConfig.apiKey) {
      headers["Authorization"] = `Bearer ${aiConfig.apiKey}`;
    }

    // Try checking Ollama version endpoint
    const res = await fetch(`${aiConfig.baseUrl}/api/version`, {
      method: "GET",
      headers,
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        connected: true,
        model: aiConfig.model,
        provider: aiConfig.provider,
        version: data.version || "active",
      };
    }

    // Fallback: check tags endpoint
    const tagsRes = await fetch(`${aiConfig.baseUrl}/api/tags`, {
      method: "GET",
      headers,
    }).catch(() => null);

    if (tagsRes && tagsRes.ok) {
      return {
        connected: true,
        model: aiConfig.model,
        provider: aiConfig.provider,
        version: "cloud/active",
      };
    }

    return {
      connected: false,
      model: aiConfig.model,
      provider: aiConfig.provider,
      error: "Ollama endpoint unreachable at " + aiConfig.baseUrl,
    };
  } catch (err: any) {
    return {
      connected: false,
      model: aiConfig.model,
      provider: aiConfig.provider,
      error: err?.message || "Connection failed",
    };
  }
}
