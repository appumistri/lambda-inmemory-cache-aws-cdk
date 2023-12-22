#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { LambdaInmemoryCacheAwsCdkStack } = require('../lib/lambda-inmemory-cache-aws-cdk-stack');

const app = new cdk.App();
new LambdaInmemoryCacheAwsCdkStack(app, 'LambdaInmemoryCacheAwsCdkStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
    stage: process.env.STAGE || 'dev',
    serviceName: 'lambda-cache'
  },
});
