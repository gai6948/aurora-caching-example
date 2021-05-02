import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as rds from "@aws-cdk/aws-rds";
import * as secrets from "@aws-cdk/aws-secretsmanager";

export interface AuroraClusterProps {
  vpc: ec2.Vpc;
}

export class AuroraCluster extends cdk.Construct {
  public auroraCluster: rds.DatabaseCluster;
  public dbProxy: rds.DatabaseProxy;
  public databaseSG: ec2.SecurityGroup;
  constructor(scope: cdk.Construct, id: string, props: AuroraClusterProps) {
    super(scope, id);

    this.databaseSG = new ec2.SecurityGroup(this, "DatabaseSG", {
      vpc: props.vpc,
      allowAllOutbound: false,
    });

    this.databaseSG.addIngressRule(
      this.databaseSG,
      ec2.Port.tcp(5432),
      "Allow RDS Proxy to access Aurora"
    );

    this.auroraCluster = new rds.DatabaseCluster(this, "AuroraCluster", {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_11_9,
      }),
      instanceProps: {
        vpc: props.vpc,
        vpcSubnets: {
          subnetGroupName: "database-subnets",
          onePerAz: true,
        },
        securityGroups: [this.databaseSG],
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.R6G,
          ec2.InstanceSize.LARGE
        ),
      },
      cloudwatchLogsExports: ["postgresql"],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.dbProxy = this.auroraCluster.addProxy("moviesDBProxy", {
      secrets: [this.auroraCluster.secret as secrets.ISecret],
      vpc: props.vpc,
      vpcSubnets: {
        subnetGroupName: "lambda-subnets",
      },
      securityGroups: [this.databaseSG],
      iamAuth: false,
      debugLogging: true,
      requireTLS: false,
    });

  }
}
