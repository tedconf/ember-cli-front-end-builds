module.exports = {
  name: 'deploy:static',
  description: 'Deploys all assets to an asset-host (default: aws:s3)',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development' }
  ],

  run: function(commandOptions, rawArgs) {
    var StaticTask = require('../tasks/static');
    var staticTask = new StaticTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return staticTask.run(commandOptions);
  }
};
