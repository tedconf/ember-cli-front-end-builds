var Task         = require('ember-cli/lib/models/task');
var Promise      = require('ember-cli/lib/ext/promise');
var SilentError  = require('silent-error');
var Mustache     = require('mustache');
var path         = require('path');
var chalk        = require('chalk');
var execSync12   = require('child_process').execSync;
var execSync10   = require('sync-exec');
var qs           = require('qs');
var request      = require('request');
var _            = require('underscore');
var fs           = require('fs');
var passwdUser   = require('passwd-user');
var crypto       = require('crypto');

var sha, branch;

if (typeof execSync12 === 'function') {
  // node 0.12.x
  sha = execSync12('git rev-parse HEAD').toString().trim();
  branch = execSync12('git rev-parse --abbrev-ref HEAD').toString().trim();
} else {
  // node 0.10.x
  sha = execSync10('git rev-parse HEAD').stdout.trim();
  branch = execSync10('git rev-parse --abbrev-ref HEAD').stdout.trim();
}

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
    var distPrefix = this.getDistPrefix(config.assets),
        bucket = config.assets.bucket;

    return 'https://s3.amazonaws.com/' + bucket + '/' + distPrefix + 'index.html';
  },

  signDeploy: function(config, url) {
    var appName = config.index.app,
        algo = 'RSA-SHA256',
        homedir = passwdUser.sync(process.getuid()).homedir;
        keyFile = config.index.privateKey || homedir + '/.ssh/id_rsa';

    return crypto
      .createSign(algo)
      .update(appName + "-" + url)
      .sign(fs.readFileSync(keyFile), 'base64');
  },

  notifyEndpoint: function(endpoint, config, verbose) {
    var indexEndpoint = this.getIndexEndpoint(config);
    var data = {
      app_name: config.index.app,
      branch: branch,
      sha: sha,
      endpoint: indexEndpoint,
      signature: this.signDeploy(config, indexEndpoint)
    };
    var query = qs.stringify(data);

    return new Promise(function(resolve, reject) {
      var requestOptions = _.extend({
          method: 'POST',
          uri: endpoint + '?' + query,
        }, config.index.requestOptions);

      return request(requestOptions, function(error, response, body) {
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
    var endpoints = config.index.endpoints.map(function(endpoint) {
          return (endpoint.match(/\/front_end_builds\/builds$/) ?
                  endpoint :
                  endpoint + '/front_end_builds/builds');
        });

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
