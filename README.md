# claudia-local-api

[![CircleCI](https://img.shields.io/circleci/project/suddi/claudia-local-api.svg)](https://circleci.com/gh/suddi/claudia-local-api)
[![codecov](https://codecov.io/gh/suddi/claudia-local-api/branch/master/graph/badge.svg)](https://codecov.io/gh/suddi/claudia-local-api)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/4aaafdcb86574c709f856f2e00d3a809)](https://www.codacy.com/app/Suddi/claudia-local-api?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=suddi/claudia-local-api&amp;utm_campaign=Badge_Grade)
[![npm](https://img.shields.io/npm/v/claudia-local-api.svg)](https://github.com/suddi/claudia-local-api)
[![npm](https://img.shields.io/npm/dt/claudia-local-api.svg)](https://github.com/suddi/claudia-local-api)
[![David](https://img.shields.io/david/suddi/claudia-local-api.svg)](https://david-dm.org/suddi/claudia-local-api)
[![David](https://img.shields.io/david/dev/suddi/claudia-local-api.svg)](https://david-dm.org/suddi/claudia-local-api?type=dev)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/suddi/claudia-local-api)

[![codecov](https://codecov.io/gh/suddi/claudia-local-api/branch/master/graphs/commits.svg)](https://codecov.io/gh/suddi/claudia-local-api)

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
