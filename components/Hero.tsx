export default function Hero() {
  return (
    <div className="mx-auto max-w-7xl w-full py-6  text-center lg:py-12  lg:text-left">
      <div className="px-4 w-full  flex flex-col justify-center items-center">
        <span className="px-3 py-1 text-blue-gray-50 text-sm font-semibold leading-4 uppercase tracking-wide bg-gradient-to-b from-yellow-400 to-amber-500 rounded-full">
          Coming soon!
        </span>
        <h1 className=" text-4xl xl:inline text-blue-gray-900 tracking-tight font-extrabold sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl text-center">
          Applicant management
        </h1>
        <h1 className=" p-1 text-4xl xl:inline text-blue-gray-900 text-emerald tracking-tight font-extrabold sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl text-center">
          at any scale
        </h1>
        <p className="mt-3 mx-auto text-xl text-center text-blue-gray-700 sm:text-2xl md:mt-5">
          Plutomi automates your entire application process with streamlined
          workflows
        </p>
      </div>
    </div>
  );
}
