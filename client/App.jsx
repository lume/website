import * as React from 'react'
import {Motor} from 'lume'
import TWEEN from '@tweenjs/tween.js'
import {Cube} from './Cube'

const MENU_WIDTH = 0.8 // percent of viewport

export class App extends React.Component {
	state = {
		cubeRotation: 0,
		menuPosition: 0,
	}

	containerRef = cubeNode => {
		Motor.addRenderTask(t => {
			cubeNode.rotation.y += 0.25
		})
	}

	// TODO make option for Tween to remember last value instead of starting
	// from the beginning. It would simplify the Tween code a lot. See
	// https://github.com/tweenjs/tween.js/issues/522

	makeOpenTween() {
		this.openTween = new TWEEN.Tween({menuPosition: (this.refs.menu && this.refs.menu.align.x) || 1})
			.onComplete(() => this.openTween.stop())
			.onUpdate(obj => (this.refs.menu.align.x = obj.menuPosition))
			.easing(TWEEN.Easing.Exponential.Out)
	}

	makeCloseTween() {
		this.closeTween = new TWEEN.Tween({
			menuPosition: (this.refs.menu && this.refs.menu.align.x) || 1 - MENU_WIDTH,
		})
			.onComplete(() => this.closeTween.stop())
			.onUpdate(obj => (this.refs.menu.align.x = obj.menuPosition))
			.easing(TWEEN.Easing.Exponential.Out)
	}

	openTween = null
	closeTween = null
	menuOpen = false

	openMenu = () => {
		if (this.menuOpen) return
		this.menuOpen = true

		if (this.closeTween && this.closeTween.isPlaying()) this.closeTween.stop()

		this.makeOpenTween()
		this.openTween.to({menuPosition: 1 - MENU_WIDTH}, 800).start()
		this.tweenLoop()
	}

	closeMenu = () => {
		if (!this.menuOpen) return
		this.menuOpen = false

		if (this.openTween && this.openTween.isPlaying()) this.openTween.stop()

		this.makeCloseTween()
		this.closeTween.to({menuPosition: 1}, 800).start()
		this.tweenLoop()
	}

	toggleMenu = () => (this.menuOpen ? this.closeMenu() : this.openMenu())

	tweenTask = null

	tweenLoop() {
		if (this.tweenTask) return

		this.tweenTask = Motor.addRenderTask(t => {
			if (this.openTween && this.openTween.isPlaying()) this.openTween.update(t)
			else if (this.closeTween && this.closeTween.isPlaying()) this.closeTween.update(t)
			else return (this.tweenTask = false)
		})
	}

	componentDidMount() {
		const scene = this.refs.scene
		const rotator = this.refs.rotator

		const resize = _.debounce(_e => {
			console.log('is mobile: ', this.viewWidth <= 1200 ? 1 : 0)
			document.body.style.setProperty('--mobile', '' + (this.viewWidth <= 1200 ? 1 : 0))
			this.forceUpdate()
		}, 100)

		window.addEventListener('resize', resize)
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
			rotator.rotation = {
				x: rotationAmountX * 0.5,
				y: rotationAmountY * 0.5,
			}

			// ...or with an array.
			rotator.position = [rotationAmountY, rotationAmountX]

			const circle = this.refs.circle
			if (!circle) return
			circle.position.x = event.clientX
			circle.position.y = event.clientY
		})
	}

	get viewWidth() {
		return window.innerWidth
	}
	get viewHeight() {
		return window.innerHeight
	}
	get mobile() {
		return this.viewWidth <= 1200
	}
	get cubeSize() {
		return this.viewIsTall ? 0.65 * this.viewWidth : 0.5 * this.viewHeight
	}
	get viewIsTall() {
		return this.viewHeight >= this.viewWidth
	}

	render = () => (
		<lume-scene ref="scene" style={s.scene} touch-action="none">
			<lume-node size-mode="proportional proportional" size="1 1 0">
				<lume-scene style={s.style}>
					<lume-node size-mode="proportional proportional" size="1 1 0">
						<lume-node
							style={{
								...s.headerBar,
								...{pointerEvents: this.mobile ? 'none' : 'auto'},
							}}
							size-mode="proportional literal"
							size={[1, this.mobile ? 100 : 100, 0]}
						>
							<div style={s.headerBarInner}>
								<img src="/images/logo.svg" style={s.logo} />
								{this.mobile ? null : <MenuLinks />}
							</div>
						</lume-node>

						<lume-node
							ref="rotator"
							style={s.rotator}
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
									style={{
										transform: this.viewIsTall ? 'translateX(-50%)' : 'translateY(-50%)',
										...(this.viewIsTall
											? {
													width: 'auto',
													height: '100%',
											  }
											: {
													width: '100%',
													height: 'auto',
											  }),
										objectFit: 'fill',
									}}
								/>
							</lume-node>

							<Cube
								containerRef={this.containerRef}
								size={this.cubeSize}
								align="0.5 0.5"
								position={[0, 0, -this.cubeSize]}
								rotation="45 45 45"
							/>
						</lume-node>
					</lume-node>
				</lume-scene>

				{/* {this.mobile ? null : <lume-node ref="circle" style={s.circle} mount-point="0.5 0.5" size="200 200" />} */}

				{this.mobile ? (
					<lume-node size-mode="proportional proportional" size="1 1 0" style={{pointerEvents: 'none'}}>
						<lume-node
							ref="menu"
							style={s.mobileMenu}
							size-mode="proportional proportional"
							size={[MENU_WIDTH, 1]}
							align="1 0" // start closed position
							opacity="0.97"
						>
							<MenuLinks isMobile={true} />
						</lume-node>

						<lume-node
							style={s.menuButton}
							size="140 100"
							align="1 0"
							position="0 0"
							mount-point="1 0"
							onClick={this.toggleMenu}
						>
							<MenuButton
								width={40}
								height={19}
								align="0.5 0.5"
								mount-point="0.5 0.5"
								position="0 0"
								lineThickness={2.5}
								lineLength={0.7}
							/>
						</lume-node>
					</lume-node>
				) : null}
			</lume-node>
		</lume-scene>
	)
}

class MenuLinks extends React.Component {
	render = () => (
		<div
			style={{
				...s.menuLinks,
				...(this.props.isMobile && s.menuLinksMobile),
			}}
		>
			<a style={s.menuLink} href="/docs">
				Documentation
			</a>
			<a style={s.menuLink} href="/docs/#/examples/hello3d">
				Examples
			</a>
			<a style={s.menuLink} href="//lume.community">
				Forum
			</a>
			<a style={s.menuLink} href="//discord.gg/PgeyevP">
				Chat
			</a>
			<a style={s.menuLink} href="//github.com/lume/lume">
				Source
			</a>
		</div>
	)
}

class MenuButton extends React.Component {
	static defaultProps = {
		lineThickness: 2,
		lineLength: 0.8,
	}

	render = () => (
		<lume-node size={[this.props.width, this.props.height]} {...this.props}>
			<lume-node
				style={s.menuButtonLine}
				size-mode="proportional literal"
				size={[this.props.lineLength, this.props.lineThickness]}
				align="1 0"
				mount-point="1 0"
			></lume-node>
			<lume-node
				style={s.menuButtonLine}
				size-mode="proportional literal"
				size={[this.props.lineLength, this.props.lineThickness]}
				align="0 0.5"
				mount-point="0 0.5"
			></lume-node>
			<lume-node
				style={s.menuButtonLine}
				size-mode="proportional literal"
				size={[this.props.lineLength, this.props.lineThickness]}
				align="1 1"
				mount-point="1 1"
			></lume-node>
		</lume-node>
	)
}

/** @type {{[k: string]: React.CSSProperties}} */
const styles = {
	scene: {
		touchAction: 'none',
		// position: 'absolute !important',
	},
	headerBar: {},
	headerBarInner: {
		display: 'flex',
		height: '100%',
		alignItems: 'center',
		// paddingLeft: 112,
		paddingLeft: 60,
		paddingRight: 60,
	},
	logo: {
		width: 50,
		height: 50,
		objectFit: 'fill',

		// push everything else to the right side of the header
		marginRight: 'auto',
	},
	rotator: {
		pointerEvents: 'none',
	},
	menuButton: {
		pointerEvents: 'auto',
	},
	menuButtonLine: {
		background: 'white',
	},
	mobileMenu: {
		background: 'rgba(0, 25, 93, 0.3)',
		backdropFilter: 'blur(14px) brightness(130%)',
		pointerEvents: 'auto',
	},
	menuLinks: {
		fontSize: `calc(
            30px * var(--mobile) + 
            14px * (1 - var(--mobile))
        )`,
		paddingTop: 15,
	},
	menuLinksMobile: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		height: '100%',
	},
	menuLink: {
		textTransform: 'uppercase',
		marginLeft: `calc(
            91px * var(--mobile) + 
            40px * (1 - var(--mobile))
        )`,
		marginTop: `calc(
            0px * var(--mobile) + 
            80px * (1 - var(--mobile))
        )`,
		letterSpacing: '0.105em',
		color: 'white',
		transform: 'translateY(15px)',
	},
	circle: {
		background: 'rgba(0, 25, 93, 0.3)',
		backdropFilter: 'blur(14px) brightness(130%)',

		borderRadius: '100%',
	},
}

// alias for styles
const s = styles
