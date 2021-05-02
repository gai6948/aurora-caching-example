import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as elasticache from "@aws-cdk/aws-elasticache";

export interface RedisClusterProps {
  vpc: ec2.Vpc;
}

export class RedisCluster extends cdk.Construct {
  public redisCluster: elasticache.CfnCacheCluster;
  public cacheSG: ec2.SecurityGroup;
  constructor(scope: cdk.Construct, id: string, props: RedisClusterProps) {
    super(scope, id);

    this.cacheSG = new ec2.SecurityGroup(this, "RedisSG", {
      vpc: props.vpc,
    });

    const redisSubnetGroup = new elasticache.CfnSubnetGroup(
      this,
      "RedisSubnetGroup",
      {
        description: "Subnet group for ElasticCache Redis cluster",
        subnetIds: props.vpc.selectSubnets({
          subnetGroupName: "cache-subnets",
          onePerAz: true,
        }).subnetIds,
      }
    );

    this.redisCluster = new elasticache.CfnCacheCluster(this, "RedisCluster", {
      cacheNodeType: "cache.t3.small",
      engine: "redis",
      engineVersion: "6.x",
      numCacheNodes: 1,
      vpcSecurityGroupIds: [this.cacheSG.securityGroupId],
      cacheSubnetGroupName: redisSubnetGroup.ref,
    });

  }
}
