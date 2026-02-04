---
title: "Amazon Bedrock LLM-as-a-Judge: Foundation Model Evaluation"
date: "January 24, 2026"
excerpt: "Use Amazon Bedrock's LLM-as-a-Judge to evaluate foundation model quality. Complete walkthrough from dataset preparation to results interpretation."
readTime: "8 min read"
keywords: ["Amazon Bedrock", "LLM-as-a-Judge", "Foundation Model Evaluation", "AI Model Testing", "Claude Sonnet", "Amazon Nova Pro", "Model Quality Assessment", "AI Safety Testing", "Bedrock Evaluation", "LLM Benchmarking"]
tags: ["AWS", "Amazon Bedrock", "AI", "Machine Learning", "Model Evaluation", "Tutorial"]
category: "AI & Machine Learning"
---

# Evaluating Foundation Models with Amazon Bedrock: LLM-as-a-Judge

How do you know if your AI model is doing a good job? Checking responses manually takes forever, and traditional metrics don't capture whether answers are actually helpful. **LLM-as-a-Judge** solves this by having one AI model evaluate another, automatically scoring responses for quality and safety.

Amazon Bedrock makes this easy with its built-in evaluation feature. This tutorial shows you exactly how to set it up, step by step.

---

## What is LLM-as-a-Judge?

Think of it like having a teacher grade a student's work, except both are AI models:

![LLM-as-a-Judge Architecture](/blog-images/llm-as-a-judge/llm-judge-architecture.svg)
*The evaluation flow: prompts from S3 go to the Generator LLM, responses are scored by the Judge LLM, and results are saved back to S3.*

**Generator Model:** This is the AI you want to test. You give it questions, and it generates answers.

**Judge Model:** This AI evaluates those answers. It checks if they're helpful, accurate, and safe.

Instead of manually reviewing hundreds of responses, the judge model does it for you, consistently and at scale.

---

## What You'll Need

Before starting:

- An AWS account with Amazon Bedrock enabled
- Permission to create S3 buckets and use Bedrock models
- About 30 minutes of time

---

## Step 1: Create Your Test Questions

Your evaluation needs a dataset, which is a file containing the questions you'll test your model with.

### The Format: JSONL

JSONL means "JSON Lines" where each line is a separate test case. Here's what it looks like:

```json
{"prompt": "Write a professional email declining a meeting request politely.", "referenceResponse": "A professional decline should thank the sender, briefly explain you're unavailable, and suggest an alternative time or delegate if possible. Keep the tone friendly and respectful.", "category": "professional_writing"}
{"prompt": "Explain the difference between machine learning and deep learning.", "referenceResponse": "Machine learning is when computers learn from data to make predictions. Deep learning is a type of machine learning that uses neural networks with many layers, similar to how the human brain processes information.", "category": "technical"}
{"prompt": "What are three tips for improving work-life balance?", "referenceResponse": "Set clear work hours and stick to them. Make time for hobbies and activities you enjoy. Learn to say no to extra commitments when you're already busy.", "category": "productivity"}
```

Each line has three parts:
- **prompt**: The question or instruction you're testing
- **referenceResponse**: What a good answer should look like (the judge uses this as a reference)
- **category**: A label to organize your results (optional)

Save this as a file called `input.jsonl`. For this tutorial, we're using just 3 questions to keep costs low while you learn.

---

## Step 2: Set Up Your S3 Storage

Amazon Bedrock needs a place to find your test questions and save the results. That's what S3 (Amazon's cloud storage) is for.

### Create a Bucket

Go to S3 and create a new bucket. Give it a unique name. I used `bedrock-foundational-model-eval`.

![Creating S3 Bucket](/blog-images/llm-as-a-judge/bucket-creation.png)
*Create a new S3 bucket for your evaluation data.*

### Create Two Folders

Inside your bucket, make two folders:
- `dataset/` - this is where your input.jsonl file goes
- `output/` - Bedrock will save evaluation results here

![Creating Folders](/blog-images/llm-as-a-judge/create-prefix.png)
*Create dataset and output folders inside your bucket.*

### Upload Your Questions

Upload your `input.jsonl` file into the `dataset/` folder.

![Uploaded Dataset](/blog-images/llm-as-a-judge/uploaded-dataset.png)
*Your input.jsonl file uploaded to the dataset folder.*

### Enable CORS (Important!)

This step is critical. Without it, Bedrock can't access your files and the evaluation will fail.

Go to your bucket's **Permissions** tab, scroll to **Cross-origin resource sharing (CORS)**, and paste this:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["Access-Control-Allow-Origin"]
    }
]
```

![CORS Configuration](/blog-images/llm-as-a-judge/cors.png)
*Enable CORS on your S3 bucket to allow Bedrock access.*

> **Why CORS?** This setting allows Bedrock to read from and write to your bucket. Skip this and your evaluation won't work.

---

## Step 3: Set Up Your Evaluation

Now we'll configure the actual evaluation in Amazon Bedrock.

### Start the Process

Open the **Amazon Bedrock Console**, click **Evaluations** in the sidebar, then click **Create** and choose **Automatic: LLM as a judge**.

![Bedrock Evaluation Console](/blog-images/llm-as-a-judge/bedrock-evaluation-console.png)
*The Bedrock Evaluations console showing automatic and human evaluation options.*

### Name Your Evaluation

Give your evaluation a descriptive name and description. This helps you keep track when you run multiple evaluations later.

### Choose Your Judge Model

The **Evaluator Model** is the AI that will grade the responses. I selected **Amazon Nova Pro** because it's good at analyzing and reasoning.

![Step 1: Basic Configuration](/blog-images/llm-as-a-judge/step1.png)
*Configure evaluation name, description, and select your judge model.*

### Choose the Model You're Testing

In the **Inference Source** section, select **Bedrock models** and choose the model you want to evaluate. I picked **Claude Sonnet 4.5**.

![Step 2: Inference Source](/blog-images/llm-as-a-judge/step2.png)
*Select Claude Sonnet 4.5 as the generator model to evaluate.*

### Pick What to Measure

The **Metrics** section lets you choose what the judge will evaluate:

**Quality Metrics:**
- **Helpfulness**: Does the response actually answer the question?
- **Coherence**: Is the response clear and logical?
- **Relevance**: Does it stay on topic?
- **Correctness**: Is the information accurate?

**Safety Metrics:**
- **Harmfulness**: Does it contain unsafe content?
- **Stereotyping**: Does it use harmful stereotypes?
- **Refusal appropriateness**: Does it properly decline inappropriate requests?

For this tutorial, I kept the defaults: **Helpfulness** and **Harmfulness**. More metrics mean longer evaluation times and higher costs. For a complete list of available metrics, check the [Model Evaluation Metrics documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-evaluation-metrics.html).

![Step 3: Metrics Selection](/blog-images/llm-as-a-judge/step3.png)
*Select the quality and responsible AI metrics for evaluation.*

### Connect Your Dataset

Tell Bedrock where to find your questions and where to save results:

1. **Prompt Dataset**: Click browse and select `dataset/input.jsonl` from your bucket
2. **Evaluation Results**: Select the `output/` folder

![Step 4: Select Input Dataset](/blog-images/llm-as-a-judge/step4.png)
*Select your input.jsonl file from S3.*

![Step 5: Dataset Configuration Complete](/blog-images/llm-as-a-judge/step5.png)
*Both input dataset and output location configured.*

### Set Up Permissions

For **Service role**, choose **Create and use a new service role**. AWS will automatically create the permissions Bedrock needs.

![Step 6: IAM Role](/blog-images/llm-as-a-judge/step6.png)
*Let Bedrock create a new service role with required permissions.*

---

## Step 4: Run Your Evaluation

Click **Create** to start. You'll see the status change to **In Progress**.

![Step 7: Job Running](/blog-images/llm-as-a-judge/step7.png)
*Evaluation job in progress.*

**How long does it take?** My 3-question evaluation took about **25 minutes**. Bigger datasets take longer.

---

## Step 5: Check Your Results

When the status shows **Completed**, click on your evaluation to see the results.

![Evaluation Complete](/blog-images/llm-as-a-judge/image.png)
*Evaluation job completed successfully.*

You'll see:
- **Overall scores** averaging all your test questions
- **Individual scores** for each question
- **Explanations** from the judge model about why it gave each score

### Understanding the Scores

Scores usually range from 1 to 5:
- **Helpfulness**: Higher is better (5 = very helpful, 1 = not helpful)
- **Harmfulness**: Lower is better (1 = safe, 5 = unsafe)

You can download the complete results from your S3 output folder for detailed analysis.

---

## Key Points to Remember

- **LLM-as-a-Judge** lets AI models evaluate other AI models automatically
- Your dataset must be in **JSONL format** with prompts and reference responses
- **Don't skip CORS configuration** since it's required for Bedrock to access your S3 bucket
- **Choose your judge model wisely** because better judges give more accurate evaluations
- **Watch your costs** as more questions and metrics increase both time and expense

---

## When to Use This

This evaluation approach is perfect for:

- **Comparing models**: Test multiple AI models to see which works best for your needs
- **Testing prompts**: See how small changes to your questions affect answer quality
- **Safety checking**: Make sure your model gives safe, appropriate responses
- **Quality control**: Verify that model updates don't make things worse

---

## What We Accomplished

Here's everything we did in one picture:

![What We Did Summary](/blog-images/llm-as-a-judge/what%20we%20did%20summary.png)
*Complete workflow summary: from dataset preparation to evaluation results.*

---

## Additional Resources

- [Model Evaluation Security and CORS Configuration](https://docs.aws.amazon.com/bedrock/latest/userguide/model-evaluation-security-cors.html)
- [LLM-as-a-Judge Evaluation Guide](https://docs.aws.amazon.com/bedrock/latest/userguide/evaluation-judge.html)
- [Prompt Datasets for Judge Evaluations](https://docs.aws.amazon.com/bedrock/latest/userguide/model-evaluation-prompt-datasets-judge.html)
- [Model Evaluation Metrics](https://docs.aws.amazon.com/bedrock/latest/userguide/model-evaluation-metrics.html)