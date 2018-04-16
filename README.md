# claudia-local-api

[![CircleCI](https://img.shields.io/circleci/project/suddi/claudia-local-api/master.svg)](https://circleci.com/gh/suddi/claudia-local-api)
[![codecov](https://codecov.io/gh/suddi/claudia-local-api/branch/master/graph/badge.svg)](https://codecov.io/gh/suddi/claudia-local-api)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/4aaafdcb86574c709f856f2e00d3a809)](https://www.codacy.com/app/Suddi/claudia-local-api)
[![npm](https://img.shields.io/npm/v/claudia-local-api.svg)](https://www.npmjs.com/package/claudia-local-api)
[![npm](https://img.shields.io/npm/dt/claudia-local-api.svg)](https://www.npmjs.com/package/claudia-local-api)
[![Greenkeeper badge](https://badges.greenkeeper.io/suddi/claudia-local-api.svg)](https://greenkeeper.io/)
[![David](https://img.shields.io/david/suddi/claudia-local-api.svg)](https://david-dm.org/suddi/claudia-local-api)
[![David](https://img.shields.io/david/dev/suddi/claudia-local-api.svg)](https://david-dm.org/suddi/claudia-local-api?type=dev)
[![license](https://img.shields.io/github/license/suddi/claudia-local-api.svg)](https://github.com/suddi/claudia-local-api/blob/master/LICENSE)

[![codecov](https://codecov.io/gh/suddi/claudia-local-api/branch/master/graphs/commits.svg)](https://codecov.io/gh/suddi/claudia-local-api)

Command line utility to launch Express local API for claudia-api-builder. Test drive your lambda functions before deployment

````
npm install --save-dev claudia-local-api
````

To install globally:

````
npm install --global claudia-local-api
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
````

You can install `claudia-local-api`  and run the command line Express API to test out the lambda function locally:

````
claudia-local-api --api-module lib/app.js
````

Or add into your `package.json`:

````json
"server": "claudia-local-api --api-module lib/app.js"
````

This will start up a local Express server on port 3000 to proxy requests to your [`claudia-api-builder`](https://www.npmjs.com/package/claudia-api-builder) app.

You can also pipe it into [`bunyan`](https://www.npmjs.com/package/bunyan) to pretty print the log:

````
claudia-local-api --api-module lib/app.js | bunyan --output short
````

---

For full list of options:

````
claudia-local-api --help
````
