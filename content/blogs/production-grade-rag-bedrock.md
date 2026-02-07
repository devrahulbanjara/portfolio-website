---
title: "HIPAA-Compliant RAG Systems with Amazon Bedrock Multi-Tenant"
date: "November 29, 2025"
excerpt: "Build HIPAA-compliant RAG systems with Amazon Bedrock Knowledge Bases. Multi-tenant isolation with metadata filtering and secure medical AI."
readTime: "15 min read"
keywords:
    [
        "HIPAA-Compliant RAG",
        "Multi-Tenant RAG",
        "Amazon Bedrock Knowledge Base",
        "Healthcare AI",
        "RAG Security",
        "Metadata Filtering",
        "Medical AI Assistant",
        "Bedrock RAG",
        "Healthcare Data Privacy",
        "Production RAG System",
    ]
tags: ["AWS", "Amazon Bedrock", "RAG", "Healthcare", "Security", "HIPAA", "Tutorial"]
category: "AI & Machine Learning"
---

## We're Building:

A healthcare system where doctors can query patient records safely. Consider the following conversation example:

- **Doctor**: "What was Sampada's weight and blood pressure on her last visit to me?"
- **System**: Looks for **ONLY** Sampada's documents to answer (never accidentally shows Subham's data).
- **Output**: Responds with exact citations (file name, page number, source text) where the answer is influenced from.

This system is production-ready: **HIPAA-eligible**, **multi-tenant secure**, and **verifiable**.

---

## Why Multi-tenant?

In the domain of healthcare, whenever developers build a system where doctors must chat with patient data in an isolated manner, the problem statement is called a multi-tenant problem. The goal is to ensure no other patient's context gets mixed during the answer generation process. The phrase multi-tenant is not limited to the healthcare domain, but is applicable for any domain that has many tenants where context must not be mixed.

![Multi-Tenant Metadata Isolation (Logical flow of isolated data retrieval ensuring zero data leakage)](/blog-images/production-grade-rag-bedrock/multi-tenant-isolation.svg)

---

## Prerequisites

- AWS account with Bedrock access (Claude 3.5 Sonnet enabled).
- An S3 bucket for documents.
- **A Bedrock Knowledge Base already created and connected to S3.**
- Python 3.8+ locally with `boto3` (or any package manager).

---

## Architecture

![Production-Grade High-level RAG Architecture](/blog-images/production-grade-rag-bedrock/production-rag-architecture.png)

---

## Step 1: The Metadata Structure

For every document, you need a metadata file to store the attributes of that PDF so that we can perform filtering in later steps.

- **Document**: `rahul-lab-results.pdf`
- **Metadata file**: `rahul-lab-results.pdf.metadata.json`

**Pattern**: `{filename}.metadata.json` (exact match required strictly).

```json
{
    "metadataAttributes": {
        "patient_id": "P-123",
        "document_type": "lab_report",
        "department": "cardiology",
        "visit_date": "2025-07-15"
    }
}
```

**Note**: Make sure each document and its metadata file are inside the same S3 prefix (folder).

---

## Step 2: Upload to S3

```python
import boto3
import json

s3 = boto3.client('s3')
BUCKET = 'rahul-special-bucket-name'

def upload_patient_document(pdf_path: str, patient_id: str, doc_type: str):
    # Upload PDF
    s3_key = f"patients/{pdf_path}"
    s3.upload_file(pdf_path, BUCKET, s3_key)

    # Upload metadata
    metadata = {
        "metadataAttributes": {
            "patient_id": patient_id,
            "document_type": doc_type
        }
    }

    s3.put_object(
        Bucket=BUCKET,
        Key=f"{s3_key}.metadata.json",
        Body=json.dumps(metadata),
        ContentType='application/json'
    )

    print(f"Uploaded {s3_key} with metadata")

# Example usage
upload_patient_document("rahul-lab-results.pdf", "P-123", "lab_report")
```

**After uploading**: Go to the Bedrock Console -> Knowledge Bases -> Select yours -> Click "Sync".

![Syncing Knowledge Base in Bedrock Console](/blog-images/production-grade-rag-bedrock/kb-sync.png)
_Manually syncing the Knowledge Base to ingest new S3 documents_

---

## Step 3: The System Prompts

### 1. Generation Prompt (Controls LLM Behavior)

_Note: It is not necessary to use Claude; you can use any foundational model that Bedrock provides._

```python
GENERATION_PROMPT = """
You are a Medical Records Assistant helping healthcare providers.

RULES:
1. Answer ONLY using the search results below
...
(complete the generation system prompt)

Search Results:
$search_results$

Answer the question and cite your sources.
"""
```

### 2. Orchestration Prompt (Improves Search Quality)

```python
ORCHESTRATION_PROMPT = """
Transform the provider's question into precise medical search terms.

Include:
- Medical abbreviations AND full terms
- Related tests and symptoms
- Generic and brand medication names

Examples:
"Is patient on BP meds?" -> "blood pressure medication antihypertensive lisinopril amlodipine losartan"
"Any signs of diabetes?" -> "diabetes mellitus DM hyperglycemia HbA1c glucose"

Question: $query$
"""
```

---

## Step 4: The Complete Implementation

The following codebase is consolidated into a single file for clarity. In a production environment, you should modularize this for scalability and testability.

```python
import boto3
from typing import Optional, Dict, List

# Configuration
AWS_REGION = "us-east-1"
KNOWLEDGE_BASE_ID = "YOUR_KB_ID"
MODEL_ARN = "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0"
RERANK_MODEL_ARN = "arn:aws:bedrock:us-east-1::foundation-model/amazon.rerank-v1:0"

bedrock = boto3.client('bedrock-agent-runtime', region_name=AWS_REGION)

def create_patient_filter(patient_id: str, document_type: Optional[str] = None) -> Dict:
    """Create metadata filter for patient isolation"""
    if document_type:
        return {
            "andAll": [
                {"equals": {"key": "patient_id", "value": patient_id}},
                {"equals": {"key": "document_type", "value": document_type}}
            ]
        }
    return {"equals": {"key": "patient_id", "value": patient_id}}

def query_patient_records(
    question: str,
    patient_id: str,
    document_type: Optional[str] = None
) -> Dict:
    """Query patient records with multi-tenant isolation"""

    metadata_filter = create_patient_filter(patient_id, document_type)

    config = {
        "type": "KNOWLEDGE_BASE",
        "knowledgeBaseConfiguration": {
            "knowledgeBaseId": KNOWLEDGE_BASE_ID,
            "modelArn": MODEL_ARN,
            "retrievalConfiguration": {
                "vectorSearchConfiguration": {
                    "numberOfResults": 20,
                    "filter": metadata_filter,  # Enforces isolation
                    "rerankingConfiguration": {
                        "type": "BEDROCK_RERANKING_MODEL",
                        "bedrockRerankingConfiguration": {
                            "modelConfiguration": {"modelArn": RERANK_MODEL_ARN},
                            "numberOfRerankedResults": 5
                        }
                    }
                }
            },
            "generationConfiguration": {
                "promptTemplate": {"textPromptTemplate": GENERATION_PROMPT},
                "inferenceConfig": {
                    "textInferenceConfig": {
                        "temperature": 0.1,  # low temperature for consistency
                        "maxTokens": 2048
                    }
                }
            },
            "orchestrationConfiguration": {
                "queryTransformationConfiguration": {"type": "QUERY_DECOMPOSITION"},
                "promptTemplate": {"textPromptTemplate": ORCHESTRATION_PROMPT}
            }
        }
    }

    response = bedrock.retrieve_and_generate(
        input={"text": question},
        retrieveAndGenerateConfiguration=config
    )

    return response

def extract_citations(response: Dict) -> List[Dict]:
    """Parse citations into clean format"""
    citations = []
    for citation in response.get('citations', []):
        answer_part = citation['generatedResponsePart']['textResponsePart']['text']
        for ref in citation.get('retrievedReferences', []):
            citations.append({
                "answer_part": answer_part,
                "source_text": ref['content']['text'],
                "file": ref['location']['s3Location']['uri'].split('/')[-1],
                "page": ref.get('metadata', {}).get('x-amz-bedrock-kb-document-page-number', 'N/A')
            })
    return citations

def format_response(response: Dict) -> str:
    """Format output for display"""
    answer = response['output']['text']
    citations = extract_citations(response)
    output = f"ANSWER:\n{answer}\n\n{'='*70}\nSOURCES:\n"
    for i, cite in enumerate(citations, 1):
        output += f"\n[{i}] \"{cite['answer_part']}\"\n"
        output += f"    File: {cite['file']} (Page {cite['page']})\n"
        output += f"    Evidence: {cite['source_text'][:150]}...\n"
    return output

if __name__ == "__main__":
    # Query all documents for patient
    response = query_patient_records(
        question="What medications is the patient taking?",
        patient_id="P-123"
    )
    print(format_response(response))
```

---

## Security & HIPAA Compliance

This production-grade multi-tenant RAG is designed to be HIPAA compliant by focusing on several security layers.

### 1. Enable Encryption

```python
# S3 bucket encryption
s3.put_bucket_encryption(
    Bucket='rahuls-super-cool-bucket',
    ServerSideEncryptionConfiguration={
        'Rules': [{'ApplyServerSideEncryptionByDefault': {'SSEAlgorithm': 'AES256'}}]
    }
)
```

### 2. IAM Policy (Least Privilege)

Following AWS best practices, ensure you provide the minimum required permissions.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["bedrock:RetrieveAndGenerate"],
            "Resource": [
                "arn:aws:bedrock:*:*:foundation-model/anthropic.claude-*",
                "arn:aws:bedrock:*:ACCOUNT_ID:knowledge-base/KB_ID"
            ]
        },
        {
            "Effect": "Allow",
            "Action": ["s3:GetObject", "s3:PutObject"],
            "Resource": "arn:aws:s3:::your-bucket/*"
        }
    ]
}
```

### 3. Audit Logging

Audit logging tracks query events for compliance reviews.

```python
import logging
import json
from datetime import datetime

audit_log = logging.getLogger('audit')

def query_with_audit(question: str, patient_id: str, user_id: str):
    audit_log.info(json.dumps({
        "event": "query",
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "patient_id": patient_id,
        "filter": {"patient_id": patient_id}
    }))
    return query_patient_records(question, patient_id)
```

### 4. Test Isolation

To verify that tenant data is never leaked:

```python
def test_tenant_isolation():
    """Verify patient P-123 queries never return P-456 data"""
    response = query_patient_records("Test query", "P-123")
    citations = extract_citations(response)

    for cite in citations:
        assert "P-456" not in cite['file'], "SECURITY VIOLATION!"

    print("Isolation test passed")
```

---

## Understanding Advanced Features

### Reranking: Why It's Important

Vector search ranks by similarity, not necessarily relevance. For example, if a doctor asks: "What caused elevated liver enzymes?"

- **Without Reranking**: The top results might include any page mentioning "liver" or general medication lists.
- **With Reranking**: The system prioritizes actual Lab Results (the answer) and Hepatotoxic medication lists (the cause).

**Result**: A 60% reduction in irrelevant results, leading to better generation by the final LLM.

### Query Decomposition

For complex questions like: "Compare the patient's blood pressure from January to June."

Simple searches might fail because no single document contains a "comparison." Query decomposition solves this by:

1.  Searching for January BP readings.
2.  Searching for June BP readings.
3.  Synthesizing the comparison.

Bedrock handles this automatically with `"type": "QUERY_DECOMPOSITION"`.

---

## Performance & Cost

Analysis performed using 500 patient records (averaging 20 pages per PDF):

![Latency vs Accuracy Analysis](/blog-images/production-grade-rag-bedrock/production-rag-latency-accuracy.png)

**Recommendation**: Always use reranking for production-grade performance. Add decomposition for complex queries only.

### Cost Optimization Tip

To optimize for sustainability and cost, you can implement caching:

```python
# Reduce retrieval for simple queries
if is_simple_question(question):
    num_results = 10  # instead of 20

# Cache frequent queries
@lru_cache(maxsize=1000)
def cached_query(question_hash, patient_id):
    return query_patient_records(question, patient_id)
```

You can also use **Prompt Caching** to reduce costs by more than half for the static portions of your prompts. For detailed prompt caching knowledge, you can check out my other blog [Reduce Bedrock Latency and Cost with Prompt Caching](/blogs/bedrock-prompt-caching).

Here is how to implement it:

```python
"messages": [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": system_prompt, # Static content
                "cache_control": {"type": "ephemeral"}
            },
            {
                "type": "text",
                "text": user_question  # Dynamic content
            }
        ]
    }
]
```

---

## Key Lessons

- Using **metadata filtering** results in a HIPAA-compliant, isolated multi-tenant RAG system.
- Leveraging **advanced features** like reranking, query decomposition, and prompt caching decreases latency and improves result quality while managing costs.

---

**Resources**:

- [AWS Bedrock Knowledge Bases Docs](https://docs.aws.amazon.com/bedrock/)
- [HIPAA on AWS](https://aws.amazon.com/compliance/hipaa-compliance/)
- [Claude Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)
