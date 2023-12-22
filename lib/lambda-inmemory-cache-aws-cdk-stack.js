const { Stack, Duration } = require('aws-cdk-lib');
const { Function, Runtime, Code, Architecture } = require('aws-cdk-lib/aws-lambda');
const { RestApi, LambdaIntegration } = require('aws-cdk-lib/aws-apigateway');
const { CfnSchedule } = require('aws-cdk-lib/aws-scheduler');
const { Role, ServicePrincipal, Policy, PolicyDocument, PolicyStatement, Effect } = require('aws-cdk-lib/aws-iam');

class LambdaInmemoryCacheAwsCdkStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    /* Lambda Function */
    const test_lambda = new Function(this, `test-lambda-${props.env.stage}`, {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('src'),
      handler: 'index.handler',
      timeout: Duration.seconds(5),
      architecture: Architecture.ARM_64
    });

    /* Event Bridge */
    const schedulerRole = new Role(this, `test-warmup-scheduler-role-${props.env.stage}`, {
      assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
    });

    const invokeLambdaPolicy = new Policy(this, `invoke-lambda-policy-${props.env.stage}`, {
      document: new PolicyDocument({
        statements: [
          new PolicyStatement({
            actions: ['lambda:InvokeFunction'],
            resources: [test_lambda.functionArn],
            effect: Effect.ALLOW,
          }),
        ],
      }),
    });

    schedulerRole.attachInlinePolicy(invokeLambdaPolicy);

    new CfnSchedule(this, `test-warmup-event-${props.env.stage}`, {
      name: `test-warmup-event-${props.env.stage}`,
      description: 'Runs a schedule for every 5 minutes',
      flexibleTimeWindow: { mode: 'OFF' },
      scheduleExpression: 'rate(5 minutes)',
      target: {
        arn: test_lambda.functionArn,
        roleArn: schedulerRole.roleArn,
        input: JSON.stringify({ source: 'event-bridge' })
      },
    });

    /* API Gateway */
    const test_api = new RestApi(this, `test-apig-${props.env.stage}`, {
      deployOptions: {
        stageName: props.env.stage
      }
    });
    const resource = test_api.root.addResource(props.env.serviceName);
    resource.addMethod('GET', new LambdaIntegration(test_lambda, { proxy: true }));
  }
}

module.exports = { LambdaInmemoryCacheAwsCdkStack }
