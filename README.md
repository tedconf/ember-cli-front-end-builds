# Ember-cli-static-deploy

1. Add a `deploy.json` to the root of your ember-cli project:

```json
{
  "production": {
    "assets": {
      "accessKeyId": "[your-id]",
      "secretAccessKey": "[your-key]",
      "bucket": "[your-bucket]",
      "assetHost": "[optional, e.g. https://s3.amazonaws.com/ted.conferences.ted-ed-lesson-creator]",
      "prefix": "[optional, dir on S3 to dump all assets]",
      "distPrefix": "[optional, dir on S3 to put `dist` in e.g. dist-{{SHA}}]"
    },
    "index": {
      "app": "ted-ed-lesson-creator",
      "endpoints": [
        "http://local.ted.com:3000/ted-ed-lesson-creator"
      ],
      "apiKey": "ee1a3e52-2aa2-4831-bf4e-92ccaf91b2ec",
    }
  }
}
```

2. Add these lines to your `Brocfile.js`

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
