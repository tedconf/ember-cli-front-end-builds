var SetupTask = require('../tasks/setup');

module.exports = {
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

    var setupTask = new SetupTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return setupTask.run(environment, verbose);
  }
};
