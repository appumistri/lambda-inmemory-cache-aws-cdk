const { Stack, Duration } = require('aws-cdk-lib');
const lambda = require('aws-cdk-lib/aws-lambda');
const apigateway = require('aws-cdk-lib/aws-apigateway');

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
    const test_lambda = new lambda.Function(this, `test-lambda-${props.env.stage}`, {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('src'),
      handler: 'index.handler',
      timeout: Duration.seconds(5),
      architecture: lambda.Architecture.ARM_64
    });

    /* API Gateway */
    const test_api = new apigateway.RestApi(this, `test-apig-${props.env.stage}`, {
      deployOptions: {
        stageName: props.env.stage
      }
    });
    const resource = test_api.root.addResource(props.env.serviceName);
    resource.addMethod('GET', new apigateway.LambdaIntegration(test_lambda, { proxy: true }));
  }
}

module.exports = { LambdaInmemoryCacheAwsCdkStack }
