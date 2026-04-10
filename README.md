# 🎙️ Voice Product Agent

A multi-language voice-powered product search system. Users speak in any language → AWS Transcribe converts speech to text → a Java/Spring agent powered by Koog interprets the request and queries a product-search MCP server → results display in the browser.

## Architecture

```
[Browser Mic]
     │ audio blob (WebM)
     ▼
[Next.js Frontend]
     │ POST /api/transcribe (audio)
     ▼
[Amazon Transcribe]  ← 100+ languages, streaming STT
     │ transcript + detected language
     ▼
[Next.js /api/agent]
     │ POST /agent/search {prompt, language}
     ▼
[Java Agent Service]  ← Spring Boot + Koog OpenAI (ECS Fargate)
     │ REST/MCP product search call
     ▼
[MCP Server]          ← Spring Boot + Spring AI MCP Server (ECS Fargate)
     │ GET /api/products/search?q=...
     ▼
[Your Product REST API]
```

## Project Structure

```
voice-product-agent/
├── frontend/          # Next.js 14 web app (TypeScript + Tailwind)
├── agent/             # Java/Koog agent service
├── mcp-server/        # Java/Spring AI MCP server wrapping Product API
├── product-service/   # Mock product catalog REST API (Node.js + Express, 20 products)
├── infra/             # AWS CDK infrastructure (TypeScript)
├── docker-compose.yml # Local development (all 4 services)
└── .env.example       # Environment variable template
```

## Prerequisites

- Node.js 20+
- JDK 17+
- Maven 3.9+
- Docker + Docker Compose
- AWS account with permissions for: Transcribe, ECS, ECR, S3, Secrets Manager, IAM
- OpenAI API key

## Quick Start (Local)

### 1. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your values
```

### 2. Run with Docker Compose

```bash
docker-compose up --build
```

Services will start at:
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Agent Service | http://localhost:8080 |
| MCP Server | http://localhost:9090 |
| Product Service | http://localhost:8081 |

**Test the product service directly:**
```bash
# Search products
curl "http://localhost:8081/api/products/search?q=headphones&limit=5"

# Filter by category and price
curl "http://localhost:8081/api/products/search?q=laptop&minPrice=1000&maxPrice=2000"

# List categories
curl "http://localhost:8081/api/products/categories"

# Get product by ID
curl "http://localhost:8081/api/products/p001"
```

### 3. Run services individually (dev mode)

```bash
# MCP Server
cd mcp-server && mvn spring-boot:run

# Agent Service
cd agent && mvn spring-boot:run

# Frontend
cd frontend && npm install && npm run dev
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `AWS_REGION` | ✅ | AWS region (e.g. `us-east-1`) |
| `AWS_ACCESS_KEY_ID` | ✅ | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | ✅ | AWS credentials |
| `LLM_API_KEY` | ✅ | OpenAI API key (`sk-...`) |
| `PRODUCT_API_URL` | ✅ | Your product REST API base URL |
| `AGENT_SERVICE_URL` | Frontend only | Agent service URL (default: `http://localhost:8080`) |
| `MCP_SERVER_URL` | Agent only | MCP server URL (default: `http://localhost:9090`) |

## AWS Deployment

### 1. Bootstrap CDK

```bash
cd infra
npm install
npx cdk bootstrap
```

### 2. Store secrets in AWS Secrets Manager

```bash
aws secretsmanager create-secret \
  --name voice-product-agent/llm-api-key \
  --secret-string "sk-ant-your-key"
```

### 3. Build & push Docker images to ECR

```bash
# Get ECR login token
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

# Build & push MCP server
docker build -t voice-product-agent/mcp-server ./mcp-server
docker tag voice-product-agent/mcp-server <account>.dkr.ecr.us-east-1.amazonaws.com/voice-product-agent/mcp-server:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/voice-product-agent/mcp-server:latest

# Build & push Agent
docker build -t voice-product-agent/agent ./agent
docker tag voice-product-agent/agent <account>.dkr.ecr.us-east-1.amazonaws.com/voice-product-agent/agent:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/voice-product-agent/agent:latest
```

### 4. Deploy CDK stack

```bash
cd infra
PRODUCT_API_URL=https://your-product-api.example.com npx cdk deploy
```

After deployment, CDK outputs the `AgentServiceUrl`. Set it as `AGENT_SERVICE_URL` in your frontend deployment (Vercel, Amplify, etc.).

## Supported Languages (Amazon Transcribe)

Amazon Transcribe supports 100+ languages. The frontend includes quick-select for:
English, Persian (فارسی), Arabic, French, German, Spanish, Chinese (Mandarin), Japanese — and more can be added.

## MCP Tool Reference

The MCP server exposes one tool:

### `search_products`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | string | ✅ | Natural language search query |
| `category` | string | ❌ | Filter by product category |
| `minPrice` | number | ❌ | Minimum price filter |
| `maxPrice` | number | ❌ | Maximum price filter |
| `limit` | integer | ❌ | Max results (default: 10) |

**Your Product REST API must expose:**
```
GET /api/products/search?q=<query>&category=<cat>&minPrice=<n>&maxPrice=<n>&limit=<n>
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Speech-to-Text | Amazon Transcribe (streaming) |
| AI Agent | Java, Spring Boot, Koog OpenAI |
| MCP Server | Java, Spring Boot, Spring AI MCP Server |
| Infrastructure | AWS CDK, ECS Fargate, S3, Secrets Manager |
| Containers | Docker, ECR |
