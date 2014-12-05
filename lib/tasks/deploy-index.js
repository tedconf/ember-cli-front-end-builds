var Task         = require('ember-cli/lib/models/task');
var Promise      = require('ember-cli/lib/ext/promise');
var SilentError  = require('ember-cli/lib/errors/silent');
var Mustache     = require('mustache');
var path         = require('path');
var chalk        = require('chalk');
var execSync     = require('exec-sync');
var qs           = require('qs');
var request      = require('request');

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

  notifyEndpoint: function(endpoint, config, verbose) {
    var indexEndpoint = this.getIndexEndpoint(config);
    var data = {
      app_name: config.index.app,
      api_key: config.index.apiKey,
      branch: branch,
      sha: sha,
      endpoint: indexEndpoint
    };
    var query = qs.stringify(data);

    return new Promise(function(resolve, reject) {

      return request.post(endpoint + '?' + query, function(error, response, body) {

        if (error) {
          var errorMessage = 'Unable to reach endpoint ' + endpoint + ': ' + error.message;
          console.error(body);
          return reject(errorMessage);

        } else {
          var code = response.statusCode;

          if (code.toString().charAt(0) === '4') {
            return reject('Rejected with code ' + code + '\n' + body);
          }

          console.log(body);
          return resolve(body);
        }

      });
    });
  },

  run: function(environment, config, verbose) {
    var _this = this;
    var promises = [];
    var endpoints = config.index.endpoints;

    endpoints.forEach(function(endpoint) {
      promises.push(_this.notifyEndpoint(endpoint, config, verbose));
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
