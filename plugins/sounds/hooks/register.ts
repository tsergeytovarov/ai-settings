import type { EngineInterface, Register } from 'claude-code'

export const DONE = 'sounds/done.wav'
export const ASK = 'sounds/ask.wav'

// Tools whose whole point is a question to the person.
const QUESTION_TOOLS = new Set(['AskUserQuestion', 'ExitPlanMode'])
// The fuse asks with this header and plays its own alarm; one sound is enough.
const FUSE_HEADER = '⛔ Опасно'

// Module state: a scheduled task runs with nobody to hear it.
let isUnattended = false

// Not awaited: the clip plays alongside, the turn and the dialog do not wait for it.
function chime($: EngineInterface, asset: string): void {
  if (isUnattended) return
  $.audio.play({ asset }).catch(error => {
    $.ui.log(`sounds: ${asset} did not play: ${error instanceof Error ? error.message : String(error)}`, { to: 'debug' })
  })
}

function isFuseQuestion(e: unknown): boolean {
  const questions = (e as { questions?: Array<{ header?: unknown }> }).questions ?? []
  return questions.some(question => question.header === FUSE_HEADER)
}

export const register: Register = on => {
  on('prompt.submit', async ($, e, next) => {
    if (e.text.startsWith('<scheduled-task')) isUnattended = true
    return next(e)
  })

  // The answer is written: the main loop's turn ended on its own, not by a stop
  // the person pressed while watching. A subagent's turn is part of the work.
  on('turn.complete', async ($, e, next) => {
    const answer = await next(e)
    if (e.agentId === undefined && e.reason !== 'aborted') chime($, DONE)
    return answer
  })

  // The model asks a question or brings a plan to approve.
  on('tool.call', async ($, e, next) => {
    if (QUESTION_TOOLS.has(e.tool) && !isFuseQuestion(e)) chime($, ASK)
    return next(e)
  })

  // A permission dialog. Questions and plans come through here too, and already rang above.
  on('classic.PermissionRequest', async ($, e, next) => {
    if (!QUESTION_TOOLS.has(e.tool_name)) chime($, ASK)
    return next(e)
  })
}
