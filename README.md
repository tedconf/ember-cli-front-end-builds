# Ember-cli-static-deploy

An Ember CLI addon that deploys your app by

1. Creating a production build of your ember-cli app
2. Uploading your assets to S3
3. Notifying a back-end URL with info about the new build

> Note: Ideally this should be a temporary project. [ember-deploy](https://github.com/LevelbossMike/ember-deploy) is an OSS project attempting to handle all reasonable deployment strategies with ember-cli. We currently do a few things differently, so once ember-deploy adopts an adapter pattern for its components, we should be able to switch over to that.

## Installation

Add the following to your `package.json`

    "ember-cli-static-deploy": "git+ssh://git@github.com/tedconf/ember-deploy.git",

then run `npm install`.

## Setup

### Add a deploy.json

Add a `deploy.json` to the root of your ember-cli project. Top-level keys are used for different deployment environments.

The default environment is production.

```json
{
  "production": {

    // Config for assets deploy task
    "assets": {
      "accessKeyId": "[your-id]",
      "secretAccessKey": "[your-key]",
      "bucket": "[your-s3-bucket]",
      "assetHost": "[optional, e.g. https://s3.amazonaws.com/ted.conferences.ted-ed-lesson-creator]",
      "prefix": "[optional, dir on S3 to dump all assets]",
      "distPrefix": "[optional, dir on S3 to put `dist` in e.g. dist-{{SHA}}]"
    },

    // Config for index deploy task
    "index": {
      "app": "[app name, e.g. ted-ed-lesson-creator]",
      "endpoints": [
        "[endpoint to notify, e.g. http://local.ted.com:3000/ted-ed-lesson-creator]"
      ],
      "apiKey": "[api key to send along with back-end notification]",
    }
  }
}
```

### Update your Brocfile.js

To fingerprint your assets with the options from your `deploy.json` config, update your Brocfile:

```js
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var env = process.env.EMBER_ENV;
var deploy = require('./deploy.json')[env];
var prependString = deploy && deploy.assets ? deploy.assets.assetHost + '/' + deploy.assets.prefix + '/' : '';

var app = new EmberApp({
  fingerprint: {
    prepend: prependString,
  }
});
```

## Usage

The following commands will be made available in your ember-cli project:

  - `ember deploy` - Builds, uploads assets, notifies index.
  - `ember deploy:assets` - Uploads assets. Note, this uses whatever is currently in `dist` folder.
    - this command dumps twice, once to a shared dir and once to a uniq dist dir.
  - `ember deploy:index` - Notifies back-end of new index. Note this uses whatever is currently in `dist` folder.

Options:

  - All commands can take an optional `--environment=[env]` flag, to determine which env of your `deploy.json` is used. Default is `production`.
