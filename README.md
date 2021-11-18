# ts-ts-claudia-local-api

Command line utility to launch Express local API for claudia-api-builder. Test drive your lambda functions before deployment (Based on Sudharshan Ravindran claudia-local-api) with the aws lambda function stage parameter. BE AWARE NOT INSTALL WITH claudia-local-api package!
Extends claudia-local-api with suport for AWS requestUUID and stages using --stage {stagename} provided as commandline argument


````
npm install --save-dev ts-claudia-local-api
````

To install globally:

````
npm install --global ts-claudia-local-api
````

## Usage

If you have a [`claudia`](https://www.npmjs.com/package/claudia) and [`claudia-api-builder`](https://www.npmjs.com/package/claudia-api-builder) app/server named `lib/app.js` ready for deployment and you want to test it locally:

````js
'use strict';

const ApiBuilder = require('claudia-api-builder');

function handleGetRequest(app, req) {
    const body = {
        status: 'OK',
        body: req.body,
        pathParams: req.pathParams,
        query: req.queryString
    };
    return new app.ApiResponse(body, {
        called: 'handleGetRequest'
    }, 200);
}

function handlePostRequest(app, req) {
    const body = {
        status: 'OK',
        body: req.body,
        pathParams: req.pathParams,
        query: req.queryString
    };
    return new app.ApiResponse(body, {
        called: 'handlePostRequest'
    }, 201);
}

function bootstrap() {
    const app = new ApiBuilder();

    app.get('/', handleGetRequest.bind(null, app));
    app.post('/', handlePostRequest.bind(null, app));

    app.get('/users/{id}', handleGetRequest.bind(null, app));
    app.get('/items/{itemId}/{partId}', handleGetRequest.bind(null, app));

    app.post('/objects', handlePostRequest.bind(null, app));

    return app;
}

module.exports = bootstrap()
````

You can install `ts-claudia-local-api`  and run the command line Express API to test out the lambda function locally:

````
ts-claudia-local-api --api-module lib/app.js
````

Or add into your `package.json`:

````json
"server": "ts-claudia-local-api --api-module lib/app.js --stage develop"
````

This will start up a local Express server on port 3000 to proxy requests to your [`claudia-api-builder`](https://www.npmjs.com/package/claudia-api-builder) app.

You can also pipe it into [`bunyan`](https://www.npmjs.com/package/bunyan) to pretty print the log:

````
ts-claudia-local-api --api-module lib/app.js --stage develop | bunyan --output short
````

---

For full list of options:

````
ts-claudia-local-api --help
````
