var Task         = require('ember-cli/lib/models/task');
var Promise      = require('ember-cli/lib/ext/promise');
var SilentError  = require('ember-cli/lib/errors/silent');
var Mustache     = require('mustache');
var path         = require('path');
var chalk        = require('chalk');
var execSync     = require('exec-sync');
var qs           = require('qs');
var Curl         = require('node-curl/lib/Curl');

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

  getCurlClient: function(endpoint, config) {
    var curl = new Curl();

    var indexEndpoint = this.getIndexEndpoint(config);
    var data = {
      app: config.index.app,
      api_key: config.index.apiKey,
      branch: branch,
      sha: sha,
      endpoint: indexEndpoint
    };
    var query = qs.stringify(data);
    curl.setopt('URL', endpoint);
    curl.setopt('POST', 1); // true?
    curl.setopt('POSTFIELDS', query);

    return curl;
  },

  notifyEndpoint: function(endpoint, config) {
    var curl = this.getCurlClient(endpoint, config);

    return new Promise(function(resolve, reject) {
      curl.on('error', function(err) {
        var errorMessage = 'Unable to curl endpoint ' + endpoint + ': ' + err.message;
        curl.close();
        return reject(errorMessage);
      });

      curl.on('end', function() {
        curl.close();

        return resolve();
      });

      curl.perform();
    });
  },

  run: function(environment, config) {
    var _this = this;
    var promises = [];
    var endpoints = config.index.endpoints;

    endpoints.forEach(function(endpoint) {
      promises.push(_this.notifyEndpoint(endpoint, config));
    });

    this.ui.pleasantProgress.start(chalk.green('Notifying ' + endpoints.join(', ')), chalk.green('.'));

    return Promise.all(promises).then(function(posts) {
        _this.ui.writeLine('Endpoints successfully notified.');
        _this.ui.pleasantProgress.stop();
      }).catch(function(reason){
        _this.ui.writeLine(chalk.red(reason));
      });
  }
});
