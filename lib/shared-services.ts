import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";

export interface SharedServicesProps {}

export class SharedServices extends cdk.Construct {
  public vpc: ec2.Vpc;
  public bastionSG: ec2.SecurityGroup;
  public secretsSG: ec2.SecurityGroup;
  constructor(scope: cdk.Construct, id: string, props: SharedServicesProps) {
    super(scope, id);

    this.vpc = new ec2.Vpc(this, "CacheExampleSharedVPC", {
      cidr: "10.0.0.0/16",
      maxAzs: 3,
      subnetConfiguration: [
          {
              name: "database-subnets",
              subnetType: ec2.SubnetType.ISOLATED,
              cidrMask: 27
          },
          {
              name: "cache-subnets",
              subnetType: ec2.SubnetType.ISOLATED,
              cidrMask: 27
          },
          {
              name: "bastion-subnets",
              subnetType: ec2.SubnetType.PUBLIC,
              cidrMask: 28,
          },
          {
              name: "lambda-subnets",
              subnetType: ec2.SubnetType.ISOLATED,
              cidrMask: 28,
          }
      ],
      natGateways: 0,
    });
    
    const bastionSG = new ec2.SecurityGroup(this, "BastionSG", {
        vpc: this.vpc,
    });
    this.bastionSG = bastionSG;

    const bastionHost = new ec2.BastionHostLinux(this, "DBABastionHost", {
        machineImage: ec2.MachineImage.lookup({
            name: "ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*",
            owners: ["099720109477"],
        }),
        vpc: this.vpc,
        subnetSelection: this.vpc.selectSubnets({subnetGroupName: "bastion-subnets", availabilityZones: ["ap-northeast-1a"]}),
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
        securityGroup: bastionSG,
    });

    bastionHost.role.addManagedPolicy({managedPolicyArn: "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"});
    bastionHost.instance.addUserData(
        "sudo apt-get install wget ca-certificates",
        "wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -",
        "sudo sh -c 'echo \"deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main\" >> /etc/apt/sources.list.d/pgdg.list'",
        "sudo apt-get update",
        "sudo apt-get install -y postgresql postgresql-contrib",
    );

    this.secretsSG = new ec2.SecurityGroup(this, "SecretsSG", {
        vpc: this.vpc,
    });

    const secretsEndpoint = this.vpc.addInterfaceEndpoint("SecretsManaerEndpoint", {
        service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
        subnets: {
            subnetGroupName: "lambda-subnets",
        },
        securityGroups: [this.secretsSG],
    });

  }
}
