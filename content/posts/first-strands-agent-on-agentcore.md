---
title: From Zero to a Deployed AI Agent: Strands + Amazon Bedrock AgentCore
slug: first-strands-agent-on-agentcore
excerpt: A hands-on beginner's guide: write a Strands agent in Python, test it locally, deploy it to Amazon Bedrock AgentCore, and give it short- and long-term memory.
tags: aws, agentcore, bedrock, strands, ai agents
status: published
date: 2026-10-15
---

## Before you start: what this guide covers

By the end of this guide you will have:

- ✅ Written an AI agent that **decides on its own** when to call your Python functions
- ✅ Understood **how an agent remembers** a conversation, and why that memory disappears
- ✅ Tested the agent locally with a visual inspector
- ✅ **Deployed it to AWS** as a managed, serverless service
- ✅ Called it over **REST**
- ✅ Given it **short-term memory** that survives crashes and redeploys
- ✅ Set up **long-term memory** that remembers a user across conversations
- ✅ Understood **authentication, identity, and costs**

Each part builds on the previous one. Don't skip ahead. Every part ends with a working result you can see.

```
Part 1  Your first agent (local)          ──►  "it calls my tools!"
Part 2  How agents remember               ──►  "so that's where memory lives"
Part 3  Create an AgentCore project       ──►  project scaffolded
Part 4  Make the agent AgentCore-ready    ──►  same agent, now a web service
Part 5  Test locally                      ──►  watch the agent think in a UI
Part 6  Deploy to AWS                     ──►  agent live in the cloud
Part 7  Call it over REST                 ──►  curl / Python
Part 8  Short-term memory                 ──►  survives restarts
Part 9  Long-term memory                  ──►  remembers you across chats
Part 10 Auth, identity & cost             ──►  production basics
```

## The big picture

### What is an agent?

A normal chatbot only produces text. An **agent** can also **take actions**: it decides which of your functions (called **tools**) to call, calls them, reads the results, and keeps going until it can answer.

```
You: "What's the weather in Delhi and what time is it?"
        │
        ▼
 ┌──────────────── the agent loop ─────────────────┐
 │  LLM thinks: "I need get_weather and get_time"  │
 │        │                                        │
 │        ▼                                        │
 │  Your code runs get_weather("Delhi")            │
 │  Your code runs get_time()                      │
 │        │                                        │
 │        ▼                                        │
 │  LLM reads the results and writes the answer    │
 └─────────────────────────────────────────────────┘
        │
        ▼
"It's sunny and 25°C in Delhi, and the time is 13:28."
```

### The tools we'll use

| Name | What it is | Analogy |
|---|---|---|
| **Strands Agents** | Open-source Python SDK from AWS that runs the agent loop for you | The engine |
| **Amazon Bedrock** | AWS service for calling LLMs (Nova, Claude, Llama, …) | The brain |
| **Bedrock AgentCore** | AWS service that *hosts* agents: runtime, memory, identity, observability | The building the engine runs in |
| **AgentCore CLI** (`agentcore`) | Command-line tool to create, test, and deploy AgentCore projects | The construction crew |

### What we're building

A **weather agent** with two tools:

- `get_time()`: the current date and time
- `get_weather(city)`: the weather for a city. It's hard-coded to *"sunny, 25°C"* so you can focus on the agent rather than on a weather API.

## Prerequisites

| You need | Why | Check with |
|---|---|---|
| **Python 3.10+** | The agent is Python | `python3 --version` |
| **uv** | Fast Python package and environment manager (the AgentCore CLI uses it) | `uv --version` |
| **Node.js 20+ and npm** | The AgentCore CLI is an npm package | `node --version` |
| **An AWS account** | For Bedrock and AgentCore | — |
| **AWS CLI v2** | To log in to AWS from your terminal | `aws --version` |

You **don't** need Docker. We'll use AgentCore's *Direct Code Deploy*, which uploads your code as a zip file.

> [!NOTE]
> **How much will this cost?** Following this whole guide costs roughly **one cent**. See [Part 10](#cost-what-did-all-this-cost) for the full breakdown.

## Part 1 – Your first agent

**Goal:** run an agent on your laptop that calls your Python functions by itself.

### Step 1.1 – Log in to AWS

```bash
aws login
aws sts get-caller-identity    # prints your account and user, so you're logged in
aws configure get region       # this guide uses us-east-1
```

### Step 1.2 – Pick a model

We'll use **Amazon Nova Micro** (`amazon.nova-micro-v1:0`). It's one of the cheapest text models on Bedrock that can use tools:

| | Price (us-east-1, October 2026) |
|---|---|
| Input | $0.035 per 1 million tokens |
| Output | $0.14 per 1 million tokens |

At these prices, thousands of short chats cost about a cent.

> [!TIP]
> **Choosing a cheap model? Test it first.** Check that the model calls your tools correctly and follows a conversation. In testing, Nova Micro did both. Nova Lite costs more and was less reliable at recalling what the user had said.

To see which models your region offers:

```bash
aws bedrock list-foundation-models --region us-east-1 --by-output-modality TEXT \
  --query "modelSummaries[].modelId" --output text
```

### Step 1.3 – Set up the project

```bash
mkdir agentcore-learn && cd agentcore-learn
uv venv && source .venv/bin/activate
uv pip install strands-agents "botocore[crt]"
```

> [!WARNING]
> **Don't skip `botocore[crt]`.** Credentials from `aws login` need it. Without it, you'll get
> `MissingDependencyException: Using the login credential provider requires an additional dependency`.

### Step 1.4 – Write the agent

Create `agent.py`:

```python
from datetime import datetime

from strands import Agent, tool
from strands.models import BedrockModel

@tool
def get_time() -> str:
    """Get the current date and time."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

@tool
def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    return f"{city}: sunny, 25°C"

model = BedrockModel(
    model_id="amazon.nova-micro-v1:0", region_name="us-east-1", max_tokens=512
)

agent = Agent(model=model, tools=[get_time, get_weather], callback_handler=None)

while True:
    prompt = input("You > ")
    if prompt in ("exit", "quit"):
        break
    print(agent(prompt))
```

### Step 1.5 – Run it

```bash
python agent.py
```

```
You > what is the weather in delhi and what time is it?
The current weather in Delhi is sunny and it is 25°C. The current date and time is October 15, 2026, at 13:10.
```

🎉 **You've built an agent.** You never told it to call `get_weather` or `get_time`. It decided to, based on your question.

### What each line does

| Code | What it does |
|---|---|
| `@tool` | Turns a plain function into a tool the LLM can call. |
| The **docstring** (`"""Get the current..."""`) | **This matters.** Strands sends it to the LLM as the tool's description, and the LLM uses it to decide *when* to call the tool. |
| The **type hints** (`city: str`) | Become the tool's input schema, so the LLM knows what arguments to pass. |
| `BedrockModel(...)` | Which LLM to use. `max_tokens` caps the length of each reply. |
| `Agent(model, tools)` | The agent. Calling `agent("question")` runs the full loop. |
| `callback_handler=None` | By default Strands *also* prints the answer as it streams. We print it ourselves, so we turn that off. Without it you'd see every answer twice. |

> [!TIP]
> **Always set `max_tokens` on Bedrock.** If you leave it out, Bedrock reserves the model's *maximum* output size against your quota on every request. That can cause `ThrottlingException` errors even when traffic is low.

> [!TIP]
> **Seeing `<thinking>...</thinking>` in replies?** Nova Micro sometimes includes its reasoning in the text when it uses tools. It's harmless. You could strip it out with a regex, but it's useful to see while you're learning.

## Part 2 – How an agent remembers

**Goal:** understand where conversation memory lives, because it shapes everything from Part 8 on.

Try this in your running agent:

```
You > my favourite city is Pokhara
Nice! Pokhara is beautiful...
You > which city is my favourite?
Your favourite city is Pokhara.
```

It remembered. But here's the surprising part:

> [!IMPORTANT]
> **The LLM itself has no memory.** Every call to the model starts from scratch.

### So who remembers?

The **`agent` object** does:

1. `agent.messages` is a plain Python list holding the whole conversation: your messages, the replies, and every tool call and result.
2. On every `agent(prompt)` call, **the entire list is sent to the model**, along with your new message.
3. The model reads that history and finds "Pokhara" in it.

You can look at the list yourself:

```python
print(agent.messages)
```

Strands manages this list automatically. It also trims it so it doesn't grow forever: by default it keeps a **sliding window of the last 40 messages**. You can change that:

```python
from strands.agent.conversation_manager import SlidingWindowConversationManager

agent = Agent(
    model=model,
    tools=[get_time, get_weather],
    callback_handler=None,
    conversation_manager=SlidingWindowConversationManager(window_size=10),
)
```

> [!TIP]
> **Try it:** set `window_size=4`, chat for a while, and watch the agent forget your favourite city.

### The catch: this memory lives in RAM

`agent.messages` is a variable inside your running Python process. That means:

- ❌ **Program exits or crashes:** the conversation is gone.
- ❌ **Server restarts or you redeploy:** the conversation is gone.
- 💸 The full history is resent on every turn, so long chats use more tokens.

We call this **in-process memory**. Other frameworks behave similarly. In **LangGraph**, for example, you manage the message state yourself and add a *checkpointer* to keep it, but by default it still lives in the process.

Keep this limitation in mind. **In Part 8 we'll move memory out of the process** so it survives all of the above.

## Part 3 – Create an AgentCore project

**Goal:** scaffold a project that AgentCore knows how to deploy.

### Step 3.1 – Install the AgentCore CLI

```bash
npm install -g @aws/agentcore
agentcore --version
```

> [!WARNING]
> **`command not found: agentcore`?** Your Node version manager hasn't picked up the new command yet.
> - **mise:** run `mise reshim`
> - **nvm / fnm:** open a new terminal
> - If you once installed the older Python `bedrock-agentcore-starter-toolkit`, uninstall it (`pip uninstall bedrock-agentcore-starter-toolkit`). Its `agentcore` command can override the new one.

### Step 3.2 – Run the wizard

From your project folder:

```bash
agentcore create
```

The wizard asks a series of questions. Here's what each one means and what to choose.

#### "What would you like to build?"

![AgentCore CLI create wizard asking what to build: Harness or Agent](/media/agentcore-guide/01-what-to-build.png)

| Option | Meaning |
|---|---|
| **Harness** | A *no-code* agent. You describe the model, prompt, and tools in a config file, and AWS runs the loop. |
| **Agent** | *Your own code* (Strands, LangGraph, …) hosted on AgentCore. |

👉 Choose **Agent**, because we're deploying the Strands code we wrote.

#### Agent type

![AgentCore CLI wizard agent type step with Create new agent selected](/media/agentcore-guide/02-agent-type.png)

👉 Choose **Create new agent**. It creates a template project, and we'll replace its code with ours.

#### Build type

![AgentCore CLI wizard build type step: Direct Code Deploy or Container](/media/agentcore-guide/03-build-type.png)

| Option | Meaning |
|---|---|
| **Direct Code Deploy** | Zips your Python code and uploads it. No Docker. |
| **Container** | Builds a Docker image. Use it when you need system packages or full control. |

👉 Choose **Direct Code Deploy**.

#### Protocol

![AgentCore CLI wizard protocol step: HTTP, MCP, A2A or AG-UI](/media/agentcore-guide/04-protocol.png)

The protocol decides **how other programs talk to your deployed agent**:

| Protocol | What it is | Use it when |
|---|---|---|
| **HTTP** | Send `{"prompt": "..."}`, get JSON back | Chatbots, question-and-answer agents |
| **MCP** | Your project becomes a *tool server* that other AI agents call | Offering tools to other agents |
| **A2A** | Agent-to-Agent: whole agents hand tasks to each other | Several agents working together |
| **AG-UI** | Streams live events (words, tool calls) to a web page | Real-time chat UIs |

👉 Choose **HTTP**, then **Strands Agents** as the framework and **Amazon Bedrock** as the model provider.

#### Memory

![AgentCore CLI wizard memory step with None selected](/media/agentcore-guide/05-memory.png)

👉 Choose **None** for now. We'll add memory properly in Part 8, once you understand what it does.

#### Confirm

![AgentCore CLI wizard confirmation screen showing model provider and network mode](/media/agentcore-guide/06-confirm.png)

Two things on this screen often confuse people:

- **"Model Provider: Claude Sonnet"**: this only sets the model in the *template code*, which we're about to replace. The permissions AgentCore gives your agent allow **any** Bedrock model, so Nova Micro will work.
- **"Network: PUBLIC"**: the agent runs on AWS's public network. That does **not** mean anyone can call it, because every call still needs your AWS credentials. Choose **VPC** only if the agent must run inside a private company network.

👉 Press **Enter**.

> [!TIP]
> **Prefer one command to the wizard?** This does the same thing:
> ```bash
> agentcore create --project-name WeatherBot --name MyWeatherAgent --language Python \
>   --framework Strands --model-provider Bedrock --memory none --build CodeZip
> ```

### Step 3.3 – What was created

```
WeatherBot/
├── agentcore/
│   ├── agentcore.json      ← WHAT to deploy (agents, memories, …)
│   ├── aws-targets.json    ← WHERE to deploy (account + region)
│   └── cdk/                ← generated infrastructure code (don't edit)
└── app/MyWeatherAgent/
    ├── main.py             ← the agent code
    ├── pyproject.toml      ← Python packages installed in the cloud
    ├── model/  mcp_client/  skills/   ← template helpers
    └── .venv/              ← the agent's Python environment
```

Remember one rule: **you describe resources in `agentcore.json`, and `agentcore deploy` creates them in AWS.** Adding something to the JSON alone creates nothing.

## Part 4 – Make the agent AgentCore-ready

**Goal:** turn your Part 1 agent into a web service that AgentCore can run.

The generated `main.py` is about **170 lines**: an MCP client, a per-session cache, input validation, streaming. That's useful in production, but too much to learn from. **Replace the whole file** with this:

`app/MyWeatherAgent/main.py`:

```python
from datetime import datetime

from bedrock_agentcore.runtime import BedrockAgentCoreApp
from strands import Agent, tool
from strands.models import BedrockModel

app = BedrockAgentCoreApp()  # (1) wraps the agent in a web server

@tool
def get_time() -> str:
    """Get the current date and time."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

@tool
def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    return f"{city}: sunny, 25°C"

model = BedrockModel(
    model_id="amazon.nova-micro-v1:0", region_name="us-east-1", max_tokens=512
)
agent = Agent(model=model, tools=[get_time, get_weather], callback_handler=None)

@app.entrypoint  # (2) runs once for every request
def invoke(payload):
    return {"result": str(agent(payload["prompt"]))}

if __name__ == "__main__":
    app.run()  # (3) replaces the while/input loop
```

### Spot the difference

Compare it with `agent.py` from Part 1. **The tools, model, and agent are identical.** Only the outer layer changed:

| Part 1 (local script) | Part 4 (AgentCore app) |
|---|---|
| `while True: input()`: **you** run the chat loop | No loop: **AgentCore** sends each request |
| You type in a terminal | Requests arrive as JSON: `{"prompt": "..."}` |
| `print(agent(prompt))` | `return {"result": ...}` goes back as JSON |

`BedrockAgentCoreApp` is a small web server that follows AgentCore's contract:

- `GET /ping` is the health check (AgentCore asks "are you alive?")
- `POST /invocations` calls your `@app.entrypoint` function with the request body
- It listens on port **8080**

### Clean up the template

Delete the helper folders that our `main.py` doesn't use:

```bash
cd app/MyWeatherAgent
rm -rf model mcp_client skills
```

Trim `pyproject.toml` to what we actually use:

```toml
dependencies = [
    "aws-opentelemetry-distro ~= 0.18.0",          # sends traces and logs to CloudWatch
    "bedrock-agentcore[strands-agents] >= 1.18.1", # BedrockAgentCoreApp
    "botocore[crt] >= 1.35.0",                     # for `aws login` credentials
    "strands-agents >= 1.15.0",
]
```

Then refresh the environment:

```bash
uv lock && uv sync
```

> [!WARNING]
> **If you delete the template `README.md`,** also remove the `readme = "README.md"` line from `pyproject.toml`. Otherwise the package build fails.

> [!TIP]
> **Remember:** `app/MyWeatherAgent/pyproject.toml` is what gets installed **in the cloud**. When your agent needs a new package, run `uv add <package>` inside that folder.

> [!TIP]
> **VS Code says `Import "bedrock_agentcore.runtime" could not be resolved`?** It's using the wrong Python environment. Add `.vscode/settings.json` to the project root:
> ```json
> { "python.defaultInterpreterPath": "${workspaceFolder}/app/MyWeatherAgent/.venv/bin/python" }
> ```

## Part 5 – Test locally

**Goal:** run the agent on your laptop exactly as AgentCore would, and *watch* it think.

From the project root:

```bash
agentcore dev
```

This starts your agent locally, reloads it whenever you save `main.py`, and opens the **agent inspector** in your browser. Say hello:

![^AgentCore agent inspector after sending "hey"](/media/agentcore-guide/07-agentcore-dev-inspector.png)

What you're looking at:

- **Chat panel:** the conversation.
- **`431 in / 68 out`:** tokens used. Even "hey" uses 431 input tokens, because **every tool description is sent with every request**.
- **"Local only" and the session ID:** you're talking to the copy on your laptop. The session ID groups the messages of one conversation.
- **Timeline view:** a trace of what happened inside the agent:
  ```
  invoke_agent Strands Agents           1.47s   ← the whole request
  └─ execute_event_loop_cycle           1.47s   ← one think → act cycle
     └─ chat amazon.nova-micro-v1:0     1.45s   ← the model call (nearly all the time)
  ```
- **Resources panel:** `Not deployed` means the agent exists only on your laptop so far.

### Watch the agent use tools

Now ask something that needs both tools:

![^The agent answering with 2 tools used](/media/agentcore-guide/09-tool-call-answer.png)

Click **"2 tools used"**:

![^Tool call details: inputs and outputs](/media/agentcore-guide/10-tool-call-details.png)

This is the agent loop from [the big picture](#the-big-picture), made visible:

1. The LLM read your question and the tool descriptions, then decided to call `get_weather` with `{"city": "Kathmandu"}` and `get_time` with `{}`. **It filled in `city` from your sentence**, even correcting the typo "kathandu".
2. Strands ran your Python functions. Each took about **1 ms**, since they're local functions.
3. The results went back to the LLM.
4. The LLM wrote the final answer.

> [!TIP]
> **Notice the tokens:** the greeting used 431 input tokens and the weather question used 522. The second request also carried the earlier messages. Every turn adds to the input of every later turn.

### Alternative: plain curl

You can also run the server yourself and call it:

```bash
cd app/MyWeatherAgent && .venv/bin/python main.py
```

```bash
curl -X POST localhost:8080/invocations \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"weather in delhi and the time?"}'
```

```json
{"result": "The current weather in Delhi is sunny with a temperature of 25°C. The current date and time is October 15, 2026, at 13:28."}
```

## Part 6 – Deploy to AWS

**Goal:** run the same agent as a managed service in your AWS account.

### Step 6.1 – Preview, then deploy

From the project root:

```bash
agentcore deploy --dry-run     # preview only; changes nothing
agentcore deploy
```

On the **first** deploy, the CLI:

1. Asks for your AWS **account** and **region** (choose `us-east-1`, the same region as the model) and saves them in `aws-targets.json`.
2. Sets up AWS CDK in your account ("bootstrapping"). This happens only once and takes a few minutes.

Then every deploy runs these steps:

![^agentcore deploy in progress](/media/agentcore-guide/11-deploy-progress.png)

| Step | What happens |
|---|---|
| Synthesize CloudFormation | Turns `agentcore.json` into an AWS infrastructure template |
| Publish assets | **Uploads your code zip to S3** |
| Deploy to AWS | Creates or updates the **Runtime**, its **IAM role**, and **CloudWatch logs** |
| Persist deployment state | Saves resource IDs to `agentcore/.cli/deployed-state.json` |

> [!NOTE]
> **Why is "Publish assets" so slow?** Your `main.py` is tiny, but the zip includes **every Python package it depends on**, about **42 MB** (5,500+ files: `botocore`, `opentelemetry`, `strands`, …). On a slow connection, or far from `us-east-1`, the upload can take several minutes. Changing even one line re-uploads the whole zip, so **test with `agentcore dev` and deploy less often.**

### Step 6.2 – Try it in the AWS console

Open **Amazon Bedrock AgentCore → Runtime → WeatherBot_MyWeatherAgent → Test**:

![^Testing the deployed agent in the AWS console](/media/agentcore-guide/12-console-test.png)

Send `{"prompt": "what time is it?"}`, then `{"prompt": "what did i ask you before this"}`. The agent remembers, because the console reuses the **same session**, and AgentCore keeps that session's copy of your program running between requests. That's still **in-process memory** from Part 2: start a new session and it's gone.

### Step 6.3 – Try it from the terminal

```bash
agentcore status                                  # deployed resources + the agent's ARN
agentcore invoke "What's the weather in Delhi?"
agentcore logs                                    # logs from CloudWatch
```

### Versions

Each deploy that changes your code creates a **new runtime version** (1, 2, 3, …). The `DEFAULT` endpoint always points to the newest one, so the agent's address (its ARN) never changes. Older versions are kept, so you can roll back.

## Part 7 – Call your agent over REST

**Goal:** call the deployed agent the way any app or service would.

### The endpoint

```
POST https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/{URL-encoded runtime ARN}/invocations?qualifier=DEFAULT
```

| Header | Purpose |
|---|---|
| `Content-Type: application/json` | The body is JSON |
| `X-Amzn-Bedrock-AgentCore-Runtime-Session-Id` | The conversation ID (**at least 33 characters**) |
| AWS SigV4 signature | Proves who you are (see [Part 10](#authentication-who-can-call-your-agent)) |

Body: `{"prompt": "..."}`. Whatever JSON you send arrives as `payload` in `invoke()`.

### With curl

curl can sign AWS requests itself:

```bash
eval "$(aws configure export-credentials --format env)"     # your aws login credentials → env vars

ARN="arn:aws:bedrock-agentcore:us-east-1:<account-id>:runtime/<runtime-id>"
ENC=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=''))" "$ARN")

curl -X POST "https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/$ENC/invocations?qualifier=DEFAULT" \
  --aws-sigv4 "aws:amz:us-east-1:bedrock-agentcore" \
  --user "$AWS_ACCESS_KEY_ID:$AWS_SECRET_ACCESS_KEY" \
  -H "X-Amz-Security-Token: $AWS_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Amzn-Bedrock-AgentCore-Runtime-Session-Id: rest-test-session-0001-aaaa-bbbb-cccc" \
  -d '{"prompt":"what is the weather in Lalitpur?"}'
```

```json
{"result": "The current weather in Lalitpur is sunny with a temperature of 25°C.\n"}
```

### With Python

boto3 signs the request for you:

```python
import json
import boto3

client = boto3.client("bedrock-agentcore", region_name="us-east-1")
response = client.invoke_agent_runtime(
    agentRuntimeArn="arn:aws:bedrock-agentcore:us-east-1:<account-id>:runtime/<runtime-id>",
    runtimeSessionId="rest-test-session-0001-aaaa-bbbb-cccc",
    payload=json.dumps({"prompt": "what is the weather in Lalitpur?"}),
)
print(json.loads(response["response"].read()))
```

## Part 8 – Short-term memory with AgentCore Memory

**Goal:** move conversation memory **out of the process**, so it survives crashes, restarts, and redeploys.

### The problem, again

Recall Part 2: `agent.messages` lives in RAM. On AgentCore that means a conversation is lost when:

- the session sits idle and AgentCore shuts it down,
- you redeploy, or
- the process crashes.

### The solution: AgentCore Memory

**AgentCore Memory** is an AWS-managed store. Your agent **saves every message there** and **loads the history back** at the start of each request.

```
In-process (Parts 1–7):   request → [ process: agent.messages ] → reply
                                         💥 crash → history lost

AgentCore Memory:         request → [ process ] ⇄ [ AgentCore Memory ] → reply
                                         💥 crash → new process reloads the history
```

| | In-process memory | AgentCore Memory |
|---|---|---|
| Where it's stored | RAM of the running process | AWS-managed storage |
| **Crash, restart, or redeploy** | ❌ lost | ✅ kept |
| Shared between local and deployed copies | ❌ | ✅ |
| Setup | none | a memory resource plus a few lines of code |

### Step 8.1 – Add a memory resource

```bash
agentcore add memory --name WeatherMemory
```

This **only edits `agentcore.json`**:

```json
"memories": [
  { "name": "WeatherMemory", "eventExpiryDuration": 30, "strategies": [] }
]
```

- `"strategies": []` means **short-term only**: raw messages, grouped by session.
- `eventExpiryDuration: 30` means messages are deleted after 30 days.

Nothing exists in AWS yet. Create it:

```bash
agentcore deploy
```

### Step 8.2 – Connect the agent to the memory

How does your code find the memory? **The CLI tells it.** After deploy, both `agentcore dev` (locally) and AgentCore Runtime (in AWS) set an environment variable named after the memory:

```
WeatherMemory  →  MEMORY_WEATHERMEMORY_ID=WeatherBot_WeatherMemory-xxxxxxxx
```

You don't put this in a `.env` file. The CLI keeps it in sync for you.

Update `main.py`:

```python
import os
from datetime import datetime

from bedrock_agentcore.memory.integrations.strands.config import AgentCoreMemoryConfig
from bedrock_agentcore.memory.integrations.strands.session_manager import (
    AgentCoreMemorySessionManager,
)
from bedrock_agentcore.runtime import BedrockAgentCoreApp
from strands import Agent, tool
from strands.models import BedrockModel

app = BedrockAgentCoreApp()

# Set by agentcore dev / AgentCore Runtime from the deployed WeatherMemory
MEMORY_ID = os.getenv("MEMORY_WEATHERMEMORY_ID")

@tool
def get_time() -> str:
    """Get the current date and time."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

@tool
def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    return f"{city}: sunny, 25°C"

model = BedrockModel(
    model_id="amazon.nova-micro-v1:0", region_name="us-east-1", max_tokens=512
)

@app.entrypoint
def invoke(payload, context):
    session_manager = AgentCoreMemorySessionManager(
        AgentCoreMemoryConfig(
            memory_id=MEMORY_ID,
            session_id=context.session_id,
            actor_id="user-1",
        ),
        region_name="us-east-1",
    )
    agent = Agent(
        model=model,
        tools=[get_time, get_weather],
        callback_handler=None,
        session_manager=session_manager,
    )
    return {"result": str(agent(payload["prompt"]))}

if __name__ == "__main__":
    app.run()
```

### What changed?

| Change | Why |
|---|---|
| `invoke(payload, context)` | AgentCore passes a second argument, `context`, carrying request details. `context.session_id` identifies the conversation. |
| `session_id=context.session_id` | Messages are stored per conversation. The same ID gives the same history. |
| `actor_id="user-1"` | Messages are also grouped per user. Everyone is "user-1" for now ([Part 10](#authentication-who-can-call-your-agent) explains how to use real users). |
| **A new `Agent` for every request** | Nothing is kept in RAM. The session manager **loads** the history from AgentCore Memory when the agent is created and **saves** every new message. |

> [!TIP]
> **A bonus fix.** A Strands `Agent` handles **one request at a time**. With one shared `agent` (Part 4), a stuck request blocks every later one with *"Agent is already processing a request"*. Creating a fresh agent per request removes that problem.

### Step 8.3 – Prove that it survives a restart

1. Run `agentcore dev` (restart it if it was already running, so it picks up the memory ID).
2. Ask: **"What is the weather in Pokhara?"**
3. **Stop the server** with `Ctrl+C` and start it again. In-process memory is now completely gone.
4. In the **same session**, ask: **"Which city did I ask about earlier?"**

```
Server 1:  "What is the weather in Pokhara?"     → "...sunny with a temperature of 25°C."
           ── server stopped and restarted ──
Server 2:  "Which city did I ask about earlier?" → "Earlier, you asked about the weather in Pokhara."
```

The second server had never seen the first question, so **it loaded it from AgentCore Memory.** ✅

Now click 🗑 in the inspector to start a **new session** and ask again. It won't know. **Short-term memory is per session.**

### Step 8.4 – Look inside the memory

The AWS CLI lets you see exactly what's stored:

```bash
# Which conversations exist for this user?
aws bedrock-agentcore list-sessions --region us-east-1 \
  --memory-id <memory-id> --actor-id user-1

# Everything stored in one conversation
aws bedrock-agentcore list-events --region us-east-1 \
  --memory-id <memory-id> --actor-id user-1 --session-id <session-id>
```

Formatted for readability, a session looks like this:

```
USER      | what's the weather in Pokhara?
ASSISTANT | [tool call] get_weather {"city": "Pokhara"}
USER      | [tool result] [{"text": "Pokhara: sunny, 25°C"}]
ASSISTANT | The current weather in Pokhara is sunny, with a temperature of 25°C.
```

Tool calls and results are stored too. In the model's message format, tool results are sent back on the **USER** side.

> [!TIP]
> **Where *not* to look:** the AWS console's Memory page shows counts (for example "Create events: 19"), not message contents. The inspector's **Memories** tab shows **long-term** records only. For short-term messages, use the CLI.

## Part 9 – Long-term memory

**Goal:** have the agent remember **you**, not just one conversation.

### Short-term vs. long-term

| | Short-term (Part 8) | Long-term |
|---|---|---|
| Stores | Raw messages | **Extracted knowledge**: facts, preferences, summaries |
| Grouped by | Session (one conversation) | **User** (`actor_id`) |
| A brand-new conversation remembers? | ❌ | ✅ |
| Available | Immediately | After background processing (about 1–2 minutes) |

### How it works

```
conversation → saved as short-term events
                     │
                     ▼  AgentCore runs a model in the background
             extracted records:  "lives in Kathmandu", "prefers Fahrenheit"
             stored per user in namespaces:  /users/user-1/facts, /users/user-1/preferences
                     │
                     ▼
new conversation → agent searches those namespaces → relevant records added to its context
```

The extraction rules are called **strategies**:

| Strategy | Extracts | Example |
|---|---|---|
| `SEMANTIC` | Facts | "User lives in Kathmandu" |
| `USER_PREFERENCE` | Preferences | "Prefers Fahrenheit" |
| `SUMMARIZATION` | Summaries of each session | "Asked about weather in Pokhara and Delhi" |
| `EPISODIC` | Records of past interactions and their outcomes | "Planned a trip last week" |

### Step 9.1 – Add strategies

In `agentcore/agentcore.json`:

```json
"memories": [
  {
    "name": "WeatherMemory",
    "eventExpiryDuration": 30,
    "strategies": [
      { "type": "USER_PREFERENCE", "namespaceTemplates": ["/users/{actorId}/preferences"] },
      { "type": "SEMANTIC",        "namespaceTemplates": ["/users/{actorId}/facts"] }
    ]
  }
]
```

`{actorId}` is replaced with each user's ID, so every user gets their own records.

```bash
agentcore deploy
```

> [!TIP]
> **Your existing memory is updated, not replaced.** Only changing a memory's `name` (or its encryption key) forces AWS to recreate it. The memory ID and your stored conversations stay.

### Step 9.2 – Let the agent search long-term records

In `main.py`, import `RetrievalConfig` and add a `retrieval_config`:

```python
from bedrock_agentcore.memory.integrations.strands.config import (
    AgentCoreMemoryConfig,
    RetrievalConfig,
)
```

```python
@app.entrypoint
def invoke(payload, context):
    actor_id = "user-1"
    session_manager = AgentCoreMemorySessionManager(
        AgentCoreMemoryConfig(
            memory_id=MEMORY_ID,
            session_id=context.session_id,
            actor_id=actor_id,
            # Long-term: search these namespaces and add relevant records to the agent's context
            retrieval_config={
                f"/users/{actor_id}/preferences": RetrievalConfig(top_k=3, relevance_score=0.2),
                f"/users/{actor_id}/facts": RetrievalConfig(top_k=3, relevance_score=0.2),
            },
        ),
        region_name="us-east-1",
    )
    agent = Agent(
        model=model,
        tools=[get_time, get_weather],
        callback_handler=None,
        session_manager=session_manager,
    )
    return {"result": str(agent(payload["prompt"]))}
```

| Setting | Meaning |
|---|---|
| `top_k=3` | At most 3 records from each namespace |
| `relevance_score=0.2` | Minimum relevance (0–1) for a record to be included. Real records often score only **0.35–0.40**, so a threshold of 0.5 would silently drop them all. |

### Step 9.3 – See what long-term memory looks like

Tell the agent something about yourself:

> *"I like Kathmandu's weather, and I love when you give me the temperature in Fahrenheit."*

About **a minute later**, AgentCore has extracted long-term records from that one message. In the inspector, open **Memories**, choose **WeatherMemory**, choose a **Strategy**, set **ActorID** to `user-1`, and click **List**:

![^Long-term memory records in the inspector](/media/agentcore-guide/13-long-term-memory-records.png)

The **USER_PREFERENCE** strategy turned your sentence into two structured preferences:

```json
{"context": "Checking local weather conditions",
 "preference": "Likes Kathmandu's weather",
 "categories": ["weather", "Kathmandu"]}

{"context": "Weather reporting or temperature display",
 "preference": "Temperature should be given in Fahrenheit",
 "categories": ["weather", "temperature", "units"]}
```

The **SEMANTIC** strategy stored the same message as plain facts:

```
The user likes Kathmandu's weather.
The user prefers temperatures to be given in Fahrenheit.
```

Click a record to see its details:

| Field | Example | Meaning |
|---|---|---|
| **Strategy** | `WeatherMemory_Userpreference-…` | Which strategy created it |
| **Namespace** | `/users/user-1/preferences/` | Where it's stored: per user, per strategy |
| **Created** | `04:42:50 PM` | About 70 seconds after the message was sent |

> [!WARNING]
> **"No memory records found"?** Check two things. First, **ActorID** must match the `actor_id` in your code (`user-1`, not the default `default-user`). Second, give extraction **1–2 minutes** before you click **List**.

> [!TIP]
> **Fact extraction is eager.** SEMANTIC stores anything that looks like a fact, including incidental ones such as *"The user asked about the weather in Lalitpur."* Those can compete with the facts you care about later.

### Step 9.4 – Test across conversations

1. **Conversation A:** *"I live in Kathmandu and I prefer temperatures in Fahrenheit."*
2. **Wait 1–2 minutes** for the background extraction.
3. Start a **new conversation** (🗑 in the inspector, or a new session ID).
4. **Conversation B:** *"What's the weather where I live?"*

**What to expect:** the agent calls `get_weather("Kathmandu")`, even though conversation B never mentioned Kathmandu.

See the extracted records:

```bash
aws bedrock-agentcore list-memory-records --region us-east-1 \
  --memory-id <memory-id> --namespace /users/user-1/preferences
```

> [!WARNING]
> Use the **full namespace** (`/users/user-1/preferences` or `/users/user-1/facts`). A partial path such as `/users/` or `/users/user-1/` returns nothing.

Or choose a strategy in the inspector's **Memories** tab.

## Part 10 – Authentication, identity, and cost

### Authentication: who can call your agent?

AgentCore calls this **inbound authorization**. A runtime uses one of two modes:

| Mode | Callers send | Good for |
|---|---|---|
| **`AWS_IAM`** (default) | Requests **signed with AWS credentials** (SigV4), which curl, boto3, and the CLI do for you | You, scripts, other AWS services |
| **`CUSTOM_JWT`** | A **login token** (`Authorization: Bearer …`) from an identity provider such as Auth0, Cognito, Okta, or Entra ID | Websites and mobile apps with real users |

A browser can't safely hold AWS keys, so public apps use `CUSTOM_JWT`. Here's the flow for a website `example.com` that uses Auth0:

```
 Browser (example.com)      Auth0                     AgentCore Runtime          main.py
        │                     │                              │                      │
 1. Sign in ─────────────────►│                              │                      │
 2. email + password ────────►│ checks the user              │                      │
 3. ◄──────── token (JWT) ────│ signed by Auth0              │                      │
        │                     │                              │                      │
 4. POST /invocations ───────────────────────────────────────►                      │
    Authorization: Bearer <token>                            │                      │
        │                     │◄── fetch public keys ────────│ 5. verify signature, │
        │                     │                              │    expiry, audience  │
        │                     │                              │ ❌ invalid → 401     │
        │                     │                              │ ✅ valid ───────────►│ 6. invoke()
 7. ◄───────────────────────────────────── reply ◄──────────────────────────────────│
```

In other words, **AgentCore Runtime acts as your backend, with token verification built in.** To enable it, add to the runtime in `agentcore.json`:

```json
"authorizerType": "CUSTOM_JWT",
"authorizerConfiguration": {
  "customJwtAuthorizer": {
    "discoveryUrl": "https://<your-tenant>.auth0.com/.well-known/openid-configuration",
    "allowedAudience": ["<your-api-identifier>"]
  }
}
```

After `agentcore deploy`, AWS-signed requests are rejected and only valid tokens are accepted. Test with `agentcore invoke --bearer-token "$TOKEN" "..."`.

> [!TIP]
> **Per-user memory:** each token identifies the user (its `sub` claim). Using that as the `actor_id` instead of `"user-1"` gives every user their own long-term memory.

### AgentCore Identity

**AgentCore Identity** handles identity in three directions:

```
              (1) INBOUND                       (3) OUTBOUND
 User/App ─────────────────► YOUR AGENT ─────────────────► Google, GitHub, Slack, APIs…
 "who may call me?"              │          "how do I log in to other services?"
                         (2) WORKLOAD ID
                         "who am I?"
```

1. **Inbound:** the IAM / JWT check above.
2. **Workload identity:** your agent's own ID, created automatically on deploy.
3. **Outbound:** credentials for calling *other* services, kept in a secure **token vault**:
   - **API keys:** `agentcore add credential --name MyApiKey --api-key ...`, then in code `@requires_api_key(provider_name="MyApiKey")`. The key never appears in your code or environment variables.
   - **OAuth on behalf of a user**, such as "read *my* Google Calendar": the first time, the user approves access through a login link. After that, the token is stored per user and given to your code with `@requires_access_token(...)`.

### Cost: what did all this cost?

Here's the total for building and testing everything in this guide, using us-east-1 prices from October 2026:

| Item | Usage | Price | Cost |
|---|---|---|---|
| Nova Micro | 62 calls, ~49K input / 4K output tokens | $0.035 / $0.14 per 1M | **$0.002** |
| Runtime CPU | 9 deployed requests, ~2 s each | $0.1276 per vCPU-hour | ~$0.001 |
| Runtime RAM | 2 sessions until idle shutdown | $0.0169 per GB-hour | ~$0.004 |
| Memory, short-term | ~50 events | $0 per event (current price list) | $0 |
| Memory, long-term | records stored + retrievals | $0.75 per 1K records/month; $0.50 per 1K retrievals | ~$0.001 |
| S3 (deploy zips) | 2 × 42 MB | ~$0.023 per GB-month | ~$0.002/month |
| **Total** | | | **≈ $0.01** |

What costs money:

- **Bedrock** charges per token.
- **Runtime** charges for CPU *only while working*, and for RAM while a session is alive. **Idle costs nothing.**
- **Long-term memory** charges for stored records and searches.
- **Leaving everything deployed while idle** costs fractions of a cent per month.

> [!TIP]
> Billing data appears in **Cost Explorer about 24 hours later**. AgentCore tags your resources with `agentcore:project-name`. Activate that tag under **Billing → Cost allocation tags** to see this project's costs separately.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Every answer prints twice | Strands streams the answer by default, and you `print()` it too | `Agent(..., callback_handler=None)` |
| `MissingDependencyException ... botocore[crt]` | `aws login` credentials need the CRT extra | Install `botocore[crt]` and add it to your dependencies |
| `ThrottlingException` at low traffic | `max_tokens` not set | Set `max_tokens` on `BedrockModel` |
| `agentcore: command not found` | Version manager hasn't picked up the new command | `mise reshim`, or open a new terminal |
| VS Code: import could not be resolved | Wrong Python interpreter | Point it at `app/MyWeatherAgent/.venv/bin/python` |
| Python environment broken after moving the folder | Virtual environments store absolute paths | Delete `.venv` and run `uv sync` |
| Build fails after deleting `README.md` | `pyproject.toml` still references it | Remove the `readme = ...` line |
| `Agent is already processing a request` | One shared `Agent` with a request still running (or stuck) | Restart `agentcore dev`. Better: create the agent per request (Part 8) |
| Agent says it's "still processing" but nothing is wrong | Text you pasted earlier (such as an error log) is in the shared history, and the model believes it | Start a fresh session or restart. **The model only knows what's in its messages.** |
| Memory not created after `agentcore add memory` | `add` only edits `agentcore.json` | Run `agentcore deploy` |
| `agentcore dev` doesn't create the memory | `aws-targets.json` is empty (no account or region yet) | Run `agentcore deploy` once to set the target |
| Observability shows "No sessions" | Traces aren't reaching CloudWatch | Check that tracing is enabled for the runtime |
| "Publish assets" takes minutes | The ~42 MB code zip is uploaded on every change | Test locally, deploy less often |

### "Agent is already processing a request"

![^ConcurrencyException in the agent inspector](/media/agentcore-guide/08-concurrency-error.png)

A Strands `Agent` processes **one request at a time**. In Part 4 we created a single `agent` when the program started, so if one request hangs, every later request is rejected immediately. Restart the dev server to clear it. The per-request agent in Part 8 avoids the problem entirely.

## Cleaning up

Everything here costs almost nothing while idle, but when you're done:

```bash
agentcore remove all
agentcore deploy        # nothing left in the config, so everything is deleted from AWS
```

## Final project structure

```
agentcore-learn/
├── agentcore/
│   ├── agentcore.json         ← what to deploy (runtime + memory + strategies)
│   ├── aws-targets.json       ← where to deploy (account + region)
│   ├── .cli/deployed-state.json  ← IDs of what's deployed (managed by the CLI)
│   └── cdk/                   ← generated infrastructure (don't edit)
├── app/MyWeatherAgent/
│   ├── main.py                ← your agent
│   ├── pyproject.toml         ← packages installed in the cloud
│   └── .venv/
└── .vscode/settings.json      ← points VS Code at the right Python
```

Your everyday loop:

```
edit main.py  →  agentcore dev  →  agentcore deploy  →  agentcore invoke
```

## What's next

- **Real tools:** replace the hard-coded weather with a real weather API (keep the key in AgentCore Identity).
- **Real users:** add Cognito or Auth0 with `CUSTOM_JWT`, and use each user's ID as the `actor_id`.
- **AgentCore Gateway:** turn existing APIs into tools your agent can use.
- **Studying for the AWS ML Engineer exam?** AgentCore is now in scope for MLA-C02. Here's [what changed from MLA-C01 to MLA-C02](/blog/mla-c01-to-mla-c02).

## Appendix – Start for free with Groq

No AWS account yet? You can learn the Strands basics (Parts 1–2) with Groq's free tier, then switch to Bedrock later by changing **one line**.

```bash
uv pip install strands-agents openai python-dotenv
echo "GROQ_API_KEY=gsk_your_key_here" > .env     # free key: https://console.groq.com/keys
```

```python
import os
from datetime import datetime

from dotenv import load_dotenv
from strands import Agent, tool
from strands.models.openai import OpenAIModel

load_dotenv()

@tool
def get_time() -> str:
    """Get the current date and time."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

@tool
def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    return f"{city}: sunny, 25°C"

model = OpenAIModel(
    model_id="openai/gpt-oss-20b",
    client_args={
        "base_url": "https://api.groq.com/openai/v1",
        "api_key": os.getenv("GROQ_API_KEY"),
    },
    params={"extra_body": {"include_reasoning": False}},
)

agent = Agent(model=model, tools=[get_time, get_weather], callback_handler=None)

while True:
    prompt = input("You > ")
    if prompt in ("exit", "quit"):
        break
    print(agent(prompt))
```

Things to know about Groq:

- **Groq's API is OpenAI-compatible**, so we use Strands' `OpenAIModel` pointed at Groq's URL.
- **`gpt-oss-20b` is a reasoning model.** It "thinks out loud". `include_reasoning: False` hides that thinking. Without it, the reasoning text appears in replies and multi-turn chats fail with `reasoningContent is not supported in multi-turn conversations`.
- **Provider-specific options go inside `extra_body`.** Passing them at the top level fails with `TypeError: unexpected keyword argument`.
- **Model names change.** If you get `404 model_not_found`, list what's currently available:
  ```python
  from openai import OpenAI
  client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key="gsk_...")
  print([m.id for m in client.models.list().data])
  ```

When you're ready for AWS, replace `OpenAIModel(...)` with `BedrockModel(...)` from Part 1. Everything else stays the same.
