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

			await Meteor.users.updateAsync({_id: this.userId}, {$set: {username}})
		},
	})
}
