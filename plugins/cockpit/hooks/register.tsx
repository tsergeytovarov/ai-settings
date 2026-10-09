import type { Register } from 'claude-code'

import { register as compact } from './compact'
import { register as fuse } from './fuse/register'
import { register as weather } from './weather/register'

// The band above the prompt (weather, limits, «Сжать») and the fuse, as one plugin.
export const register: Register = (on, options) => {
  weather(on, options)
  compact(on, options)
  fuse(on, options)
}
