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
	document.write(html)
}
