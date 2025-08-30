import {attribute, css, Element, element, eventAttribute, html, signal} from 'lume'
import '../../../../elements/for-each.js'
import '../AccordionButton.js'
import {
	StudioElement,
	StudioElementHoverEvent,
	StudioElementRemoveEvent,
	StudioElementSelectEvent,
} from '../../StudioElement.js'
import './SceneViewListItem.js'

@element
export class SceneView extends Element {
	static readonly elementName = 'scene-view'

	hasShadow = false

	/**
	 * This should be the head scene studio element of the scene hierarchy.
	 */
	@attribute sceneElement?: StudioElement

	@eventAttribute onstudioElementRemove = (_ev: StudioElementRemoveEvent) => {}

	@eventAttribute onstudioElementSelect = (_ev: StudioElementSelectEvent) => {}

	@eventAttribute onstudioElementHover = (_ev: StudioElementHoverEvent) => {}

	@signal itemRef?: HTMLElement

	connectedCallback() {
		super.connectedCallback()
	}

	template = () =>
		html`<div class="studio-panel">
			<scene-view-list-item
				element=${() => this.sceneElement}
				open="true"
				onstudio-element-remove=${(ev: StudioElementRemoveEvent) => {
					this.dispatchEvent(new StudioElementRemoveEvent(ev.element))
				}}
				onstudio-element-select=${(ev: StudioElementSelectEvent) => {
					this.dispatchEvent(new StudioElementSelectEvent(ev.element, ev.selected))
				}}
				onstudio-element-hover=${(ev: StudioElementHoverEvent) => {
					this.dispatchEvent(new StudioElementHoverEvent(ev.element, ev.hovered))
				}}
			></scene-view-list-item>
		</div>`

	css = css`
		:host {
		}

		/* TODO :host-context support for non-shadow scoped styles? */
		:host-context([data-theme='dark']) {
			background: rgba(0, 0, 0, 0.5);
		}
	`
}
