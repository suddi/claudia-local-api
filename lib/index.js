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
        extended: true,
        limit: '10mb'
    }));
    server.use(bodyParser.json({
        limit: '10mb'
    }));

    return server;
}

function initLogger(abbreviation) {
    const bunyan = require('bunyan');
    const logger = bunyan.createLogger({
        name: packageJson.name
    });
    // initialize maximum body logging length
    logger.bodyAbbreviationLength = abbreviation;
    return logger;
}

function logJson(logger, body) {
    // If the body is too long of a string, abbreviate it
    if (body.body && body.body.length && body.body.length > logger.bodyAbbreviationLength) {
        // Make a copy so the original body doesn't get mutated
        const content = Object.assign({}, body);

        /* eslint-disable-next-line no-param-reassign */
        content.body = `${content.body.substr(0, logger.bodyAbbreviationLength - 3)}...`;

        logger.info(JSON.stringify(content, null, 4));
    } else {
        logger.info(JSON.stringify(body, null, 4));
    }
}

function logError(logger, error) {
    logger.error(error.message);
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

// Determine whether to enable binary content handling
function parseContentHandling(params, app) {
    const requestContext = params.requestContext;
    // path in API Config is indexed without the leading slash
    const apiPath = requestContext.resourcePath.slice(1);
    const httpMethod = requestContext.httpMethod;

    if (app.apiConfig().routes &&
        app.apiConfig().routes[apiPath] &&
        app.apiConfig().routes[apiPath][httpMethod] &&
        app.apiConfig().routes[apiPath][httpMethod].success) {
        return app.apiConfig().routes[apiPath][httpMethod].success.contentHandling;
    }
    return false;
}

function makeHandleResponse(logger, res, convertToBinary) {
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

        // If the CONVERT_TO_BINARY flag was set, return the response as a buffer
        if (convertToBinary === 'CONVERT_TO_BINARY') {
            return res
                .set(response.headers || {})
                .status(response.statusCode || 200)
                .send(response.body ? Buffer.from(response.body, 'base64') : undefined);
        }

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

        const convertToBinary = parseContentHandling(params, app);
        app.proxyRouter(params, {
            done: makeHandleResponse(logger, res, convertToBinary)
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
        .option('--abbrev [body length]', 'Specify the maximum logged length of a response/request body [no abbreviation]', -1)
        .parse(process.argv);

    const apiPath = path.join(process.cwd(), program.apiModule);
    const claudiaApp = require(apiPath);

    const apiConfig = claudiaApp.apiConfig();
    const routes = getRoutes(apiConfig.routes);

    const server = initServer();
    const logger = initLogger(program.abbrev);

    bootstrapFn(server, logger, claudiaApp, routes, program);
}

module.exports = {
    run: runCmd.bind(null, bootstrap)
};
