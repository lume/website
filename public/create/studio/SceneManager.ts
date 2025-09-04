import {camelCaseToDash, Element, Scene} from 'lume'
import {StudioElement} from './StudioElement.js'
import type {SceneElementNode} from '../../../imports/collections/scenes/UserScenes.js'

function mapStudioChildren(parent: StudioElement, elements: HTMLCollection, nodes: SceneElementNode[]) {
	const warnInvalidLength = () => {
		console.warn(
			'Error mapping studio elements, element count does not equal node count (' +
				elements.length +
				' != ' +
				nodes.length +
				')',
		)
	}

	if (elements.length != nodes.length) {
		warnInvalidLength()

		return
	}

	parent.children = []
	for (let i = 0; i < elements.length; i++) {
		const element = elements[i]
		const node = nodes[i]

		if (!node.children) node.children = []

		if (element.children.length != node.children.length) {
			warnInvalidLength()

			return
		}

		// TODO match tag name

		const studioElement = new StudioElement()
		studioElement.parent = parent
		studioElement.lumeElement = element as Element
		studioElement.node = node

		mapStudioChildren(studioElement, element.children, node.children)

		parent.children.push(studioElement)
	}
}

/**
 * Maps element nodes to their DOM Lume elements.
 * @param scene Lume scene
 * @param nodeHead Scene head node
 * @param skipChildren If the scene has existing children, how many should be skipped
 * @returns Head `StudioElement` node, corresponding to the scene itself.
 */
function mapStudioElements(scene: Scene, nodeHead: SceneElementNode, skipChildren?: number) {
	const studioElementHead = new StudioElement()
	studioElementHead.lumeElement = scene
	studioElementHead.node = nodeHead

	const expectedChildren = scene.children.length - (skipChildren ?? 0)

	if (expectedChildren == 0) return studioElementHead

	if (expectedChildren != nodeHead.children?.length) {
		console.warn(
			'Scene child count does not meet expected node count (' +
				expectedChildren +
				' != ' +
				nodeHead.children?.length +
				')',
		)

		return undefined
	}

	// Copilot's solution to slicing children:
	/* // Pass only the children after skipChildren (inclusive)
	let childrenToMap: HTMLCollection;
	if (skipChildren) {
		// Create a fake HTMLCollection from the sliced array
		const arr = Array.prototype.slice.call(scene.children, skipChildren);
		childrenToMap = {
			length: arr.length,
			item: (i: number) => arr[i] ?? null,
			namedItem: (_: string) => null,
			[Symbol.iterator]: function* () { yield* arr; }
		} as unknown as HTMLCollection;
	} else {
		childrenToMap = scene.children;
	}
	mapChildren(studioElementHead, childrenToMap, nodeHead.children) */

	mapStudioChildren(
		studioElementHead,
		Array.from(scene.children).slice(skipChildren) as any as HTMLCollection,
		nodeHead.children,
	)

	return studioElementHead
}

/**
 * Manages adding/removing/tracking elements within the studio's scene.
 */
export class SceneManager {
	scene?: Scene

	elements: StudioElement[] = []

	sceneNodes: SceneElementNode[] = []

	updateScene(nodes: SceneElementNode[]) {
		if (!this.scene) return

		// If we have existing elements in the scene (ex: grid helper, transform controls, etc.),
		// exclude those from main element tree.
		const existingChildren = this.scene.children.length

		this.sceneNodes = nodes

		this.deserialize()

		// TODO Standardize having the scene be the head within the hierarchy representation.
		let headNode = {
			tagName: 'lume-scene',
			children: nodes,
		} as SceneElementNode
		if (nodes.length == 1 && nodes[0].tagName === 'lume-scene') {
			// TODO Set properties of scene
			headNode = nodes[0]
		}

		const head = mapStudioElements(this.scene, headNode, existingChildren)
		if (head) this.elements = [head]
	}

	createElement(node: SceneElementNode, parent: StudioElement) {
		if (!this.scene || !parent.lumeElement || !parent.node) return

		const studioElement = new StudioElement()
		studioElement.parent = parent

		parent.lumeElement.insertAdjacentHTML('beforeend', this.nodeToHTML(node))

		if (!parent.node.children) parent.node.children = []
		parent.node?.children?.push(node)

		parent.children.push(studioElement)

		studioElement.lumeElement = parent.lumeElement.children[parent.lumeElement.children.length - 1] as Element
		studioElement.node = node

		this.elements.push(studioElement)

		return studioElement
	}

	/**
	 * Creates and maps `sceneNodes` to be added to the scene.
	 * @returns The HTML string representation of the nodes.
	 */
	private deserialize() {
		if (!this.scene) return

		const nodes =
			this.sceneNodes.length == 1 && this.sceneNodes[0].tagName === 'lume-scene'
				? this.sceneNodes[0].children
				: this.sceneNodes

		this.scene.insertAdjacentHTML('beforeend', `${nodes?.map(node => this.nodeToHTML(node)).join('')}`)
	}

	private nodeToHTML(node: SceneElementNode): string {
		return `<${node.tagName} ${node.attributes
			?.map(attribute => `${camelCaseToDash(attribute.name)}="${attribute.val}"`)
			.join('')}>${node.children?.map(child => this.nodeToHTML(child)) ?? ''}</${node.tagName}>`
	}
}
