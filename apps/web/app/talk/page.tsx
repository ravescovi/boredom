import { ConvoCards } from "../../components/ConvoCards";

export default function TalkPage() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-10">
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-hot px-3 py-1.5 text-[12px] font-bold uppercase tracking-[.08em] text-paper shadow-brut-sm">
          💬 Conversation Cards
        </span>
        <h1 className="mt-4 font-display text-[clamp(40px,6vw,72px)] font-extrabold leading-[.92] -tracking-[.03em]">
          Real talk.
          <br />
          <span className="inline-block border-[3px] border-ink bg-butter px-3 shadow-brut">
            Better conversations.
          </span>
        </h1>
        <p className="mt-4 max-w-[480px] text-[16px] leading-[1.55] text-ink/80">
          Pick a theme, draw a card, talk it out. For couples, friends, or anyone who wants to go a little deeper.
        </p>
      </div>
      <ConvoCards />
    </main>
  );
}
