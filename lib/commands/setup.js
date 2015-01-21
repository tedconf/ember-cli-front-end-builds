var SetupTask = require('../tasks/setup');
var BaseCommand = require('./base-command-factory')();
var _ = require('underscore');

module.exports = _.extend(BaseCommand, {
  name: 'deploy:setup',
  description: 'Setup and configure front end builds',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'staging' },
    { name: 'verbose', type: Boolean, default: false }
  ],

  run: function(commandOptions) {
    var environment = commandOptions.environment;
    var verbose = commandOptions.verbose;
    var config = this.getConfigForEnvironment(environment);

    var setupTask = new SetupTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return setupTask.run(environment, config, verbose);
  }
});
