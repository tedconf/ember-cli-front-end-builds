var BaseCommand = require('./base-command-factory')();
var _ = require('underscore');

module.exports = _.extend(BaseCommand, {
  name: 'deploy',
  description: 'Deploys an ember-cli app',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development' }
  ],

  run: function(commandOptions, rawArgs) {
    var environment = commandOptions.environment;
    var config = this.getConfigForEnvironment(environment);

    var DeployIndexTask = require('../tasks/deploy-index');
    var AssetsTask      = require('../tasks/assets');
    var BuildTask       = this.tasks.Build;

    var buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project

    });
    var buildOptions = {
      environment: "production",
      outputPath: "dist/",
      watch: false,
      disableAnalytics: false
    };
    var assetsTask = new AssetsTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });
    var deployIndexTask = new DeployIndexTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return buildTask.run(buildOptions)
      .then(function() {
        return assetsTask.run(environment, config);
      })
      .then(function() {
        return deployIndexTask.run(environment, config);
      });
  }
});
