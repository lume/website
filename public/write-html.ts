/**
 * Does one thing simply: writes the given HTML from url to the document.
 * Usage:
 * <script src="/write-html.js" href="/path/to/some.html"></script>
 */
{
	const href = document.currentScript?.getAttribute('href') || '/'
	const xhr = new XMLHttpRequest()
	xhr.open('GET', href, false)
	xhr.send()
	const html = xhr.responseText

	/////////////////////////////////////////////////////////////////
	//// Method 1 ///////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	// This method works only in the head, not in the body where head-only tags
	// will land in the body and won't work. When running in the head, the
	// parser places body content into the body automatically, but does not do
	// that automatically for head content when running in the body.

	// document.write(html)

	/////////////////////////////////////////////////////////////////
	//// Method 2 ///////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	// This method works regardless if this script runs in the head or the body.
	// We manually write the head content to the head, and write the body
	// content like normal (we're already in the body).

	const parser = new DOMParser()
	const doc = parser.parseFromString(html, 'text/html')

	// Ensure anything that belongs in the head will go in the head, even if
	// this script is running in the body (otherwise some elements that only
	// work in the head won't work).
	for (const el of Array.from(doc.head.childNodes))
		if (el instanceof HTMLScriptElement) handleScript(el)
		else if (el instanceof Element) document.head.insertAdjacentHTML('beforeend', el.outerHTML)
		else if (el instanceof Text) document.head.insertAdjacentText('beforeend', el.data)
	doc.head.remove()

	// Write the body in place (the HTML parser naturally puts elements that
	// don't belong in the head into the body in case this script is running in
	// the head).
	//
	document.write(doc.body.outerHTML)
	doc.body.remove()

	function handleScript(script: HTMLScriptElement) {
		const newScript = document.createElement('script')
		if (script.src) newScript.src = script.src
		else newScript.textContent = script.textContent
		document.head.appendChild(newScript)
	}
}
