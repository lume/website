export const StudioSignups = new Mongo.Collection<{email: string}>('StudioSignups')

if (Meteor.isServer) {
	Meteor.methods({
		async studioSignup(email: string) {
			await StudioSignups.upsertAsync({email}, {email})
		},
	})
}
