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

// `next(e)` answers `{ type: 'engine' }` when nothing beneath drew: it may only stand alone.
function drawnBeneath(rest: RenderElement): RenderElement | null {
  return rest.type === 'engine' ? null : rest
}

export const register: Register = on => {
  // «Сжать» at the right end of the band; what else the band holds takes the room it leaves.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const rest = await next(e)
    if (e.props.hasSurvey) return rest

    const { Box, Button } = $.ui.resolve(e)
    const button = (
      <Box flexShrink={0}>
        <Button key="cockpit-compact" label="🗜 Сжать" onPress={async () => compactNow($)} />
      </Box>
    )
    const others = drawnBeneath(rest)
    if (others === null) return button
    // Side by side, not glued into one row: the weather's band wraps, so the button
    // stays on its line and a full-width card (the fuse's) takes a line of its own.
    return (
      <>
        {button}
        {others}
      </>
    )
  })
}
