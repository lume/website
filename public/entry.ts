// Render the UI only when on the home page domain (or localhost), but
// not for HTML files because they render their own content (they can
// still use Meteor APIs), and not when in an iframe (because if we're
// in a iframe, it is for off-screen credentials requests by other
// domains and the primary domain's UI is not needed in that case).
const renderHomePage = location.pathname === '/'

if (renderHomePage) {
	// import './await-startup.js'
	await import('./imports/collections/Visits.js')
	const {appTitle} = await import('./routes.js')
	const {effect} = await import('./meteor-signals.js')
	await import('./elements/HomePage.js')

	effect(() => (document.title = appTitle()))

	const root = document.getElementById('root')!
	const html = String.raw // for syntax/formatting
	root.innerHTML = html`<home-page></home-page>`

	setTimeout(() => {
		const loadingCover = document.getElementById('loadingCover')!
		loadingCover.classList.add('invisible')
		loadingCover.addEventListener('animationend', () => loadingCover.remove())
	}, 1000)
}

export {} // merely so that TS treats the file as a module
