const styleVars = {
	// Soft blue in light mode, and dark blue in dark mode.
	appBackground: '#f0f4ff',
	appBackgroundDark: '#1a1a2e',

	// This will be 0.8 in JS and "80%" in CSS.
	menuWidth: '80%' as any as number,
	desktopMenuItemHeight: 50,
	headerHeight: 100,
	pageTopBottomPadding: 25,
	pageLeftRightPadding: 60,

	// Some colors (TBD).
	lumePrimaryRgb: '10, 58, 221',
	lumePrimary: 'rgba(var(--lumePrimaryRgb), 1)',
	lumeSecondaryRgb: '255, 67, 169',
	lumeSecondary: 'rgba(var(--lumeSecondaryRgb), 1)',
	lumeDanger: 'red',
	lumeTextColor: 'white',

	// TODO improve type defs for this without requiring error-prone manual type casting.
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
