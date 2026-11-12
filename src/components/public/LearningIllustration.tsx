import { BookOpen, Check, Code2, Sparkles } from "lucide-react";

/** Decorative, CSS-animated artwork. No scripts, remote assets, or layout shifts. */
export function LearningIllustration() {
  return (
    <div className="learning-illustration" aria-hidden="true">
      <div className="illustration-orbit orbit-one" />
      <div className="illustration-orbit orbit-two" />
      <span className="illustration-dot dot-one" />
      <span className="illustration-dot dot-two" />
      <span className="illustration-spark">
        <Sparkles size={25} strokeWidth={1.5} />
      </span>

      <div className="illustration-window">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex gap-1.5">
            <i className="h-2 w-2 rounded-full bg-rose-200" />
            <i className="h-2 w-2 rounded-full bg-amber-200" />
            <i className="h-2 w-2 rounded-full bg-sage-300" />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            a little progress, every day
          </span>
          <Code2 size={15} className="text-sage-600" />
        </div>
        <div className="grid grid-cols-[38px_1fr] gap-3 p-6 font-mono text-[12px] leading-[2.1] sm:text-[13px]">
          <div className="select-none border-r border-border text-center text-navy-300">
            01
            <br />
            02
            <br />
            03
            <br />
            04
            <br />
            05
            <br />
            06
          </div>
          <div className="text-navy-500">
            <div>
              <span className="text-violet-500">const</span> developer = {"{"}
            </div>
            <div className="pl-4">
              curiosity: <span className="text-sage-600">true</span>,
            </div>
            <div className="pl-4">
              learn:{" "}
              <span className="text-sage-600">
                &apos;one step at a time&apos;
              </span>
              ,
            </div>
            <div className="pl-4">
              build:{" "}
              <span className="text-sage-600">&apos;something real&apos;</span>
            </div>
            <div>{"};"}</div>
            <div className="code-result">
              <span className="text-cyan-600">developer</span>.start()
              <span className="code-caret" />
            </div>
          </div>
        </div>
        <div className="mx-5 mb-5 flex items-center gap-2 rounded-xl bg-sage-50 px-4 py-3 text-xs text-sage-700">
          <Check size={14} /> Your next chapter starts here.
        </div>
      </div>

      <div className="illustration-book">
        <svg viewBox="0 0 180 150" fill="none" className="h-full w-full">
          <path
            d="M20 31c24-10 47-6 70 9 23-15 46-19 70-9v90c-23-7-47-4-70 10-23-14-47-17-70-10V31Z"
            fill="#fff"
            stroke="#9BCDBB"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M27 24c22-7 43-3 63 12 20-15 41-19 63-12v88c-21-5-42 0-63 14-21-14-42-19-63-14V24Z"
            fill="#E0F3EB"
            stroke="#69AD93"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M90 36v90M39 44c13-2 25 1 38 8M39 57c13-1 25 2 38 9M39 70c13 0 25 4 38 10M39 84c13 0 25 4 38 10"
            stroke="#8FC4AE"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="m116 53-10 10 10 10m17-20 10 10-10 10m-6-25-5 30"
            stroke="#168164"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M105 91c13-5 23-7 35-6"
            stroke="#8FC4AE"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="illustration-card illustration-card-top">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#5A7CB5]">
          <Code2 size={21} />
        </span>
        <div>
          <p className="text-xs font-semibold text-navy">
            Learn. Build. Repeat.
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Small steps. Real skills.
          </p>
        </div>
      </div>
      <div className="illustration-card illustration-card-bottom">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-sage-600">
          <BookOpen size={20} />
        </span>
        <div>
          <p className="text-xs font-semibold text-navy">
            Made for your next step
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Free resources. Open possibilities.
          </p>
        </div>
        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-sage-100 text-sage-600">
          <Check size={12} />
        </span>
      </div>
    </div>
  );
}
