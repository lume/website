// import './await-startup.js'
import './imports/collections/Visits.js'
import {appTitle} from './routes.js'
import {effect} from './meteor-signals.js'

const devPort = 8765
const locals = [`http://localhost:${devPort}`, `http://127.0.0.1:${devPort}`, `http://0.0.0.0:${devPort}`]
const homePageOrigins = ['https://lume.io', ...locals]
const inIframe = window.parent !== window

// Render the UI only when on the home page domain (or localhost), but
// not for HTML files because they render their own content (they can
// still use Meteor APIs), and not when in an iframe (because if we're
// in a iframe, it is for off-screen credentials requests by other
// domains and the primary domain's UI is not needed in that case).
const renderHomePage = homePageOrigins.includes(location.origin) && !location.pathname.endsWith('.html') && !inIframe

if (renderHomePage) {
	effect(() => (document.title = appTitle()))

	await import('./elements/HomePage.js')
	const root = document.getElementById('root')!
	const html = String.raw // for syntax/formatting
	root.innerHTML = html`<home-page></home-page>`
}
