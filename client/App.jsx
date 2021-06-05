/* @jsxImportSource @lume/element */

import {Motor, Element, reactive, element, Show, Node, numberAttribute, booleanAttribute, autorun} from 'lume'
import {Tween, Easing} from '@tweenjs/tween.js'

const MENU_WIDTH = 0.8 // percent of viewport
const HEADER_HEIGHT = 100

@element('app-root')
export class App extends Element {
	get root() {
		return this
	}
	set root(_v) {}

	// Used in App.types.d.ts to denote no attributes. See TODO there.
	/** @type {undefined=} */
	_____

	/** @type {import('./Cube').LandingCube=} */
	cubeNode

	/** @type {Node=} */
	menu

	/** @type {import('lume').Scene=} */
	scene

	/** @type {Node=} */
	rotator

	/** @type {Node=} */
	circle

	/** @type {Node=} */
	// @reactive menuButtonWrapper
	menuButtonWrapper

	// TODO make option for Tween to remember last value instead of starting
	// from the beginning. It would simplify the Tween code a lot. See
	// https://github.com/tweenjs/tween.js/issues/522

	makeOpenTween() {
		this.openTween = new Tween({menuPosition: this.menu?.getAlignPoint().x || 1})
			.onComplete(() => this.openTween?.stop())
			.onUpdate(obj => this.menu && (this.menu.getAlignPoint().x = obj.menuPosition))
			.easing(Easing.Exponential.Out)
	}

	makeCloseTween() {
		this.closeTween = new Tween({
			menuPosition: this.menu?.getAlignPoint().x || 1 - MENU_WIDTH,
		})
			.onComplete(() => this.closeTween?.stop())
			.onUpdate(obj => this.menu && (this.menu.getAlignPoint().x = obj.menuPosition))
			.easing(Easing.Exponential.Out)
	}

	/** @type {Tween<{menuPosition: number}> | null} */
	openTween = null

	/** @type {Tween<{menuPosition: number}> | null} */
	closeTween = null

	@reactive menuOpen = false

	openMenu() {
		if (this.menuOpen) return
		this.menuOpen = true

		if (this.closeTween?.isPlaying()) this.closeTween.stop()

		this.makeOpenTween()
		// TODO Tween.start() time arg should be optional.
		// XXX this.openTween exists here! Optional chaining operator is needed to satisfy type system
		this.openTween?.to({menuPosition: 1 - MENU_WIDTH}, 800).start(performance.now())
		this.possiblyStartTweenLoop()
	}

	closeMenu() {
		if (!this.menuOpen) return
		this.menuOpen = false

		if (this.openTween?.isPlaying()) this.openTween.stop()

		this.makeCloseTween()
		// XXX this.closeTween exists here! Optional chaining operator is needed to satisfy type system
		this.closeTween?.to({menuPosition: 1}, 800).start(performance.now())
		this.possiblyStartTweenLoop()
	}

	toggleMenu = () => (this.menuOpen ? this.closeMenu() : this.openMenu())

	/** @type {import('lume').RenderTask | false} */
	tweenTask = false

	possiblyStartTweenLoop() {
		if (this.tweenTask) return

		this.tweenTask = Motor.addRenderTask(t => {
			if (this.openTween?.isPlaying()) this.openTween.update(t)
			else if (this.closeTween?.isPlaying()) this.closeTween.update(t)
			else return (this.tweenTask = false)
			return
		})
	}

	@reactive viewWidth = 0
	@reactive viewHeight = 0

	get isMobile() {
		return this.viewWidth <= 1200
	}
	get cubeSize() {
		return this.viewIsTall ? 0.65 * this.viewWidth : 0.5 * this.viewHeight
	}
	get viewIsTall() {
		return this.viewHeight >= this.viewWidth
	}

	connectedCallback() {
		super.connectedCallback()

		const {scene, rotator, cubeNode} = this

		// TODO assigning to onclick works here, but it doesn't work in the
		// onclick JSX prop in the template. Does it work with new Solid.js?
		if (this.menuButtonWrapper) {
			this.menuButtonWrapper.onclick = () => {
				console.log('CLICK 2!')
				this.toggleMenu()
			}
		}

		if (!scene || !rotator || !cubeNode) throw 'They must exist.'

		Motor.addRenderTask(_t => {
			cubeNode.getRotation().y += 0.25
		})

		window.addEventListener('resize', this.resize)
		this.resize()

		scene.addEventListener('pointermove', event => {
			const size = scene.calculatedSize
			const rotationRange = 30

			// TODO use offsetX/Y so we get events relative to `currentTarget`,
			// and make an abstraction so that the offsets can be calculated
			// from event.target instead of event.currentTarget, otherwise the
			// behavior is strange when trying to use mouse values relative to
			// an element instead of relative to the viewport. ...
			// const rotationAmountX = (event.offsetY / size.y) * rotationRange - rotationRange / 2
			// const rotationAmountY = (event.offsetX / size.x) * rotationRange - rotationRange / 2

			// ... For now just use clientX/Y. ...
			const rotationAmountX = -((event.clientY / size.y) * rotationRange - rotationRange / 2)
			const rotationAmountY = (event.clientX / size.x) * rotationRange - rotationRange / 2

			// ... See https://discourse.wicg.io/t/4236 for discussion

			// Shorthands: set xyz values with an object,...
			rotator.rotation = {
				x: rotationAmountX * 0.5,
				y: rotationAmountY * 0.5,
			}

			// ...or with an array.
			rotator.position = [rotationAmountY, rotationAmountX]

			const circle = this.circle
			if (!circle) return
			circle.getPosition().x = event.clientX
			circle.getPosition().y = event.clientY
		})
	}

	resize = (/** @type {UIEvent} */ _e) => {
		this.viewWidth = window.innerWidth
		this.viewHeight = window.innerHeight
	}

	template = () => (
		<lume-scene ref={this.scene} class="scene" touch-action="none">
			<lume-node size-mode="proportional proportional" size="1 1 0">
				<lume-scene perspective="800" id="innerScene" webgl={false}>
					<lume-ambient-light color="white" intensity="0.8"></lume-ambient-light>
					<lume-node size-mode="proportional proportional" size="1 1 0">
						<lume-node
							class="headerBar"
							//

							// TODO
							// This causes the header to lose LUME styling (it
							// clashes somehow with LUME's manual setting of the
							// style attribute):
							//
							//style={'pointerEvents: ' + this.isMobile ? 'none' : 'auto'}
							//
							// But this allows the header's LUME styling to work properly:
							//
							style={{pointerEvents: this.isMobile ? 'none' : 'auto'}}
							//
							// In either case, the pointer-events style is still not applied.
							//
							// Do we still have the same issue with latest Solid.js?

							//
							size-mode="proportional literal"
							size={[1, HEADER_HEIGHT, 0]}
						>
							<div class="headerBarInner">
								<img src="/images/logo.svg" class="logo" />
								<Show when={!this.isMobile}>
									<menu-links />
								</Show>
							</div>
						</lume-node>

						<lume-node
							ref={this.rotator}
							class="rotator"
							align-point="0.5 0.5"
							mount-point="0.5 0.5"
							size-mode="proportional proportional"
							size="1 1"
						>
							<lume-node
								size-mode="proportional proportional"
								size={this.viewIsTall ? '0 0.7 0' : '0.5 0 0'}
								mount-point="0.5 0.5"
								align-point="0.5 0.5"
							>
								<img
									src={'/images/logo-wordmark.svg'}
									style={`
                                        display: ${this.viewIsTall ? 'none' : 'initial'};
										transform: translateY(-50%);
										object-fit: fill;
                                        width: 100%;
                                        height: auto;
									`}
								/>
								<img
									src={'/images/logo-wordmark-vertical.svg'}
									style={`
                                        display: ${this.viewIsTall ? 'initial' : 'none'};
										transform: translateX(-50%);
										object-fit: fill;
                                        width: auto;
                                        height: 100%;
									`}
								/>
							</lume-node>

							<landing-cube
								ref={this.cubeNode}
								// size={this.cubeSize} // TODO how to make a single-number value type check
								size={[this.cubeSize]}
								align-point="0.5 0.5 0.5"
								mount-point="0.5 0.5 0.5"
								position={[0, 0, -this.cubeSize]}
								rotation="45 45 45"
							/>
						</lume-node>
					</lume-node>
				</lume-scene>

				{/* <Show when={!this.isMobile}>
					<lume-node ref={this.circle} class="circle" mount-point="0.5 0.5" size="200 200" />
				</Show> */}

				<Show when={this.isMobile}>
					<lume-node class="mobileNav" size-mode="proportional proportional" size="1 1 0">
						<lume-node
							ref={this.menu}
							class="mobileMenu"
							size-mode="proportional proportional"
							size={[MENU_WIDTH, 1]}
							align-point="1 0" // start closed position
							opacity="0.97"
						>
							<menu-links is-mobile={true} />
						</lume-node>

						<lume-node
							class="menuButtonWrapper"
							ref={this.menuButtonWrapper}
							size="140 100"
							align-point="1 0"
							position="0 0"
							mount-point="1 0"
							onClick={() => {
								console.log('CLICK 1!')
								this.toggleMenu()
							}}
						>
							<hamburger-button
								size="40 19"
								align-point="0.5 0.5"
								mount-point="0.5 0.5"
								position="0 0"
								line-thickness={2.5}
								line-length={0.7}
								activated={this.menuOpen}
							/>
						</lume-node>
					</lume-node>
				</Show>
			</lume-node>
		</lume-scene>
	)

	css = /*css*/ `
        :host {
            display: block;
            width: 100%;
            height: 100%;
        }

        .scene {
            touch-action: none;
        }

        .headerBar {
            pointer-events: none;
        }

        .headerBarInner {
            display: flex;
            height: 100%;
            align-items: center;
            padding-left: 60px;
            padding-right: 60px;
        }

        .mobileNav {
            pointer-events: none
        }

        menu-links {
            pointer-events: auto;
        }

        .logo {
            width: 50px;
            height: 50px;
            object-fit: fill;

            /* push everything else to the right side of the header */
            margin-right: auto;
        }

        .rotator {
            pointer-events: none;
        }

        .circle {
            background: rgba(0, 25, 93, 0.3);
            backdrop-filter: blur(14px) brightness(130%);
            border-radius: 100%;
        }

        .mobileMenu {
            background: rgba(0, 25, 93, 0.3);
            backdrop-filter: blur(14px) brightness(130%);
            pointer-events: auto;
        }

		.menuButtonWrapper {
			pointer-events: auto;
		}
    `
}

@element('menu-links')
export class MenuLinks extends Element {
	@booleanAttribute(false) isMobile = false

	/** @type {HTMLDivElement =} */
	menuLinks

	template = () => (
		<div class={`menuLinks${this.isMobile ? ' menuLinksMobile' : ''}`} ref={this.menuLinks}>
			<div data-comment="empty space"></div>
			<div data-comment="empty space"></div>
			<a class="menuLink" href="/docs">
				Documentation
			</a>
			<a class="menuLink" href="/docs/#/examples/hello-world/">
				Examples
			</a>
			<a class="menuLink" href="//lume.community">
				Forum
			</a>
			<a class="menuLink" href="//discord.gg/PgeyevP">
				Chat
			</a>
			<a class="menuLink" href="//github.com/lume/lume">
				Source
			</a>
			<div data-comment="empty space"></div>
			<div data-comment="empty space"></div>
		</div>
	)

	css = /*css*/ `
        :host {
            display: contents;
        }

        .menuLinks {
            font-size: calc(
                4vw * var(--isMobile) +
                14px * (1 - var(--isMobile))
            );
        }

        .menuLinksMobile {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            justify-content: space-around;
        }

        .menuLink {
            text-decoration: none;
            text-transform: uppercase;
            margin-left: calc(
                0% * var(--isMobile) +
                40px * (1 - var(--isMobile))
            );
            margin-top: calc(
                0px * var(--isMobile) +
                80px * (1 - var(--isMobile))
            );
            letter-spacing: 0.105em;
            color: white;
            padding-left: calc(
                10% * var(--isMobile) +
                0px * (1 - var(--isMobile))
            );
            padding-top: calc(
                4% * var(--isMobile) +
                0px * (1 - var(--isMobile))
            );
            padding-bottom: calc(
                4% * var(--isMobile) +
                0px * (1 - var(--isMobile))
            );
        }
    `

	connectedCallback() {
		super.connectedCallback()

		autorun(() => {
			this.menuLinks?.style.setProperty('--isMobile', '' + (this.isMobile ? 1 : 0))
		})
	}
}

@element('hamburger-button')
export class HamburgerButton extends Node {
	@numberAttribute(2) lineThickness = 2
	@numberAttribute(0.8) lineLength = 0.8
	@booleanAttribute(false) activated = false

	get root() {
		return this
	}
	set root(_v) {}

	template = () => (
		<>
			<lume-node
				class="menuButtonLine"
				size-mode="proportional literal"
				size={[this.lineLength, this.lineThickness]}
				align-point={this.activated ? '0.5 0.5' : '1 0'}
				mount-point={this.activated ? '0.5 0.5' : '1 0'}
				rotation={[0, 0, this.activated ? -45 : 0]}
			></lume-node>
			<lume-node
				classList={{menuButtonLine: true, hide: this.activated}}
				size-mode="proportional literal"
				size={[this.lineLength, this.lineThickness]}
				align-point="0 0.5"
				mount-point="0 0.5"
			></lume-node>
			<lume-node
				class="menuButtonLine"
				size-mode="proportional literal"
				size={[this.lineLength, this.lineThickness]}
				align-point={this.activated ? '0.5 0.5' : '1 1'}
				mount-point={this.activated ? '0.5 0.5' : '1 1'}
				rotation={[0, 0, this.activated ? 45 : 0]}
			></lume-node>
		</>
	)

	css = /*css*/ `
        .menuButtonLine {
            background: white;
        }

        .hide {
            display: none!important;
        }
    `
}
