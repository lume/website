import {element, booleanAttribute, numberAttribute, html, css, Element3D, type Element3DAttributes} from 'lume'
import type {ElementAttributes} from '@lume/element'

@element
export class HamburgerButton extends Element3D {
	static readonly elementName = 'hamburger-button'

	hasShadow = true

	@numberAttribute lineThickness = 2
	@numberAttribute lineLength = 0.8
	@booleanAttribute activated = false

	template = () => html`
		<lume-element3d
			class="menuButtonLine"
			size-mode="proportional literal"
			size="${() => [this.lineLength, this.lineThickness]}"
			align-point="${() => (this.activated ? '0.5 0.5' : '1 0')}"
			mount-point="${() => (this.activated ? '0.5 0.5' : '1 0')}"
			rotation="${() => [0, 0, this.activated ? -45 : 0]}"
		></lume-element3d>
		<lume-element3d
			TODO="no classList"
			class="${() => ({menuButtonLine: true, hide: this.activated})}"
			size-mode="proportional literal"
			size="${() => [this.lineLength, this.lineThickness]}"
			align-point="0 0.5"
			mount-point="0 0.5"
		></lume-element3d>
		<lume-element3d
			class="menuButtonLine"
			size-mode="proportional literal"
			size="${() => [this.lineLength, this.lineThickness]}"
			align-point="${() => (this.activated ? '0.5 0.5' : '1 1')}"
			mount-point="${() => (this.activated ? '0.5 0.5' : '1 1')}"
			rotation="${() => [0, 0, this.activated ? 45 : 0]}"
		></lume-element3d>
	`

	css = css/*css*/ `
		.menuButtonLine {
			background: white;
		}

		.hide {
			display: none !important;
		}
	`
}

type HamburgerButtonAttributes = Element3DAttributes | 'lineThickness' | 'lineLength' | 'activated'

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			[HamburgerButton.elementName]: ElementAttributes<HamburgerButton, HamburgerButtonAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[HamburgerButton.elementName]: HamburgerButton
	}
}
