'use strict';

var commands = require('./lib/commands');

module.exports = {
  name: 'ember-cli-front-end-builds',

  includedCommands: function() {
    return commands;
  }
};

