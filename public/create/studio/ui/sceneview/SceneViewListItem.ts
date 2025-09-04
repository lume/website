import {attribute, css, dashCaseToCamelCase, Element, element, eventAttribute, html, signal} from 'lume'

import '../AccordionButton.js'
import {
	StudioElement,
	StudioElementHoverEvent,
	StudioElementRemoveEvent,
	StudioElementSelectEvent,
} from '../../StudioElement.js'

/**
 * Converts the tag name to what is hopefully the name of the class used to create the element.
 * @param tagName
 */
function convertTagName(tagName: string) {
	return dashCaseToCamelCase(tagName.toLowerCase()).replace('lume', '')
}

@element
export class SceneViewListItem extends Element {
	static readonly elementName = 'scene-view-list-item'

	hasShadow = false

	@attribute element?: StudioElement

	@attribute indent?: number

	@attribute open?: boolean

	@eventAttribute onstudioElementRemove = (_ev: StudioElementRemoveEvent) => {}

	@eventAttribute onstudioElementSelect = (_ev: StudioElementSelectEvent) => {}

	@eventAttribute onstudioElementHover = (_ev: StudioElementHoverEvent) => {}

	@signal name = 'LumeElement'

	@signal selected = false

	// Keep track of the index in `for-each`
	#childIndex = 0

	connectedCallback() {
		super.connectedCallback()

		this.createEffect(() => {
			if (!this.element?.lumeElement) return

			this.name = convertTagName(this.element.lumeElement.tagName)

			this.element.addEventListener('studio-element-select', (ev: any) => {
				this.selected = ev.selected
			})

			this.selected = this.element.isSelected()
		})
	}

	template = () =>
		html`<accordion-button
				open=${() => this.open}
				hide-marker=${() => {
					if (!this.element) return

					return this.element.children.length == 0
				}}
				indent=${() => this.indent}
				button=${() => {
					return html`<div
							style="flex: 1; display: flex; align-items: center;"
							onmouseenter=${(_ev: MouseEvent) => {
								if (!this.element) return

								this.dispatchEvent(new StudioElementHoverEvent(this.element, true))
							}}
							onmouseleave=${(_ev: MouseEvent) => {
								if (!this.element) return

								this.dispatchEvent(new StudioElementHoverEvent(this.element, false))
							}}
						>
							<div
								style="flex:1; cursor: pointer;"
								onclick=${(_ev: MouseEvent) => {
									if (!this.element) return

									this.dispatchEvent(new StudioElementSelectEvent(this.element, true))
								}}
							>
								<span
									><p
										style=${() => {
											const baseStyle = 'margin-top: 0; margin-bottom: 0; transition: color 0.1s;'

											if (this.selected) return baseStyle + 'color: var(--lumeSecondary); font-weight: bold;'

											return baseStyle
										}}
									>
										${this.name}
									</p></span
								>
							</div>
							<div
								style="padding-right: 0.25rem;"
								onclick=${() => {
									if (!this.element) return

									this.dispatchEvent(new StudioElementRemoveEvent(this.element))
								}}
							>
								<svg
									class="summary-trash-icon"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="16"
									height="16"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
									focusable="false"
								>
									<title>Delete</title>
									<path d="M3 6h18" />
									<path d="M8 6l1-2h6l1 2" />
									<rect x="6" y="6" width="12" height="14" rx="2" />
									<path d="M10 11v6M14 11v6" />
								</svg>
							</div>
						</div>
						<style>
							.summary-trash-icon {
								color: black;
								opacity: 0;
								transition:
									color 0.2s,
									opacity 0.2s;
								cursor: pointer;
							}
							summary:hover .summary-trash-icon {
								opacity: 1;
							}

							.summary-trash-icon:hover {
								color: var(--lumeDanger);
							}
						</style>`
				}}
				panel=${() => {
					// Force rerun on element change
					this.element

					return html`<for-each
						items=${() => this.element?.children}
						content=${() => {
							this.#childIndex = 0

							return () => {
								return html`<scene-view-list-item
									indent=${() => {
										return (this.indent ?? 0) + 1
									}}
									element=${() => this.element?.children[this.#childIndex++]}
									onstudio-element-remove=${(ev: StudioElementRemoveEvent) => {
										this.dispatchEvent(new StudioElementRemoveEvent(ev.element))
									}}
									onstudio-element-select=${(ev: StudioElementSelectEvent) => {
										this.dispatchEvent(new StudioElementSelectEvent(ev.element, ev.selected))
									}}
									onstudio-element-hover=${(ev: StudioElementHoverEvent) => {
										this.dispatchEvent(new StudioElementHoverEvent(ev.element, ev.hovered))
									}}
								></scene-view-list-item>`
							}
						}}
					></for-each>`
				}}
			></accordion-button>
			<style>
				${() => {
					return '.studio-accordion-button:hover .studio-accordion-button-content { background: var(--studio-button-hover-color);}'
					/* return this.element?.lumeElement?.tagName === 'LUME-SCENE'
						? '.studio-accordion-button:hover { background: var(--studio-button-hover-color);}'
						: '.studio-accordion-button:hover .studio-accordion-button-content { background: var(--studio-button-hover-color);}' */
				}}
			</style>`

	css = css`
		:host {
		}
	`
}
