<h1 align="center">
  <a href="https://elpunto.vercel.app" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/948a0ab6-e48e-4d0b-9e34-daf1a254b717">
      <source media="(prefers-color-scheme: light)" srcset="https://github.com/user-attachments/assets/2ed89018-0925-411d-a031-3f0e1782ef9b">
      <img alt="El Punto logo" height="36" src="https://github.com/user-attachments/assets/948a0ab6-e48e-4d0b-9e34-daf1a254b717">
    </picture>
  </a>
</h1>

<div align="center">
  
El Punto uses [DeepSeek-V3](https://www.deepseek.com/en) and
[Sentence Transformers](https://sbert.net/) to aggregate and summarize top news
headlines.

<a href="https://elpunto.vercel.app">
<img alt="Desktop screenshot of El Punto" src="https://github.com/user-attachments/assets/4ad8d63d-59fa-4f61-a128-348aa3f9911f">
</a>

</div>

<br/>

Things move fast in today’s 24-hour news cycle. El Punto (Spanish for _The
Point_) summarizes the most important stories and presents them in a minimal,
easy-to-scan format to help you stay on top of the latest headlines.

El Punto automatically updates twice per day (at 13:00 and 21:00 UTC) using
articles from a [variety of sources](/lambda/src/top.csv). Prior to DeepSeek-V3,
El Punto used OpenAI's GPT-3.5 Turbo model.

**Check it out at [elpunto.vercel.app](https://elpunto.vercel.app).**

<!-- [Read more about how El Punto works.]() -->

<br/>

## Built with

- **Frontend**: TypeScript, Next.js, React, Tailwind CSS, Radix UI
- **Backend**: Python, Amazon DynamoDB, AWS Lambda, Amazon ECR, Amazon
  EventBridge, Docker, DeepSeek-V3, OpenAI GPT-3.5 Turbo, Sentence Transformers,
  BERTopic
