# El Punto

El Punto is a web app that leverages AI to aggregate top news stories. Check it out at <a href="https://elpunto.vercel.app"><kbd>elpunto.vercel.app</kbd></a>!

> [!TIP]
> Click on the logo to toggle between light and dark mode!

The web app automatically updates twice per day with top news headlines from a [variety of news sources](https://github.com/evxiong/elpunto/blob/main/src/lambda/src/top.csv).

<!-- [Read more about how El Punto works.]() -->

## Tools Used

- **Frontend**: TypeScript, Next.js, React, Tailwind CSS
- **Backend**: Python, Amazon DynamoDB, AWS Lambda, Amazon ECR, Amazon EventBridge, Docker, OpenAI GPT-3.5 Turbo, SentenceTransformers, BERTopic
