import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faCopy, faPaste } from '@fortawesome/free-solid-svg-icons'

library.add(faCopy, faPaste)
dom.watch() // Restores the auto-replace-on-import behavior of the old @fortawesome/fontawesome package
