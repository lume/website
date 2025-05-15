// Define what we will store in user.profile.
declare module 'meteor/meteor' {
	namespace Meteor {
		interface UserProfile {
			isAdmin?: boolean
		}
	}
}
