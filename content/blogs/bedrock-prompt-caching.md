---
title: "The FinOps of GenAI: Reduce Bedrock Latency and Cost with Prompt Caching"
date: "November 5, 2025"
excerpt: "Learn how to cut GenAI costs by 90% and reduce latency by 59% using Amazon Bedrock Prompt Caching with real benchmarks and implementation code."
readTime: "12 min read"
---

# The FinOps of GenAI: Reduce Bedrock Latency and Cost with Prompt Caching

When talking about Generative AI, most of the discussions revolve around two main questions: **How fast is the response?** and **How much does it cost?**

The more applications of AI are in the production phase, rather than just experiments of concept, the more important such questions become. A chatbot that takes 8 seconds to respond loses users. A cost API that costs **50 USD/1,000 requests** is economically not sustainable.

**Amazon Bedrock Prompt Caching** solves the two issues at the same time. Within a test I conducted, the addition of some lines of code **decreased latency by 59%** and **reduced expenses by 90 %** on the same workloads.

In this post, I have discussed the caching mechanism, when one should you use it and also give the actual benchmark data to give you an idea of how much you may save using it in your own context.

---

## The Problem: Redundant Processing Is Expensive

The majority of GenAI applications send the same content repeatedly:
- A customer service bot includes your company's 50-page knowledge base in every request
- AI Copilots re-process your entire codebase if they have to give an inline suggestion
- A legal AI re-reads the same contract for every user question

**Without caching** each time the model has to read and process the complete context. That is slow and expensive.

**With caching**, the model processes the static content only once, caches it, and reuses it between requests, reducing the latency and cost by a huge amount.

---

## How Prompt Caching Works

![Amazon Bedrock Prompt Caching Architecture](/blog-images/prompt-caching-architecture.svg)

You can understand prompt caching with an analogy:

**Without Caching**: Asking a lawyer new questions time and again, and the lawyer has to read your entire contract every single time.
**With Caching**: The lawyer reads the contract one time and immediately proceeds to respond to all of your questions without glancing at it again.

Behind the scenes, Amazon Bedrock stores the **computational state** of the fixed part of your prompt. In case the new request has the same prefix, Bedrock does not need to reprocess, and it directly produces the response.

---

## The Architecture: Static vs. Dynamic Content

To use caching effectively, break down your prompts into two parts:

### 1. Static Content (Cached)
This is information that remains constant to numerous requests:
- System instructions and rules
- PDFs, long documents, or knowledge bases
- Software catalogs or documentation
- Few‑shot examples

### 2. Dynamic Content (Not Cached)
This is different with every request:
- User’s specific question
- Current chat message
- Parameters that are session-specific.

**Critical Rule:** The portion that will be being stored as a cache should be positioned at the start of your prompt. The prefix has one character difference which will result in a cache miss.

---

## Implementation: The Code

You just need to make a minimal change in your code to implement prompt cachings. Here's a practical example using **Claude 3.7 Sonnet**:

```python
# do necessary imports
import boto3
import json

bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    region_name='us-east-1' # put your region name here
)

# Your long, static content (e.g., company knowledge base, text extracted from any book, etc....)
# This is just a dummy content for the purpose of demonstration
# As I have multiplied by 200, the knoweldge base becomes huge meeting the min context length
KNOWLEDGE_BASE = (
    """
[Imagine 20+ pages of your company's documentation here]
Product guidelines, policies, technical specifications, etc.
This content stays the same across thousands of user requests.
"""
    * 200
)

# User's question (changes every request)
user_question = "What is our refund policy for enterprise customers?"

# Structure the request with cache checkpoint
request_body = {
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 1024,
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": KNOWLEDGE_BASE, # this is our static content
                    "cache_control": {"type": "ephemeral"}  # Cache checkpoint
                },
                {
                    "type": "text",
                    "text": user_question  # Dynamic content
                }
            ]
        }
    ]
}

# Invoke the model
response = bedrock_runtime.invoke_model(
    modelId="us.anthropic.claude-3-7-sonnet-20250219-v1:0",  # you can use any other model supported for prompt caching, check out documentation for this
    body=json.dumps(request_body)
)

response_body = json.loads(response['body'].read())
print(json.dumps(response_body, indent=2))
```

### Understanding the Response

The response includes usage metrics which shows the cache performance:

**First Request (Cache Write):**
```json
{
  "usage": {
    "input_tokens": 12,
    "cache_creation_input_tokens": 7800,  // Tokens are cached
    "cache_read_input_tokens": 0,
    "output_tokens": 156
  }
}
```

**Second request onwards (Cache Hit):**
```json
{
  "usage": {
    "input_tokens": 12,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 7800,  // Reading from cache
    "output_tokens": 143
  }
}
```

---

## Real-World Benchmark: The Financial Impact

I tested a document Q&A system with a **7,800-token document** (approximately 20 pages). Here are the results:

| Metric | Without Caching | With Caching | Improvement |
|--------|----------------|--------------|-------------|
| **Response Latency** | 7.61 seconds | 3.12 seconds | **59% faster** |
| **Input Token Cost** | $0.0235 | $0.0024 | **90% cheaper** |

### Cost Breakdown (Claude 3.7 Sonnet Pricing)

**Scenario:** 1,000 requests with a 7,800-token document

**Without Caching:**
- 1,000 requests × 7,800 tokens = 7,800,000 tokens
- Cost: 7,800,000 ÷ 1,000 × $0.003 = **$23.40**

**With Caching:**
- First request: 7,800 tokens (cache write) = $0.0235
- Next 999 requests: 7,800 tokens (cache read) = 999 × $0.0003 = $0.234
- Total: **$0.26**

**Savings: $23.14 per 1,000 requests (99% reduction)**

### Latency Impact

For user experience, the difference between 7.6 seconds and 3.1 seconds is huge:
- **7.6 seconds** feels like a broken application with some bugs inside of it
- **3.1 seconds** feels like a natural conversation not hampering the UX

---

## Multiple Cache Checkpoints

You can create multiple cache layers for even more optimization:

```python
def chat_with_document_advanced(system_instructions, document, user_query):
    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 2048,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": system_instructions,  # Layer 1: Instructions
                        "cache_control": {"type": "ephemeral"}
                    },
                    {
                        "type": "text",
                        "text": f"<document>{document}</document>",  # Layer 2: Document
                        "cache_control": {"type": "ephemeral"}
                    },
                    {
                        "type": "text",
                        "text": user_query  # Dynamic: User question
                    }
                ]
            }
        ]
    }
    
    response = bedrock_runtime.invoke_model(
        modelId="us.anthropic.claude-3-7-sonnet-20250219-v1:0",
        body=json.dumps(request_body)
    )
    
    return json.loads(response['body'].read())
```

---

## When to Use Prompt Caching

### Ideal Use Cases

In situations when you have to create Document QnA systems where users typically ask from the same PDF, or manuals, or making a coding assisant where same codebase context is passed for even a small suggestion, you can use prompt caching. Not limited to this, there are numerous other use cases for prompt caching.


### Poor Use Cases

Having said that prompt caching is really useful doesn't mean it is perfect for every situation. It can be of no use when you have to do just a single shot inference (no repeat usage), or your prompts have less than 1024 tokens which is the minimum cache size, or a worse place to use this is when you have highly dynamic content that changes every request.

---

## Conclusion

Prompt caching is one of the techniques that can provide any business a very high ROI. With having almost no catches, using this technique can massively save your money as well as improve the customer's experience by faster responses.

**There are other important considerations to keep in mind while using prompt cachings**. For detailed model specifications, considerations, regional availability, and pricing, make sure to visit the [Amazon Bedrock Prompt Caching documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html).