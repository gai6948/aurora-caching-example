import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as nodeLambda from '@aws-cdk/aws-lambda-nodejs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as rds from "@aws-cdk/aws-rds";
import * as apigw from '@aws-cdk/aws-apigatewayv2';
import * as integrations from'@aws-cdk/aws-apigatewayv2-integrations';
import * as elasticache from "@aws-cdk/aws-elasticache";

export interface MovieServiceProps {
    vpc: ec2.Vpc;
    auroraCluster: rds.DatabaseCluster;
    dbProxy: rds.DatabaseProxy;
    databaseSG: ec2.SecurityGroup;
    secretsSG: ec2.SecurityGroup;
    cacheSG: ec2.SecurityGroup;
    cacheCluster: elasticache.CfnCacheCluster;
}

export class MovieService extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: MovieServiceProps) {
    super(scope, id);

    const lambdaSG = new ec2.SecurityGroup(this, "LambdaSG", {
      vpc: props.vpc,
    });
    props.databaseSG.addIngressRule(lambdaSG, ec2.Port.tcp(5432), "Allow Lambda to access RDSProxy");
    props.secretsSG.addIngressRule(lambdaSG, ec2.Port.tcp(443), "Allow Lambda to fetch database credentials from Secrets Manager");
    props.cacheSG.addIngressRule(lambdaSG, ec2.Port.tcp(6379), "Allow Lambda to access ElasticCache");
    
    const movieService = new nodeLambda.NodejsFunction(this, "MovieServiceLambda", {
      entry: "src/lambda/movie-service/index.js",
      handler: "lambdaHandler",
      bundling: {
        minify: true,
      },
      runtime: lambda.Runtime.NODEJS_12_X,
      vpc: props.vpc,
      vpcSubnets: {
        subnetGroupName: "lambda-subnets",
      },
      securityGroups: [lambdaSG],
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        POSTGRES_HOST: props.dbProxy.endpoint,
        DB_SECRETS_ID: props.auroraCluster.secret? props.auroraCluster.secret.secretName : "",  
        REDIS_HOST: props.cacheCluster.attrRedisEndpointAddress,
      },
    });

    props.auroraCluster.secret?.grantRead(movieService);
    props.dbProxy.grantConnect(movieService);

    const api = new apigw.HttpApi(this, "MovieServiceApi", {
      defaultIntegration: new integrations.LambdaProxyIntegration({
        handler: movieService,
      }),
    });

    new cdk.CfnOutput(this, 'Movies Service HTTP API Url', {
      value: api.url ?? 'Something went wrong with the deploy',
      description: "URL of the movies api",
    });
  }
}