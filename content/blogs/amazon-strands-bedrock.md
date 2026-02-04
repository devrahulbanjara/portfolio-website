---
title: "Building an Intelligent YouTube Assistant with Strands Agents and Amazon Bedrock"
date: "February 4, 2026"
excerpt: "Learn how to build a YouTube Video Assistant using Amazon Bedrock and Strands Agents, an open-source AI agents SDK. This tutorial demonstrates how to create an agentic workflow that can summarize videos and engage in contextual, multi-turn conversations with video transcripts."
readTime: "7 min read"
---

# Building an Intelligent YouTube Assistant with Strands Agents and Amazon Bedrock

In the modern digital landscape, video content is the primary medium for knowledge sharing. However, extracting specific insights from a 60-minute technical deep dive or a multi-hour keynote can be a bottleneck for productivity. 

Today, we are exploring how to build a **YouTube Video Assistant** using **Amazon Bedrock** and **Strands Agents**, an open-source AI agents SDK. This assistant allows users to not only summarize videos but to engage in a contextual, multi-turn conversation with the transcript, effectively turning passive content into an interactive knowledge base.

---

## The Architecture: Agentic Orchestration

Unlike traditional "Chain-of-Thought" prompting, an **Agentic Workflow** allows the Large Language Model (LLM) to act as a reasoning engine. By using the Strands SDK, we provide the model with "tools" (functions) that it can invoke dynamically based on user intent.

1.  **The Brain:** Amazon Bedrock provides access to high-performance foundation models.
2.  **The Framework:** Strands Agents handles the tool-calling logic, state management, and communication with Bedrock.
3.  **The Tools:** Custom Python functions that interface with the YouTube Transcript API.

![YouTube Assistant Architecture Flow](/blog-images/amazon-strands-bedrock/flow.png)
*Architecture diagram showing the agentic workflow: User Input → Strands Agent → Tools (fetch_transcript, summarize, qa_tool) → Amazon Bedrock → Final Response*

---

## Step 1: Environment Configuration

To interact with Amazon Bedrock, your environment requires AWS credentials. You can configure this in two ways:

### Option A: Using a `.env` File (Local Development)
Create a `.env` file in your project root. This is ideal for quick prototyping:
```text
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

### Option B: Using `aws configure` (Production Standard)
For a more secure and standardized approach, use the AWS CLI:
```bash
aws configure
```
This stores credentials in your local `~/.aws/` directory, which the Strands SDK and Boto3 will automatically detect.

---

## Step 2: The Power of Claude Sonnet

When deploying in `us-east-1`, this implementation leverages the latest high-performance inference profile:
**`us.anthropic.claude-sonnet-4-20250514-v1:0`**

### Why this model?
*   **Cross-Region Inference:** The `us.` prefix enables Amazon Bedrock to route requests across multiple US regions, ensuring higher throughput and resilience.
*   **Reasoning Capabilities:** Claude Sonnet excels at "tool-use" (function calling), making it the ideal choice for agents that need to parse complex transcripts and extract precise answers.
*   **Context Window:** It can handle massive transcripts, ensuring that even hour-long videos are summarized without losing critical context.

---

## Step 3: Implementation

The following code defines our tools and initializes the Strands Agent.

```python
from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi
from strands import Agent, tool
from dotenv import load_dotenv

# Load environment variables if using Option A
load_dotenv()

def get_video_id(url: str) -> str:
    parsed = urlparse(url)
    vid_list = parse_qs(parsed.query).get("v")
    if not vid_list:
        raise ValueError("Invalid YouTube URL")
    return vid_list[0]

@tool
def fetch_transcript_tool(youtube_url: str) -> str:
    """Fetches the full transcript of a YouTube video given its URL."""
    vid_id = get_video_id(youtube_url)
    raw = YouTubeTranscriptApi().fetch(vid_id)
    return " ".join(segment.text for segment in raw)

@tool
def summarize_tool(transcript: str) -> str:
    """Generates a concise summary of the provided transcript."""
    prompt = f"Summarize the following video transcript concisely:\n\n{transcript}"
    response = agent(prompt)
    return response.message["content"][0]["text"].strip()

@tool
def qa_tool(transcript: str, question: str) -> str:
    """Answers a specific question based strictly on the provided transcript."""
    prompt = (
        f"Here is the transcript:\n{transcript}\n\n"
        f"Answer the following question in one clear response: {question}"
    )
    response = agent(prompt)
    return response.message["content"][0]["text"].strip()

# Initialize the Strands Agent
agent = Agent(
    tools=[fetch_transcript_tool, summarize_tool, qa_tool]
)

if __name__ == "__main__":
    url = input("YouTube URL: ").strip()
    transcript = fetch_transcript_tool(url)
    
    print("\n--- Video Summary ---")
    print(summarize_tool(transcript))

    while True:
        q = input("\nAsk a question (or type EXIT): ").strip()
        if q.lower() == "exit":
            break
        print(f"\nAI: {qa_tool(transcript, q)}")
```

## Running the Assistant

Once you run the script, it prompts you for a YouTube URL. After pasting the URL, the assistant fetches the transcript and generates a summary:

![Video Summary](/blog-images/amazon-strands-bedrock/summarize.png)
*The assistant processes the YouTube URL and generates a concise summary of the video content.*

After displaying the summary, the assistant immediately prompts you to ask questions. You can ask unlimited questions about the video content:

![Q&A Interaction](/blog-images/amazon-strands-bedrock/qa.png)
*The assistant answers questions based on the video transcript. You can continue asking questions indefinitely until you type "EXIT".*

This interactive workflow transforms passive video content into an engaging, conversational experience where you can explore specific aspects of the video in depth.

---

## Explore Further: Next Steps

Building a CLI assistant is just the beginning. Here is how you can take this project to a production level:

1.  **Deploy as a Web App:** Use [Streamlit](https://streamlit.io/) to create a frontend for this agent, allowing users to paste URLs into a browser.
2.  **Add Persistent Memory:** Integrate [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) with Strands to allow the agent to remember previous conversations about different videos.
3.  **Multi-Model Testing:** Experiment with different models available in Bedrock for faster, lower-cost summaries, or use **Amazon Titan** for text embeddings.
4.  **Serverless Deployment:** Wrap this logic in an [AWS Lambda](https://aws.amazon.com/lambda/) function triggered by an API Gateway to build a scalable "Summary-as-a-Service."

---

## References

To learn more about the technologies used in this post, visit the following resources:

*   **Strands Agents Documentation:** [Official Docs](https://strandsagents.com/latest/documentation/docs/)
*   **Strands Python SDK:** [GitHub Repository](https://github.com/strands-agents/sdk-python)
*   **AWS Blog:** [Introducing Strands Agents: An Open Source AI Agents SDK](https://aws.amazon.com/blogs/opensource/introducing-strands-agents-an-open-source-ai-agents-sdk/)
*   **Amazon Bedrock:** [Product Overview](https://aws.amazon.com/bedrock/)