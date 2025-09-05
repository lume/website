import {camelCaseToDash, Element, Element3D} from 'lume'
import type {SceneElementNode} from '../../../imports/collections/scenes/UserScenes'

export class StudioElementRemoveEvent extends Event {
	element: StudioElement

	constructor(element: StudioElement) {
		super('studio-element-remove')

		this.element = element
	}
}

export class StudioElementSelectEvent extends Event {
	element: StudioElement

	selected: boolean

	constructor(element: StudioElement, selected: boolean) {
		super('studio-element-select')

		this.element = element

		this.selected = selected
	}
}

export class StudioElementHoverEvent extends Event {
	element: StudioElement

	hovered: boolean

	constructor(element: StudioElement, hovered: boolean) {
		super('studio-element-hover')

		this.element = element

		this.hovered = hovered
	}
}

export class StudioElementCreateEvent extends Event {
	node: SceneElementNode

	constructor(node: SceneElementNode) {
		super('studio-element-create')

		this.node = node
	}
}

/**
 * Manages shared state between a scene's hierarchy node and its corresponding HTML/Lume element.
 *
 * Events:
 * - `StudioElementSelectEvent`: Dispatched whenever `setSelected` is called.
 * - `StudioElementHoverEvent`: Dispatched whenever `setHovered` is called.
 */
export class StudioElement extends EventTarget {
	lumeElement?: Element
	node?: SceneElementNode

	parent?: StudioElement

	children: StudioElement[] = []

	private selected = false

	private hovered = false

	private defaultState = {
		opacity: undefined as string | undefined,
		color: undefined as string | undefined,
	}

	constructor() {
		super()
	}

	remove() {
		if (this.parent) {
			if (this.parent.node && this.parent.node.children) {
				this.parent.node.children = this.parent.node.children.filter(node => {
					return node != this.node
				})
			}

			this.parent.children = this.parent.children.filter(el => el != this)
		}

		if (this.lumeElement) {
			this.lumeElement.remove()
		}
	}

	/**
	 * Sets an attribute of the element.
	 * @param name camelCase name of the attribute
	 * @param value Value to set it to
	 * @returns
	 */
	setAttribute(name: string, value: string) {
		if (!this.lumeElement) return

		this.lumeElement.setAttribute(camelCaseToDash(name), value)

		if (!this.node) return

		if (!this.node.attributes) this.node.attributes = []

		const att = this.node.attributes.find(val => {
			return val.name == name
		})

		if (att) att.val = value
		else this.node.attributes.push({name, val: value})
	}

	setSelected(selected: boolean) {
		if (!this.lumeElement) return

		this.selected = selected

		this.dispatchEvent(new StudioElementSelectEvent(this, selected))
	}

	isSelected() {
		return this.selected
	}

	setHovered(hovered: boolean) {
		if (!this.lumeElement) return

		if (this.hovered && !hovered) {
			if (this.defaultState.opacity) {
				this.lumeElement.setAttribute('opacity', this.defaultState.opacity)
			}
		}

		if (!this.hovered && hovered && this.lumeElement.tagName !== 'LUME-SCENE') {
			const opacity = (this.lumeElement as Element3D).opacity

			if (opacity) {
				this.defaultState.opacity = opacity.toString()

				this.lumeElement.setAttribute('opacity', (opacity / 3).toString())
			}

			// If opacity is less than 0.5, change color to white instead.
			/* if (!opacity || parseFloat(opacity) < 0.5) {
				const color = this.lumeElement.getAttribute('color')
				if (color && color !== 'white') {
					this.defaultState.color = color

					this.lumeElement.setAttribute('color', 'white')
				} else {
					// Do something else idk
				}
			} else {
				this.defaultState.opacity = opacity

				this.lumeElement.setAttribute('opacity', '0.25')
			} */
		}

		this.hovered = hovered

		this.dispatchEvent(new StudioElementHoverEvent(this, hovered))
	}

	isHovered() {
		return this.hovered
	}

	// TODO: Maybe implement fast updates that don't verify if attributes exist on the node, or
	// have them throttled.
	// `updateAttribute`: updates the node's attribute with its corresponding value on the element.
	// `updateNode`: Iterates over all properties of the element, and any property that isn't its
	// default value gets put as an attribute of the node.
}
