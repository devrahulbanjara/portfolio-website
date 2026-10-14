---
title: How I keep the AI assistant on my portfolio safe
slug: how-i-keep-my-portfolio-ai-assistant-safe
excerpt: The assistant on this site answers questions about me and can even pass on a message. Here's how it's built so it can't be talked into anything else.
tags: agents, llm, guardrails, gemini
---

This site has an AI assistant. You can ask it about my work, my teaching or how to hire me, and it answers using what's on the site. It can also draft a message to me for you.

Anything public that talks will be tested. People will ask it to write their homework, reveal its instructions, or pretend to be something else. Here's how I built it so that doesn't work.

## It only knows about me

The assistant doesn't search the web. Before it answers, the server looks up the most relevant notes from a small knowledge base built from this site — my experience, certifications, teaching and projects — and hands them to the model. It's told to answer only from those notes, and to say "I don't know" rather than guess.

## Guardrails in three layers

**Before the model.** Every message is checked for length and for common prompt-injection patterns ("ignore your instructions", fake system tags, long encoded text). Suspicious messages are flagged, and every visitor has rate limits so nobody can burn through my free API quota.

**In the model's instructions.** It's told exactly what it may talk about. For anything else it must call a `decline` tool instead of writing a reply — so refusals are consistent and every one is logged.

**After the model.** Answers are checked before they're shown: a hidden marker catches any attempt to leak the instructions, off-site links are removed, and tool calls written out as text are stripped.

## It can't do anything by itself

The assistant can draft a message to me, but it can't send it. You see the draft on a card, edit it if you like, and press Send. The model has no way to press that button. That one rule closes a whole class of attacks: even if someone tricks the model, nothing leaves the chat without a human click.

## Two models, one experience

The assistant uses Google's Gemini models first. If they're busy or rate-limited, it automatically switches to a backup model on Groq, and remembers how long to wait before trying Gemini again. Visitors just see an answer.

## Everything is traced

Every question, every tool the assistant used, the model, the timing, the tokens and any guardrail decision are recorded. In my admin panel I can open any conversation and see exactly how each answer was made — and which answers visitors marked as not helpful, so I know what to improve.

Try it: open the assistant and ask what I've built — or try to make it misbehave.
