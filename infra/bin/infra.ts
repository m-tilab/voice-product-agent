#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { VoiceProductStack } from "../lib/voice-product-stack";

const app = new cdk.App();

new VoiceProductStack(app, "VoiceProductStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "us-east-1",
  },
  tags: {
    Project: "voice-product-agent",
    Environment: process.env.DEPLOY_ENV ?? "dev",
  },
});
