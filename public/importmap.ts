{
	/** identity template tag function for html syntax */
	const html = String.raw

	document.write(html`
		<script type="importmap">
			{
				"imports": {
					"@tweenjs/tween.js": "https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@25.0.0/dist/tween.esm.js",
					"classy-solid": "https://cdn.jsdelivr.net/npm/classy-solid@0.4.3/dist/index.js",
					"lume": "https://cdn.jsdelivr.net/npm/lume@0.3.0-alpha.45/dist/index.js",
					"lume/": "https://cdn.jsdelivr.net/npm/lume@0.3.0-alpha.45/",
					"solid-js": "https://cdn.jsdelivr.net/npm/solid-js@1.9.5/dist/solid.js",
					"solid-js/html": "https://cdn.jsdelivr.net/npm/solid-js@1.9.5/html/dist/html.js",
					"solid-js/store": "https://cdn.jsdelivr.net/npm/solid-js@1.9.5/store/dist/store.js",
					"solid-js/web": "https://cdn.jsdelivr.net/npm/solid-js@1.9.5/web/dist/web.js",

					"@lume/autolayout": "https://cdn.jsdelivr.net/npm/@lume/autolayout@0.10.2/dist/AutoLayout.js",
					"@lume/custom-attributes/dist/index.js": "https://cdn.jsdelivr.net/npm/@lume/custom-attributes@0.2.4/dist/index.js",
					"@lume/element": "https://cdn.jsdelivr.net/npm/@lume/element@0.16.0/dist/index.js",
					"@lume/eventful": "https://cdn.jsdelivr.net/npm/@lume/eventful@0.3.3/dist/index.js",
					"@lume/kiwi": "https://cdn.jsdelivr.net/npm/@lume/kiwi@0.4.4/dist/kiwi.js",
					"@lume/three-projected-material/dist/ProjectedMaterial.js": "https://cdn.jsdelivr.net/npm/@lume/three-projected-material@0.3.1/dist/ProjectedMaterial.js",
					"element-behaviors": "https://cdn.jsdelivr.net/npm/element-behaviors@5.0.5/dist/index.js",
					"james-bond": "https://cdn.jsdelivr.net/npm/james-bond@0.7.4/dist/index.js",
					"lowclass/": "https://cdn.jsdelivr.net/npm/lowclass@8.0.2/",
					"regexr": "https://cdn.jsdelivr.net/npm/regexr@2.0.4/dist/index.js",
					"three": "https://cdn.jsdelivr.net/npm/three@0.174.0/src/Three.js",
					"three/": "https://cdn.jsdelivr.net/npm/three@0.174.0/",

					"meteor/meteor": "/meteor-packages.js",
					"meteor/tracker": "/meteor-packages.js",
					"meteor/blaze": "/meteor-packages.js",
					"meteor/templating": "/meteor-packages.js",
					"meteor/mongo": "/meteor-packages.js",
					"meteor/session": "/meteor-packages.js",
					"meteor/reactive-var": "/meteor-packages.js",
					"meteor/accounts-base": "/meteor-packages.js"
				}
			}
		</script>
	`)
}
