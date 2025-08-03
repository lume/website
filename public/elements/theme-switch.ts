// Ported from https://github.com/mahozad/theme-switch
// (Apache 2.0)

// TODO update this to support CSS `color-scheme` and `light-dark()` CSS functions.

const ELEMENT_NAME = 'theme-switch'
const ICON_SIZE = 24 /* px */
const ICON_COLOR = '#000'
const THEME_KEY = 'theme'
const THEME_AUTO = 'auto'
const THEME_DARK = 'dark'
const THEME_LIGHT = 'light'
const THEME_VALUES = [THEME_AUTO, THEME_DARK, THEME_LIGHT] as const
type THEME_VALUE = (typeof THEME_VALUES)[number]
const THEME_DEFAULT = THEME_LIGHT
const THEME_ATTRIBUTE = 'data-theme'
const COLOR_SCHEME_DARK = '(prefers-color-scheme: dark)'
const CUSTOM_EVENT_NAME = 'themeToggle'
// circleRadius, raysOpacity, eclipseCenterX, letterOffset
const ICON_INITIAL_STATE_FOR_AUTO = [10, 0, 33, 0] as const
const ICON_INITIAL_STATE_FOR_DARK = [10, 0, 20, 1] as const
const ICON_INITIAL_STATE_FOR_LIGHT = [5, 1, 33, 1] as const

class ThemeSwitch extends HTMLElement {
	static readonly elementName = 'theme-switch'

	shadowRoot
	static counter = 0
	identifier = ThemeSwitch.counter++

	constructor() {
		super()
		this.shadowRoot = this.attachShadow({mode: 'open'})
		this.shadowRoot.innerHTML = generateIcon(...getInitialStateForIcon())
		// Add the click listener to the top-most parent (the custom element itself)
		// so the padding etc. on the element be also clickable
		this.shadowRoot.host.addEventListener('click', this.onClick)
		// If another theme switch in page toggled, update my icon too
		document.addEventListener(CUSTOM_EVENT_NAME, event => {
			if (event.detail.originId !== this.identifier) {
				this.adaptToTheme()
			}
		})
		// If a theme switch in another page toggled, update my state too
		// See https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
		window.addEventListener('storage', event => {
			if (event.key === THEME_KEY) {
				this.adaptToTheme()
				updateTheme()
			}
		})
		// Create some CSS to apply to the shadow DOM
		// See https://css-tricks.com/styling-a-web-component/
		const style = document.createElement('style')
		style.textContent = generateStyle()
		this.shadowRoot.append(style)
	}

	onClick() {
		const oldTheme = getUserThemeSelection()
		this.toggleTheme(oldTheme)
		const newTheme = getUserThemeSelection()
		const event = this.createEvent(oldTheme, newTheme)
		this.dispatchEvent(event)
	}

	createEvent(oldTheme: THEME_VALUE, newTheme: THEME_VALUE) {
		return new CustomEvent(CUSTOM_EVENT_NAME, {
			detail: {
				originId: this.identifier,
				oldState: oldTheme,
				newState: newTheme,
			},
			bubbles: true,
			composed: true,
			cancelable: false,
		})
	}

	toggleTheme(currentTheme: THEME_VALUE) {
		if (currentTheme === THEME_AUTO) {
			localStorage.setItem(THEME_KEY, THEME_LIGHT)
			this.animateThemeButtonIconToLight()
		} else if (currentTheme === THEME_DARK) {
			localStorage.setItem(THEME_KEY, THEME_AUTO)
			this.animateThemeButtonIconToAuto()
		} /* if (theme === THEME_LIGHT) */ else {
			localStorage.setItem(THEME_KEY, THEME_DARK)
			this.animateThemeButtonIconToDark()
		}
		updateTheme()
	}

	adaptToTheme() {
		const theme = getUserThemeSelection()
		if (theme === THEME_AUTO) {
			this.animateThemeButtonIconToAuto()
		} else if (theme === THEME_DARK) {
			this.animateThemeButtonIconToDark()
		} /* if (theme === THEME_LIGHT) */ else {
			this.animateThemeButtonIconToLight()
		}
	}

	getEl(selector: string) {
		return this.shadowRoot.querySelector(selector)
	}

	getAnimEl(id: string) {
		return this.getEl('#' + id) as SVGAnimationElement
	}

	animateThemeButtonIconToLight() {
		this.getAnimEl('letter-anim-hide').beginElement()
		this.getAnimEl('core-anim-shrink').beginElement()
		this.getAnimEl('rays-anim-rotate').beginElement()
		this.getAnimEl('rays-anim-show').beginElement()
	}

	animateThemeButtonIconToAuto() {
		this.getAnimEl('eclipse-anim-go').beginElement()
		this.getAnimEl('letter-anim-show').beginElement()
	}

	animateThemeButtonIconToDark() {
		this.getAnimEl('rays-anim-hide').beginElement()
		this.getAnimEl('core-anim-enlarge').beginElement()
		this.getAnimEl('eclipse-anim-come').beginElement()
	}
}

updateTheme()
window.customElements.define(ELEMENT_NAME, ThemeSwitch)
window.matchMedia(COLOR_SCHEME_DARK).addEventListener('change', updateTheme)

function generateIcon(...args: number[]) {
	const [circleRadius, raysOpacity, eclipseCenterX, letterOffset] = args as [number, number, number, number]
	const html = String.raw

	return html`
		<!-- Using <button> element allows the element to be focused and is more semantic -->
		<button id="theme-switch">
			<svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<mask id="mask">
						<!-- Fill the entire viewBox as the mask default (show everything) -->
						<rect width="100%" height="100%" fill="#fff" />
						<circle id="eclipse" r="10" cx="${eclipseCenterX}" cy="6">
							<animate
								id="eclipse-anim-come"
								fill="freeze"
								attributeName="cx"
								to="20"
								dur="300ms"
								begin="indefinite"
								calcMode="spline"
								keyTimes="0; 1"
								keySplines="0.37, 0, 0.63, 1"
							/>
							<animate
								id="eclipse-anim-go"
								fill="freeze"
								attributeName="cx"
								to="33"
								dur="300ms"
								begin="indefinite"
								calcMode="spline"
								keyTimes="0; 1"
								keySplines="0.37, 0, 0.63, 1"
							/>
						</circle>
						<!-- SVG line animation and pathLength=1 ✨: https://youtu.be/7aobRPg7BXI -->
						<g
							id="letter"
							fill="none"
							stroke="#000"
							stroke-width="2"
							stroke-linejoin="round"
							stroke-linecap="round"
							stroke-dasharray="1 1"
							stroke-dashoffset="${letterOffset}"
						>
							<path pathLength="1" d="m 8,16.5 4,-9 4,9" />
							<path pathLength="1" d="M 8,16.5 9,14.5 h 6" />
							<animate
								id="letter-anim-show"
								fill="freeze"
								attributeName="stroke-dashoffset"
								to="0"
								dur="400ms"
								begin="indefinite"
								calcMode="spline"
								keyTimes="0; 1"
								keySplines=".67,.27,.55,.9"
							/>
							<animate
								id="letter-anim-hide"
								fill="freeze"
								attributeName="stroke-dashoffset"
								to="1"
								dur="15ms"
								begin="indefinite"
								calcMode="spline"
								keyTimes="0; 1"
								keySplines="0.37, 0, 0.63, 1"
							/>
						</g>
					</mask>
				</defs>
				<g id="visible-content" mask="url(#mask)">
					<g id="rays" opacity="${raysOpacity}" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round">
						<animate
							id="rays-anim-hide"
							fill="freeze"
							attributeName="opacity"
							to="0"
							dur="100ms"
							begin="indefinite"
							calcMode="spline"
							keyTimes="0; 1"
							keySplines="0.37, 0, 0.63, 1"
						/>
						<animate
							id="rays-anim-show"
							fill="freeze"
							attributeName="opacity"
							to="1"
							dur="300ms"
							begin="indefinite"
							calcMode="spline"
							keyTimes="0; 1"
							keySplines="0.37, 0, 0.63, 1"
						/>
						<animateTransform
							id="rays-anim-rotate"
							attributeName="transform"
							attributeType="XML"
							type="rotate"
							from="-25 12 12"
							to="0 12 12"
							dur="300ms"
							begin="indefinite"
							calcMode="spline"
							keyTimes="0; 1"
							keySplines="0.37, 0, 0.63, 1"
						/>
						<path d="m12 1v3" />
						<path d="m23 12h-3" />
						<path d="m19.778 4.2218-2.121 2.1213" />
						<path d="m19.778 19.778-2.121-2.121" />
						<path d="m4.222 19.778 2.121-2.121" />
						<path d="m4.222 4.222 2.121 2.121" />
						<path d="m4 12h-3" />
						<path d="m12 20v3" />
					</g>
					<circle id="circle" r="${circleRadius}" cx="12" cy="12">
						<animate
							id="core-anim-enlarge"
							fill="freeze"
							attributeName="r"
							to="10"
							dur="300ms"
							begin="indefinite"
							calcMode="spline"
							keyTimes="0; 1"
							keySplines="0.37, 0, 0.63, 1"
						/>
						<animate
							id="core-anim-shrink"
							fill="freeze"
							attributeName="r"
							to="5"
							dur="300ms"
							begin="indefinite"
							calcMode="spline"
							keyTimes="0; 1"
							keySplines="0.37, 0, 0.63, 1"
						/>
					</circle>
				</g>
			</svg>
		</button>
	`
}

function generateStyle() {
	const css = String.raw

	return css`
		:host {
			display: flex;
			width: ${ICON_SIZE}px;
			aspect-ratio: 1 / 1;
			/* This is for when the element has padding */
			cursor: pointer;
		}

		:host([hidden]) {
			display: none;
		}

		button {
			padding: 0;
			border: none;
			background: transparent;
			display: flex;
			/* The host element also has its cursor set */
			cursor: pointer;
		}

		#circle {
			fill: var(--theme-switch-icon-color, ${ICON_COLOR});
		}

		#rays {
			stroke: var(--theme-switch-icon-color, ${ICON_COLOR});
		}
	`
}

function updateTheme() {
	let theme: THEME_VALUE = getUserThemeSelection()
	if (theme === THEME_AUTO) theme = getSystemTheme()
	document.documentElement.setAttribute(THEME_ATTRIBUTE, theme)
}

function getUserThemeSelection(): THEME_VALUE {
	const userSelection = localStorage.getItem(THEME_KEY) as THEME_VALUE
	return THEME_VALUES.includes(userSelection) ? userSelection : THEME_DEFAULT
}

function getSystemTheme() {
	const isDark = window.matchMedia(COLOR_SCHEME_DARK).matches
	return isDark ? THEME_DARK : THEME_LIGHT
}

function getInitialStateForIcon() {
	const theme = getUserThemeSelection()
	if (theme === THEME_AUTO) {
		return ICON_INITIAL_STATE_FOR_AUTO
	} else if (theme === THEME_DARK) {
		return ICON_INITIAL_STATE_FOR_DARK
	} /* if (theme === THEME_LIGHT) */ else {
		return ICON_INITIAL_STATE_FOR_LIGHT
	}
}

interface GlobalEventHandlersEventMap {
	[CUSTOM_EVENT_NAME]: CustomEvent<{
		originId: number
		oldState: THEME_VALUE
		newState: THEME_VALUE
	}>
}

// FIXME TypeScript bug: this causes the solid-js package to be fully overriden
// by this small definition, instead of augmented, making type errors in all
// other files that import solid-js.
//
// declare module 'solid-js' {
// 	namespace JSX {
// 		interface IntrinsicElements {
// 			[ThemeSwitch.elementName]: import('@lume/element').ElementAttributes<ThemeSwitch>
// 		}
// 	}
// }

interface HTMLElementTagNameMap {
	[ThemeSwitch.elementName]: ThemeSwitch
}
