# ember-cli-front-end-builds

### NOTE: This package is deprecated, in favor of [ember-cli-deploy-front-end-builds-pack](https://github.com/tedconf/ember-cli-deploy-front-end-builds-pack), a new addon for use with [Ember CLI Deploy](http://ember-cli.com/ember-cli-deploy/).

Easily deploy your Ember CLI app to a [front_end_builds](https://github.com/tedconf/front_end_builds)
Rails backend.

The deploy process involves:

1. Creating a build of your ember-cli app
1. Uploading your assets to S3
1. Notifying your Rails backend with info about the new build

## Installation

```
npm install --save-dev ember-cli-front-end-builds
```

#### Backend

Please make sure you have setup your Rails backend with the
[front_end_builds](https://github.com/tedconf/front_end_builds) gem.

You should also setup the admin area and add your application.

#### Amazon S3

You'll also need to setup a S3 bucket, and allow it to be accessed publicly.  Add a policy such as:

```js
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadForGetBucketObjects",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::MY-BUCKET-NAME/*"
        }
    ]
}
```

#### Ember App Setup

In your App's `ember-cli-build.js`, you'll want to prepend your asset fingerprinting with your S3 Bucket URL:

```js
var env = process.env.EMBER_ENV;
var fingerprintOptions = {
  enabled: true
};
switch (env) {
  case 'development':
    fingerprintOptions.prepend = 'http://localhost:4200/';
  break;
  case 'production':
    fingerprintOptions.prepend = 'https://s3.amazonaws.com/MY-BUCKET-NAME/dist/';
  break;
}
var app = new EmberApp({
  'fingerprint': fingerprintOptions
});
```

Please note that if you are serving assets off S3 and your bucket is
not in the US Standard region your prepend string should be 
`https://MY-BUCKET-NAME.s3.amazonaws.com/dist/`.

## Setup

To get started with deploy configuration simply run:

```
ember deploy:setup
```

This will ask you a series questions about your application and write a
configuration file to ``config/deploy.js``.

### Explaining the configuration file.

TODO

```json
{
  "production": {
    "assets": {
      "accessKeyId": process.env.ACCESS_KEY_ID,
      "secretAccessKey": process.env.SECRET_ACCESS_KEY,
      "bucket": "[your-s3-bucket]",
      "prefix": "[optional, dir on S3 to dump all assets]",
      "distPrefix": "[optional, dir on S3 to put `dist` in e.g. dist-{{SHA}}]"
    },
    "index": {
      "app": "[app name, e.g. ted-ed-lesson-creator]",
      "endpoints": [
        "[endpoint to notify, e.g. http://local.ted.com:3000/ted-ed-lesson-creator]"
      ]
    },
    "build": {
      "environment": "production" // optional, specify if you need an ember-cli build env different from your deploy environment (e.g. use `production` for my staging deploy)
    }
  }
}
```

### Add .env file in root dir of project

```
ACCESS_KEY_ID=YOUR-ACCESS-KEY
SECRET_ACCESS_KEY=YOUR-SECRET-KEY
```

### Edit `.gitignore`

```
/.env
```

## Usage

To deploy your application just run

```
ember deploy --environment=ENV
```

Where ENV is the name of the environment you wish to deploy to.

