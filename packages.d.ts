declare module 'meteor/session' {
	namespace Session {
		// This is added by ferjep:persistent-session
		function setPersistent(key: string, value: string | object): void
	}
}

// TODO Remove this type definition once we update accounts-password to 3.1.0 of
// this issue is solved: https://github.com/meteor/meteor/issues/13660
declare module 'meteor/accounts-base' {
	import type {Mongo} from 'meteor/mongo'

	namespace Accounts {
		function findUserByEmailTmp(
			email: string,
			options?: {fields?: Mongo.FieldSpecifier | undefined},
		): Promise<Meteor.User | null | undefined>
	}
}
