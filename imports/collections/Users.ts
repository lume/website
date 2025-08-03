import {Meteor} from 'meteor/meteor'

// Define what we will store in user.profile.
declare module 'meteor/meteor' {
	namespace Meteor {
		interface UserProfile {
			isAdmin?: boolean
		}
	}
}

if (Meteor.isServer) {
	Meteor.methods({
		async updateUsername(username: string) {
			if (!this.userId) return

			// username validation
			// Alphanumeric, underscores, and dashes allowed, and must start with a letter.
			if (!/^[a-zA-Z][a-zA-Z0-9_\-]*$/.test(username)) {
				throw new Meteor.Error(
					'invalid-username',
					'Username can only contain letters, numbers, underscores, and dashes, and must start with a letter.',
				)
			}
			// length validation
			if (!username || username.length < 3 || username.length > 40) {
				throw new Meteor.Error('invalid-username', 'Username must be between 3 and 40 characters long.')
			}

			await Meteor.users.updateAsync({_id: this.userId}, {$set: {username}})
		},
	})

	Meteor.publish('usersCount', function () {
		Counts.publish(this, 'users', Meteor.users.find())
	})
}
