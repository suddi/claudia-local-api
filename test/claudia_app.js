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

module.exports = bootstrap();
