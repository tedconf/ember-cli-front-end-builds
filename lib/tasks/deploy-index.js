var Task         = require('ember-cli/lib/models/task');
var Promise      = require('ember-cli/lib/ext/promise');
var SilentError  = require('ember-cli/lib/errors/silent');
var Mustache     = require('mustache');
var path         = require('path');
var chalk        = require('chalk');
var green        = chalk.green;
var execSync     = require('exec-sync');
var qs           = require('qs');

var sha = execSync('git rev-parse HEAD');
var branch = execSync('git rev-parse --abbrev-ref HEAD');

module.exports = Task.extend({
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

  run: function(environment, config) {
    var _this = this;
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
      var cmd = 'curl -k --data "' + query + '" ' + endpoint;
      _this.ui.writeLine("Notifying endpoint of new index:");
      _this.ui.writeLine(cmd);
      execSync(cmd);
    });
  }
});
