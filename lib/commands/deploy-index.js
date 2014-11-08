var DeployIndexTask = require('../tasks/deploy-index');

module.exports = {
  name: 'deploy:index',
  description: 'Notifies back end of new index',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development' }
  ],

  run: function(commandOptions, rawArgs) {
    var deployIndexTask = new DeployIndexTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return deployIndexTask.run(commandOptions.environment);
  }
};
