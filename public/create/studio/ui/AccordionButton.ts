import {attribute, booleanAttribute, css, element, Element} from '@lume/element'
import {html} from 'lume'
import type {JSX} from 'solid-js'

@element
export class AccordionButton extends Element {
	static readonly elementName = 'accordion-button'

	hasShadow = false

	@attribute button? = () => []

	@attribute panel? = () => []

	@attribute onToggle?: () => void

	@attribute open?: boolean

	@attribute indent?: number

	@booleanAttribute hideMarker = false

	/* @attribute marker? = () => [] as JSX.Element[] | undefined */

	@attribute marker? = undefined as (() => JSX.Element[]) | undefined

	connectedCallback() {
		super.connectedCallback()
	}

	template = () =>
		html`<details
			open="${() => this.open}"
			onToggle=${(ev: ToggleEvent) => {
				this.open = ev.newState === 'open' ? true : false

				this.onToggle?.()
			}}
		>
			<summary class="studio-button" style="display: flex; align-items: center; padding-right: 5px;">
				<span
					style=${() => {
						return `width: ${(this.indent ?? 0) * 2}ch;`
					}}
				></span>
				${() => {
					return (
						this.marker ??
						html`<svg
							class=${() => {
								return this.open ? 'accordion-chevron open' : 'accordion-chevron'
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
			</summary>
			<div>${() => this.panel}</div>
		</details>`

	css = css`
		:host {
		}

		/* TODO :host-context support for non-shadow scoped styles? */
		:host-context([data-theme='dark']) {
			background: rgba(0, 0, 0, 0.5);
		}

		.accordion-summary {
			display: flex;
			align-items: center;
			cursor: pointer;
			user-select: none;
			padding: 0.5rem;
			border-radius: 4px;
			transition: background 0.2s ease;
		}

		.accordion-summary::-webkit-details-marker {
			display: none; /* hide default arrow */
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
	`
}
