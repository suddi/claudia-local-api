'use strict';

const expect = require('chai').expect;
const pathParser = require('path-parser');
const request = require('request');
const rewire = require('rewire');
const sinon = require('sinon');

const localApi = rewire('../lib');

describe('Unit tests for lib/index', function () {
    context('Testing getDefaultConfig', function () {
        it('CASE 1: Should return required fields for default config', function () {
            const getDefaultConfig = localApi.__get__('getDefaultConfig');

            const result = getDefaultConfig();

            expect(result).to.have.keys('port');
        });
    });

    context('Testing logJson', function () {
        it('CASE 1: Should log result as expected', function () {
            const logJson = localApi.__get__('logJson');
            const spy = sinon.spy();
            const logger = {
                info: spy
            };
            const body = {
                a: {
                    b: {
                        c: [1, 2, 3],
                        d: 42
                    }
                },
                e: 42
            };
            const expectedResult = JSON.stringify(body, null, 4);

            const result = logJson(logger, body);

            expect(result).to.be.eq(undefined);
            expect(spy.calledOnce).to.be.eql(true);
            expect(spy.calledWith(expectedResult)).to.be.eql(true);
        });

        it('CASE 2: Should abbreviate bodies if abbrev is set', function () {
            const logJson = localApi.__get__('logJson');
            const spy = sinon.spy();
            const logger = {
                info: spy
            };
            logger.bodyAbbreviationLength = 11;

            const body = {
                body: 'OiPF7VcXwqydXKqIBUgucyu4I03zkqsIdAghlG8HmZiYgF6BPa'
            };

            const expected = {
                body: 'OiPF7VcX...'
            };

            const expectedResult = JSON.stringify(expected, null, 4);

            const result = logJson(logger, body);

            expect(result).to.be.eq(undefined);
            expect(spy.calledOnce).to.be.eql(true);
            expect(spy.calledWith(expectedResult)).to.be.eql(true);
        });

        it('CASE 3: Abbreviate to nothing but ellipsis if very small', function () {
            const logJson = localApi.__get__('logJson');
            const spy = sinon.spy();
            const logger = {
                info: spy
            };
            logger.bodyAbbreviationLength = 0;
            const body = {
                body: 'OiPF7VcXwqydXKqIBUgucyu4I03zkqsIdAghlG8HmZiYgF6BPa'
            };

            const expected = {
                body: '...'
            };

            const expectedResult = JSON.stringify(expected, null, 4);

            const result = logJson(logger, body);

            expect(result).to.be.eq(undefined);
            expect(spy.calledOnce).to.be.eql(true);
            expect(spy.calledWith(expectedResult)).to.be.eql(true);
        });
    });

    context('Testing logError', function () {
        it('CASE 1: Should log error as expected', function () {
            const logError = localApi.__get__('logError');
            const spy = sinon.spy();
            const logger = {
                error: spy
            };
            const error = new Error('Fail!');
            const expectedMessage = error.message;
            const expectedResult = error.stack;

            const result = logError(logger, error);

            expect(result).to.be.eq(undefined);
            expect(spy.calledTwice).to.be.eql(true);
            expect(spy.calledWith(expectedMessage)).to.be.eql(true);
            expect(spy.calledWith(expectedResult)).to.be.eql(true);
        });
    });

    context('Testing getPathParams', function () {
        it('CASE 1: Should match route if it is provided', function () {
            const getPathParams = localApi.__get__('getPathParams');
            const params = {
                id: '42'
            };
            const req = {
                originalUrl: `http://www.example.com/test/${params.id}?test-value=42`,
                _parsedUrl: {
                    pathname: `/test/${params.id}`
                },
                method: 'PATCH',
                headers: {
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36'
                },
                query: {
                    'test-value': '42'
                },
                body: {
                    a: {
                        b: {
                            c: [1, 2, 3],
                            d: 42
                        }
                    },
                    e: 42
                }
            };
            const resourcePath = '/test/{id}';
            const parsedPath = pathParser.Path.createPath(resourcePath.replace(/{(.+?)}/g, ':$1'));
            const routes = [
                {
                    resourcePath,
                    supportedMethods: [
                        'GET',
                        'POST',
                        'PUT',
                        'PATCH',
                        'DELETE'
                    ],
                    path: parsedPath
                }
            ];
            const expectedResult = {
                resourcePath,
                pathParameters: parsedPath.test(req._parsedUrl.pathname)
            };

            const result = getPathParams(req, routes);

            expect(result).to.deep.eql(expectedResult);
        });

        it('CASE 3: Should not match route if path does not match', function () {
            const getPathParams = localApi.__get__('getPathParams');
            const params = {
                id: '42'
            };
            const req = {
                originalUrl: `http://www.example.com/test/${params.id}?test-value=42`,
                _parsedUrl: {
                    pathname: `/test/${params.id}`
                },
                method: 'PATCH',
                headers: {
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36'
                },
                query: {
                    'test-value': '42'
                },
                body: {
                    a: {
                        b: {
                            c: [1, 2, 3],
                            d: 42
                        }
                    },
                    e: 42
                }
            };
            const routes = [];
            const expectedResult = {
                resourcePath: req._parsedUrl.pathname,
                pathParameters: {}
            };

            const result = getPathParams(req, routes);

            expect(result).to.deep.eql(expectedResult);
        });

        it('CASE 2: Should not match route if req.method does not match', function () {
            const getPathParams = localApi.__get__('getPathParams');
            const params = {
                id: '42'
            };
            const req = {
                originalUrl: `http://www.example.com/test/${params.id}?test-value=42`,
                _parsedUrl: {
                    pathname: `/test/${params.id}`
                },
                method: 'PATCH',
                headers: {
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36'
                },
                query: {
                    'test-value': '42'
                },
                body: {
                    a: {
                        b: {
                            c: [1, 2, 3],
                            d: 42
                        }
                    },
                    e: 42
                }
            };
            const resourcePath = '/test/{id}';
            const parsedPath = pathParser.Path.createPath(resourcePath.replace(/{(.+?)}/g, ':$1'));
            const routes = [
                {
                    resourcePath,
                    supportedMethods: [
                        'GET',
                        'POST',
                        'PUT',
                        'DELETE'
                    ],
                    path: parsedPath
                }
            ];
            const expectedResult = {
                resourcePath: req._parsedUrl.pathname,
                pathParameters: {}
            };

            const result = getPathParams(req, routes);

            expect(result).to.deep.eql(expectedResult);
        });
    });

    context('Testing getParams', function () {
        it('CASE 1: Should make claudia-api-builder request params as expected', function () {
            const getParams = localApi.__get__('getParams');
            const params = {
                id: '42'
            };
            const req = {
                originalUrl: `http://www.example.com/test/${params.id}?test-value=42`,
                _parsedUrl: {
                    pathname: `/test/${params.id}`
                },
                method: 'PATCH',
                headers: {
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36'
                },
                query: {
                    'test-value': '42'
                },
                body: {
                    a: {
                        b: {
                            c: [1, 2, 3],
                            d: 42
                        }
                    },
                    e: 42
                }
            };
            const resourcePath = '/test/{id}';
            const routes = [
                {
                    resourcePath,
                    supportedMethods: [
                        'GET',
                        'POST',
                        'PUT',
                        'PATCH',
                        'DELETE'
                    ],
                    path: pathParser.Path.createPath(resourcePath.replace(/{(.+?)}/g, ':$1'))
                }
            ];
            const expectedResult = {
                requestContext: {
                    resourcePath: resourcePath,
                    httpMethod: req.method
                },
                headers: req.headers,
                queryStringParameters: req.query,
                body: req.body,
                pathParameters: params
            };

            const result = getParams(req, routes);

            expect(result).to.deep.eql(expectedResult);
        });
    });

    context('Testing parseContentHandling', function () {
        it('CASE 1: Should get content handling parameter if it exists', function () {
            const parseContentHandling = localApi.__get__('parseContentHandling');
            const params = {
                requestContext: {
                    resourcePath: '/tile/{z}/{x}/{y}',
                    httpMethod: 'GET'
                }
            };
            const app = {
                apiConfig: function () {
                    return {
                        routes: {
                            'tile/{z}/{x}/{y}': {
                                GET: {
                                    success: {
                                        contentHandling: 'CONVERT_TO_BINARY'
                                    }
                                }
                            }
                        }
                    };
                }
            };

            expect(parseContentHandling(params, app)).to.eql('CONVERT_TO_BINARY');
        });

        it('CASE 2: Should return false if the path does not exist', function () {
            const parseContentHandling = localApi.__get__('parseContentHandling');
            const params = {
                requestContext: {
                    resourcePath: '/tile/{z}/{x}/{y}',
                    httpMethod: 'GET'
                }
            };
            const app = {
                apiConfig: function () {
                    return {
                        routes: {
                            'tile/{z}/{x}/{y}': {
                                POST: {}
                            }
                        }
                    };
                }
            };

            expect(parseContentHandling(params, app)).to.eql(false);
        });
    });

    context('Testing makeHandleResponse', function () {
        function getRes(expectedHeaders, expectedStatusCode, expectedBody) {
            return {
                set: function (headers) {
                    expect(headers).to.deep.eql(expectedHeaders);
                    return this;
                },

                status: function (statusCode) {
                    expect(statusCode).to.be.eql(expectedStatusCode);
                    return this;
                },

                send: function (body) {
                    expect(body).to.deep.eql(expectedBody);
                    return this;
                }
            };
        }

        function getBinaryRes(expectedHeaders, expectedStatusCode, expectedBody) {
            return {
                set: function (headers) {
                    expect(headers).to.deep.eql(expectedHeaders);
                    return this;
                },

                status: function (statusCode) {
                    expect(statusCode).to.be.eql(expectedStatusCode);
                    return this;
                },

                send: function (body) {
                    if (body) {
                        expect(body).to.be.instanceof(Buffer);
                    }
                    return this;
                }
            };
        }

        it('CASE 1: Should handle successful response', function () {
            const makeHandleResponse = localApi.__get__('makeHandleResponse');
            const spy = sinon.spy();
            const logger = {
                info: spy
            };
            const response = {
                headers: {
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36'
                },
                statusCode: 201,
                body: {
                    a: {
                        b: {
                            c: [1, 2, 3],
                            d: 42
                        }
                    },
                    e: 42
                }
            };
            const res = getRes(response.headers, response.statusCode, response.body);
            const expectedResult = JSON.stringify(response, null, 4);

            const handleResponse = makeHandleResponse(logger, res);
            handleResponse(null, response);

            expect(spy.calledOnce).to.be.eql(true);
            expect(spy.calledWith(expectedResult)).to.be.eql(true);
        });

        it('CASE 2: Should handle successful response with default values', function () {
            const makeHandleResponse = localApi.__get__('makeHandleResponse');
            const spy = sinon.spy();
            const logger = {
                info: spy
            };
            const response = {};
            const res = getRes({}, 200, {});
            const expectedResult = JSON.stringify(response, null, 4);

            const handleResponse = makeHandleResponse(logger, res);
            handleResponse(null, response);

            expect(spy.calledOnce).to.be.eql(true);
            expect(spy.calledWith(expectedResult)).to.be.eql(true);
        });

        it('CASE 3: Should handle error response', function () {
            const makeHandleResponse = localApi.__get__('makeHandleResponse');
            const spy = sinon.spy();
            const logger = {
                error: spy
            };
            const error = new Error('Fail');
            const res = getRes({}, 500, {
                message: error.message
            });
            const expectedMessage = error.message;
            const expectedResult = error.stack;

            const handleResponse = makeHandleResponse(logger, res);
            handleResponse(error, {});

            expect(spy.calledTwice).to.be.eql(true);
            expect(spy.calledWith(expectedMessage)).to.be.eql(true);
            expect(spy.calledWith(expectedResult)).to.be.eql(true);
        });

        it('CASE 4: Should handle binary data', function () {
            const makeHandleResponse = localApi.__get__('makeHandleResponse');
            const spy = sinon.spy();
            const logger = {
                info: spy
            };
            const response = {
                headers: {
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36'
                },
                statusCode: 201,
                body: 'asdjlaasdfiuaslfuaweliuasldifudif'
            };
            const res = getBinaryRes(response.headers, response.statusCode, response.body);
            const expectedResult = JSON.stringify(response, null, 4);

            const handleResponse = makeHandleResponse(logger, res, 'CONVERT_TO_BINARY');
            handleResponse(null, response);

            expect(spy.calledOnce).to.be.eql(true);
            expect(spy.calledWith(expectedResult)).to.be.eql(true);
        });

        it('CASE 5: Should handle binary data when response is broken', function () {
            const makeHandleResponse = localApi.__get__('makeHandleResponse');
            const spy = sinon.spy();
            const logger = {
                info: spy
            };
            const response = {};
            const res = getBinaryRes({}, 200);
            const expectedResult = JSON.stringify(response, null, 4);

            const handleResponse = makeHandleResponse(logger, res, 'CONVERT_TO_BINARY');
            handleResponse(null, response);

            expect(spy.calledOnce).to.be.eql(true);
            expect(spy.calledWith(expectedResult)).to.be.eql(true);
        });
    });

    context('Testing makeHandleRequest', function () {
        it('CASE 1: Should handle request correctly', function () {
            const makeHandleRequest = localApi.__get__('makeHandleRequest');
            const spy = sinon.spy();
            const logger = {
                info: spy
            };
            const params = {
                id: '23423'
            };
            const req = {
                originalUrl: `http://www.example.com/test/${params.id}?test-value=42`,
                _parsedUrl: {
                    pathname: `/test/${params.id}`
                },
                method: 'PATCH',
                headers: {
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36'
                },
                query: {
                    'test-value': '42'
                },
                body: {
                    a: {
                        b: {
                            c: [1, 2, 3],
                            d: 42
                        }
                    },
                    e: 42
                }
            };
            const resourcePath = '/test/{id}';
            const routes = [
                {
                    resourcePath,
                    supportedMethods: [
                        'GET',
                        'POST',
                        'PUT',
                        'PATCH',
                        'DELETE'
                    ],
                    path: pathParser.Path.createPath(resourcePath.replace(/{(.+?)}/g, ':$1'))
                }
            ];
            const expectedParams = {
                requestContext: {
                    resourcePath: resourcePath,
                    httpMethod: req.method
                },
                headers: req.headers,
                queryStringParameters: req.query,
                body: req.body,
                pathParameters: params
            };
            const app = {
                proxyRouter: function (receivedParams, controlFlow) {
                    expect(receivedParams).to.deep.eql(expectedParams);
                    expect(controlFlow).to.have.keys('done');
                    expect(controlFlow.done).to.be.a('function');
                },
                apiConfig: function () {
                    return {
                        message: 'This function exists so that the rest of this test does not fail.'
                    };
                }
            };

            const handleRequest = makeHandleRequest(logger, app, routes);
            const result = handleRequest(req, {});

            expect(result).to.be.eql(undefined);
        });
    });

    context('Testing getRoutes', function () {
        it('CASE 1: Should be able to parse routes', function () {
            const getRoutes = localApi.__get__('getRoutes');
            const firstRoute = 'items/{itemId}';
            const secondRoute = 'objects/{objectId}';
            const routesObj = {
                [firstRoute]: {
                    GET: {},
                    POST: {}
                },
                [secondRoute]: {
                    PUT: {},
                    DELETE: {}
                }
            };
            const expectedResult = [
                {
                    resourcePath: `/${firstRoute}`,
                    supportedMethods: Object.keys(routesObj[firstRoute]),
                    path: pathParser.Path.createPath(`/${firstRoute}`.replace(/{(.+?)}/g, ':$1'))
                },
                {
                    resourcePath: `/${secondRoute}`,
                    supportedMethods: Object.keys(routesObj[secondRoute]),
                    path: pathParser.Path.createPath(`/${secondRoute}`.replace(/{(.+?)}/g, ':$1'))
                }
            ];

            const result = getRoutes(routesObj);

            expect(result).to.deep.eql(expectedResult);
        });

        it('CASE 2: Should be able handle if routesObj is an empty object', function () {
            const getRoutes = localApi.__get__('getRoutes');
            const routesObj = {};
            const expectedResult = [];

            const result = getRoutes(routesObj);

            expect(result).to.deep.eql(expectedResult);
        });

        it('CASE 3: Should be able handle if routesObj contains "undefined" or "null" values', function () {
            const getRoutes = localApi.__get__('getRoutes');
            const firstRoute = 'items/{itemId}';
            const secondRoute = 'objects/{objectId}';
            const thirdRoute = 'things/{thingId}';
            const routesObj = {
                [firstRoute]: {
                    GET: {},
                    POST: {}
                },
                [secondRoute]: undefined,
                [thirdRoute]: null
            };
            const expectedResult = [
                {
                    resourcePath: `/${firstRoute}`,
                    supportedMethods: Object.keys(routesObj[firstRoute] || {}),
                    path: pathParser.Path.createPath(`/${firstRoute}`.replace(/{(.+?)}/g, ':$1'))
                },
                {
                    resourcePath: `/${secondRoute}`,
                    supportedMethods: Object.keys(routesObj[secondRoute] || {}),
                    path: pathParser.Path.createPath(`/${secondRoute}`.replace(/{(.+?)}/g, ':$1'))
                },
                {
                    resourcePath: `/${thirdRoute}`,
                    supportedMethods: Object.keys(routesObj[thirdRoute] || {}),
                    path: pathParser.Path.createPath(`/${thirdRoute}`.replace(/{(.+?)}/g, ':$1'))
                }
            ];

            const result = getRoutes(routesObj);

            expect(result).to.deep.eql(expectedResult);
        });
    });

    context('Testing bootstrap', function () {
        it('CASE 1: Should be able to bootstrap a server', function () {
            const bootstrap = localApi.__get__('bootstrap');
            const options = {
                port: 42
            };
            const server = {
                all: function (route, handler) {
                    expect(route).to.be.eql('*');
                    expect(handler).to.be.a('function');
                },
                listen: function (port) {
                    expect(port).to.be.eql(options.port);
                }
            };
            const spy = sinon.spy();
            const logger = {
                info: spy
            };
            const claudiaApp = {};
            const routes = [];

            const result = bootstrap(server, logger, claudiaApp, routes, options);

            expect(result).to.be.eql(undefined);
            expect(spy.calledOnce).to.be.eql(true);
        });
    });

    context('Testing runCmd', function () {
        it('CASE 1: Should be able to process command line arguments', function () {
            const runCmd = localApi.__get__('runCmd');
            const apiModule = 'test/claudia_app';
            const port = 3001;
            const abbrev = 10;
            process.argv = [
                'node',
                'claudia-local-api',
                '--api-module',
                apiModule,
                '--port',
                String(port),
                '--abbrev',
                abbrev
            ];
            const bootstrap = function (server, logger, claudiaApp, routes, options) {
                expect(server).to.be.a('function');
                expect(logger).to.be.a('object');
                expect(claudiaApp).to.be.a('object');
                expect(options.apiModule).to.be.eql(apiModule);
                expect(options.port).to.be.eql(String(port));
                expect(options.abbrev).to.be.eql(abbrev);
            };

            const result = runCmd(bootstrap);

            expect(result).to.be.eql(undefined);
        });

        it('CASE 2: Should be able to set default value for port', function () {
            const runCmd = localApi.__get__('runCmd');
            const apiModule = 'test/claudia_app';
            const port = 3000;
            const abbrev = -1;
            process.argv = [
                'node',
                'claudia-local-api',
                '--api-module',
                apiModule
            ];
            const bootstrap = function (server, logger, claudiaApp, routes, options) {
                expect(server).to.be.a('function');
                expect(logger).to.be.a('object');
                expect(claudiaApp).to.be.a('object');
                expect(options.apiModule).to.be.eql(apiModule);
                expect(options.port).to.be.eql(port);
                expect(options.abbrev).to.be.eql(abbrev);
            };

            const result = runCmd(bootstrap);

            expect(result).to.be.eql(undefined);
        });
    });
});

describe('Integration tests for lib/index', function () {
    const port = 3000;
    const spy = sinon.spy();

    before(function () {
        const initServer = localApi.__get__('initServer');
        const bootstrap = localApi.__get__('bootstrap');
        const getRoutes = localApi.__get__('getRoutes');
        const logger = {
            info: spy,
            error: spy
        };
        const claudiaApp = require('./claudia_app');
        const routes = getRoutes(claudiaApp.apiConfig().routes);
        const options = {
            port
        };
        const server = initServer();

        this.app = bootstrap(server, logger, claudiaApp, routes, options);
    });

    after(function () {
        this.app.close();
    });

    function makeRequest(params) {
        return new Promise(function (resolve, reject) {
            return request(params, function (err, headers, body) {
                if (err) {
                    return reject(err);
                } else if ([200, 201, 204].indexOf(headers.statusCode) === -1) {
                    return reject(new Error(`Received statusCode = ${headers.statusCode}`));
                }
                return resolve({headers, body});
            });
        });
    }

    it('CASE 1: Should handle request and response correctly for GET request', function () {
        const params = {
            url: `http://localhost:${port}`,
            method: 'GET'
        };
        return makeRequest(params)
            .then(function (result) {
                const headers = result.headers;
                const body = result.body;

                expect(headers.statusCode).to.be.eql(200);
                expect(headers.headers.called).to.be.eql('handleGetRequest');
                expect(body).to.be.eql(JSON.stringify({
                    status: 'OK',
                    body: {},
                    pathParams: {},
                    query: {}
                }));
            });
    });

    it('CASE 2: Should handle request and response correctly for POST request', function () {
        const params = {
            url: `http://localhost:${port}`,
            method: 'POST'
        };
        return makeRequest(params)
            .then(function (result) {
                const headers = result.headers;
                const body = result.body;

                expect(headers.statusCode).to.be.eql(201);
                expect(headers.headers.called).to.be.eql('handlePostRequest');
                expect(body).to.be.eql(JSON.stringify({
                    status: 'OK',
                    body: {},
                    pathParams: {},
                    query: {}
                }));
            });
    });

    it('CASE 3: Should handle request and response correctly for GET request with params', function () {
        const userId = 131;
        const params = {
            url: `http://localhost:${port}/users/${userId}`,
            method: 'GET'
        };
        return makeRequest(params)
            .then(function (result) {
                const headers = result.headers;
                const body = result.body;

                expect(headers.statusCode).to.be.eql(200);
                expect(headers.headers.called).to.be.eql('handleGetRequest');
                expect(body).to.be.eql(JSON.stringify({
                    status: 'OK',
                    body: {},
                    pathParams: {
                        id: userId.toString()
                    },
                    query: {}
                }));
            });
    });

    it('CASE 4: Should handle request and response correctly for GET request with params and query', function () {
        const itemId = '1298346721';
        const partId = 'AV2322232B';
        const unique = true;
        const batch = [
            'X131',
            'X232'
        ];
        const params = {
            url: `http://localhost:${port}/items/${itemId}/${partId}?unique=${unique}&batch[]=${batch[0]}&batch[]=${batch[1]}`,
            method: 'GET'
        };
        return makeRequest(params)
            .then(function (result) {
                const headers = result.headers;
                const body = result.body;

                expect(headers.statusCode).to.be.eql(200);
                expect(headers.headers.called).to.be.eql('handleGetRequest');
                expect(body).to.be.eql(JSON.stringify({
                    status: 'OK',
                    body: {},
                    pathParams: {
                        itemId,
                        partId
                    },
                    query: {
                        unique: unique.toString(),
                        batch
                    }
                }));
            });
    });

    it('CASE 5: Should handle request and response correctly for POST request with JSON body', function () {
        const inputBody = {
            test: true
        };
        const params = {
            url: `http://localhost:${port}/objects/`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(inputBody)
        };
        return makeRequest(params)
            .then(function (result) {
                const headers = result.headers;
                const body = result.body;

                expect(headers.statusCode).to.be.eql(201);
                expect(headers.headers.called).to.be.eql('handlePostRequest');
                expect(body).to.be.eql(JSON.stringify({
                    status: 'OK',
                    body: inputBody,
                    pathParams: {},
                    query: {}
                }));
            });
    });

    it('CASE 6: Should handle request and response correctly for POST request with form body', function () {
        const inputBody = {
            test: true
        };
        const params = {
            url: `http://localhost:${port}/objects`,
            method: 'POST',
            form: inputBody
        };
        return makeRequest(params)
            .then(function (result) {
                const headers = result.headers;
                const body = result.body;

                expect(headers.statusCode).to.be.eql(201);
                expect(headers.headers.called).to.be.eql('handlePostRequest');
                expect(body).to.be.eql(JSON.stringify({
                    status: 'OK',
                    body: {
                        test: inputBody.test.toString()
                    },
                    pathParams: {},
                    query: {}
                }));
            });
    });

    it('CASE 7: Should respond with "ESOCKETTIMEDOUT" error, if route does not exist', function () {
        const params = {
            url: `http://localhost:${port}/non-existent-route`,
            method: 'GET',
            timeout: 200
        };
        return makeRequest(params)
            .then(function (result) {
                expect(result).to.deep.eql(undefined);
            })
            .catch(function (err) {
                expect(err.message).to.be.eql('Received statusCode = 500');
            });
    });

    it('CASE 8: Should be able to render binary', function () {
        const params = {
            url: `http://localhost:${port}/img`,
            method: 'GET',
            timeout: 200
        };
        return makeRequest(params)
            .then(function (result) {
                const headers = result.headers;

                expect(headers.statusCode).to.be.eql(200);
                expect(headers.headers['content-type']).to.be.eql('image/png');
            });
    });

    it('CASE 9: Should handle application/x-www-form-urlencoded requests', function () {
        const inputBody = {
            foo: 'bar',
            baz: 45
        };
        const params = {
            url: `http://localhost:${port}/items`,
            method: 'POST',
            form: inputBody,
            timeout: 200
        };
        return makeRequest(params)
            .then(function (result) {
                const headers = result.headers;
                const body = result.body;

                expect(headers.statusCode).to.be.eql(200);
                expect(headers.headers.called).to.be.eql('handleFormUrlEncodedRequest');
                expect(body).to.be.eql(JSON.stringify({
                    status: 'OK',
                    body: {
                        foo: inputBody.foo,
                        baz: inputBody.baz.toString()
                    },
                    pathParams: {},
                    query: {}
                }));
            });
    });
});
