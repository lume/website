import {camelCaseToDash, Scene} from 'lume'

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

export interface TrackedSceneElementNode extends SceneElementNode {
	id?: string
}

/**
 * Manages adding/removing/tracking elements within the studio's scene.
 */
export class SceneManager {
	scene?: Scene

	sceneNodes: TrackedSceneElementNode[] = []

	/**
	 * This is just used for assigning unique IDs to each element of the scene.
	 */
	private nodeIndex = 0

	private nodeMap: {
		[id: string]: {
			node: TrackedSceneElementNode
			/**
			 * HTML string representation of the node.
			 */
			html: string

			/**
			 * Callback to delete the node from the DOM and from `sceneNodes`.
			 * @returns
			 */
			delete: () => void
		}
	} = {}

	setNodes(nodes: SceneElementNode[]) {
		this.sceneNodes = structuredClone(nodes)

		this.nodeIndex = 0
	}

	updateScene(nodes?: SceneElementNode[]) {
		if (!this.scene) return

		if (nodes) this.setNodes(nodes)

		/* this.scene.innerHTML = this.createNodes() */
		this.scene.insertAdjacentHTML('beforeend', this.createNodes())
	}

	deleteNodeById(id: string) {
		if (!this.nodeMap[id]) return

		this.nodeMap[id].delete()
	}

	/**
	 * Creates and maps the nodes to be added to the scene.
	 * @param nodes
	 * @returns The HTML string representation of the nodes.
	 */
	private createNodes(nodes?: SceneElementNode[]) {
		if (nodes) this.setNodes(nodes)

		return `${this.sceneNodes.map(node => this.createNode(node, this.sceneNodes)).join('')}`
	}

	/**
	 * Creates the node with a unique ID.
	 * @param node Node representation
	 * @param parentChildArr The array of `children` that this node belongs to. This is needed so
	 * the element can be delete easily.
	 * @returns The HTML string representation of the node.
	 */
	private createNode(node: TrackedSceneElementNode, parentChildArr: TrackedSceneElementNode[]): string {
		const id = this.getUniqueId()

		const nodeHtml = `<${node.tagName} id="${(node.id = id)}"${node.attributes
			?.map(attribute => ` ${camelCaseToDash(attribute.name)}="${attribute.val}"`)
			.join('')}>${node.children?.map(child => this.createNode(child, node.children!)) ?? ''}</${node.tagName}>`

		this.nodeMap[id] = {
			node,
			html: nodeHtml,
			delete: () => {
				const el = document.getElementById(id)
				if (!el) return

				// Remove from node array.
				parentChildArr.filter(val => val == node)

				// Now from DOM.
				el.remove()

				// Now from the node map.
				delete this.nodeMap[id]
			},
		}

		return nodeHtml
	}

	private getUniqueId() {
		// We can change this to just get a random string, or do something like "box2", etc.
		return `studioElement${++this.nodeIndex}`
	}
}
