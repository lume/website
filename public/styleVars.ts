const styleVars = {
	appBackground: 'rgb(13, 9, 98)',
	// This will be 0.8 in JS and "80%" in CSS.
	menuWidth: '80%' as any as number,
	desktopMenuItemHeight: 50,
	headerHeight: 100,
	pageTopBottomPadding: 25,
	pageLeftRightPadding: 60,
}

interface Window {
	styleVars: typeof styleVars
}

window.styleVars = styleVars

const css = String.raw // for syntax/formatting

const style = document.createElement('style')

style.textContent = css`
	:root {
		${Object.entries(styleVars)
			.map(([k, v]) => `--${k}: ${typeof v === 'number' ? v + 'px' : v};`)
			.join('\n')}
	}
`

document.head.append(style)

for (const [key, val] of Object.entries(styleVars)) {
	// @ts-ignore
	styleVars[key] = typeof val === 'string' && val.endsWith('%') ? Number(val.replace('%', '')) / 100 : val
}
