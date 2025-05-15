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
import {Accounts} from 'meteor/accounts-base'

// @ts-expect-error missing type (TODO update away from @types/meteor? Ask
// Meteor's AI "How to set up TypeScript", there's some good docs.)
WebApp.addHtmlAttributeHook(() => ({lang: 'en', prefix: 'og: http://ogp.me/ns#'}))

const lumeDomain = (sub?: string) => `https://${sub ? sub + '.' : ''}lume.io`

const locals = (port: string | number) => [
	`http://localhost:${port}`,
	`http://127.0.0.1:${port}`,
	`http://0.0.0.0:${port}`,
]

const allowedOrigins = [
	lumeDomain(),
	lumeDomain('docs'),

	// TODO authentication into the forum using Lume login.
	// "https://lume.community",

	// lume.io on localhost
	...locals(8765),

	// docs.lume.io on localhost
	...locals(54321),
]

// Allow only certain domains to access content from the server (for example
// domains that we have not authorized will not be able to authenticate using
// lume.io via iframe).
WebApp.rawHandlers.use(
	/*'/public',*/
	function (req, res, next) {
		// Respond to preflight requests.
		// TODO Do we need this (if we're only on GET)?
		// if (req.method === 'OPTIONS') {
		// 	res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
		//  // Meteor is on GET only by default, with API communication over
		//  // WebSockets, we're currently not handling anything other than GET.c
		// 	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
		// 	res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
		// 	res.setHeader('Access-Control-Max-Age', '3600')
		// 	res.writeHead(200)
		// 	res.end()
		// 	return
		// }

		// Check if the request is from a valid origin, and if so allow it.
		//
		// If there is no origin header, it means its a same-origin GET
		// or HEAD request, otherwise it is another type of same-origin request,
		// or a cross-origin request (cross-origin requests from non-hacked
		// browsers always have the origin header). Setting access control is
		// not a security feature, but more of a convenience for the browser to
		// block resources from being usable on other origins, so always use
		// authentication.
		// (https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin#description)
		if (!req.headers.origin || allowedOrigins.includes(req.headers.origin)) {
			res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
			res.setHeader('Vary', 'Origin')

			// TODO maybe we only need to set this for documents (not scripts,
			// images, etc).
			res.setHeader(
				'Content-Security-Policy',
				`frame-ancestors 'self' ${Meteor.isDevelopment ? locals('*').join(' ') : lumeDomain('*')}`,
			)
		}

		return next()
	},
)

//// Set up admins. ////////////////////////////////
// This is in server code only so that people won't see the list of emails on
// the client.

const admins = ['joe@lume.io', 'kyleb@lume.io', 'anastasia@lume.io', 'kyle@lume.io']

Accounts.findUserByEmailTmp = Accounts.findUserByEmail as any

// If a user signs up with a known admin email, make them an admin.
Accounts.onCreateUser((options, user) => {
	const isAdmin = user.emails?.some(email => admins.includes(email.address.toLowerCase()))

	user.profile = {...user.profile, ...options.profile, isAdmin}

	return user
})

const promises = [] as Promise<any>[]

// Make all existing users with a known admin email admins.
for (const email of admins) {
	promises.push(
		Accounts.findUserByEmailTmp(email).then(user => {
			if (user) return Meteor.users.updateAsync({_id: user._id}, {$set: {profile: {...user.profile, isAdmin: true}}})
		}),
	)
}

await Promise.all(promises)

// TODO configure default field selector.
// Accounts.config({ defaultFieldSelector: { includeThisOne: 1, excludeThisOne: 0 } })
