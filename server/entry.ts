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

import '../imports/collections/index.js'
import {WebApp} from 'meteor/webapp'

// @ts-expect-error missing type (TODO update away from @types/meteor? Ask
// Meteor's AI "How to set up TypeScript", there's some good docs.)
WebApp.addHtmlAttributeHook(() => ({lang: 'en', prefix: 'og: http://ogp.me/ns#'}))

const allowedOrigins = [
	'https://lume.io',
	'https://docs.lume.io',

	// lume.io on localhost
	'http://localhost:8765',
	'http://127.0.0.1:8765',
	'http://0.0.0.0:8765',

	// docs.lume.io on localhost
	'http://localhost:54321',
	'http://127.0.0.1:54321',
	'http://0.0.0.0:54321',
]

// Allow only certain domains to access content.
WebApp.rawConnectHandlers.use(
	/*'/public',*/
	function (req, res, next) {
		// Check if the request is from a valid origin, and if so allow it.
		//
		// If there is no origin header, it means its a same-origin request GET
		// or HEAD request, otherwise it is another type of same-origin request,
		// or a cross-origin request (cross-origin requests from non-hacked
		// browsers always have the origin header). Setting access control is
		// not a security feature, but more of a convenience for the browser to
		// block resources from being usable on other origins, always use
		// authentication.
		// (https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin#description)
		if (!req.headers.origin || allowedOrigins.includes(req.headers.origin)) {
			res.setHeader('Access-Control-Allow-Origin', req.headers.origin ? req.headers.origin : '*')
			res.setHeader('Vary', 'Origin')
		}

		return next()
	},
)
