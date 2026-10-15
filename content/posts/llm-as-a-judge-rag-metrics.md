---
title: LLM-as-a-Judge for RAG: Why One Metric Is Never Enough
slug: llm-as-a-judge-rag-metrics
excerpt: Faithfulness, answer relevancy, contextual precision, recall and relevancy, explained with one insurance question that keeps going wrong in different ways.
tags: llm evaluation, rag, deepeval, llm as a judge, genai
status: published
date: 2026-10-01
---

Here is a question and an answer from a RAG system I built over health-insurance policies:

> **Q:** Is knee replacement covered under my HDFC ERGO policy?
>
> **A:** Yes, knee replacement is covered when it requires in-patient hospitalisation.

It reads well. It's polite and confident, and every word of it is in the policy. It's also the kind of answer that gets a customer's claim rejected. The policy adds a 24-month waiting period for joint replacement, and an exclusion when the surgery comes from a degenerative condition. Neither made it into the answer.

If you had evaluated this system by asking it a few questions during a demo, you'd have shipped it. This is why I built [RAG-eval](https://github.com/devrahulbanjara/RAG-eval). It's a small RAG app over insurance policy wordings whose whole purpose is to be measured, so I can catch it being confidently wrong.

This post explains the five most widely used RAG metrics, in plain language, and why you need all of them. The short version: **every metric checks one thing, and a RAG system can fail in more ways than any single metric can see.**

## What "LLM-as-a-judge" means

Older NLP metrics like BLEU and ROUGE count overlapping words between your answer and a reference answer. That works for translation. It fails for RAG, where a correct answer can use completely different words, and a wrong one can share most of its words with the right one. "Covered" and "not covered" differ by one word.

LLM-as-a-judge means a second LLM grades the output. Doing it well usually means not asking "is this good, from 1 to 10?" Good metrics break the judgment into small yes/no questions the judge can answer reliably, then count:

1. **Break it down.** Split the answer (or the retrieved text, or the ideal answer) into individual statements.
2. **Ask a yes/no question about each.** "Does the context contradict this claim?" "Is this statement relevant to the question?"
3. **Compute a ratio.** Score = the number of "yes" answers ÷ the total.

That's how every metric in this post works in [DeepEval](https://deepeval.com), the framework I used. Because each score is a ratio of simple verdicts, you can open the judge's reasoning and see exactly which statement failed.

## The parts of a RAG system, and what each metric looks at

A RAG system has two halves, and they fail differently:

- **The retriever** takes the question and pulls chunks of text from your documents.
- **The generator** (the LLM) reads those chunks and writes the answer.

Every metric looks at some combination of four things:

| Ingredient | What it is |
| --- | --- |
| **Input** | The user's question |
| **Retrieval context** | The chunks the retriever returned, in order |
| **Actual output** | The answer the generator wrote |
| **Expected output** | An ideal answer you wrote by hand from the source document (a "golden") |

Keep this table in mind: which ingredients a metric looks at decides which failures it can catch.

## Why insurance?

I chose insurance documents because they cause the exact failure I wanted to catch.

A policy grants cover in one clause and takes part of it back in another, using almost the same words:

> **Grant of cover:** "We cover surgical treatment of the knee joint, including joint replacement, where the treatment requires in-patient hospitalisation."
>
> **Exclusion:** "We do not cover surgical treatment of the knee joint, including joint replacement, where it arises from a degenerative condition."

To a human, these say opposite things. To an embedding model, they're almost the same vector: same treatment, same body part, same words. And a full answer to "is knee replacement covered?" needs facts from three sections: the grant, the waiting period and the exclusion.

So every metric gets tested on the same tricky question. Let's go through them.

## Generator metrics: what did the model do with the context?

### 1. Faithfulness: did the answer come from the context?

**The question it answers:** Is everything in the answer backed by the retrieved context, or did the model add things from its own memory?

**How it's scored:** The judge extracts every claim from the answer and checks each one against the retrieval context.
`Faithfulness = claims consistent with the context ÷ total claims`

**The failure it catches:** LLMs have read thousands of insurance policies. Most of those have a 24-month waiting period for some procedures. So when the context doesn't mention one, the model sometimes writes "subject to the standard 24-month waiting period" anyway, because that's what policies usually say. It sounds right, and for this policy it's made up.

**Its blind spot:** Faithfulness only compares the answer with the *context*. If the retriever handed over the wrong clause, an answer copied faithfully from that clause scores 1.0 and is still wrong. **Faithful doesn't mean correct.**

> **A DeepEval detail worth knowing:** by default, a claim counts as faithful if it doesn't *contradict* the context. A claim the context simply doesn't mention can pass. If invented details are your main risk, set `penalize_ambiguous_claims=True` so unsupported claims count against the score.

### 2. Answer relevancy: did it answer the question asked?

**The question it answers:** Is the answer about what the user asked?

**How it's scored:** The judge splits the answer into statements and checks whether each one is relevant to the question.
`Answer relevancy = relevant statements ÷ total statements`

**The failure it catches:** Ask about knee replacement and get a well-written paragraph about hospitalisation in general: room rent limits, day-care procedures, cashless claims. All of it can come from the context, so faithfulness is perfect, but it doesn't answer the question.

**Its blind spot:** It checks whether the answer is *on topic*, not whether it's *true* or *complete*. "Yes, knee replacement is covered" is 100% relevant.

## Retriever metrics: did the right facts reach the model?

A generator can only be as good as the context it receives. These three metrics judge the retriever alone; they don't look at the generated answer.

### 3. Contextual precision: are the useful chunks ranked first?

**The question it answers:** Of the chunks the retriever returned, are the relevant ones at the top?

**How it's scored:** The judge marks each retrieved chunk relevant or not, using your ideal answer as the reference. The score rewards relevant chunks that appear early. The formula is a weighted precision; in practice, a relevant chunk at position 1 counts for much more than one at position 5.

A quick example with three chunks, where two are relevant:

| Ranking | Score |
| --- | --- |
| ✅ ✅ ❌ (relevant first) | (1/1 + 2/2) ÷ 2 = **1.00** |
| ❌ ✅ ✅ (noise first) | (1/2 + 2/3) ÷ 2 = **0.58** |

The chunks are the same in both rows; only the order changed.

**Why order matters:** LLMs pay more attention to what comes first, and many pipelines cut the context to the top few chunks. My dataset has two policies, HDFC ERGO and Universal Sompo, with almost identical waiting-period wording. If the Universal Sompo clause is ranked above the HDFC ERGO one for an HDFC ERGO question, the generator can quote the wrong policy's terms. The answer is faithful (it's in the context), relevant (it's about waiting periods) and wrong. Contextual precision is the metric that catches it.

**Its blind spot:** It only judges the chunks that were returned. If a needed chunk was never retrieved, precision can still look fine.

### 4. Contextual recall: was anything needed missing?

**The question it answers:** Does the retrieved context contain everything needed to write the ideal answer?

**How it's scored:** The judge splits your *ideal answer* into statements and checks whether each one can be traced to the retrieved chunks.
`Contextual recall = ideal-answer statements found in the context ÷ total statements`

**The failure it catches:** The knee replacement answer needs three facts from three sections. If the retriever brings back the grant of cover but not the waiting-period clause, no generator can write a complete answer, however good it is. The generator then writes "Yes, it's covered", which is faithful, relevant and incomplete.

**Precision vs recall in one line:** precision is about the *order* of what came back; recall is about whether *something is missing*.

### 5. Contextual relevancy: how much of the context is noise?

**The question it answers:** What share of the retrieved text is actually relevant to the question?

**How it's scored:** The judge splits the retrieved chunks into statements and checks each one against the question.
`Contextual relevancy = relevant statements in the context ÷ total statements`

**The failure it catches:** Policy clauses are long. One block bundles a definition, a condition and three exceptions. Even when the right chunk is retrieved, most of its text is unrelated to the question. That noise costs tokens and gives the generator more chances to wander off.

**Its blind spot:** A low score here isn't automatically a wrong answer. It tells you to look at your chunking strategy, a reranker, or how many chunks you retrieve (top-k).

## Why no single metric is enough

Here's the core argument in one table. Each row is a real failure; ✅ marks the metric that catches it.

| Failure | Faithful­ness | Answer relevancy | Ctx precision | Ctx recall | Ctx relevancy |
| --- | :-: | :-: | :-: | :-: | :-: |
| Model invents a "standard" 24-month waiting period | ✅* | | | | |
| Answers about hospitalisation in general | | ✅ | | | |
| Wrong policy's clause ranked first and quoted | | | ✅ | | |
| Waiting-period clause never retrieved; answer says "Yes, covered" | | | | ✅ | |
| Right chunk retrieved, but 80% of it is unrelated | | | | | ✅ |

\* *Reliably only with `penalize_ambiguous_claims=True`, as explained above.*

Each failure is caught by exactly one metric. Remove any one of them and that failure goes unnoticed, while the other four scores still look healthy.

Look at rows three and four again. Those answers would score well on **both** generator metrics, because the model did its job with the context it was given. If you only measure the generator, retrieval failures stay hidden. If you only measure the retriever, you miss a model making things up. You need both halves.

## Finding which part broke: golden context vs retrieved context

This is the most useful trick in the project. I ran the generator metrics twice:

1. **Generator level:** the generator gets the *golden context*, the exact clauses I picked by hand. Any problem here is the generator's alone.
2. **Pipeline level:** the generator gets whatever the *real retriever* returned.

Here are the actual results: 20 golden questions, judged by `gemini-3.1-flash-lite` at temperature 0, with a pass at 0.7 or above.

| Level | Metric | Passed | Avg score |
| --- | --- | --- | --- |
| Generator (golden context) | Faithfulness | 19/20 | 0.970 |
| | Answer relevancy | 19/20 | 0.962 |
| Pipeline (retrieved context) | Faithfulness | 8/20 | 0.727 |
| | Answer relevancy | 9/20 | 0.879 |
| Retriever | Contextual precision | 8/20 | 0.562 |
| | Contextual recall | 15/20 | 0.800 |
| | Contextual relevancy | 1/20 | 0.301 |

Here's what the numbers show:

- **The generator is fine.** With the right clauses in front of it, it's almost perfect (0.97 / 0.96).
- **The retriever is the problem.** Same generator, real retrieval: faithfulness falls to 0.73 and only 9 of 20 answers pass relevancy. With noisy or incomplete context, the model fills gaps from what "most policies" say.
- **More specifically, it's ranking and noise, not coverage.** Recall is decent (0.80), so the facts are usually *somewhere* in the results. But precision is 0.56 and relevancy is 0.30, so they're ranked badly and buried in irrelevant text.

Without the component metrics, all I'd know is "the answers are bad", and I'd probably start tweaking the prompt. The metrics say the prompt is fine and the fix is in retrieval: a reranker, better chunking, or metadata filters so an HDFC ERGO question can't retrieve a Universal Sompo clause.

## When to use which metric

| You want to know… | Use | Needs an ideal answer? |
| --- | --- | --- |
| Is the model making things up? | Faithfulness | No |
| Is it answering the actual question? | Answer relevancy | No |
| Are the best chunks ranked at the top? | Contextual precision | Yes |
| Is anything needed missing from retrieval? | Contextual recall | Yes |
| How much retrieved text is noise? | Contextual relevancy | No |

The last column matters in practice. **Faithfulness, answer relevancy and contextual relevancy need no ideal answer**, so you can run them on live production traffic. Contextual precision and recall need a golden dataset, so they belong in your offline test suite. Use both: goldens to catch regressions before you ship, and reference-free metrics to watch what real users get.

## Making the judge trustworthy

A judge is still an LLM, so treat it like one:

- **Temperature 0.** You want the same verdict for the same input on every run.
- **Read the reasons.** DeepEval can return the judge's explanation (`include_reason=True`). Spot-check them, especially failures. When the judge is wrong, you want to know before you trust the numbers.
- **Set a threshold and stick to it.** I count a question as passing at 0.7. The exact number matters less than keeping it fixed, so runs can be compared.
- **Log every run.** I add each run's results to a file. Change the chunk size, rerun, and compare every metric with the baseline. That's a regression test for a RAG system.
- **Watch cost and rate limits.** Each metric makes several judge calls per question (contextual relevancy makes one per chunk). On a free tier, run test cases one at a time with a pause between them.

## Closing thoughts

An answer can be faithful, relevant and wrong. It can be wrong because of the retriever even when the generator is perfect, and no single score shows both.

Each metric covers a different way the system can fail. Retriever metrics show whether the right facts arrived. Generator metrics show what the model did with them. Running the generator on golden context and then on retrieved context shows which part to fix.

These five metrics show where a pipeline breaks. Checking whether the final answer is *true* and *complete* against an ideal answer needs a judge with your own criteria, and that's what my next post covers.

The full project, with the evals, goldens and every logged run, is on GitHub: [devrahulbanjara/RAG-eval](https://github.com/devrahulbanjara/RAG-eval). There's also a shorter write-up in my [Insurance RAG Eval case study](/work/insurance-rag-eval).
