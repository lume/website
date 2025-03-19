import './await-startup.js'
import {appTitle} from './routes.js'
import {effect} from './meteor-signals.js'
import {AppRoot} from './elements/AppRoot.js'
import './imports/collections/Visits.js'

export default AppRoot

effect(() => (document.title = appTitle()))
