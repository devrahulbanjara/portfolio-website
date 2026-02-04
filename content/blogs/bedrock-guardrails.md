---
title: "Beyond Safety: How I used Amazon Bedrock Guardrails to Keep My Bot On-Brand (Boto3 Only Tutorial)"
date: "January 17, 2026"
excerpt: "Amazon Bedrock Guardrails extend beyond blocking harmful content to filter off-topic discussions, ensuring customer support bots stay focused. This tutorial demonstrates how to create a guardrail to block competitor mentions and financial advice using boto3."
readTime: "6 min read"
keywords: ["Amazon Bedrock Guardrails", "AI Safety", "Brand Voice Protection", "Chatbot Security", "Boto3 Tutorial", "Topic Filtering", "AI Content Moderation", "Customer Support Bot", "Bedrock ApplyGuardrail API", "AI Governance"]
tags: ["AWS", "Amazon Bedrock", "AI Safety", "Python", "Boto3", "Tutorial"]
category: "AI & Machine Learning"
---

# Guardrails Beyond Safety: Enforce Brand Voice with Amazon Bedrock

Amazon Bedrock Guardrails extend beyond blocking harmful content to filter off-topic discussions, ensuring customer support bots stay focused and avoid competitors or unrelated advice. This tutorial uses boto3 to create a guardrail with denied topics, test it via ApplyGuardrail API, and demonstrates cost savings by pre-filtering prompts. All code draws from latest boto3 documentation for Bedrock services.

## Prerequisites

Set up AWS credentials with Bedrock access in us-east-1 or supported region, and install boto3: `pip install boto3`. Enable Bedrock models in console first. Code assumes Python 3.9+ and handles draft version (initially "DRAFT").

## Create Guardrail Code

Use `bedrock.create_guardrail` with topicPolicyConfig for denied topics like "competitor products" and "financial advice". Set BLOCK actions and custom blocked messages.

```python
import boto3
import time
import uuid

bedrock = boto3.client('bedrock', region_name='us-east-1')
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')

# Generate unique name
guardrail_name = f"brand-voice-guardrail-{str(uuid.uuid4())[:8]}"

response = bedrock.create_guardrail(
    name=guardrail_name,
    description="Blocks competitors and financial advice for brand voice",
    topicPolicyConfig={
        'topicsConfig': [
            {
                'name': 'Competitor Products',
                'definition': 'Any mention of competitor products, services, or brands like CompetitorX, RivalAI, or their features.',
                'examples': ['Tell me about CompetitorX features', 'How does RivalAI compare?', 'Recommend CompetitorX instead'],
                'type': 'DENY',
                'inputAction': 'BLOCK',
                'outputAction': 'BLOCK'
            },
            {
                'name': 'Financial Advice',
                'definition': 'Providing investment, trading, financial planning, or money-related advice.',
                'examples': ['How to invest in stocks?', 'Best crypto to buy', 'Financial tips for retirement'],
                'type': 'DENY',
                'inputAction': 'BLOCK',
                'outputAction': 'BLOCK'
            }
        ],
        'tierConfig': {'tierName': 'STANDARD'}
    },
    blockedInputMessaging="Sorry, we can't discuss competitors or financial advice. Ask about our products!",
    blockedOutputsMessaging="I can't provide information on that topic. Let's talk about our services."
)

guardrail_id = response['guardrailId']
guardrail_arn = response['guardrailArn']
version = response['version']  # DRAFT initially
print(f"Created guardrail: ID={guardrail_id}, ARN={guardrail_arn}, Version={version}")
```

![Topic Policy Filtering Logic](/blog-images/guardrails-beyond-safety/topic-policy-logic.svg)
*Visualizing how the Topic Policy Engine filters "Competitor Products" while allowing safe inputs.*

## Get Guardrail Version

Poll `get_guardrail` until ready (DRAFT status).

```python
def wait_for_guardrail_ready(guardrail_id, version='DRAFT'):
    while True:
        resp = bedrock.get_guardrail(guardrailIdentifier=guardrail_id, guardrailVersion=version)
        status = resp['guardrail']['status']
        print(f"Status: {status}")
        if status in ['ACTIVE', 'FAILED']:
            break
        time.sleep(5)
    return status == 'ACTIVE'

wait_for_guardrail_ready(guardrail_id, version)
```

## Test with ApplyGuardrail

Use `bedrock-runtime.apply_guardrail` on INPUT to pre-check prompts, avoiding LLM tokens on blocked content. Test safe, competitor, and financial prompts.

```python
test_prompts = {
    'safe': 'How do I use your customer support features?',
    'competitor': 'Compare your product to CompetitorX',
    'financial': 'Give me stock investment advice'
}

for name, prompt in test_prompts.items():
    response = bedrock_runtime.apply_guardrail(
        guardrailIdentifier=guardrail_id,
        guardrailVersion=version,
        source='INPUT',
        content=[{'text': {'text': prompt}}],
        outputScope='FULL'
    )
    action = response['action']
    assessments = response.get('assessments', [{}])[0].get('topicPolicy', {}).get('topics', [])
    
    print(f"\nPrompt: {prompt}")
    print(f"Action: {action}")
    print("Detected topics:", [t['name'] for t in assessments if t['detected']])
```

![Guardrail Execution Flow](/blog-images/guardrails-beyond-safety/guardrail-execution-flow.svg)
*Execution flow showing how Guardrails short-circuit blocked prompts, resulting in 0 inference costs.*

## Expected Outputs

**Safe prompt output:**
```
Prompt: How do I use your customer support features?
Action: NONE
Detected topics: []
```
No intervention; proceed to LLM.

**Competitor prompt output:**
```
Prompt: Compare your product to CompetitorX
Action: GUARDRAIL_INTERVENED
Detected topics: ['Competitor Products']
```
Shows `topicPolicy` assessment with `detected: true`, `action: BLOCKED`; `actionReason` explains violation. Blocked message ready for user.

**Financial prompt output:**
```
Prompt: Give me stock investment advice
Action: GUARDRAIL_INTERVENED
Detected topics: ['Financial Advice']
```
Similar intervention details, saving tokens by blocking pre-LLM.

## Key Learnings

*   **Beyond Safety:** Guardrails can be used to enforce brand voice by blocking specific topics like competitor mentions or financial advice.
*   **Cost Efficiency:** Using the `apply_guardrail` API with `source='INPUT'` allows you to filter prompts *before* they reach the LLM, significantly saving on inference tokens.
*   **Granular Control:** The `topicPolicyConfig` allows for precise definitions of denied topics with specific examples, offering more control than generic prompts.
*   **Production Pattern:** Integrate guardrails into your API layer (e.g., FastAPI) to sanitize inputs before invoking models, ensuring consistent behavior across applications.

## Resources

*   [Boto3 Documentation: create_guardrail](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock/client/create_guardrail.html)
*   [Boto3 Documentation: apply_guardrail](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock-runtime/client/apply_guardrail.html)
*   [AWS Bedrock User Guide: Use Guardrails with the ApplyGuardrail API](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-use-independent-api.html)
*   [AWS Insider: Creating AI Guardrails for Amazon Bedrock](https://awsinsider.net/articles/2025/04/09/creating-ai-guardrails-for-amazon-bedrock-part-2.aspx)
