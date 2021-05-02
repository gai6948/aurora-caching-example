import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";

import { SharedServices } from "./shared-services";
import { AuroraCluster } from "./aurora-cluster";
import { RedisCluster } from "./redis-cluster";
import { MovieService } from "./movie-service";

export class AuroraElasticacheExampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const sharedServices = new SharedServices(this, "SharedServices", {});

    const auroraCluster = new AuroraCluster(this, "AuroraCluster", {
      vpc: sharedServices.vpc,
    });

    const redisCluster = new RedisCluster(this, "RedisCluster", {
      vpc: sharedServices.vpc,
    });

    auroraCluster.databaseSG.addIngressRule(
      sharedServices.bastionSG,
      ec2.Port.tcp(5432),
      "Allow bastion access to Aurora"
    );

    redisCluster.cacheSG.addIngressRule(
      sharedServices.bastionSG,
      ec2.Port.tcp(6379),
      "Allow bastion access to ElastiCache Redis"
    );

    const movieService = new MovieService(this, "MovieServices", {
      auroraCluster: auroraCluster.auroraCluster,
      databaseSG: auroraCluster.databaseSG,
      dbProxy: auroraCluster.dbProxy,
      secretsSG: sharedServices.secretsSG,
      vpc: sharedServices.vpc,
    });
    
  }
}
