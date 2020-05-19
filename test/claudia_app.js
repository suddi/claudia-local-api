'use strict';

const ApiBuilder = require('claudia-api-builder');
const fs = require('fs');
const path = require('path');

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

function handleFormUrlEncodedRequest(app, req) {
    const body = {
        status: 'OK',
        body: req.body,
        pathParams: req.pathParams,
        query: req.queryString
    };
    return new app.ApiResponse(body, {
        called: 'handleFormUrlEncodedRequest'
    }, 200);
}

function handleImageRequest() {
    return fs.readFileSync(path.join(__dirname, 'img.png'));
}

function bootstrap() {
    const app = new ApiBuilder();

    app.get('/', handleGetRequest.bind(null, app));
    app.post('/', handlePostRequest.bind(null, app));

    app.get('/users/{id}', handleGetRequest.bind(null, app));
    app.get('/items/{itemId}/{partId}', handleGetRequest.bind(null, app));

    app.post('/objects', handlePostRequest.bind(null, app));

    app.post('/items', handleFormUrlEncodedRequest.bind(null, app));

    app.get('/img', handleImageRequest, {
        requestContentHandling: 'CONVERT_TO_TEXT',
        success: {
            contentType: 'image/png',
            contentHandling: 'CONVERT_TO_BINARY'
        }
    });

    return app;
}

module.exports = bootstrap();
