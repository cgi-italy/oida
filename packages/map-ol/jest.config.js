const base = require("../../config/jest.config.default.js");

module.exports = {
    ...base,
    testEnvironment: "jsdom",
    transform: {
        ...base.transform,
        "^.+\\.jsx?$": "babel-jest"
    },
    transformIgnorePatterns: [
        "node_modules[\\\/](?!(ol)[\\\/]?)"
    ]
};
