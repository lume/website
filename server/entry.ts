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

// WebApp is defined by Meteor, but the type is missin.
declare const WebApp: any

WebApp.addHtmlAttributeHook(() => ({lang: 'en'}))

// Allow only certain domains to access content.
WebApp.rawConnectHandlers.use(
	/*'/public',*/
	function (req, res, next) {
		// For development mode allow localhost origins.
		if (
			[
				// landing page (the Meteor app)
				'localhost:3000',
				'127.0.0.1:3000',
				'0.0.0.0:3000',
				// docs site (the static Docsify app)
				'localhost:54321',
				'127.0.0.1:54321',
				'0.0.0.0:54321',
			].includes(req.headers.host)
		) {
			// We use 'http://' for local development.
			res.setHeader('Access-Control-Allow-Origin', 'http://' + req.headers.host)
		}
		// Otherwise only allow lume.io.
		else {
			// Asumption: lume.io is only accessible via HTTPS, so that's why we
			// can confidently use 'https://' in the following.
			res.setHeader('Access-Control-Allow-Origin', 'https://lume.io')
		}

		return next()
	},
)
