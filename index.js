'use strict';

var commands = require('./lib/commands').default;

module.exports = {
  name: 'ember-cli-front-end-builds',

  includedCommands() {
    return commands;
  }
};
