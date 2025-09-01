import {css, Element, element, eventAttribute, html, Sizeable, Transformable} from 'lume'
import {StudioElementCreateEvent} from '../../StudioElement.js'

import '../../../../elements/for-each.js'
import type {SceneElementNode} from '../../../../../imports/collections/scenes/UserScenes.js'

const icons: {[name: string]: Node | Node[]} = {
	box: html`<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path
			d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
		></path>
		<path d="m3.3 7 8.7 5 8.7-5"></path>
		<path d="M12 22V12"></path>
	</svg>`,
	sphere: html`<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<circle cx="12" cy="12" r="10"></circle>
	</svg>`,
	plane: html`<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<rect width="18" height="18" x="3" y="3" rx="2"></rect>
	</svg>`,
}

interface CreateStudioElementListEntry {
	title: string
	tagName: string
	icon: Node
}

const createElementListEntries: {[title: string]: CreateStudioElementListEntry} = {
	/* box: {
		title: 'Box',
		tagName: 'lume-box',
		icon: icons.box as Node,
	},
	sphere: {
		title: 'Sphere',
		tagName: 'lume-sphere',
		icon: icons.sphere as Node,
	},
	plane: {
		title: 'Plane',
		tagName: 'lume-plane',
		icon: icons.plane as Node,
	}, */
}

function tagNameToTitle(str: string): string {
	const withSpaces = str.split('-').slice(1).join(' ')
	return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}

function addElementToList(tagName: string) {
	const name = tagName.split('-').slice(1).join('')

	let icon = (icons[name] ?? icons.box) as Node

	createElementListEntries[name] = {
		title: tagNameToTitle(tagName),
		tagName: tagName,
		icon,
	}
}

function createNode(tagName: string) {
	const node = {tagName} as SceneElementNode

	const elCtor = customElements.get(tagName)
	if (!elCtor) return node

	node.attributes = []

	const el = new elCtor()

	if (el instanceof Sizeable) {
		node.attributes.push({name: 'size', val: '5 5 5'})
	}
	if (el instanceof Transformable) {
		node.attributes.push({name: 'alignPoint', val: '0.5 0.5 0.5'})
		node.attributes.push({name: 'mountPoint', val: '0.5 0.5 0.5'})
	}

	return node
}

addElementToList('lume-box')
addElementToList('lume-sphere')
addElementToList('lume-plane')

const elementTitles = ['box', 'sphere', 'plane']

@element
export class CreateStudioElementList extends Element {
	static readonly elementName = 'create-studio-element-list'

	hasShadow = false

	@eventAttribute onstudioElementCreate = (_ev: StudioElementCreateEvent) => {}

	#elementIndex = 0

	connectedCallback() {
		super.connectedCallback()
	}

	template = () => html`
		<for-each
			items=${() => elementTitles}
			content=${() => {
				this.#elementIndex = 0

				return () => {
					const el = createElementListEntries[elementTitles[this.#elementIndex++]]

					return html`
						<div
							class="studio-dropdown-item"
							onclick=${() => {
								this.dispatchEvent(new StudioElementCreateEvent(createNode(el.tagName)))
							}}
						>
							<div style="padding: 3px;">${el.icon}</div>
							<div style="padding-right: var(--studio-panel-padding-x);">${el.title}</div>
						</div>
					`
				}
			}}
		></for-each>
	`
}
