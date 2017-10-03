'use strict';

const program = require('commander');
const path = require('path');

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

function getParams(req) {
    return {
        requestContext: {
            resourcePath: req.originalUrl,
            httpMethod: req.method
        },
        headers: req.headers,
        queryStringParameters: req.query,
        body: req.body
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

function makeHandleRequest(logger, app) {
    return function (req, res) {
        const params = getParams(req);
        logJson(logger, params);
        app.proxyRouter(params, {
            done: makeHandleResponse(logger, res)
        });
    };
}

function bootstrap(server, logger, claudiaApp, options) {
    const handleRequest = makeHandleRequest(logger, claudiaApp);

    server.all('*', handleRequest);
    server.listen(options.port);
    logger.info(`Server listening on ${options.port}`);
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
    const server = initServer();
    const logger = initLogger();
    bootstrapFn(server, logger, claudiaApp, program);
}

module.exports = {
    run: runCmd.bind(null, bootstrap)
};
