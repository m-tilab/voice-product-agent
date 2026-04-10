import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as logs from "aws-cdk-lib/aws-logs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

export class VoiceProductStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // ─── S3: Audio file staging bucket ───────────────────────────────────────
    const audioBucket = new s3.Bucket(this, "AudioBucket", {
      bucketName: `voice-product-agent-audio-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        { expiration: cdk.Duration.days(1), id: "expire-audio-24h" },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // ─── Secrets ──────────────────────────────────────────────────────────────
    const llmApiKeySecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "LlmApiKey",
      "voice-product-agent/llm-api-key"
    );

    // ─── VPC ──────────────────────────────────────────────────────────────────
    const vpc = new ec2.Vpc(this, "AgentVpc", {
      maxAzs: 2,
      natGateways: 1,
    });

    // ─── ECS Cluster ──────────────────────────────────────────────────────────
    const cluster = new ecs.Cluster(this, "AgentCluster", {
      vpc,
      containerInsights: true,
    });

    // ─── ECR Repositories ─────────────────────────────────────────────────────
    const mcpServerRepo = new ecr.Repository(this, "McpServerRepo", {
      repositoryName: "voice-product-agent/mcp-server",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const agentRepo = new ecr.Repository(this, "AgentRepo", {
      repositoryName: "voice-product-agent/agent",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ─── MCP Server Fargate Service ───────────────────────────────────────────
    const mcpService = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      "McpServerService",
      {
        cluster,
        cpu: 512,
        memoryLimitMiB: 1024,
        desiredCount: 1,
        taskImageOptions: {
          image: ecs.ContainerImage.fromEcrRepository(mcpServerRepo, "latest"),
          containerPort: 9090,
          environment: {
            PORT: "9090",
            MCP_TRANSPORT: "http",
            PRODUCT_API_URL: process.env.PRODUCT_API_URL ?? "http://your-product-api",
          },
          logDriver: ecs.LogDrivers.awsLogs({
            streamPrefix: "mcp-server",
            logRetention: logs.RetentionDays.ONE_WEEK,
          }),
        },
        publicLoadBalancer: false, // internal only
      }
    );

    // ─── Koog Agent Fargate Service ───────────────────────────────────────────
    const agentTaskDef = new ecs.FargateTaskDefinition(this, "AgentTaskDef", {
      cpu: 1024,
      memoryLimitMiB: 2048,
    });

    // Grant agent access to Transcribe + S3
    agentTaskDef.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: ["transcribe:StartStreamTranscription", "transcribe:StartTranscriptionJob"],
        resources: ["*"],
      })
    );
    audioBucket.grantReadWrite(agentTaskDef.taskRole);
    llmApiKeySecret.grantRead(agentTaskDef.taskRole);

    agentTaskDef.addContainer("AgentContainer", {
      image: ecs.ContainerImage.fromEcrRepository(agentRepo, "latest"),
      portMappings: [{ containerPort: 8080 }],
      environment: {
        PORT: "8080",
        MCP_SERVER_URL: `http://${mcpService.loadBalancer.loadBalancerDnsName}`,
      },
      secrets: {
        LLM_API_KEY: ecs.Secret.fromSecretsManager(llmApiKeySecret),
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: "koog-agent",
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
    });

    const agentService = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      "AgentService",
      {
        cluster,
        taskDefinition: agentTaskDef,
        desiredCount: 1,
        publicLoadBalancer: true,
      }
    );

    // ─── Auto-scaling ─────────────────────────────────────────────────────────
    const scaling = agentService.service.autoScaleTaskCount({ maxCapacity: 5 });
    scaling.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: 70,
    });

    // ─── Outputs ──────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, "AgentServiceUrl", {
      value: `http://${agentService.loadBalancer.loadBalancerDnsName}`,
      description: "Koog Agent Service URL — set as AGENT_SERVICE_URL in frontend",
    });

    new cdk.CfnOutput(this, "AudioBucketName", {
      value: audioBucket.bucketName,
    });

    new cdk.CfnOutput(this, "McpServerInternal", {
      value: `http://${mcpService.loadBalancer.loadBalancerDnsName}`,
      description: "MCP Server internal ALB URL",
    });
  }
}
