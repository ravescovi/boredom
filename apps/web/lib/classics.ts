import type { GameSpec } from "@bordon-ai/shared";
import { GameSpecSchema } from "@bordon-ai/shared";

export type ClassicGame = {
  shortId: string;
  emoji: string;
  blurb: string;
  spec: GameSpec;
};

const raw: Array<{
  shortId: string;
  emoji: string;
  blurb: string;
  spec: Omit<GameSpec, "id" | "commercialUseAllowed">;
}> = [
  {
    shortId: "CHARAD",
    emoji: "🎭",
    blurb: "Act it out — no words allowed.",
    spec: {
      title: "Charades",
      summary:
        "One player silently acts out a phrase while their team races the clock to guess it. A timeless party staple.",
      playerCount: { min: 4, max: 12 },
      durationMinutes: 30,
      ageRating: "8+",
      requiredMaterials: ["paper", "pens", "a bowl or hat", "a phone timer"],
      setup: [
        "Split everyone into two roughly even teams seated facing each other.",
        "Each player secretly writes three short phrases (a movie title, a song, an activity) on slips of paper and drops them into the bowl.",
        "Decide turn order within each team and pick who goes first."
      ],
      rules: [
        "The actor draws a slip and silently mimes the phrase — no talking, lip-syncing, or pointing at written words.",
        "Their team has 60 seconds to guess; the actor may nod or shake their head in response.",
        "If the team guesses correctly within the time, they score one point.",
        "Standard signals (movie = crank a camera, syllables = fingers on the forearm) are encouraged."
      ],
      turnStructure: [
        "Active team's actor draws a slip and starts the timer.",
        "Team shouts guesses while the actor mimes.",
        "Timer ends or team guesses correctly — score is recorded.",
        "Play passes to the other team."
      ],
      gameplayLoop: [
        "Pick a slip.",
        "Mime the phrase silently.",
        "Teammates guess against the clock.",
        "Score, then pass the turn."
      ],
      scoring: ["Each correct guess within the time limit earns the team one point."],
      winCondition: "After every player on both teams has acted twice, the team with the most points wins.",
      edgeCases: [
        "If a slip is impossible or unknown, the actor may discard it once per turn with no score.",
        "If both teams tie, play one sudden-death round with a fresh slip."
      ],
      variants: [
        "Speed round: each team gets 90 seconds to clear as many slips as possible.",
        "Mixed teams: pair newcomers with veterans for an even spread of skill."
      ],
      safetyNotes: [
        "Acting only — no physical contact, lifting, or risky movement.",
        "Skip any prompt that makes a player uncomfortable; substitute a new slip."
      ]
    }
  },
  {
    shortId: "20QUST",
    emoji: "❓",
    blurb: "Guess the secret in twenty questions or fewer.",
    spec: {
      title: "Twenty Questions",
      summary:
        "One player thinks of a person, place, or thing. The rest get twenty yes-or-no questions to figure out what it is.",
      playerCount: { min: 2, max: 8 },
      durationMinutes: 15,
      ageRating: "6+",
      requiredMaterials: ["nothing (paper helps to track questions)"],
      setup: [
        "Choose who will be the 'thinker' for the first round.",
        "The thinker silently picks a single noun — a person, place, or thing — and commits to it.",
        "Decide a question-asking order so guessers take turns."
      ],
      rules: [
        "Guessers take turns asking yes-or-no questions; the thinker answers truthfully with 'yes', 'no', or 'sometimes'.",
        "Players may guess the answer at any time, but a wrong guess uses up a question.",
        "Each round is capped at twenty questions total across all guessers."
      ],
      turnStructure: [
        "Next guesser in order asks one yes/no question.",
        "Thinker answers honestly.",
        "Tally the question count, then pass to the next guesser."
      ],
      gameplayLoop: [
        "Ask a question.",
        "Listen to the answer.",
        "Update your shared mental model.",
        "Pass the turn or take a guess."
      ],
      scoring: [
        "Guessers score one point if they figure out the answer within twenty questions.",
        "The thinker scores one point if the group runs out of questions."
      ],
      winCondition: "After everyone has been the thinker once, the player with the most points wins.",
      edgeCases: [
        "A vague answer like 'sometimes' counts as one of the twenty questions.",
        "If a guess is partially right (e.g. correct category), the thinker says 'close' but the question still counts."
      ],
      variants: [
        "Themed round: restrict the answer to a single category like 'kitchen objects' or 'famous scientists'.",
        "Whisper mode: questions are written on paper to avoid leaking accidental hints."
      ],
      safetyNotes: [
        "Stick to non-personal answers — avoid people present or sensitive topics.",
        "Pause the round at any time if a question feels invasive; the thinker can substitute a new answer."
      ]
    }
  },
  {
    shortId: "PICTNR",
    emoji: "🖼️",
    blurb: "Draw it. Pass it. Watch it warp.",
    spec: {
      title: "Telephone Pictionary",
      summary:
        "A drawing-and-writing relay where a phrase becomes a sketch becomes a phrase, mutating hilariously around the table.",
      playerCount: { min: 4, max: 10 },
      durationMinutes: 25,
      ageRating: "8+",
      requiredMaterials: ["one small notebook per player", "pens"],
      setup: [
        "Hand each player a small notebook and a pen.",
        "Everyone writes a short, original phrase on the first page of their own notebook.",
        "Decide a passing direction (clockwise) and agree on a 60-second turn timer."
      ],
      rules: [
        "When you receive a notebook with a phrase, draw what it describes on the next page, then pass.",
        "When you receive a notebook with a drawing, write a phrase describing it, then pass.",
        "Do not flip back — only react to the most recent page."
      ],
      turnStructure: [
        "Receive a notebook.",
        "If the last page is a phrase, draw it. If a drawing, describe it.",
        "Pass to the next player when the timer ends."
      ],
      gameplayLoop: [
        "Glance at the previous page.",
        "Add your interpretation.",
        "Pass.",
        "Repeat until the notebook returns to its owner."
      ],
      scoring: [
        "There are no points — at the end, each owner reads their notebook aloud and the table votes on the funniest chain."
      ],
      winCondition: "When notebooks have returned to their starting owners, share them in a final reveal — no formal winner.",
      edgeCases: [
        "If a phrase is too complex to draw, simplify it and pass on time.",
        "If the timer ends mid-stroke, finish the line and pass."
      ],
      variants: [
        "Theme round: all starting phrases must fit a category (e.g. 'sandwiches').",
        "Silent mode: no commentary allowed until the final reveal."
      ],
      safetyNotes: [
        "Keep phrases kind — no jabs at people present or sensitive topics.",
        "Original phrases only; avoid copyrighted titles or characters."
      ]
    }
  },
  {
    shortId: "WORDAS",
    emoji: "🧩",
    blurb: "Co-op word ladders against the clock.",
    spec: {
      title: "Word Association Ladder",
      summary:
        "A cooperative chain game: each player adds one word that links to the last, and the table tries to keep the ladder going as long as possible.",
      playerCount: { min: 3, max: 8 },
      durationMinutes: 15,
      ageRating: "7+",
      requiredMaterials: ["paper", "a pen", "a phone timer"],
      setup: [
        "Pick a starting word together — anything concrete works (e.g. 'lamp').",
        "Choose a scorekeeper who will write each word down in order.",
        "Agree on a per-turn time limit (5 seconds is brisk, 10 seconds is friendly)."
      ],
      rules: [
        "On your turn, say one word that clearly associates with the previous word.",
        "No repeats — once a word has been used in the current ladder, it is out.",
        "If you stall past the timer, hesitate twice, or repeat, the ladder ends and the round is over."
      ],
      turnStructure: [
        "Start the timer.",
        "Next player says a single associated word.",
        "Scorekeeper writes it down.",
        "Pass to the next player."
      ],
      gameplayLoop: [
        "Hear the previous word.",
        "Find a fresh association.",
        "Say it before the timer ends.",
        "The next player goes."
      ],
      scoring: [
        "The team scores one point per unique word added to the ladder before it collapses."
      ],
      winCondition: "Play three rounds total and try to beat your highest ladder length each time.",
      edgeCases: [
        "If two players disagree on whether a link is valid, the table votes; majority decides.",
        "Reset the ladder cleanly if the timer fails or a phone interrupts."
      ],
      variants: [
        "Themed ladder: every word must fit a chosen category like 'kitchen' or 'weather'.",
        "Rhyme mode: each word must rhyme with the previous one."
      ],
      safetyNotes: [
        "Stay seated; this is a verbal game with no movement.",
        "Keep associations kind — no targeting people present."
      ]
    }
  },
  {
    shortId: "STORYC",
    emoji: "📖",
    blurb: "One sentence at a time, a story builds.",
    spec: {
      title: "Story Cubes Round Robin",
      summary:
        "Players take turns adding one sentence to a shared story, anchored by a prompt word drawn from a small pool.",
      playerCount: { min: 3, max: 7 },
      durationMinutes: 20,
      ageRating: "8+",
      requiredMaterials: ["paper", "pens", "a bowl"],
      setup: [
        "Each player writes three random nouns on separate slips and tosses them into the bowl.",
        "Mix the bowl thoroughly.",
        "Pick who tells the opening sentence; play passes clockwise from there."
      ],
      rules: [
        "On your turn, draw a slip from the bowl and add one sentence to the story that includes that word.",
        "Sentences must connect to the existing story — no resets.",
        "Keep contributions short (one or two sentences); do not narrate over other players' turns."
      ],
      turnStructure: [
        "Draw a slip.",
        "Read your word silently.",
        "Add one sentence aloud that uses the word and continues the story.",
        "Pass."
      ],
      gameplayLoop: [
        "Listen to the story so far.",
        "Draw a word.",
        "Weave it into the next beat.",
        "Pass it along."
      ],
      scoring: [
        "No competitive scoring — at the end, the group votes on the funniest sentence and the best twist."
      ],
      winCondition: "The story ends when the bowl is empty; share favorite moments in a final wrap-up.",
      edgeCases: [
        "If a word is impossible to use, swap it once per turn for a fresh slip.",
        "Skip a sentence if it makes any player uncomfortable; draw a new word."
      ],
      variants: [
        "Genre round: pick a genre (mystery, sci-fi, romance) and stick to it throughout.",
        "Two-word challenge: draw two slips per turn and use both."
      ],
      safetyNotes: [
        "Keep the tone kind and inclusive — no targeting players or sensitive topics.",
        "Original story only; avoid copyrighted characters or worlds."
      ]
    }
  },
  {
    shortId: "QUICKD",
    emoji: "⚡",
    blurb: "Five-second category sprints.",
    spec: {
      title: "Five Second Sprint",
      summary:
        "A fast-paced naming game: a player is given a category and has five seconds to name three things in it before the buzzer.",
      playerCount: { min: 3, max: 8 },
      durationMinutes: 15,
      ageRating: "7+",
      requiredMaterials: ["paper", "pens", "a phone timer with a buzzer sound"],
      setup: [
        "Brainstorm a stack of categories together (e.g. 'breakfast foods', 'rivers', 'board games') and write each on a slip.",
        "Place the slips face down in a stack.",
        "Decide a turn order; the player on the clock sits opposite the timer-holder."
      ],
      rules: [
        "On your turn, the timer-holder draws a slip and reads the category aloud, then starts a 5-second timer.",
        "You must name three things in that category before the buzzer.",
        "If you succeed, you score a point. If you fail, the slip is passed clockwise — the next player faces the same category with a fresh 5 seconds."
      ],
      turnStructure: [
        "Timer-holder reads the category.",
        "Active player names three items within 5 seconds.",
        "Result is recorded; play passes."
      ],
      gameplayLoop: [
        "Hear the category.",
        "Blurt three answers fast.",
        "Score or pass.",
        "Next player goes."
      ],
      scoring: [
        "Earn one point per successful 5-second answer.",
        "Earn no point if the buzzer beats you; the category passes to the next player."
      ],
      winCondition: "First to five points wins; the loser picks the next game.",
      edgeCases: [
        "Disputed answers are resolved by table vote — majority rules.",
        "If a category truly has fewer than three valid answers, discard and draw a new slip."
      ],
      variants: [
        "Team mode: split into pairs and alternate who answers each turn.",
        "Theme deck: prepare a category stack around one shared interest (movies, cooking, sports)."
      ],
      safetyNotes: [
        "No category should target a player or sensitive topic — keep prompts neutral.",
        "Stay seated; no rushing around to grab the timer."
      ]
    }
  }
];

function buildClassic(entry: (typeof raw)[number]): ClassicGame {
  const spec = GameSpecSchema.parse({
    id: entry.shortId,
    commercialUseAllowed: false,
    ...entry.spec
  });
  return { shortId: entry.shortId, emoji: entry.emoji, blurb: entry.blurb, spec };
}

export const CLASSIC_GAMES: ReadonlyArray<ClassicGame> = raw.map(buildClassic);

export function findClassic(shortId: string): ClassicGame | undefined {
  const normalized = shortId.toUpperCase();
  return CLASSIC_GAMES.find((c) => c.shortId === normalized);
}
