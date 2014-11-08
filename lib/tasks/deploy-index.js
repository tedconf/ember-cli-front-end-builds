var Task        = require('ember-cli/lib/models/task');
var Promise     = require('ember-cli/lib/ext/promise');
var SilentError = require('ember-cli/lib/errors/silent');
var Mustache    = require('mustache');
var path        = require('path');
var chalk       = require('chalk');
var green       = chalk.green;
var execSync    = require('exec-sync');
var qs          = require('qs');

var sha = execSync('git rev-parse HEAD');
var branch = execSync('git rev-parse --abbrev-ref HEAD');

module.exports = Task.extend({
  getConfig: function(environment) {
    var root = process.cwd();
    var config = require(path.join(root, 'deploy.json'))[environment];

    if (!config) {
      this.ui.writeLine(chalk.red('Config for "' + environment + '" environment not found.\n'));
      this.ui.writeLine("Change your environment with the --environment flag.");
      process.exit(1);
    }

    return config;
  },

  /*
    The consuming app's deploy.json can use Mustache for dynamic portions.

    e.g. distPrefix: "dist-{{SHA}}"
  */
  getDistPrefix: function(assetsConfig) {
    var prefix = '';

    if (assetsConfig && assetsConfig.distPrefix) {
      var str = assetsConfig.distPrefix;
      prefix = Mustache.render(str, {
        SHA: sha
      }) + '/';
    }

    return prefix;
  },

  getIndexEndpoint: function(config) {
    var distPrefix = this.getDistPrefix(config.assets);

    return config.assets.assetHost + '/' + distPrefix + 'index.html';
  },

  run: function(environment) {
    var config = this.getConfig(environment);
    var indexEndpoint = this.getIndexEndpoint(config);

    var data = {
      app: config.index.app,
      api_key: config.index.apiKey,
      branch: branch,
      sha: sha,
      endpoint: indexEndpoint
    };

    var query = qs.stringify(data);
    config.index.endpoints.forEach(function(endpoint) {
      execSync('curl -k --data "' + query + '" ' + endpoint);
    });
  }
});
