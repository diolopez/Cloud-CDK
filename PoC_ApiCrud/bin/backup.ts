import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';

export class PoCApiCrudStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Tabla de DynamoDB
    const table = new dynamodb.Table(this, "http-crud-tutorial-items", {
      tableName: "http-crud-tutorial-items",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    })

    // Lambda Function
    const dynamoLambda = new lambda.Function(this, "http-crud-tutorial-function", {
      functionName: "http-crud-tutorial-function",
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("functions"),
      handler: "function.handler",
      environment: {
        HELLO_TABLE_NAME: table.tableName,
      },
    });

    // Permisos sobre la tabla
    table.grantReadWriteData(dynamoLambda);

    // HTTP API para exponer la función
    // Creamos la integración para que las rutas del API Gateway puedan ver la lambda (Los destinos)
    const lambdaIntegration = new HttpLambdaIntegration('LambdaIntegration', dynamoLambda);
    
    // Creamos el API Gateway
    const httpApi = new apigatewayv2.HttpApi(this, 'HttpApi');

    // Definimos las rutas para el API Gateway
    httpApi.addRoutes({
      path: '/items',
      methods: [ apigatewayv2.HttpMethod.GET ],
      integration: lambdaIntegration,
    });
    httpApi.addRoutes({
      path: '/items/{id}',
      methods: [ apigatewayv2.HttpMethod.GET ],
      integration: lambdaIntegration,
    });
    httpApi.addRoutes({
      path: '/items',
      methods: [ apigatewayv2.HttpMethod.PUT ],
      integration: lambdaIntegration,
    });
    httpApi.addRoutes({
      path: '/items/{id}',
      methods: [ apigatewayv2.HttpMethod.DELETE ],
      integration: lambdaIntegration,
    });

  }
}