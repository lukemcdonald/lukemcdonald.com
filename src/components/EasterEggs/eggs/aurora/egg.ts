import type { EasterEgg } from '../../types'

import { mountAuroraFireflies, unmountAuroraFireflies } from './fireflies'
import { KONAMI_SEQUENCE } from './sequence'

export const auroraEgg: EasterEgg = {
  id: 'aurora',
  mode: 'toggle',
  name: 'Aurora',
  onActivate: mountAuroraFireflies,
  onDismiss: unmountAuroraFireflies,
  soundOff: 'close',
  soundOn: 'success',
  trigger: {
    codes: KONAMI_SEQUENCE,
    type: 'sequence',
  },
}
