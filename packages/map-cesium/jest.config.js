const base = require("../../config/jest.config.default.js");

module.exports = {
    ...base,
    testEnvironment: "jsdom"
};
