export const StudioSignups = new Mongo.Collection<{email: string}>('StudioSignups')

if (Meteor.isServer) {
	if (Meteor.isDevelopment) {
		await StudioSignups.removeAsync({})
	}

	Meteor.methods({
		async studioSignup(email: string) {
			await StudioSignups.upsertAsync({email}, {email})
			console.log('sign up recorded:', await StudioSignups.find().fetchAsync())
		},
	})
}
