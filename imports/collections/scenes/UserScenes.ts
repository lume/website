import {Meteor} from 'meteor/meteor'
import {Mongo} from 'meteor/mongo'

interface ElementNodeAttribute {
	/**
	 * The camelCased name of the attribute.
	 */
	name: string
	val: any
}

/**
 * Node within the scene hierarchy.
 */
export interface SceneElementNode {
	tagName: string
	attributes?: ElementNodeAttribute[]

	parent?: SceneElementNode
	children?: SceneElementNode[]
}

export interface UserSceneDocument {
	_id?: string

	/**
	 * `_id` of the user that created the scene.
	 */
	userId?: string

	/**
	 * Title for the scene.
	 */
	title?: string

	/**
	 * The head scene node of the user's scene.
	 */
	node: SceneElementNode

	/**
	 * TODO: We'll put metrics here, such as likes, saves, views, etc.
	 */

	dateCreated?: Date

	dateModified?: Date
}

export const UserScenes = new Mongo.Collection<UserSceneDocument>('UserScenes')

UserScenes.deny({
	insert() {
		return true
	},
	update() {
		return true
	},
	remove() {
		return true
	},
})

if (Meteor.isServer) {
	Meteor.methods({
		async getUserScenes() {
			if (!this.userId) return

			return UserScenes.find({userId: this.userId}).fetch()
		},
		async createUserScene(node: SceneElementNode) {
			if (!this.userId) return

			const dateNow = new Date(Date.now())

			const sceneDoc: UserSceneDocument = {
				node,
				userId: this.userId,
				dateCreated: dateNow,
				dateModified: dateNow,
			}

			return UserScenes.insert(sceneDoc)
		},
		async updateUserScene(doc: UserSceneDocument) {
			if (!this.userId) return

			// Verify the scene being updated belongs to the user.
			// In the future, we can maybe have a list of allowed userIds that can modify the
			// scene.
			const existingScene = UserScenes.findOne({_id: doc._id})
			if (!existingScene) {
				throw new Meteor.Error('user-scene-not-found', 'Error: Scene not found.')
			}
			if (existingScene.userId !== this.userId) {
				throw new Meteor.Error('user-scene-ownership', 'Error: Attempted to update a scene not created by the user.')
			}

			// TODO Verify scene title doesn't violate any rules...

			return UserScenes.update(
				{_id: doc._id},
				{$set: {title: doc.title, node: doc.node, dateModified: new Date(Date.now())}},
			)
		},
		async removeUserScene(id: string) {
			if (!this.userId) return

			const existingScene = UserScenes.findOne({_id: id})
			if (!existingScene) {
				throw new Meteor.Error('user-scene-not-found', 'Error: Scene not found.')
			}
			if (existingScene.userId !== this.userId) {
				throw new Meteor.Error('user-scene-ownership', 'Error: Attempted to remove a scene not created by the user.')
			}

			return UserScenes.remove({_id: id})
		},
	})
}
