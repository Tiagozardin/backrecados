const config = require("./jest.config");

// Definir que o JEST pegue apenas os testes unitários
config.testMach = ['**/*.spec.ts']

module.exports = config;