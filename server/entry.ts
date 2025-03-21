// Native ESM test: ///////////////////////////////////////////////////////
// This is not working natively (without ecmascript package) because import() not available in a Node `vm`: https://forums.meteor.com/t/attempt-to-import-native-es-modules-in-meteor-3-0-beta-0-no-luck-yet/61085
// import('./imports/test.js').then(({foo}) => console.log('foo', foo))
//
// This is also not working (with ecmascript installed) with the same error:
// function nativeImport(path) {
// 	console.log('eval import')
// 	return eval(`import('${path}')`)
// }
// nativeImport('./imports/test.js').then(({foo}) => console.log('foo', foo))
//
// This works with ecmascript installed when projects are not symlinked, which doesn't work for lume's repo (https://github.com/meteor/meteor/issues/12952):
// import {foo} from './imports/test.js'
// console.log('foo', foo)
///////////////////////////////////////////////////////////////////////////

import {Meteor} from 'meteor/meteor'
import '../imports/collections/index.js'
import {WebApp} from 'meteor/webapp'

// @ts-expect-error missing type (TODO update away from @types/meteor? Ask
// Meteor's AI "How to set up TypeScript", there's some good docs.)
WebApp.addHtmlAttributeHook(() => ({lang: 'en', prefix: 'og: http://ogp.me/ns#'}))

if (Meteor.isDevelopment) {
	// Allow only certain domains to access content.
	WebApp.rawConnectHandlers.use(
		/*'/public',*/
		function (req, res, next) {
			// For development mode allow localhost origins.
			if (
				[
					// landing page (the Meteor app)
					'localhost:8765',
					'127.0.0.1:8765',
					'0.0.0.0:8765',
					// docs site (the static Docsify app)
					'localhost:54321',
					'127.0.0.1:54321',
					'0.0.0.0:54321',
				].some(val => req.headers.host === val)
			) {
				// We use 'http://' for local development.
				// res.setHeader('Access-Control-Allow-Origin', 'http://' + req.headers.host)
				res.setHeader('Access-Control-Allow-Origin', '*')
			}
			// Otherwise only allow lume.io.
			else if (req.headers.host === 'lume.io' || req.headers.host === 'docs.lume.io') {
				// lume.io is only accessible via HTTPS
				res.setHeader('Access-Control-Allow-Origin', (req as any).protocol + '://' + req.headers.host)
			}

			return next()
		},
	)
}
