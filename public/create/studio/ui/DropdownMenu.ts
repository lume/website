import {attribute, booleanAttribute, css, element, Element, eventAttribute} from '@lume/element'
import {html} from 'lume'
import type {JSX} from 'solid-js'
import {AccordionToggleEvent} from './AccordionButton.js'

@element
export class DropdownMenu extends Element {
	static readonly elementName = 'dropdown-menu'

	hasShadow = false

	@attribute button? = () => []

	@attribute panel? = () => []

	@eventAttribute onaccordionToggle = (_ev: AccordionToggleEvent) => {}

	@attribute open?: boolean

	@booleanAttribute hideMarker = false

	/* @attribute marker? = () => [] as JSX.Element[] | undefined */

	@attribute marker? = undefined as (() => JSX.Element[]) | undefined

	connectedCallback() {
		super.connectedCallback()
	}

	template = () =>
		html`<accordion-button
			class="studio-dropdown"
			open=${() => this.open}
			onaccordion-toggle=${(ev: AccordionToggleEvent) => {
				this.open = ev.toggled

                this.dispatchEvent(new AccordionToggleEvent(this.open))
			}}
			marker=${() => this.marker}
			button=${() => this.button}
			panel=${() => this.panel}
		>
		</accordion-button>`

	css = css`
		:host {
		}

		.studio-dropdown {
		}

		.studio-dropdown .studio-accordion-button:hover .studio-accordion-button-content {
			background: initial;
		}

		.studio-dropdown .studio-accordion-button {
			/* Taken from studio-container */
			/* Why doesn't this get inherited? */
			border-radius: 5px;
		}

		.studio-dropdown .studio-accordion-button:hover {
			background: var(--studio-button-hover-color);
		}

		.studio-dropdown-item {
			display: flex;
			align-items: center;
			border-radius: 5px;
			cursor: pointer;
			transition: background 0.2s ease;
		}

		.studio-dropdown-item:hover {
			background: var(--studio-button-hover-color);
		}

		.studio-dropdown .studio-accordion-panel {
			position: absolute;
			z-index: 1000;
			height: auto;
			padding: 0;
		}

		/* Stops dropdown button from extending slightly when opened.  */
		.studio-dropdown-button .studio-accordion-panel {
			padding: 0;
		}

		/* TODO :host-context support for non-shadow scoped styles? */
		:host-context([data-theme='dark']) {
			background: rgba(0, 0, 0, 0.5);
		}
	`
}
