export default function Card() {
  return (
    <div className="flex flex-col gap-4 px-6 py-6 border border-gray-200 rounded-md mb-7">
      <div className="text-green font-space font-medium text-xs tracking-tight">Top Headlines</div>
      <div className="grid grid-cols-1 gap-y-6 gap-x-8 lg:grid-cols-2">
        <Headline section={1} title={"Supreme Court strikes down affirmative action"}/>
        <Headline section={16} title={"Judge limits Biden admin’s contact with social media firms"}/>
        <Headline section={4} title={"Suspected cocaine found in White House"}/>
        <Headline section={2} title={"Israel withdraws from Jenin in West Bank"}/>
        <Headline section={8} title={"A Veery Long and Obnoxious Business Headline to Test the Overflow Blah Blah Blah"}/>
        <Headline section={8} title={"A Veery Long and Obnoxious Business Headline to Test the Overflow Blah Blah Blah"}/>

      </div>
    </div>
  )
}

function Headline({ title, section } : { title: string, section: keyof typeof SECTIONS }) {
  const SECTIONS = {
    1: ['text-red', 'U.S.'],
    2: ['text-world', 'World'],
    4: ['text-politics', 'Politics'],
    8: ['text-business', 'Business'],
    16: ['text-tech', 'Tech'],
    32: ['text-sports', 'Sports'],
    64: ['text-entertainment', 'Entertainment'],
    128: ['text-science', 'Science'],
    256: ['text-health', 'Health']
  }

  return (
    <div className="flex flex-col gap-1">
    <div className="text-[21px] font-normal font-inter md:line-clamp-1 leading-[26px] text-gray-800" title={title}>
      {title}
    </div>
    <div className="flex flex-row gap-4 font-space text-xs">
      <div className={`${SECTIONS[section][0]} font-medium`}>{SECTIONS[section][1]}</div>
      <div>30m</div>
      <div>CNN - AP</div>
    </div>
  </div>
  )
}