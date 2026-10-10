import type { EngineInterface, Register, RenderElement } from 'claude-code'

function reasonOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

// The direct call refuses while the engine counts a turn as running, and a button
// press may count as one. /compact as a command waits for the session to go idle.
async function compactNow($: EngineInterface): Promise<void> {
  try {
    const result = await $.session.compact({})
    if (result.messages === undefined) $.ui.toast(`Сжатие отменено: ${result.skip}`)
  } catch (direct) {
    $.ui.log(`cockpit: $.session.compact refused: ${reasonOf(direct)}`, { to: 'debug' })
    try {
      await $.command.run({ command: 'compact', args: '' })
    } catch (queued) {
      $.ui.toast(`Сжать не вышло: ${reasonOf(queued)}`)
    }
  }
}

// chat-memory draws its own «Сжать», which also saves the memory: with it on, one button
// is enough. A read that fails counts as off, so the band keeps a button.
async function isChatMemoryOn($: EngineInterface): Promise<boolean> {
  try {
    const enabled = (await $.settings.read()).enabledPlugins
    if (typeof enabled !== 'object' || enabled === null) return false
    return Object.entries(enabled).some(([id, on]) => id.startsWith('chat-memory@') && on !== false)
  } catch {
    return false
  }
}

// `next(e)` answers `{ type: 'engine' }` when nothing beneath drew: it may only stand alone.
function drawnBeneath(rest: RenderElement): RenderElement | null {
  return rest.type === 'engine' ? null : rest
}

export const register: Register = on => {
  // «Сжать» at the right end of the band; what else the band holds takes the room it leaves.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const rest = await next(e)
    if (e.props.hasSurvey || (await isChatMemoryOn($))) return rest

    const { Box, Button } = $.ui.resolve(e)
    const button = (
      <Box flexShrink={0}>
        <Button key="cockpit-compact" label="🗜 Сжать" onPress={async () => compactNow($)} />
      </Box>
    )
    const others = drawnBeneath(rest)
    if (others === null) return button
    // The rest of the band takes the room the button leaves; the button holds to
    // the top, beside the weather's line, when the fuse's card adds a second line.
    return (
      <Box flexDirection="row" alignItems="flex-start" gap={1} width="100%">
        <Box flexGrow={1} flexShrink={1} minWidth={0}>
          {others}
        </Box>
        {button}
      </Box>
    )
  })
}
