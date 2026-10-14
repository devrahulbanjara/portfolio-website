---
title: Fine-tuning Whisper Small for Nepali speech
slug: fine-tuning-whisper-small-for-nepali
excerpt: How I fine-tuned OpenAI's Whisper Small on Devanagari Nepali and brought the word error rate down from 130.80% to 31.64%.
tags: speech, nepali, hugging-face, fine-tuning
---

Off-the-shelf speech recognition barely works for Nepali. When I tested Whisper Small on Nepali audio, its **word error rate was 130.80%** — it produced more wrong words than there were words in the audio. After fine-tuning, the same model reached **31.64%**. The model is public on [Hugging Face](https://huggingface.co/devrahulbanjara/whisper-small-nepali).

This post explains the approach.

## Why the base model struggles

Whisper is trained on a huge amount of audio, but very little of it is Nepali. In practice the base model often guesses Hindi, mixes scripts, or invents words. A word error rate above 100% sounds impossible, but it happens when the model inserts lots of words that were never spoken.

## The setup

The pieces are standard Hugging Face tooling:

- **Model:** `openai/whisper-small` — small enough to fine-tune on a single GPU.
- **Data:** Nepali speech paired with Devanagari transcripts.
- **Training:** `Seq2SeqTrainer` from `transformers`, with the language and task fixed to Nepali transcription.

```python
from transformers import WhisperProcessor, WhisperForConditionalGeneration

processor = WhisperProcessor.from_pretrained("openai/whisper-small", language="nepali", task="transcribe")
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-small")

# Tell the model to always transcribe Nepali instead of guessing the language.
model.generation_config.language = "nepali"
model.generation_config.task = "transcribe"
```

## What mattered most

**Fixing the language.** Forcing the language to Nepali stops the model from drifting into Hindi or English.

**Clean transcripts.** Consistent Devanagari text — same spellings, punctuation handled the same way everywhere — matters as much as the amount of audio.

**Measuring the right thing.** I tracked word error rate on a held-out set throughout training, not just the training loss. Loss can keep improving while real transcription quality stalls.

## Result

| Model | Word error rate |
| --- | --- |
| Whisper Small (base) | 130.80% |
| Whisper Small (fine-tuned on Nepali) | **31.64%** |

There is still a long way to go — 31.64% means roughly one word in three needs correcting — but it turns an unusable model into a useful starting point for Nepali voice tools.

## What I'd try next

- More varied audio: different speakers, accents and background noise.
- A larger Whisper model, now that the training pipeline works.
- Evaluating on everyday conversational speech, not just read text.

If you're working on speech or language tools for Nepali, I'd love to compare notes — [get in touch](/contact).
