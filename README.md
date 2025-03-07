<h1>
  <a href="https://elpunto.vercel.app" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/948a0ab6-e48e-4d0b-9e34-daf1a254b717">
      <source media="(prefers-color-scheme: light)" srcset="https://github.com/user-attachments/assets/2ed89018-0925-411d-a031-3f0e1782ef9b">
      <img alt="EFI logo" height="40" src="https://github.com/user-attachments/assets/948a0ab6-e48e-4d0b-9e34-daf1a254b717">
    </picture>
  </a>
</h1>

A web app that leverages [DeepSeek-V3](https://www.deepseek.com/) and
[Sentence Transformers](https://sbert.net/) to aggregate and summarize top news
headlines.

**Check it out at
<a href="https://elpunto.vercel.app"><kbd>elpunto.vercel.app</kbd></a>.**

El Punto automatically updates twice per day (at 13:00 and 21:00 UTC) with top
headlines from a [variety of sources](/lambda/src/top.csv). It previously used
OpenAI's GPT-3.5 Turbo model.

> [!TIP]
>
> Toggle between light and dark mode by clicking the website logo.

<!-- [Read more about how El Punto works.]() -->

## Tools Used

- **Frontend**: TypeScript, Next.js, React, Tailwind CSS
- **Backend**: Python, Amazon DynamoDB, AWS Lambda, Amazon ECR, Amazon
  EventBridge, Docker, DeepSeek-V3, OpenAI GPT-3.5 Turbo, Sentence Transformers,
  BERTopic
