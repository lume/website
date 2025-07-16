import {css, html, Element, element, type ElementAttributes, signal, Scene, jsonAttribute} from 'lume'
import {SceneManager, type TrackedSceneElementNode} from './SceneManager.js'

import './ui/SceneView.js'

export type LumeStudioAttributes = 'sceneNodes'

@element
export class LumeStudio extends Element {
	static readonly elementName = 'lume-studio'

	@jsonAttribute sceneNodes?: object

	@signal lumeScene?: Scene

	// Passed to `SceneView`.
	@signal elementIds: string[] = []

	@signal trackedNodes: TrackedSceneElementNode[] = []

	sceneManager = new SceneManager()

	connectedCallback() {
		super.connectedCallback()

		this.createEffect(() => {
			if (!this.sceneNodes || !this.lumeScene) return

			// Recreate
			this.sceneManager = new SceneManager()
			this.sceneManager.scene = this.lumeScene
			this.sceneManager.updateScene((this.sceneNodes as any).nodes)

			this.elementIds = this.sceneManager.sceneNodes.map(node => node.id ?? '')
			this.trackedNodes = this.sceneManager.sceneNodes
		})
	}

	template = () => html`
		<div style="width: 100%; height: 100%;">
			<lume-scene
				ref="${(e: Scene) => {
					this.lumeScene = e

					this.sceneManager.scene = e
				}}"
				webgl
				style="position: absolute; width: 100%; height: 100%; background: lightgray;"
			>
			</lume-scene>
			<div style="position: absolute;">
				<scene-view
					scene-nodes="${() => {
						return this.trackedNodes
					}}"
					element-ids="${() => this.elementIds}"
					scene=${() => this.lumeScene}
				></scene-view>
			</div>
		</div>
	`

	css = css`
		:host {
			width: 100%;
		}

		/* TODO :host-context support for non-shadow scoped styles? */
		:host-context([data-theme='dark']) {
			background: rgba(0, 0, 0, 0.5);
		}

		:host,
		* {
			box-sizing: border-box;
		}
	`
}

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			[LumeStudio.elementName]: ElementAttributes<LumeStudio, LumeStudioAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[LumeStudio.elementName]: LumeStudio
	}
}
