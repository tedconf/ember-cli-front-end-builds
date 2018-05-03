var Task         = require('ember-cli/lib/models/task');
var Promise      = require('rsvp');
var fs           = require('fs');

module.exports = Task.extend({
  options: null,

  run: function(environment, verbose) {
    var task = this,
        show = function(f) {
          return function() { return task[f].call(task); };
        },
        ask = function(f) {
          return show("ask" + f.charAt(0).toUpperCase() + f.substr(1));
        },
        deploy = {};

    return this.checkExisting()
      .then(show('welcome'))

      .then(ask('environment'))
      .then(function(answer) {
        deploy.environment = answer.environment;
      })

      .then(ask('bucket'))
      .then(function(answer) {
        deploy.bucket = answer.bucket;
      })

      .then(ask('frontEnd'))
      .then(function(answers) {
        var prefix = '',
            matchScheme = /^http(s?):\/\//;

        if (!matchScheme.test(answers.endpoint)) {
          prefix = 'http://';
        }

        deploy.endpoint = prefix + answers.endpoint;
        deploy.appName = answers.appName;
        deploy.apiKey = answers.apiKey;
      })

      .then(function() {
        return task.writeConfig(deploy);
      })

      .then(show('allDone'))

      .then(null, function(error) {
        task.ui.writeLine('There was an error', 'ERROR');
        console.log(error.stack);
      });
  },

  checkExisting: function() {
    // check for existing config, and warn
    return new Promise(function(resolve) {
      resolve();
    });
  },

  welcome: function() {
    this.outputMessage([
      "",
      "Welcome to front end builds!",
      "",
      "We're about to setup the configuration file, which",
      "will take about five minutse to complete. It assumes",
      "you have already setup your Rails application with",
      "the front_end_builds gem as well as an S3 bucket",
      "that will host assets. It's ok if you haven't done",
      "these yet, but be prepared to set them up during this",
      "installation process."
    ]);
  },

  askEnvironment: function() {
    this.outputMessage([
      "",
      "Environment",
      "",
      "What environment are we setting up right now? This",
      "is usually something like production or staging.",
      ""
    ]);

    return this.ui.prompt({
      type: "input",
      name: "environment",
      message: "What environment are we setting up:",
      default: "staging"
    });
  },

  askBucket: function() {
    this.outputMessage([
      "",
      "AWS S3 Bucket",
      "",
      "Please set up an S3 bucket with static website",
      "hosting enabled.",
      ""
    ]);

    return this.ui.prompt({
      type: "input",
      name: "bucket",
      message: "What is the name of your S3 bucket:"
    });
  },

  askFrontEnd: function() {
    this.outputMessage([
      "",
      "Front end application",
      "",
      "If you have not already, please go and setup your",
      "Rails app with the front_end_builds gem. Once you",
      "do this, use the admin interface to add a new front",
      "end application.",
      ""
    ]);

    return this.ui.prompt([{
      type: "input",
      name: "appName",
      message: "What is the name of your front end application:"
    },{
      type: "input",
      name: "endpoint",
      message: "What is the hostname where your Rails app lives:"
    }]);
  },

  outputMessage: function(message, level) {
    level = level || 'INFO';

    var task = this;

    message.forEach(function(line) {
      task.ui.writeLine(line, level);
    });
  },

  writeConfig: function(deploy) {
    var toWrite = {},
        config = {
          assets: {
            accessKeyId: "Dont hard code, use something like process.env.AWS_ACCESS_KEY_ID",
            secretAccessKey: "Dont hard code, use something like process.env.AWS_SECRET_ACCESS_KEY",
            bucket: deploy.bucket,
            prefix: "dist",
            distPrefix: "dist-{{SHA}}"
          },
          index: {
            app: deploy.appName,
            endpoints: [deploy.endpoint]
          }
        };

    toWrite[deploy.environment] = config;

    return new Promise(function(resolve, reject) {
      fs.writeFile(
        "./config/deploy.js",
        "module.exports = " + JSON.stringify(toWrite, null, 2) + ";\n",
        function(err) {
          if (err) {
            reject();
          } else {
            resolve();
          }
        }
      );
    });
  },

  allDone: function() {
    this.outputMessage([
      "",
      "Almost there...",
      "",
      "We created a configuration file for you at:",
      "",
      "  ./config/deploy.js",
      "",
      "Please review it and make sure all of the fields",
      "are correct. You'll then be able to deploy with:",
      "",
      "  ember deploy --environment=ENV_NAME",
      "",
      "Thanks for using front end builds!"
    ]);
  }
});
