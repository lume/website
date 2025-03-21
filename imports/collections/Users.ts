import {Accounts} from 'meteor/accounts-base'
import {admins} from '../admins.js'
import {Meteor} from 'meteor/meteor'

Accounts.findUserByEmailTmp = Accounts.findUserByEmail as any

declare module 'meteor/meteor' {
	namespace Meteor {
		interface UserProfile {
			isAdmin?: boolean
		}
	}
}

if (Meteor.isServer) {
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
				return Meteor.users.updateAsync({_id: user._id}, {$set: {profile: {...user.profile, isAdmin: true}}})
			}),
		)
	}

	await Promise.all(promises)

	// TODO configure default field selector.
	// Accounts.config({ defaultFieldSelector: { includeThisOne: 1, excludeThisOne: 0 } })
}
