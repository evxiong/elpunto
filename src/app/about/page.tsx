export default function About() {
  return (
    <div className="w-full sm:max-w-md font-manrope mt-10">
      <div className="text-3xl font-space font-medium tracking-tight mb-6 flex flex-row items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          className="w-6 h-6 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>
        About
      </div>
      <p className="text-base font-medium tracking-normal text-neutral-700 mb-4">
        <a
          href="https://platform.openai.com/docs/models/gpt-3-5"
          className="hover:text-green underline-offset-4 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub Repo
        </a>
      </p>
      <p className="text-base font-medium tracking-normal text-neutral-700 mb-4">
        El Punto uses{" "}
        <a
          href="https://www.sbert.net/"
          className="hover:text-green underline-offset-4 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          SentenceTransformers
        </a>{" "}
        and scikit-learn&rsquo;s hierarchical agglomerative clustering algorithm
        to cluster similar news headlines, as part of{" "}
        <a
          href="https://maartengr.github.io/BERTopic/index.html"
          className="hover:text-green underline-offset-4 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          BERTopic
        </a>{" "}
        .
      </p>
      <p className="text-base font-medium tracking-normal text-neutral-700 mb-4">
        In addition, El Punto uses OpenAI&rsquo;s{" "}
        <a
          href="https://platform.openai.com/docs/models/gpt-3-5"
          className="hover:text-green underline-offset-4 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          GPT-3.5 Turbo model
        </a>{" "}
        to summarize news headlines. Because of this, some summaries may not
        accurately represent the headlines they are based on.
      </p>

      {/* <a href="" target="_blank" rel="noopener noreferrer">
        <button className="font-manrope text-sm hover:text-blue-500 hover:border-blue-500 px-3 py-1 my-2 border border-gray-200 text-neutral-500 rounded-full flex flex-row items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
            <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
          </svg>
          GitHub Repository
        </button>
      </a> */}
    </div>
  );
}
