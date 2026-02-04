---
title: "Scaling Reasoning Models on Amazon Bedrock: Reducing Inference Latency with Chain-of-Draft Prompting"
date: "September 25, 2025"
excerpt: "High-quality reasoning with Chain-of-Thought often comes at an unsustainable token cost in production. This post introduces Chain-of-Draft prompting on Amazon Bedrock—a simple constraint-based technique that preserves reasoning accuracy while cutting token usage, latency, and inference costs at scale."
readTime: "8 min read"
keywords: ["Chain-of-Draft Prompting", "Chain-of-Thought", "Amazon Bedrock Cost Optimization", "LLM Inference Optimization", "Token Usage Reduction", "AI Cost Reduction", "Prompt Engineering", "Production LLM", "Bedrock Converse API", "AI Efficiency"]
tags: ["AWS", "Amazon Bedrock", "AI", "Cost Optimization", "Prompt Engineering", "Tutorial"]
category: "AI & Machine Learning"
---

When I began creating production LLM apps, the same problem continued to occur regularly, i.e. my prompts performed well in testing but were extremely costly in production. Chain-of-Thought prompting provided the accuracy that I required, though the use of the tokens was burning my pocket.

Unless you are on a different cloud than AWS, you have likely bumped into this problem as well. The most common suggestion is to use CoT to think more logically, though nobody speaks about what to do when you have thousands of requests per day. That's when Chain-of-Draft (CoD) changed everything for me.


## The Problem with Verbose Reasoning

Chain-of-Thought prompting involves prompts that require that the models think step-by-step. It works but it generates a lot of tokens. Let us give an example of a basic math question:

**Question:** A store has 156 books. They sell 47 in the morning and 32 in the afternoon. How many books are now remaining ?

**CoT Response:** "Let's solve this step by step. The store starts with 156 books. In the morning, they sell 47 books, so we subtract: `156 - 47 = 109` books remaining after morning sales. Then in the afternoon, they sell 32 more books. We subtract again: `109 - 32 = 77` books. Therefore, 77 books remain in the store."

That's roughly 65 tokens for a simple direct calculation. Now if you are taking your application at scale, then this kind of requests come 1000s per day, burning $$$ for almost no extra benefit.

## Enter Chain-of-Draft

![Chain-of-Thought vs Chain-of-Draft Comparison](/blog-images/chain-of-draft-prompting/cot_vs_cod_1.png)

Chain-of-Draft solves this litation by liiting each reasoning step to five words or even less than that. The model still reasons through the problem, but without the in depth explanations.

**CoD Response:** "Start: 156. Sold morning: 47. Remaining: 109. Sold afternoon: 32. Final: 77."

Same logic, similar accuracy, but only about 15 tokens. **Reduction in 75% token usage** -> **Reduction in cost**

The techique is based on the study that the reasoning chains contains highly redundant outputs. When you force brevity, you force the model into concentrating on necessary logical entities as opposed to the ability to create linguistically.

---

## Implementation: The Basics

Here's a simple implementation using the Bedrock Converse API:

```python
import boto3

bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

def chain_of_draft_query(question, model_id):
    prompt = f"""{question}

Think step by step to solve this, but keep each step to 5 words maximum. 
Return your final answer after '###'."""

    response = bedrock.converse(
        modelId=model_id,
        messages=[{
            "role": "user",
            "content": [{"text": prompt}]
        }],
        inferenceConfig={"maxTokens": 500, "temperature": 0.7}
    )
    
    return response["output"]["message"]["content"][0]["text"]
```

Its trick lies in the limitation: **remember not to spend more than 5 words on each step.** The given basic instruction alters fundamentally the way of producing the answer from the model.

---

## Real-World Testing

I compared CoD with the standard CoT on a logistics problem: optimization of the level of stocks held in the warehouse due to the seasonal demand curves. This demanded this model to follow numerous variables and perform successive calculations.

**Results with `us.anthropic.claude-3-5-sonnet-20240620-v1:0`**

![CoT vs CoD Performance Comparison](/blog-images/chain-of-draft-prompting/cod-performance-comparison.svg)

Eventhough same response, using CoD reasoning reduced tokens by 72% and cut latency by 57%, with no loss in accuracy.

## When CoD Works Best

Through experimentation, I've found CoD works better in specific scenarios when there is Multi-step math problems, unit conversions, financial calculations. The brevity actually improves clarity when dealing with numbers. Similarly other cases like processing records, applying business rules, filtering logic. The compact format of COD makes it easier to parse programmatically.

Here's a data validation example:

```python
validation_prompt = """Check if this transaction is valid:
Amount: $5,200
Daily limit: $5,000
Previous today: $1,800

Think step by step (5 words max per step).
Return VALID or INVALID after '###'."""
```

**CoD Output:**
```
Previous + Amount: 7,000
Exceeds daily limit: 5,000
Limit check: INVALID
### INVALID
```

## When to Avoid CoD

Like every other concept, COD isn't the technology with no limitations. I stick to traditional CoT or even zero-shot prompting I have to understand the reasoning, not just get an answer. In cases like, Customer support scenarios, educational content, or debugging assistance all benefit from detailed explanations. Similarly creative tasks like writing, brainstorming and open ended idea generation processes. Audit trails and regulatory requirements often demand detailed reasoning. Five-word steps don't provide sufficient documentation.

## Practical Optimization Strategy

Here's my current approach for production applications which I think is considered a good practice:

```python
def adaptive_reasoning(question, context):
    # High-volume, structured queries
    if context == "calculation" or context == "validation":
        return chain_of_draft_query(question)
    
    # User-facing explanations
    elif context == "support":
        return chain_of_thought_query(question)
    
    # Simple lookups
    else:
        return direct_query(question)
```

This hybrid approach lets me optimize costs where it matters while maintaining quality where explanation is valuable.

## Measuring Impact

Reduction in output tokens links directly with reduced bills in the month end. At a rate of 100,000 calls of inference a month with an average 400 token per CoT response, a switching cost to CoD (average 120 tokens) will save you approximately 28 million tokens per month.

With Bedrock models such as Claude Sonnet, which are currently priced at the lower side of the budget, that is a significant optimization of the budget with no performance compromise.

![Detailed CoT vs CoD Comparison](/blog-images/chain-of-draft-prompting/cot_vs_cod_2.png)

## Conclusion

Chain-of-Draft is not about replacing Chain-of-Thoughts prompting or any other classic techniques. It is all about reducing the extra output thinking token usage when we significantly do not need our model to produce such elaborated thinking, and our task can benefit even with less thinking. Choosing between CoD or CoT completely depends on the usecase, and both can be used with certain if-else conditions as illustrated in the example above.

**Resources**:
*   [Chain of Draft: Thinking Faster by Writing Less](https://arxiv.org/abs/2502.18600)