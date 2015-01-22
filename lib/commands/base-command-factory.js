var DeployIndexTask = require('../tasks/deploy-index');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

// Tried just exporting an object, but it was getting
// mutated by each function that was _.extend'ing it.
// I'm sure there's a way to export a POJO and not have
// it get mutated, but I don't know how.
module.exports = function() {

  return {
    getConfigForEnvironment: function(environment) {
      var root = process.cwd();
      var config = {};
      var configFile = path.join(root, 'config', 'deploy.js');

      if (fs.existsSync(configFile)) {
        config = require(configFile)[environment];

        if (!config) {
          this.ui.writeLine(chalk.red('Config for "' + environment + '" environment not found.\n'));
          this.ui.writeLine("Change your environment with the --environment flag.");
          process.exit(1);
        }
      }

      return config;
    }
  };

};
