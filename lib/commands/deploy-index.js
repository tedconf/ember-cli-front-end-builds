var DeployIndexTask = require('../tasks/deploy-index');
var path = require('path');
var chalk = require('chalk');
var BaseCommand = require('./base-command-factory')();
var _ = require('underscore');

module.exports = _.extend(BaseCommand, {
  name: 'deploy:index',
  description: 'Notifies back end of new index',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development' }
  ],

  run: function(commandOptions) {
    var environment = commandOptions.environment;
    var config = this.getConfigForEnvironment(environment);

    var deployIndexTask = new DeployIndexTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return deployIndexTask.run(environment, config);
  }
});
