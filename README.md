# claudia-local-api

Command line utility to launch Express local API for claudia-api-builder. Test drive your lambda functions before deployment

````
npm install --save-dev claudia-local-api
````

## Usage

If you have a `claudia` server ready for deployment and you want to test it locally:

````js
'use strict';

const ApiBuilder = require('claudia-api-builder');

function handleGetRequest(app, req) {
    return new app.ApiResponse('OK', {
        called: 'handleGetRequest'
    }, 200);
}

function handlePostRequest(app, req) {
    return new app.ApiResponse('OK', {
        called: 'handlePostRequest'
    }, 201);
}

function bootstrap() {
    const app = new ApiBuilder();

    app.get('/', handleGetRequest.bind(null, app));
    app.post('/', handlePostRequest.bind(null, app));

    return app;
}

module.exports = bootstrap();
````

You can install `claudia-local-api` and run the command line Express API to test out the lambda function locally:

````
node_modules/.bin/claudia-local-api --api-module lib/app.js
````

Or add into your `package.json`:

````json
"server": "claudia-local-api --api-module lib/app.js"
````
