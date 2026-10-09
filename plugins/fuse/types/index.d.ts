// Rule ids the person allowed for the rest of the session.
export type AllowedRules = string[]

// One path an rm would delete, as found on disk.
export type TargetInfo = {
  path: string
  kind: 'file' | 'dir' | 'missing' | 'pattern'
  files?: number
  bytes?: number
  // The count stopped at its limit, or a folder could not be read.
  isPartial?: boolean
}

// The question the fuse is waiting on, for the card above the prompt and the dialog.
export type PendingDanger = {
  question: string
  what: string
  detail: string
  why: string | null
  targets: TargetInfo[]
}

declare module 'claude-code' {
  interface PluginState {
    fuse: {
      allowed: AllowedRules
      // The session runs a scheduled task: nobody is there to answer.
      isUnattended: boolean
      pending: PendingDanger | null
    }
  }
}
