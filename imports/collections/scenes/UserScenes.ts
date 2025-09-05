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

	children?: SceneElementNode[]
}

export interface UserSceneDocument {
	_id?: string

	/**
	 * `_id` of the user that created the scene.
	 */
	userId?: string

	/**
	 * Name for the scene.
	 */
	name?: string

	/**
	 * The nodes of the scene, including the scene itself. Usually, this should just be an array
	 * with a single element, being the Lume scene.
	 */
	nodes?: SceneElementNode[]

	/**
	 * TODO: We'll put metrics here, such as likes, saves, views, etc.
	 */

	dateCreated?: Date

	dateModified?: Date
}

export const UserScenes = new Mongo.Collection<UserSceneDocument>('UserScenes')

export const exampleScenes: {[_id: string]: UserSceneDocument} = {
	exampleScene1: {
		_id: 'exampleScene1',
		name: 'Example scene 1',
		nodes: [
			{
				tagName: 'lume-scene',
				children: [
					{
						tagName: 'lume-camera-rig',
						attributes: [
							{name: 'alignPoint', val: '0.5 0.5 0.5'},
							{name: 'mountPoint', val: '0.5 0.5 0.5'},
							{name: 'distance', val: '50'},
							{name: 'minDistance', val: '5'},
							{name: 'dollySpeed', val: '5'},
							{name: 'dynamicDolly', val: true},
							{name: 'maxDistance', val: '5000'},
						],
					},
					{
						tagName: 'lume-point-light',
						attributes: [
							{name: 'intensity', val: '750'},
							{name: 'alignPoint', val: '0.5 0.5 0.5'},
							{name: 'mountPoint', val: '0.5 0.5 0.5'},
							{name: 'position', val: '100 -75 120'},
							{name: 'color', val: 'pink'},
						],
					},
					{
						tagName: 'lume-ambient-light',
						attributes: [{name: 'intensity', val: '0.4'}],
					},
					{
						tagName: 'lume-box',
						attributes: [
							{name: 'alignPoint', val: '0.5 0.5 0.5'},
							{name: 'mountPoint', val: '0.5 0.5 0.5'},
							{name: 'position', val: '0 0 0'},
							{name: 'color', val: 'blue'},
							{name: 'size', val: '5 5 5'},
							{name: 'opacity', val: '0.5'},
							{name: 'has', val: 'phong-material'},
						],
						children: [
							{
								tagName: 'lume-box',
								attributes: [
									{name: 'alignPoint', val: '0.5 0.5 0.5'},
									{name: 'mountPoint', val: '0.5 0.5 0.5'},
									{name: 'position', val: '0 0 0'},
									{name: 'color', val: 'red'},
									{name: 'size', val: '5 5 5'},
									{name: 'opacity', val: '0.5'},
									{name: 'has', val: 'phong-material'},
								],
							},
						],
					},
					{
						tagName: 'lume-box',
						attributes: [
							{name: 'alignPoint', val: '0.5 0.5 0.5'},
							{name: 'mountPoint', val: '0.5 0.5 0.5'},
							{name: 'position', val: '20 0 0'},
							{name: 'color', val: 'blue'},
							{name: 'size', val: '5 5 5'},
							{name: 'has', val: 'phong-material'},
						],
					},
					{
						tagName: 'lume-sphere',
						attributes: [
							{name: 'alignPoint', val: '0.5 0.5 0.5'},
							{name: 'mountPoint', val: '0.5 0.5 0.5'},
							{name: 'position', val: '-20 0 0'},
							{name: 'color', val: 'green'},
							{name: 'size', val: '5 5 5'},
							{name: 'has', val: 'phong-material'},
						],
					},
				],
			},
		],
	},
}

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
		async getUserSceneById(id: string) {
			if (exampleScenes[id]) {
				return exampleScenes[id]
			}

			const scene = await UserScenes.findOneAsync({_id: id})

			if (!scene) throw new Meteor.Error('user-scene-not-found', 'Error: Scene not found.')

			return scene
		},
		async getUserSceneIds() {
			if (!this.userId) return []

			const scenes = UserScenes.find({userId: this.userId}).fetch()
			if (!scenes.length) return []

			return scenes.map(scene => scene._id ?? '')
		},
		async getUserScenes() {
			if (!this.userId) return

			return UserScenes.find({userId: this.userId}).fetch()
		},
		async createUserScene(scene: UserSceneDocument) {
			if (!this.userId) return

			const dateNow = new Date(Date.now())

			const sceneDoc: UserSceneDocument = {
				name: scene.name,
				nodes: scene.nodes,
				userId: this.userId,
				dateCreated: dateNow,
				dateModified: dateNow,
			}

			return UserScenes.insertAsync(sceneDoc)
		},
		async updateUserScene(doc: UserSceneDocument) {
			if (!this.userId) return

			// Verify the scene being updated belongs to the user.
			// In the future, we can maybe have a list of allowed userIds that can modify the
			// scene.
			const existingScene = await UserScenes.findOneAsync({_id: doc._id})
			if (!existingScene) {
				throw new Meteor.Error('user-scene-not-found', 'Error: Scene not found.')
			}
			if (existingScene.userId !== this.userId) {
				throw new Meteor.Error('user-scene-ownership', 'Error: Attempted to update a scene not created by the user.')
			}

			// TODO Verify scene title doesn't violate any rules...

			return UserScenes.updateAsync(
				{_id: doc._id},
				{$set: {name: doc.name, nodes: doc.nodes, dateModified: new Date(Date.now())}},
			)
		},
		async removeUserScene(id: string) {
			if (!this.userId) return

			const existingScene = await UserScenes.findOneAsync({_id: id})
			if (!existingScene) {
				throw new Meteor.Error('user-scene-not-found', 'Error: Scene not found.')
			}
			if (existingScene.userId !== this.userId) {
				throw new Meteor.Error('user-scene-ownership', 'Error: Attempted to remove a scene not created by the user.')
			}

			return UserScenes.remove({_id: id})
		},
		async getExampleScenes() {
			if (!this.userId) return
		},
	})
}
