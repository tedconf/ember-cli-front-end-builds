'use strict';

var commands = require('./lib/commands');

module.exports = {
  name: 'ember-cli-static-deploy',

  includedCommands: function() {
    return commands;
  }
};

