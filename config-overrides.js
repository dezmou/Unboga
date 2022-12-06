const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

module.exports = function override(config, env) {
    config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));

    return config;
};

// const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

// module.exports = function override(config, env) {
//     config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));

//     return config;
// };





// const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
// const path = require("path");

// module.exports = function override(config) {
//   config.resolve.plugins.forEach(plugin => {
//     if (plugin instanceof ModuleScopePlugin) {
//       plugin.allowedFiles.add(path.resolve("./back/src/common/game.interface.ts"));
//     }
//   });

//   return config;
// };