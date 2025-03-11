export const Visits = new Mongo.Collection<{route: string; visits: number}>('Visits')

if (Meteor.isServer) {
	if (Meteor.isDevelopment) {
		await Visits.removeAsync({})
	}

	Meteor.publish('Visits', () => Visits.find({}))

	Meteor.methods({
		async 'visits.increment'(route: string) {
			await Visits.upsertAsync({route}, {$inc: {visits: 1}})
		},
	})
} else {
	Meteor.subscribe('Visits')
}
