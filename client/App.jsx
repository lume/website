import {
	Motor,
	Element,
	reactive,
	element,
	Show,
	Node,
	numberAttribute,
	booleanAttribute,
	rotation,
	position,
} from 'lume'
import {Tween, Easing} from '@tweenjs/tween.js'

if (!Tween) throw new Error('Expected Tween to be defined (imported).')

const MENU_WIDTH = 0.8 // percent of viewport

@element('app-root')
export class App extends Element {
	root = this

	// state = {
	// 	menuPosition: 0,
	// }

	// @reactive menuPosition = 0

	// containerRef = cubeNode => {
	// 	Motor.addRenderTask(t => {
	// 		cubeNode.rotation.y += 0.25
	// 	})
	// }

	/** @type {import('./Cube').Cube=} */
	cubeNode
	/** @type {Node=} */
	menu
	/** @type {import('lume').Scene=} */
	scene
	/** @type {Node=} */
	rotator
	/** @type {Node=} */
	circle

	// TODO make option for Tween to remember last value instead of starting
	// from the beginning. It would simplify the Tween code a lot. See
	// https://github.com/tweenjs/tween.js/issues/522

	makeOpenTween() {
		this.openTween = new Tween({menuPosition: this.menu?.align.x || 1})
			.onComplete(() => this.openTween?.stop())
			.onUpdate(obj => this.menu && (this.menu.align.x = obj.menuPosition))
			.easing(Easing.Exponential.Out)
	}

	makeCloseTween() {
		this.closeTween = new Tween({
			menuPosition: this.menu?.align.x || 1 - MENU_WIDTH,
		})
			.onComplete(() => this.closeTween?.stop())
			.onUpdate(obj => this.menu && (this.menu.align.x = obj.menuPosition))
			.easing(Easing.Exponential.Out)
	}

	/** @type {InstanceType<Tween<{foo: 13}>> | null} */
	openTween = null
	/** @type {InstanceType<Tween<{foo: 13}>> | null} */
	closeTween = null
	menuOpen = false

	openMenu = () => {
		if (this.menuOpen) return
		this.menuOpen = true

		if (this.closeTween?.isPlaying()) this.closeTween.stop()

		this.makeOpenTween()
		// TODO Tween.start() time arg should be optional.
		// XXX this.openTween exists here! Optional chaining operator is needed to satisfy type system
		this.openTween?.to({menuPosition: 1 - MENU_WIDTH}, 800).start(performance.now())
		this.tweenLoop()
	}

	closeMenu = () => {
		if (!this.menuOpen) return
		this.menuOpen = false

		if (this.openTween?.isPlaying()) this.openTween.stop()

		this.makeCloseTween()
		// XXX this.closeTween exists here! Optional chaining operator is needed to satisfy type system
		this.closeTween?.to({menuPosition: 1}, 800).start(performance.now())
		this.tweenLoop()
	}

	toggleMenu = () => (this.menuOpen ? this.closeMenu() : this.openMenu())

	/** @type {import('lume').RenderTask | null | boolean} */
	tweenTask = null

	tweenLoop() {
		if (this.tweenTask) return

		this.tweenTask = Motor.addRenderTask(t => {
			if (this.openTween && this.openTween.isPlaying()) this.openTween.update(t)
			else if (this.closeTween && this.closeTween.isPlaying()) this.closeTween.update(t)
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

		if (!scene || !rotator || !cubeNode) throw 'They must exist.'

		Motor.addRenderTask(_t => {
			if (cubeNode) cubeNode.rotation.y += 0.25
		})

		const resize = (/** @type {UIEvent} */ _e) => {
			this.viewWidth = window.innerWidth
			this.viewHeight = window.innerHeight

			console.log('is mobile: ', this.viewWidth <= 1200 ? 1 : 0)
			document.body.style.setProperty('--mobile', '' + (this.viewWidth <= 1200 ? 1 : 0))

			// this.forceUpdate && this.forceUpdate()
		}

		window.addEventListener('resize', _.debounce(resize, 100))
		resize()

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
			rotator.rotation = rotation({
				x: rotationAmountX * 0.5,
				y: rotationAmountY * 0.5,
			})

			// ...or with an array.
			rotator.position = position([rotationAmountY, rotationAmountX])

			const circle = this.circle
			if (!circle) return
			circle.position.x = event.clientX
			circle.position.y = event.clientY
		})
	}

	template = () => (
		<lume-scene
			ref={this.scene}
			class="scene"
			touch-action="none"
			// size-mode="literal literal"
			// size={[this.viewWidth, this.viewHeight]}
			// size="800 600"
		>
			<lume-node size-mode="proportional proportional" size="1 1 0">
				<lume-scene perspective={123} background-color={'asdf'} id="innerScene">
					<lume-node size-mode="proportional proportional" size="1 1 0">
						<lume-node
							class="headerBar"
							style={`pointer-events: ${this.isMobile ? 'none' : 'auto'};`}
							size-mode="proportional literal"
							size={[1, this.isMobile ? 100 : 100, 0]}
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
							align="0.5 0.5"
							mount-point="0.5 0.5"
							size-mode="proportional proportional"
							size="1 1"
						>
							<lume-node
								size-mode="proportional proportional"
								size={this.viewIsTall ? '0 0.7 0' : '0.5 0 0'}
								mount-point="0.5 0.5"
								align="0.5 0.5"
							>
								<img
									src={'/images/logo-wordmark' + (this.viewIsTall ? '-vertical' : '') + '.svg'}
									style={`
										transform: ${this.viewIsTall ? 'translateX(-50%)' : 'translateY(-50%)'};
										object-fit: fill;
										${
											this.viewIsTall
												? `
                                                    width: auto;
                                                    height: 100%;
                                                `
												: `
                                                    width: 100%;
                                                    height: auto;
                                                `
										}
									`}
								/>
							</lume-node>

							<x-cube
								ref={this.cubeNode}
								size={this.cubeSize}
								align="0.5 0.5"
								position={[0, 0, -this.cubeSize]}
								rotation="45 45 45"
							/>
						</lume-node>
					</lume-node>
				</lume-scene>

				{/* <Show when={!this.mobile}>
					<lume-node ref={this.circle} class="circle" mount-point="0.5 0.5" size="200 200" />
				</Show> */}

				<Show when={this.isMobile}>
					<lume-node size-mode="proportional proportional" size="1 1 0" style="pointer-events: none">
						<lume-node
							ref={this.menu}
							class="mobileMenu"
							size-mode="proportional proportional"
							size={[MENU_WIDTH, 1]}
							align="1 0" // start closed position
							opacity="0.97"
						>
							<menu-links isMobile={true} />
						</lume-node>

						<lume-node
							class="menuButtonWrapper"
							size="140 100"
							align="1 0"
							position="0 0"
							mount-point="1 0"
							onClick={this.toggleMenu}
						>
							<menu-button
								// width={40}
								// height={19}
								size="40 19"
								align="0.5 0.5"
								mount-point="0.5 0.5"
								position="0 0"
								line-thickness={2.5}
								line-length={0.7}
							/>
						</lume-node>
					</lume-node>
				</Show>
			</lume-node>
		</lume-scene>
	)

	css = /*css*/ `
        :host {
            /* display: contents; */
            display: block;
            width: 100%;
            height: 100%;
        }

        .scene {
            touch-action: none;
            /* position: absolute !important; */
        }

        .headerBarInner {
            display: flex;
            height: 100%;
            align-items: center;
            /* padding-left: 112; */
            padding-left: 60px;
            padding-right: 60px;
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
@reactive
export class MenuLinks extends Element {
	@reactive @booleanAttribute(false) isMobile = false

	template = () => (
		<div class={`menuLinks${this.isMobile ? ' menuLinksMobile' : ''}`}>
			<a class="menuLink" href="/docs">
				Documentation
			</a>
			<a class="menuLink" href="/docs/#/examples/hello3d">
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
		</div>
	)

	css = /*css*/ `
        :host {
            display: contents;
        }
        
        .menuLinks {
            font-size: calc(
                30px * var(--mobile) + 
                14px * (1 - var(--mobile))
            );
            padding-top: 15px;
        }

        .menuLinksMobile {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
        }

        .menuLink {
            text-transform: uppercase;
            margin-left: calc(
                91px * var(--mobile) + 
                40px * (1 - var(--mobile))
            );
            margin-top: calc(
                0px * var(--mobile) + 
                80px * (1 - var(--mobile))
            );
            letter-spacing: 0.105em;
            color: white;
            transform: translateY(15px);
        }
	`
}

@element('menu-button')
export class MenuButton extends Node {
	@reactive @numberAttribute(2) lineThickness = 2
	@reactive @numberAttribute(0.8) lineLength = 0.8

	root = this

	template = () => (
		<>
			{/* <lume-node size={[this.props.width, this.props.height]} {...this.props}> */}
			<lume-node
				class="menuButtonLine"
				size-mode="proportional literal"
				size={[this.lineLength, this.lineThickness]}
				align="1 0"
				mount-point="1 0"
			></lume-node>
			<lume-node
				class="menuButtonLine"
				size-mode="proportional literal"
				size={[this.lineLength, this.lineThickness]}
				align="0 0.5"
				mount-point="0 0.5"
			></lume-node>
			<lume-node
				class="menuButtonLine"
				size-mode="proportional literal"
				size={[this.lineLength, this.lineThickness]}
				align="1 1"
				mount-point="1 1"
			></lume-node>
			{/* </lume-node> */}
		</>
	)

	css = /*css*/ `
        .menuButtonLine {
            background: white;
        }
    `
}
