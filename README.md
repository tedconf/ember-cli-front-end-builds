# ember-cli-front-end-builds

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

In your App's `Brocfile.js`, you'll want to prepend your asset fingerprinting with your S3 Bucket URL:

```js
var app = new EmberApp({
  'fingerprint': {
    prepend: "https://s3.amazonaws.com/MY-BUCKET-NAME/dist/"
  }
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
      "accessKeyId": "[your-id]",
      "secretAccessKey": "[your-key]",
      "bucket": "[your-s3-bucket]",
      "prefix": "[optional, dir on S3 to dump all assets]",
      "distPrefix": "[optional, dir on S3 to put `dist` in e.g. dist-{{SHA}}]"
    },
    "index": {
      "app": "[app name, e.g. ted-ed-lesson-creator]",
      "client": "optional('mobile' or 'web')",
      "endpoints": [
        "[endpoint to notify, e.g. http://local.ted.com:3000/ted-ed-lesson-creator]"
      ]
    }
  }
}
```

## Usage

To deploy your application just run

```
ember deploy --environment=ENV
```

Where ENV is the name of the environment you wish to deploy to.

