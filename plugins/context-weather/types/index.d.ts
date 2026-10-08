export type ContextReading = { tokens?: number; window: number; percent?: number }

// The fields of SessionRateLimit the band reads.
export type RateLimitReading = { kind: string; percentUsed: number; resetsAt?: string }

declare module 'claude-code' {
  interface PluginState {
    'context-weather': { reading: ContextReading | null; limits: RateLimitReading[] }
  }
}
