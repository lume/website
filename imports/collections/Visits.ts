import {Meteor} from 'meteor/meteor'
import {Mongo} from 'meteor/mongo'

export interface Visit {
	host?: string // No host means lume.io (otherwise we have to do a migration to fix it)
	route: string // The route is the path of the URL, e.g. '/foo/bar'
	visits: number
}

export const Visits = new Mongo.Collection<Visit>('Visits')

if (Meteor.isServer) {
	Meteor.publish('Visits', async () => {
		const user = await Meteor.userAsync()
		const isAdmin = !!user?.profile?.isAdmin

		if (isAdmin) return Visits.find({})
		return []
	})

	Meteor.methods({
		async 'visits.increment'(href: string) {
			const url = new URL(href)
			const route = url.pathname
			const host = url.host
			await Visits.upsertAsync({host, route}, {$inc: {visits: 1}})
		},
	})
} else {
	Meteor.subscribe('Visits')
}
