// Allow only certain domains to access content.
WebApp.rawConnectHandlers.use(
/*'/public',*/
function (req, res, next) {
    // For development mode allow localhost origins.
    if ([
        // landing page (the Meteor app)
        'localhost:3000',
        '127.0.0.1:3000',
        '0.0.0.0:3000',
        // docs site (the static Docsify app)
        'localhost:54321',
        '127.0.0.1:54321',
        '0.0.0.0:54321',
    ].includes(req.headers.host)) {
        // We use 'http://' for local development.
        res.setHeader('Access-Control-Allow-Origin', 'http://' + req.headers.host);
    }
    // Otherwise only allow lume.io.
    else {
        // Asumption: lume.io is only accessible via HTTPS, so that's why we
        // can confidently use 'https://' in the following.
        res.setHeader('Access-Control-Allow-Origin', 'https://lume.io');
    }
    return next();
});
export {};
//# sourceMappingURL=entry.js.map