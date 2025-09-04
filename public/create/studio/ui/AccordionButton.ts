import {attribute, booleanAttribute, css, element, Element, eventAttribute} from '@lume/element'
import {html} from 'lume'
import type {JSX} from 'solid-js'

export class AccordionToggleEvent extends Event {
	toggled: boolean

	constructor(toggled: boolean) {
		super('accordion-toggle')

		this.toggled = toggled
	}
}

@element
export class AccordionButton extends Element {
	static readonly elementName = 'accordion-button'

	hasShadow = false

	@attribute button? = () => []

	@attribute panel? = () => []

	@eventAttribute onaccordionToggle = (_ev: AccordionToggleEvent) => {}

	@attribute open?: boolean

	@attribute indent?: number

	@booleanAttribute hideMarker = false

	@attribute marker? = undefined as (() => JSX.Element[]) | undefined

	connectedCallback() {
		super.connectedCallback()
	}

	template = () =>
		html`<details
			open=${() => this.open}
			onToggle=${(ev: ToggleEvent) => {
				this.open = ev.newState === 'open' ? true : false

				this.dispatchEvent(new AccordionToggleEvent(this.open))
			}}
		>
			<summary class="studio-accordion-button">
				<div class="studio-accordion-button-content">
					<span
						style=${() => {
							return `width: ${(this.indent ?? 0) * 2}ch;`
						}}
					></span>
					${() => {
						this.marker

						return (
							this.marker ??
							html`<svg
								class=${() => {
									// This avoids some weird issues with outlines around the
									// button when marker is hidden.
									return this.open && !this.hideMarker ? 'accordion-chevron open' : 'accordion-chevron'
								}}
								style=${() => {
									return this.hideMarker ? 'opacity: 0;' : ''
								}}
								fill="none"
								stroke="black"
								stroke-width="2"
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
							</svg>`
						)
					}}
					${() => this.button}
				</div>
			</summary>
			<div class="studio-accordion-panel">${() => this.panel}</div>
		</details>`

	css = css`
		:host {
		}

		/* TODO :host-context support for non-shadow scoped styles? */
		:host-context([data-theme='dark']) {
			background: rgba(0, 0, 0, 0.5);
		}

		.accordion-chevron {
			margin-right: 0.25rem;
			width: 1rem;
			height: 1rem;
			transition: transform 0.2s ease;
		}

		.accordion-chevron.open {
			transform: rotate(90deg);
		}

		/* Styling for the accordion button itself */
		.studio-accordion-button {
			display: flex;
			cursor: pointer;
			transition: background 0.2s ease;
			padding: var(--studio-panel-padding-y) var(--studio-panel-padding-x);
		}

		/* Element containing accordion button content. */
		.studio-accordion-button-content {
			display: flex;
			flex: 1; /* Grow to put trash icon at end */
			align-items: center;
			border-radius: 3px;
			cursor: pointer;
			user-select: none;
			transition: background 0.2s ease;
		}

		/* The dropdown panel associated with the accordion. */
		.studio-accordion-panel {
			padding-left: var(--studio-panel-padding-x);
			padding-right: var(--studio-panel-padding-x);
			padding-bottom: var(--studio-panel-padding-y);
			/* Top padding looks weird. */
		}

		/* Ideally the accordion button has padding, but we don't want it if its nested. */
		.studio-accordion-panel .studio-accordion-button {
			padding: 0;
		}

		/* Mainly for nested accordions, don't want excess padding.  */
		.studio-accordion-panel .studio-accordion-panel {
			padding: 0;
		}
	`
}
