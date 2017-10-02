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
