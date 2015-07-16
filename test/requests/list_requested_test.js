"use strict";
var chakram     = require("chakram"),
    curry       = require("curry"),
    Q           = require("q"),
    util        = require("util"),
    querystring = require("querystring"),
    auth        = require("../common/auth.js");

var expect = chakram.expect;

describe("Requests", function () {
    describe("Listing Requests Made by Current User", function () {
        // list all requests made by a user
        var listRequested = module.exports.listRequested = function (parameters, accessToken) {
            if (typeof parameters === "undefined" || parameters === null) parameters = {};
            var query = querystring.stringify(parameters);
            var url = util.format("http://localhost:3000/v1/requested?%s", query);
            return chakram.get(url, auth.genAuthHeaders(accessToken));
        };
    });
});
