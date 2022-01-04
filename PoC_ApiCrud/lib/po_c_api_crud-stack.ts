import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as s3 from "@aws-cdk/aws-s3";
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';

export class PoCApiCrudStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Tabla de DynamoDB
    const table = new dynamodb.Table(this, "http-crud-tutorial-items", {
      tableName: "http-crud-tutorial-items",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    })

    // Defino las funciones lambda
    const getDynamoLambda = new lambda.Function(this, "http-get-dynamo-funtion", {
      functionName: "http-get-dynamo-function",
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("functions"),
      handler: "getMethod.handler",
      environment: {
        HELLO_TABLE_NAME: table.tableName,
      },
    });
    
    const putDynamoLambda = new lambda.Function(this, "http-put-dynamo-funtion", {
      functionName: "http-put-dynamo-function",
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("functions"),
      handler: "putMethod.handler",
      environment: {
        HELLO_TABLE_NAME: table.tableName,
      },
    });
    
    const deleteDynamoLambda = new lambda.Function(this, "http-delete-dynamo-funtion", {
      functionName: "http-delete-dynamo-function",
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("functions"),
      handler: "deleteMethod.handler",
      environment: {
        HELLO_TABLE_NAME: table.tableName,
      },
    });
    

    // Permisos para que las funciones lambda sobre la tabla dynamo table
    table.grantReadWriteData(getDynamoLambda);
    table.grantReadWriteData(putDynamoLambda);
    table.grantReadWriteData(deleteDynamoLambda);

    // HTTP API para exponer la función
    // Creamos las integraciones para que las rutas del API Gateway puedan ver la lambda (Los destinos)
    //const lambdaIntegration = new HttpLambdaIntegration('LambdaIntegration', dynamoLambda);
    const lambdaGetIntegrarion= new HttpLambdaIntegration('LambdaGetIntegration', getDynamoLambda);
    const lambdaPutIntegrarion= new HttpLambdaIntegration('LambdaPutIntegration', putDynamoLambda);
    const lambdaDeleteIntegrarion= new HttpLambdaIntegration('LambdaDeleteIntegration', deleteDynamoLambda);
    
    
    // Creamos el API Gateway
    const httpApi = new apigatewayv2.HttpApi(this, 'HttpApi');

    // Definimos las rutas para el API Gateway
    httpApi.addRoutes({
      path: '/items',
      methods: [ apigatewayv2.HttpMethod.GET ],
      integration: lambdaGetIntegrarion,
    });
    httpApi.addRoutes({
      path: '/items/{id}',
      methods: [ apigatewayv2.HttpMethod.GET ],
      integration: lambdaGetIntegrarion,
    });
    httpApi.addRoutes({
      path: '/items',
      methods: [ apigatewayv2.HttpMethod.PUT ],
      integration: lambdaPutIntegrarion,
    });
    httpApi.addRoutes({
      path: '/items/{id}',
      methods: [ apigatewayv2.HttpMethod.DELETE ],
      integration: lambdaDeleteIntegrarion,
    });
    
  const bucketS3 = new s3.Bucket(this, "certBucket", {
    bucketName: "bcol-cert-bucket-pocapirud"
  });


/*new s3deploy.BucketDeployment(this, 'DeployFiles', {
  sources: [s3deploy.Source.asset('./certs')],
  destinationBucket: bucketS3,
});*/

  }
}
