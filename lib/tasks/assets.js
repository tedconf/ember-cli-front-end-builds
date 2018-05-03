var Task        = require('ember-cli/lib/models/task');
var Promise     = require('rsvp');
var SilentError = require('silent-error');
var s3          = require('s3');
var Mustache    = require('mustache');
var path        = require('path');
var chalk       = require('chalk');
var green       = chalk.green;
var execSync12   = require('child_process').execSync;
var execSync10   = require('sync-exec');

var sha;

if (typeof execSync12 === 'function') {
  // node 0.12.x
  sha = execSync12('git rev-parse HEAD').toString().trim();
} else {
  // node 0.10.x
  sha = execSync10('git rev-parse HEAD').stdout.trim();
}

module.exports = Task.extend({
  getS3ClientParams: function(assetsConfig) {
    var params = {
      maxAsyncS3: 1, // concurrency is hard (and broken in node-s3)
      s3Options: {
        accessKeyId: assetsConfig.accessKeyId,
        secretAccessKey: assetsConfig.secretAccessKey,
      }
    };

    return params;
  },

  getUploadDirParams: function(bucket, remoteDir) {
    var params = {
      localDir: 'dist',
      s3Params: {
        Bucket: bucket,
        Prefix: remoteDir
      }
    };

    return params;
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

  uploadAssets: function(client, uploadParams) {
    var _this = this;
    var s3Params = uploadParams.s3Params;
    var message = 'Uploading assets to ' + s3Params.Bucket + '/' + s3Params.Prefix;

    this.ui.pleasantProgress.start(green(message), green('.'));

    return new Promise(function(resolve, reject){
      var uploader = client.uploadDir(uploadParams);

      uploader.on('error', function(err) {
        var errorMessage = 'Unable to sync: ' + err.stack;
        return reject(new SilentError(errorMessage));
      });

      // uploader.on('fileUploadStart', function(fullPath, fullKey) {
      //   _this.ui.writeLine('Uploading: ' + green(fullPath));
      // });

      uploader.on('end', function() {
        _this.ui.writeLine('Done uploading assets');
        _this.ui.pleasantProgress.stop();
        return resolve();
      });
    });
  },

  run: function(environment, config) {
    var assetsConfig = config.assets;

    var clientParams = this.getS3ClientParams(assetsConfig);
    var client = s3.createClient(clientParams);

    var sharedRemoteDir = config.assets.prefix || '';
    var sharedUploadParams = this.getUploadDirParams(config.assets.bucket, sharedRemoteDir);

    var distRemoteDir = this.getDistPrefix(config.assets);
    var distUploadParams = this.getUploadDirParams(config.assets.bucket, distRemoteDir);

    return this.uploadAssets(client, sharedUploadParams)
      .then(function() {
        return this.uploadAssets(client, distUploadParams);
      }.bind(this));
  }

});
