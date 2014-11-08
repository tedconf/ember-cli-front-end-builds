var AssetsTask = require('../tasks/assets');

module.exports = {
  name: 'deploy:assets',
  description: 'Deploys assets to s3 in a shared dir, and a build dir',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development' }
  ],

  run: function(commandOptions, rawArgs) {
    var assetsTask = new AssetsTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return assetsTask.run(commandOptions.environment);
  }
};
