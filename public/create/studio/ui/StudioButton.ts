import {attribute, css, Element, element, html, type JSX} from 'lume'

type StudioButtonVariant = 'primary' | 'secondary'

@element
export class StudioButton extends Element {
	static readonly elementName = 'studio-button'

	hasShadow = false

	@attribute content?: JSX.Element

	@attribute variant: StudioButtonVariant = 'primary'

	connectedCallback() {
		super.connectedCallback()
	}

	template = () =>
		html`<button
			class=${() => {
				return `studio-container studio-button studio-button-${this.variant}`
			}}
		>
			${() => this.content}
		</button> `

	css = css/*css*/ `
		.studio-button {
			cursor: pointer;
			padding: 5px 8px;
			transition: background 0.2s ease;
		}

		.studio-button-primary {
			background: var(--lumePrimary);
		}
		.studio-button-primary:hover {
			background: var(--studio-button-hover-color);
		}

		.studio-button-secondary {
			background: var(--lumeSecondary);
		}
		.studio-button-secondary:hover {
			background: color-mix(in srgb, var(--lumeSecondary) 70%, white 30%);
		}
	`
}
