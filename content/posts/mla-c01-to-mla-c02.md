---
title: MLA-C01 → MLA-C02: What AWS Changed, and Why AgentCore Is Now on the Exam
slug: mla-c01-to-mla-c02
excerpt: A trainer's breakdown of the new AWS ML Engineer Associate exam: what was added, what was cut, why Bedrock Agents gave way to AgentCore, and how I'd study for it.
tags: aws, certification, mla-c02, bedrock, agentcore, mlops
status: published
date: 2026-09-15
---

I teach the AWS Certified Machine Learning Engineer – Associate course at TekBay Academy. I wrote the original MLA-C01 curriculum from scratch, and when AWS announced MLA-C02, I had to redesign it. That meant reading the new exam guide line by line and comparing it with the old one.

This post is the short version of that work. It covers what changed, what was removed, the platform shift that explains a lot of it, and how I'd study for the new exam today.

## The dates that matter

| Date | What happens |
| --- | --- |
| Sep 1, 2026 | MLA-C02 beta registration opens (English) and the exam guide is published |
| Sep 28, 2026 | Last day to take MLA-C01 in English |
| Sep 29, 2026 | MLA-C02 beta delivery begins |
| Jan 14, 2027 | MLA-C02 standard delivery begins in all languages; MLA-C01 is retired everywhere |

After September 28, MLA-C01 stays available only in Japanese, Korean and Simplified Chinese, until January 14. If you've passed MLA-C01, or pass it before it retires, your certification stays valid until its original expiry date, so you don't need to retake anything.

## The format

The **beta** is 85 questions in 170 minutes and costs **$75**, half the usual associate price. Like all AWS betas, you don't get your result immediately; it comes after the beta closes and AWS sets the passing standard.

The **standard** MLA-C02 has 65 questions. Per the official exam guide, 50 are scored and 15 are unscored, and you can't tell which is which. Scoring is 100–1,000 with **720 to pass**. The model is compensatory, so you don't need to pass each domain, only the exam overall. The question types are still multiple choice and multiple response.

Should you take the beta? If you've been building with Bedrock and agents at work, yes: it's cheaper and you'll be one of the first holders. If you've only studied MLA-C01 material, wait. That material doesn't cover the half of this exam that's new, and the prep resources will catch up by January.

## Same four domains, new names

| Domain | MLA-C01 | MLA-C02 |
| --- | --- | --- |
| 1 | Data Preparation for **ML** (28%) | Data Preparation for **ML and AI** (28%) |
| 2 | ML Model Development (26%) | ML Model **and Foundation Model** Development (24%) |
| 3 | Deployment and Orchestration of ML Workflows (22%) | Deployment and Orchestration of ML **and AI** Workflows (24%) |
| 4 | ML Solution Monitoring, Maintenance, and Security (24%) | **Operating**, Monitoring, and Securing ML and AI Solutions (24%) |

The weights barely moved: two points left model development and went to deployment. The renames tell the real story. "ML" became "ML and AI" everywhere, and in AWS's wording, "AI" means foundation models, RAG and agents. Every task statement still maps one-to-one to its MLA-C01 version, but each one now has GenAI skills added.

## What was added

I grouped the new skills by theme, because that's how I re-sequenced the course. The numbers in brackets are the official skill IDs, so you can find them in the guide.

### 1. Data preparation now includes RAG data

- **Vector stores [1.1.7]:** Configure scalable vector databases, such as OpenSearch Service, RDS with **pgvector**, and **Amazon S3** (S3 Vectors).
- **Embeddings and documents [1.2.5, 1.2.7]:** Configure embedding models for text and images, and prepare documents for RAG, including **chunking strategies** and metadata extraction.
- **Sensitive data [1.2.8]:** Mask, redact and anonymize it.
- **Training data for FMs [1.2.9]:** Prepare data for **FM fine-tuning, continued pre-training and distillation**.
- **Validation [1.3.6]:** Validate GenAI training data, including prompt–response pair checks and content-safety screening.

**What this means:** Domain 1 is still the biggest at 28%, and a real share of it is now about building a knowledge base, not a feature table. If you've never compared chunking strategies, start there.

### 2. Model development: choosing an FM

- **Choosing a model [2.1.1, 2.1.4]:** Choose an FM from Bedrock for a task. Compare a custom model, a managed service, a pre-trained model and an FM.
- **Choosing a RAG pattern [2.1.5]:** Pick the RAG architecture that fits the use case.
- **The trade-off [2.1.7]:** Balance quality, **latency and cost**.
- **Customization [2.2.8, 2.2.9]:** Prompt engineering, fine-tuning, and optimizing retrieval and embedding models.

### 3. Evaluation: the most underrated change

This is the section I'd tell every candidate not to skim:

- **NLP metrics [2.3.8]:** BLEU, ROUGE, **BERTScore** and semantic similarity.
- **AI evaluation [2.3.9]:** Output assessment, bias detection and **LLM-as-a-judge** frameworks.
- **Human evaluation [2.3.7]:** Human-in-the-loop workflows and assessing generated text.
- **RAG monitoring [2.3.10]:** Including retrieval accuracy.
- **Prompt testing [3.3.9]:** Test prompts like code.

For anyone who learned ML from accuracy, F1 and AUC, this is new. You need to know when ROUGE is misleading, what an LLM judge is good and bad at, and how to tell a retrieval failure from a generation failure. I've built eval suites with exactly these tools, and the exam is right to test this: in production it's the step teams most often skip.

### 4. Deploying agents

- **Deploying agents [3.1.6]:** Deploy and configure agents, including tool integration and **agent communication protocols**. The guide doesn't name them, but in practice that means MCP and agent-to-agent protocols.
- **Agent memory and infrastructure [3.2.9, 3.2.11]:** Agent state management and agentic workflow infrastructure.
- **Agent pipelines [3.3.8]:** Automated deployment and **version management** for agents.
- **Knowledge bases [3.2.7, 3.3.11]:** Create and manage Bedrock Knowledge Bases, and build pipelines that refresh them.
- **Prompt management [3.3.7]:** Bedrock Prompt Management.
- **Hosting and imports [3.1.5, 3.2.10]:** Deploy models built outside AWS (SageMaker AI, **Bedrock Custom Model Import**) and scale GPU resources for AI workloads.

### 5. Operations: tokens are the new cost metric

- **Agent failures [4.1.5]:** Monitor agents for coordination failures, **truncated streaming and tool failures**.
- **Agent resources [4.2.8]:** Monitor what agents consume.
- **FM inference cost [4.2.7, 4.2.9, 4.2.10]:** Token usage, embedding compute, and vector storage costs.
- **Credentials [4.3.8]:** Choose the right credential for FM access, **Bedrock API keys vs IAM credentials**.
- **Guardrails [4.3.9]:** Use **Bedrock Guardrails** for safeguards and responsible AI.
- **Pipeline security [4.3.1]:** Scan CI/CD for vulnerabilities with CodeGuru and Inspector.

## What was removed

AWS made room by cutting:

- **SageMaker Neo** and edge-device optimization
- **Bring your own container (BYOC)** with SageMaker
- **Model-size reduction:** pruning, data-type changes, compression
- Using custom datasets to fine-tune pre-trained models via Bedrock or JumpStart (this skill was replaced by FM fine-tuning and data-preparation skills; it didn't disappear)
- Loading training data from **EFS/FSx** into training resources (both services are still in scope in general)
- Infrastructure monitoring with **EventBridge** events, and troubleshooting capacity issues (provisioned concurrency, quotas, auto scaling)

If you prepared with MLA-C01 material, these are the hours you can get back. Don't overcorrect, though: SageMaker training, tuning, endpoints, Pipelines, Model Monitor and Clarify are all still in scope. This exam adds GenAI to MLOps; it doesn't replace it.

## Why AgentCore? Bedrock Agents is now "Classic"

The biggest new item in the in-scope services list is **Amazon Bedrock AgentCore**. The change in the service itself explains why.

On **July 30, 2026**, AWS renamed Amazon Bedrock Agents to **Bedrock Agents Classic** and put it in maintenance mode:

- **No new customers:** Accounts without Bedrock Agents activity in the past 12 months get an `AccessDeniedException` when calling `CreateAgent` or `InvokeInlineAgent`, and there's no exception process.
- **Existing agents keep running:** There's no end-of-life date, but no new features are coming, and its model catalog is frozen at the July 30 date.
- **The rest of Bedrock is unaffected:** Models, Knowledge Bases and Guardrails continue as before.

AWS recommends moving to AgentCore, which offers two paths:

1. **The managed harness (recommended):** Declare the model, tools and system prompt, and AgentCore handles compute, memory, identity and tracing. It's the closest thing to the old Agents experience.
2. **Code-defined agents on AgentCore Runtime:** Bring any framework (Strands, LangChain, OpenAI Agents SDK, Claude Agent SDK) when you need custom orchestration or multi-agent patterns.

Here's how the pieces map, which is also a good study checklist:

| Bedrock Agents Classic | AgentCore equivalent |
| --- | --- |
| Managed orchestration loop | Harness |
| Action groups (OpenAPI/Lambda) | Tools behind **AgentCore Gateway**, exposed as **MCP tools** |
| Knowledge base attached to the agent | Knowledge base through the Gateway or a retrieval tool |
| Session and cross-session memory | **AgentCore Memory** (short- and long-term strategies) |
| Return of control / user input | Inline function tools in the harness |
| Code interpreter action group | AgentCore Code Interpreter |
| Trace UI | End-to-end tracing / observability |
| Guardrails on the agent | Bedrock Guardrails, with policy enforced at the Gateway |
| Multi-agent supervisor | Agent-as-tool in the harness; full patterns need custom code on Runtime |

AgentCore keeps changing quickly. Recent changes:

- **July 2026:** The harness and the Web Search tool became generally available.
- **August 2026:** AWS Agent Registry became generally available, and Memory can now ingest content directly into long-term memory.

Don't memorize this release notes list for the exam. Do understand what each component is for: Runtime, Gateway, Memory, Identity, Observability and the harness.

**What this means for you:** Older practice tests are built around Bedrock Agents action groups. They still teach the concepts (tools, return of control, knowledge-base grounding), but you should know where each concept lives in AgentCore. And outside the exam, if you're starting a new agent project in a new AWS account, Classic may not even be available to you.

## How I'd study for MLA-C02

This is roughly the order I rebuilt the course in. Adjust it to your background.

1. **Start from the exam guide.** Read the official [MLA-C01 vs MLA-C02 comparison page](https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-02/mla-02-comparison.html) and treat every added skill as a checklist item. It's the most useful page AWS has published on this exam.
2. **Learn the MLOps core as before.** Cover data prep with Glue and Data Wrangler, SageMaker training, tuning and endpoints, Pipelines, Model Monitor and Clarify, plus IAM, KMS and VPC. That's still most of the exam.
3. **Build one RAG system end to end on Bedrock.** Use a Knowledge Base, try two chunking strategies, pick an embedding model, add a reranker, and add a Guardrail. Then measure it. Reading about chunking doesn't teach you what building one does.
4. **Evaluate it properly.** Run a Bedrock evaluation job, try an LLM judge, compute ROUGE and BERTScore on a small set, and see where they disagree. That covers the whole evaluation group of skills.
5. **Build one agent on AgentCore.** In my redesigned MLA-C02 course, students build an AgentCore agent as their project. That means not just the agent, but what it needs in production: memory, observability, and tools exposed through Gateway as MCP. Then version it and deploy it through a pipeline.
6. **Do the cost math.** For every architecture question, ask what drives the cost: tokens, embeddings, vector storage, or instance hours. Domain 4 now expects you to think in tokens.
7. **Practice with scenarios, not definitions.** AWS questions are scenarios with several plausible answers. Practice explaining why each wrong option is wrong. That's what I drill most in class, and it's the habit behind our first batch's 100% pass rate.

## Final thoughts

MLA-C01 tested whether you could train, deploy and monitor a model on SageMaker. MLA-C02 also tests whether you can build, measure and run a foundation-model system: retrieval, agents, evaluation and token costs. That matches what ML engineering work looks like in 2026, so the update is a good one. It also means the old prep material is now only half of what you need.

If you're preparing for MLA-C02 and want to compare notes, or you're stuck on a particular task statement, reach out.

---

### Sources

- [AWS: Updates to the AWS Certified Machine Learning Engineer – Associate (MLA-C02)](https://aws.amazon.com/blogs/training-and-certification/updates-to-aws-certified-machine-learning-engineer-associate-mla-c02/)
- [AWS Training and Certification: September 2026 new offerings](https://aws.amazon.com/blogs/training-and-certification/september-2026-new-offerings/)
- [MLA-C02 exam guide](https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-02/machine-learning-engineer-associate-02.html)
- [Comparison of MLA-C01 and MLA-C02](https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-02/mla-02-comparison.html)
- [MLA-C02 in-scope services](https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-02/mla-02-in-scope-services.html)
- [Amazon Bedrock Agents Classic maintenance mode](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-classic-maintenance-mode.html)
- [Amazon Bedrock AgentCore release notes](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/release-notes.html)
