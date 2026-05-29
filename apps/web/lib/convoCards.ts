// Static conversation card library — 8 themes × 20 cards

export type CardType = "question" | "task" | "would-you-rather" | "scenario";

export type ConvoCard = {
  id: string;
  text: string;
  type: CardType;
};

export type Theme = {
  id: string;
  label: string;
  emoji: string;
  tagline: string;
  audience: string;
  bg: string;
  textColor: string;
  accentColor: string; // for badges / borders on the card
};

export const THEMES: Theme[] = [
  {
    id: "couples",
    label: "Couples",
    emoji: "💑",
    tagline: "Deepen your connection",
    audience: "romantic partners",
    bg: "#FF5C8A",
    textColor: "#FFFCF0",
    accentColor: "rgba(255,255,255,0.25)",
  },
  {
    id: "friends",
    label: "Friends",
    emoji: "👯",
    tagline: "Get to know each other better",
    audience: "close friends",
    bg: "#8AD7FF",
    textColor: "#1A1A1A",
    accentColor: "rgba(26,26,26,0.12)",
  },
  {
    id: "deep",
    label: "Deep Talk",
    emoji: "🌊",
    tagline: "Go below the surface",
    audience: "anyone",
    bg: "#C9B6FF",
    textColor: "#1A1A1A",
    accentColor: "rgba(26,26,26,0.12)",
  },
  {
    id: "laughs",
    label: "Just Laughs",
    emoji: "😂",
    tagline: "Keep it light and fun",
    audience: "friends or couples",
    bg: "#FFE45C",
    textColor: "#1A1A1A",
    accentColor: "rgba(26,26,26,0.12)",
  },
  {
    id: "dreams",
    label: "Dreams & Goals",
    emoji: "🌍",
    tagline: "Talk about what's ahead",
    audience: "anyone",
    bg: "#5BE0B0",
    textColor: "#1A1A1A",
    accentColor: "rgba(26,26,26,0.12)",
  },
  {
    id: "nostalgia",
    label: "Nostalgia",
    emoji: "👶",
    tagline: "Remember the good old days",
    audience: "anyone",
    bg: "#FFFCF0",
    textColor: "#1A1A1A",
    accentColor: "rgba(26,26,26,0.08)",
  },
  {
    id: "wyr",
    label: "Would You Rather",
    emoji: "🤔",
    tagline: "No wrong answers… maybe",
    audience: "anyone",
    bg: "#1A1A1A",
    textColor: "#FFFCF0",
    accentColor: "rgba(255,255,255,0.18)",
  },
  {
    id: "challenges",
    label: "Challenges",
    emoji: "🎯",
    tagline: "Stop talking — start doing",
    audience: "friends or couples",
    bg: "#2E5240",
    textColor: "#FFFCF0",
    accentColor: "rgba(255,255,255,0.18)",
  },
];

const CARD_LIBRARY: Record<string, ConvoCard[]> = {
  couples: [
    { id: "c01", type: "question", text: "What did you first notice about me when we met?" },
    { id: "c02", type: "question", text: "What's one thing I do that makes you feel most loved?" },
    { id: "c03", type: "question", text: "What's your favorite memory of us together?" },
    { id: "c04", type: "question", text: "What does your perfect Sunday with me look like?" },
    { id: "c05", type: "question", text: "What's something you've always wanted to tell me but haven't yet?" },
    { id: "c06", type: "question", text: "How do you think we've changed each other for the better?" },
    { id: "c07", type: "question", text: "What's one thing you wish we did more of together?" },
    { id: "c08", type: "question", text: "What's a small thing I do that you really appreciate?" },
    { id: "c09", type: "question", text: "What song makes you think of us, and why?" },
    { id: "c10", type: "question", text: "If you could relive one day from our relationship, which would it be?" },
    { id: "c11", type: "question", text: "What was the moment you knew you were falling for me?" },
    { id: "c12", type: "question", text: "What's one thing you want us to try together this year?" },
    { id: "c13", type: "question", text: "How do you want us to grow together over the next five years?" },
    { id: "c14", type: "question", text: "What's something I helped you see differently about yourself?" },
    { id: "c15", type: "question", text: "What's something you secretly love that I do?" },
    { id: "c16", type: "question", text: "If you wrote a book about our relationship, what would the title be?" },
    { id: "c17", type: "task",     text: "Tell each other one thing you've been meaning to say for a while but kept putting off." },
    { id: "c18", type: "task",     text: "Each of you: describe your ideal version of next year — together." },
    { id: "c19", type: "scenario", text: "You both have a completely free weekend with no plans. What do you each secretly hope happens?" },
    { id: "c20", type: "question", text: "What's one thing we could do this week to make each other feel more appreciated?" },
  ],

  friends: [
    { id: "f01", type: "question", text: "What's the most spontaneous thing we've ever done together?" },
    { id: "f02", type: "question", text: "What's something I've taught you, even if I didn't know I was teaching it?" },
    { id: "f03", type: "question", text: "How would you describe our friendship to someone who doesn't know us?" },
    { id: "f04", type: "question", text: "What's the best piece of advice you've ever gotten — and did you take it?" },
    { id: "f05", type: "question", text: "What's something you've always admired about me?" },
    { id: "f06", type: "question", text: "What's a phase or version of me you actually miss?" },
    { id: "f07", type: "question", text: "When did you first feel like we were going to be real friends?" },
    { id: "f08", type: "question", text: "What's the most generous thing someone has ever done for you?" },
    { id: "f09", type: "question", text: "What's one thing you want to accomplish before your next birthday?" },
    { id: "f10", type: "question", text: "What's something you want more of in your life right now?" },
    { id: "f11", type: "question", text: "What's your biggest regret — and what did you learn from it?" },
    { id: "f12", type: "question", text: "What's something you do differently because of knowing me?" },
    { id: "f13", type: "question", text: "What does a perfect day look like for you right now?" },
    { id: "f14", type: "question", text: "If you called me at 3am needing help, what would you hope I'd do?" },
    { id: "f15", type: "question", text: "What's a friendship habit you think we should start?" },
    { id: "f16", type: "question", text: "If you made a documentary about your life so far, what would it be called?" },
    { id: "f17", type: "task",     text: "Share a story you've never told anyone in this group before." },
    { id: "f18", type: "task",     text: "Text someone you haven't spoken to in too long — right now. Show the group." },
    { id: "f19", type: "scenario", text: "You and your friends get a spontaneous invitation to travel somewhere tomorrow. Where do you hope it is?" },
    { id: "f20", type: "question", text: "What's a goal you've been putting off — and why?" },
  ],

  deep: [
    { id: "d01", type: "question", text: "What belief have you held for years that you've since changed your mind about?" },
    { id: "d02", type: "question", text: "What does success mean to you — and are you living by that definition?" },
    { id: "d03", type: "question", text: "What's something most people misunderstand about you?" },
    { id: "d04", type: "question", text: "When do you feel most like yourself?" },
    { id: "d05", type: "question", text: "What's a fear you've never fully admitted to anyone?" },
    { id: "d06", type: "question", text: "What's something you're still healing from?" },
    { id: "d07", type: "question", text: "What's the most important thing you've learned about love?" },
    { id: "d08", type: "question", text: "What version of your future self are you most scared of becoming?" },
    { id: "d09", type: "question", text: "What would you do differently if you knew nobody would judge you?" },
    { id: "d10", type: "question", text: "What relationship in your life taught you the most about yourself?" },
    { id: "d11", type: "question", text: "What do you need more of in your life — and what's stopping you?" },
    { id: "d12", type: "question", text: "What do you want people to say about you after you're gone?" },
    { id: "d13", type: "question", text: "What's a chapter of your life you haven't fully closed yet?" },
    { id: "d14", type: "question", text: "What makes you feel genuinely understood?" },
    { id: "d15", type: "question", text: "When was the last time you surprised yourself?" },
    { id: "d16", type: "question", text: "What's the bravest thing you've ever done?" },
    { id: "d17", type: "question", text: "What's something you've forgiven yourself for that took a long time?" },
    { id: "d18", type: "question", text: "What does 'home' feel like to you?" },
    { id: "d19", type: "scenario", text: "You could know one undeniable truth about yourself. Do you want to know it? And what do you think it would be?" },
    { id: "d20", type: "question", text: "If you could know one truth about the universe, what would you ask?" },
  ],

  laughs: [
    { id: "l01", type: "question", text: "What's the most embarrassing thing on your phone right now?" },
    { id: "l02", type: "question", text: "If you had a theme song that played every time you walked into a room, what would it be?" },
    { id: "l03", type: "question", text: "What's a ridiculous hill you will absolutely die on?" },
    { id: "l04", type: "question", text: "What's the worst haircut you've ever had?" },
    { id: "l05", type: "question", text: "If your pet — or your ideal pet — could talk, what would they say about you?" },
    { id: "l06", type: "question", text: "What's something you're irrationally good at?" },
    { id: "l07", type: "question", text: "What's your most useless talent?" },
    { id: "l08", type: "question", text: "What movie or show do you watch even though you know it's terrible?" },
    { id: "l09", type: "question", text: "What's the weirdest food combination you actually love?" },
    { id: "l10", type: "question", text: "If you had to give a TED Talk on a ridiculous topic, what would it be?" },
    { id: "l11", type: "question", text: "What's the most dramatic thing you've done over something small?" },
    { id: "l12", type: "question", text: "What word do you use way too much?" },
    { id: "l13", type: "question", text: "If you were a flavor of ice cream, what would you be and why?" },
    { id: "l14", type: "question", text: "What's something you've done that you still can't fully explain?" },
    { id: "l15", type: "question", text: "What's your go-to karaoke song — even if you'd never admit it?" },
    { id: "l16", type: "question", text: "What's an opinion you hold that would cost you followers?" },
    { id: "l17", type: "question", text: "If your life was a reality TV show, what would it be called?" },
    { id: "l18", type: "question", text: "What's the strangest dream you've had recently?" },
    { id: "l19", type: "task",     text: "Do your best impression of someone in the room. Everyone guesses who it is." },
    { id: "l20", type: "task",     text: "Describe your week using only movie titles." },
  ],

  dreams: [
    { id: "dr01", type: "question", text: "Where in the world would you move if you had absolutely no constraints?" },
    { id: "dr02", type: "question", text: "What would you do if you knew you couldn't fail?" },
    { id: "dr03", type: "question", text: "What's a dream you've had since childhood that still feels real?" },
    { id: "dr04", type: "question", text: "What does your ideal Wednesday look like in 10 years?" },
    { id: "dr05", type: "question", text: "If you could master one skill overnight, what would it be?" },
    { id: "dr06", type: "question", text: "What project have you been putting off that you actually care about?" },
    { id: "dr07", type: "question", text: "If money wasn't a factor, how would you spend your time?" },
    { id: "dr08", type: "question", text: "What's one adventure you want to have before you're 10 years older?" },
    { id: "dr09", type: "question", text: "What's a place you've always wanted to visit that most people haven't heard of?" },
    { id: "dr10", type: "question", text: "If you had 6 months completely free, what would your passion project be?" },
    { id: "dr11", type: "question", text: "If you wrote a book, what would it be about?" },
    { id: "dr12", type: "question", text: "What does your dream home feel like — not look like?" },
    { id: "dr13", type: "question", text: "What kind of impact do you want to have on your community?" },
    { id: "dr14", type: "question", text: "If you could collaborate with anyone in the world, who would it be?" },
    { id: "dr15", type: "question", text: "What would make you feel like you've 'made it'?" },
    { id: "dr16", type: "question", text: "What's a dream you've given up on — and is it really gone?" },
    { id: "dr17", type: "question", text: "What's something you want to be noticeably better at by the end of this year?" },
    { id: "dr18", type: "scenario", text: "You just got handed one year off — completely free, fully funded. What do you do with it?" },
    { id: "dr19", type: "task",     text: "Write down your biggest dream on a piece of paper — then share it only if you want to." },
    { id: "dr20", type: "question", text: "If you could send one message to your future self, what would you say?" },
  ],

  nostalgia: [
    { id: "n01", type: "question", text: "What's a toy or game from childhood you'd love to play again right now?" },
    { id: "n02", type: "question", text: "What's the earliest memory you can recall?" },
    { id: "n03", type: "question", text: "What smell instantly takes you back to childhood?" },
    { id: "n04", type: "question", text: "Who was your biggest influence growing up, and how did they shape you?" },
    { id: "n05", type: "question", text: "What's a family tradition you loved — or one you wish you'd had?" },
    { id: "n06", type: "question", text: "What were you like as a kid that you've mostly grown out of?" },
    { id: "n07", type: "question", text: "What's a class or teacher that changed how you see the world?" },
    { id: "n08", type: "question", text: "What's something you believed as a kid that you now find hilarious?" },
    { id: "n09", type: "question", text: "What music defined a particular era of your life?" },
    { id: "n10", type: "question", text: "What's a friendship from your past you still think about?" },
    { id: "n11", type: "question", text: "What was your dream job at age 10?" },
    { id: "n12", type: "question", text: "What's the most adventurous thing you did as a teenager?" },
    { id: "n13", type: "question", text: "What's a place from your past that no longer exists the way you remember it?" },
    { id: "n14", type: "question", text: "What's a book, movie, or show that shaped who you became?" },
    { id: "n15", type: "question", text: "What did summer feel like to you as a kid?" },
    { id: "n16", type: "question", text: "What would your younger self be most surprised to know about you now?" },
    { id: "n17", type: "question", text: "What's a lesson you learned the hard way — and would you take it back?" },
    { id: "n18", type: "question", text: "Who was the most interesting person you grew up around?" },
    { id: "n19", type: "question", text: "What's something from your childhood you've quietly carried into adulthood?" },
    { id: "n20", type: "question", text: "What would a perfect day have looked like when you were 12?" },
  ],

  wyr: [
    { id: "w01", type: "would-you-rather", text: "Would you rather always say what you're thinking, or never speak again?" },
    { id: "w02", type: "would-you-rather", text: "Would you rather travel to the future or the past?" },
    { id: "w03", type: "would-you-rather", text: "Would you rather be famous for something embarrassing, or unknown for something great?" },
    { id: "w04", type: "would-you-rather", text: "Would you rather have one trusted friend or a hundred acquaintances?" },
    { id: "w05", type: "would-you-rather", text: "Would you rather live in a massive city or a tiny village?" },
    { id: "w06", type: "would-you-rather", text: "Would you rather know the date you'll die, or the cause?" },
    { id: "w07", type: "would-you-rather", text: "Would you rather be wildly successful in a field you don't love, or quietly great at something you do?" },
    { id: "w08", type: "would-you-rather", text: "Would you rather have perfect memory or endless creativity?" },
    { id: "w09", type: "would-you-rather", text: "Would you rather relive your best day or erase your worst?" },
    { id: "w10", type: "would-you-rather", text: "Would you rather speak every language or play every instrument?" },
    { id: "w11", type: "would-you-rather", text: "Would you rather read minds or be invisible?" },
    { id: "w12", type: "would-you-rather", text: "Would you rather lose all your photos or all your messages?" },
    { id: "w13", type: "would-you-rather", text: "Would you rather be the smartest person in every room, or the most charismatic?" },
    { id: "w14", type: "would-you-rather", text: "Would you rather give up social media or coffee for one year?" },
    { id: "w15", type: "would-you-rather", text: "Would you rather have unlimited money but no free time, or all the free time but just enough money?" },
    { id: "w16", type: "would-you-rather", text: "Would you rather always be overdressed or always underdressed?" },
    { id: "w17", type: "would-you-rather", text: "Would you rather know everything about your future, or nothing at all?" },
    { id: "w18", type: "would-you-rather", text: "Would you rather always have to whisper or always have to shout?" },
    { id: "w19", type: "would-you-rather", text: "Would you rather be the funniest person alive, or the wisest?" },
    { id: "w20", type: "would-you-rather", text: "Would you rather spend a week alone in nature or a week in a city you've never visited?" },
  ],

  challenges: [
    { id: "ch01", type: "task", text: "Tell the person next to you one thing you genuinely admire about them — no deflecting, no jokes." },
    { id: "ch02", type: "task", text: "Share a story you have never told anyone in this group." },
    { id: "ch03", type: "task", text: "Describe how you met someone in this group — but make it sound like the opening of a movie." },
    { id: "ch04", type: "task", text: "Go around the group: each person says one word that describes the vibe right now." },
    { id: "ch05", type: "task", text: "Show the group the last photo on your camera roll and explain what's happening." },
    { id: "ch06", type: "task", text: "Everyone shares one thing they've been putting off — and says when they'll actually do it." },
    { id: "ch07", type: "task", text: "Share the most recently played song on your phone. Tell the group why it was on." },
    { id: "ch08", type: "task", text: "Everyone finishes this sentence aloud: 'Most people don't know that I…'" },
    { id: "ch09", type: "task", text: "Go around and say one honest, kind thing to each person in the group." },
    { id: "ch10", type: "task", text: "Each person shares one thing they're proud of that they've never been thanked for." },
    { id: "ch11", type: "task", text: "Share a moment when you failed at something — and what happened next." },
    { id: "ch12", type: "task", text: "Everyone shares the best piece of advice they've ever received." },
    { id: "ch13", type: "task", text: "Tell the group what superpower you'd give each person here, and why." },
    { id: "ch14", type: "task", text: "Each person shares one goal they have for the next six months." },
    { id: "ch15", type: "task", text: "Describe your perfect day from start to finish. You have 60 seconds." },
    { id: "ch16", type: "task", text: "Share one unpopular opinion you genuinely hold." },
    { id: "ch17", type: "task", text: "Pick one item in your bag or pocket and tell a story about it." },
    { id: "ch18", type: "task", text: "Each person asks the group one question they've always wanted to ask." },
    { id: "ch19", type: "task", text: "Write down your biggest dream. Share it only if you want to. Then discuss what's actually stopping you." },
    { id: "ch20", type: "task", text: "Everyone: say the name of someone outside this group you should check in with soon — then do it." },
  ],
};

export function getCardsForTheme(themeId: string): ConvoCard[] {
  return (CARD_LIBRARY[themeId] ?? []).map((c) => ({ ...c }));
}

export function shuffleCards(cards: ConvoCard[]): ConvoCard[] {
  const a = [...cards];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function findTheme(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}
