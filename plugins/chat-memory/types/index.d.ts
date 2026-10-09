export type Memory = {
  goal: string
  decisions: string[]
  findings: string[]
  questions: string[]
  next: string
}

export type MemoryStatus = {
  // How many messages of the transcript the memory already covers.
  cursor: number
  isRunning: boolean
}

export type Tab = 'memory' | 'stats'

declare module 'claude-code' {
  interface PluginState {
    'chat-memory': {
      memory: Memory | null
      status: MemoryStatus
      tab: Tab
    }
  }
}
