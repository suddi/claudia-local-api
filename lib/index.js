'use strict';

const program = require('commander');
const path = require('path');
const pathParser = require('path-parser');

const packageJson = require('../package');

function getDefaultConfig() {
    return {
        port: 3000
    };
}

function initServer() {
    const express = require('express');
    const bodyParser = require('body-parser');

    const server = express();
    server.use(bodyParser.urlencoded({
        extended: true
    }));
    server.use(bodyParser.json());

    return server;
}

function initLogger() {
    const bunyan = require('bunyan');
    return bunyan.createLogger({
        name: packageJson.name
    });
}

function logJson(logger, body) {
    logger.info(JSON.stringify(body, null, 4));
}

function logError(logger, error) {
    logger.error(error.stack);
}

function getPathParams(req, routes) {
    const parsedPath = req._parsedUrl.pathname;
    for (const route of routes) {
        const isSupported = route.supportedMethods.indexOf(req.method) !== -1;
        const pathParameters = route.path.test(parsedPath);
        if (isSupported && pathParameters) {
            return {
                resourcePath: route.resourcePath,
                pathParameters
            };
        }
    }

    return {
        resourcePath: parsedPath,
        pathParameters: {}
    };
}

function getParams(req, routes) {
    const pathParams = getPathParams(req, routes);

    return {
        requestContext: {
            resourcePath: pathParams.resourcePath,
            httpMethod: req.method
        },
        headers: req.headers,
        queryStringParameters: req.query,
        body: req.body,
        pathParameters: pathParams.pathParameters
    };
}

function makeHandleResponse(logger, res) {
    return function (err, response) {
        if (err) {
            logError(logger, err);
            const body = {
                message: err.message
            };
            return res
                .status(500)
                .send(body);
        }
        logJson(logger, response);
        return res
            .set(response.headers || {})
            .status(response.statusCode || 200)
            .send(response.body || {});
    };
}

function makeHandleRequest(logger, app, routes) {
    return function (req, res) {
        const params = getParams(req, routes);
        logJson(logger, params);
        app.proxyRouter(params, {
            done: makeHandleResponse(logger, res)
        });
    };
}

function getRoutes(routesObj) {
    const routePaths = Object.keys(routesObj);

    return routePaths.map(function (routePath) {
        const supportedMethods = Object.keys(routesObj[routePath] || {});
        const route = `/${routePath}`;
        return {
            resourcePath: route,
            supportedMethods,
            path: pathParser.Path.createPath(route.replace(/{(.+?)}/g, ':$1'))
        };
    });
}

function bootstrap(server, logger, claudiaApp, routes, options) {
    const handleRequest = makeHandleRequest(logger, claudiaApp, routes);

    server.all('*', handleRequest);
    const instance = server.listen(options.port);
    logger.info(`Server listening on ${options.port}`);
    return instance;
}

function runCmd(bootstrapFn) {
    const config = getDefaultConfig();
    program
        .version(packageJson.version)
        .option('-a --api-module <apiModule>', 'Specify claudia api path from project root')
        .option('-p --port [port]', `Specify port to use [${config.port}]`, config.port)
        .parse(process.argv);

    const apiPath = path.join(process.cwd(), program.apiModule);
    const claudiaApp = require(apiPath);

    const apiConfig = claudiaApp.apiConfig();
    const routes = getRoutes(apiConfig.routes);

    const server = initServer();
    const logger = initLogger();
    bootstrapFn(server, logger, claudiaApp, routes, program);
}

module.exports = {
    run: runCmd.bind(null, bootstrap)
};
