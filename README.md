# ember-cli-front-end-builds

Easily deploy your Ember CLI app to a [front_end_builds](https://github.com/tedconf/front_end_builds)-enabled Rails backend.

The deploy process involves

1. Creating a production build of your ember-cli app
2. Uploading your assets to S3
3. POST'ing to your Rails backend with info about the new build

> Note: Ideally, once [ember-deploy](https://github.com/LevelbossMike/ember-deploy) implements an adapter pattern, this project could simply become an adapter for that lib.

## Installation

Add the following to your `package.json`

    "ember-cli-front-end-builds": "git+ssh://git@github.com/tedconf/ember-cli-front-end-builds.git#v0.0.1",

then run `npm install`.

## Setup

### Add a deploy.json

Add a `deploy.json` to the root of your ember-cli project. Top-level keys are used for different deployment environments.

The default environment is production.

```json
{
  "production": {
    "assets": {
      "accessKeyId": "[your-id]",
      "secretAccessKey": "[your-key]",
      "bucket": "[your-s3-bucket]",
      "assetHost": "[optional, e.g. https://s3.amazonaws.com/ted.conferences.ted-ed-lesson-creator]",
      "prefix": "[optional, dir on S3 to dump all assets]",
      "distPrefix": "[optional, dir on S3 to put `dist` in e.g. dist-{{SHA}}]"
    },
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
