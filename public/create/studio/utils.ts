import {camelCaseToDash} from 'lume'

type ElementSpecMemberType = 'string' | 'number' | 'boolean' | 'object' | 'undefined' | 'null'

type ElementSpecMemberDefaultType = string | number | boolean | Object | undefined | null

interface ElementSpecMember {
	name: string
	type: ElementSpecMemberType
	defaultValue: ElementSpecMemberDefaultType
	isOptional?: boolean
	// isAttribute?: boolean // make attribute
	// isReactive?: boolean // make signal
}

interface ElementNodeAttribute {
	/**
	 * The camelCased name of the attribute.
	 */
	name: string
	val: any
}

/**
 * Node within the scene hierarchy.
 */
export interface SceneElementNode {
	tagName: string
	attributes?: ElementNodeAttribute[]

	parent?: SceneElementNode
	children?: SceneElementNode[]
}

interface ElementSpec {
	name: string
	tagName: string
	members: ElementSpecMember[]

	templateElements?: SceneElementNode[]
}

function nodeToHTML(node: SceneElementNode): string {
	// Objects aren't currently supported.
	return `<${node.tagName}${node.attributes
		?.map(attribute => ` ${camelCaseToDash(attribute.name)}="${attribute.val}"`)
		.join('')}>${node.children?.map(child => nodeToHTML(child)) ?? ''}</${node.tagName}>`
}

function createTemplate(nodes: SceneElementNode[]) {
	return `${nodes.map(node => nodeToHTML(node))}`
}

/**
 * Creates the HTML for the scene, and
 * @param nodes
 * @returns
 */
export function createSceneHTML(nodes: SceneElementNode[]) {
	return createTemplate(nodes)
}


export function createClassDefinition(spec: ElementSpec) {
	// This is just for testing, we should remove the import when defining multiple elements

	// TODO: Import attributes based off of what is being used in the definition.

	return `
    import {Element, element, numberAttribute, stringAttribute} from '@lume/element'
    import {html} from 'lume'

    @element
    class ${spec.name} extends Element {
        static elementName = '${spec.name}'

        connectedCallback() {
            super.connectedCallback()

            console.log('this is connectedCallback :)')
        }

        ${spec.members.map(member => `@${member.type}Attribute ${member.name} = ${member.defaultValue}\n`)}${spec.templateElements && spec.templateElements.length > 0 ? `\ntemplate = () => html\`${createTemplate(spec.templateElements)}\`` : ''}
    }
  `
}
