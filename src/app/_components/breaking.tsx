export default function Breaking() {
  return (
    <div className="flex flex-col w-full gap-2 border px-6 py-4 border-red rounded-md md:flex-row md:gap-12 md:items-center mb-7">
      <div className="font-space text-red font-medium text-xs tracking-tight">BREAKING</div>
      <div className="flex flex-col gap-1">
        <div className="text-[21px] font-medium font-inter tracking-tight leading-6">FDA approves Alzheimer's drug</div>
        <div className="flex flex-row gap-4 font-space text-xs">
          <div className="text-science font-medium">Science</div>
          <div>30m</div>
          <div>CNN - AP</div>
        </div>
      </div>
    </div>
  )
}
