import type { Register } from 'claude-code'

import { register as compact } from './compact'
import { register as fuse } from './fuse/register'
import { register as weather } from './weather/register'

// The band above the prompt (weather, limits, «Сжать») and the fuse, as one plugin.
// The first registered draws outermost: the fuse, so its card spans the whole band
// on a line of its own above the weather; the weather next, so «Сжать» sits on its line.
export const register: Register = (on, options) => {
  fuse(on, options)
  weather(on, options)
  compact(on, options)
}
