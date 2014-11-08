var AssetsTask = require('../tasks/assets');
var BaseCommand = require('./base-command-factory')();
var _ = require('underscore');

module.exports = _.extend(BaseCommand, {
  name: 'deploy:assets',
  description: 'Deploys assets to s3 in a shared dir, and a build dir',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'production' }
  ],

  run: function(commandOptions, rawArgs) {
    var environment = commandOptions.environment;
    var config = this.getConfigForEnvironment(environment);

    var assetsTask = new AssetsTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return assetsTask.run(environment, config);
  }
});
