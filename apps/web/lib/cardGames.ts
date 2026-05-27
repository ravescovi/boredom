import type { GameSpec } from "@bordom-ai/shared";
import { GameSpecSchema } from "@bordom-ai/shared";
import { CLASSIC_GAMES } from "./classics";
import type { ClassicGame } from "./classics";

export type CardGameCategory = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  games: ReadonlyArray<ClassicGame>;
};

const raw: Array<{
  shortId: string;
  emoji: string;
  blurb: string;
  spec: Omit<GameSpec, "id" | "commercialUseAllowed">;
}> = [
  {
    shortId: "GOLFCD",
    emoji: "⛳",
    blurb: "Lowest score wins — swap your worst cards.",
    spec: {
      title: "Golf",
      summary:
        "A draw-and-discard game where each player manages a face-down 6-card grid. Swap in low cards, keep Kings at zero, and aim for the lowest total score — just like the sport.",
      playerCount: { min: 2, max: 8 },
      durationMinutes: 25,
      ageRating: "8+",
      requiredMaterials: ["one standard 52-card deck", "paper and pencil for scoring"],
      setup: [
        "Deal 6 cards face-down to each player in a 2×3 grid.",
        "Place remaining cards face-down as the draw pile; flip the top card to start the discard pile.",
        "Each player flips any 2 of their 6 cards face-up before play begins."
      ],
      rules: [
        "On your turn, draw from the draw pile or take the top discard card.",
        "Swap the drawn card with any card in your grid — the replaced card goes face-up to the discard pile.",
        "Alternatively, discard the drawn card without swapping (only if drawn from the draw pile).",
        "A round ends when one player has all 6 cards face-up; everyone else gets one final turn.",
        "Reveal remaining face-down cards for scoring."
      ],
      turnStructure: [
        "Draw one card from the draw pile or discard pile.",
        "Swap it into your grid or discard it.",
        "Next player's turn."
      ],
      gameplayLoop: [
        "Assess your visible cards and estimate your score.",
        "Draw and decide: swap for a lower card or discard.",
        "Strategically reveal face-down cards."
      ],
      scoring: [
        "Ace = 1, numbered cards = face value, Jacks and Queens = 10, Kings = 0.",
        "Sum all 6 grid cards; lowest cumulative score after the agreed number of rounds wins."
      ],
      winCondition:
        "After the agreed number of rounds, the player with the lowest total score wins.",
      edgeCases: [
        "If the draw pile empties, reshuffle the discard pile (minus the top card) to form a new draw pile.",
        "If the round-triggering player does not have the lowest score, they score normally — no bonus or penalty."
      ],
      variants: [
        "9-Hole Golf: deal 9 cards per player for a longer, more strategic session.",
        "Column rule: two matching cards in the same column cancel each other out and score 0."
      ],
      safetyNotes: ["Seated card game — no physical activity required."]
    }
  },
  {
    shortId: "RUMMYG",
    emoji: "🎴",
    blurb: "Build sets and runs — empty your hand first.",
    spec: {
      title: "Rummy",
      summary:
        "Players draw and discard to build melds — sets of three or more same-rank cards, or runs of three or more consecutive same-suit cards. First to empty their hand scores points from opponents' leftover cards.",
      playerCount: { min: 2, max: 6 },
      durationMinutes: 30,
      ageRating: "8+",
      requiredMaterials: ["one standard 52-card deck", "paper and pencil for scoring"],
      setup: [
        "Shuffle and deal 7 cards to each player (10 each for 2 players).",
        "Place remaining cards face-down as the draw pile; flip the top card face-up to start the discard pile.",
        "Determine the first player; play proceeds clockwise."
      ],
      rules: [
        "On your turn, draw one card from the draw pile or take the top discard.",
        "You may lay down complete melds (sets of 3+ same rank, or runs of 3+ consecutive same suit) in front of you.",
        "You may also add cards to any existing meld on the table — yours or an opponent's.",
        "End your turn by discarding one card face-up.",
        "A round ends when a player empties their hand by discarding their last card."
      ],
      turnStructure: [
        "Draw one card from the draw pile or discard pile.",
        "Optionally lay down melds or add to existing ones.",
        "Discard one card to end your turn."
      ],
      gameplayLoop: [
        "Draw a card.",
        "Extend or lay down melds if possible.",
        "Discard strategically and pass."
      ],
      scoring: [
        "The winner scores the total value of all unmelded cards in opponents' hands: face cards = 10, Aces = 1, number cards = face value.",
        "First player to reach 100 points wins."
      ],
      winCondition: "First player to accumulate 100 points across rounds wins.",
      edgeCases: [
        "If the draw pile empties, reshuffle the discard pile (minus the top card) to form a new draw pile.",
        "A player cannot draw the top discard and immediately return it as their discard on the same turn."
      ],
      variants: [
        "Gin Rummy: 2-player version — knock when your unmelded card value is 10 or under.",
        "Oklahoma Rummy: the first discarded card sets the maximum value needed to knock."
      ],
      safetyNotes: ["Seated card game — no physical activity required."]
    }
  },
  {
    shortId: "CANSTG",
    emoji: "♣️",
    blurb: "Team up, meld big, and canasta your way to victory.",
    spec: {
      title: "Canasta",
      summary:
        "A partnership card game using two standard decks. Teams race to form melds and score points by completing 'canastas' — melds of seven or more cards of the same rank. Wild cards add chaos to every hand.",
      playerCount: { min: 4, max: 4 },
      durationMinutes: 60,
      ageRating: "12+",
      requiredMaterials: [
        "two standard 52-card decks with jokers (108 cards total)",
        "paper and pencil for scoring"
      ],
      setup: [
        "Partners sit across from each other; deal 11 cards to each player.",
        "Place remaining cards face-down as the draw pile; flip the top card to start the discard pile.",
        "If the first discard is a wild card or red three, bury it and flip another."
      ],
      rules: [
        "On your turn, draw two cards from the draw pile or pick up the entire discard pile (only if you can immediately meld the top card).",
        "Form melds: 3 or more cards of the same rank, with up to 2 wild cards (Jokers or 2s) allowed per meld.",
        "A canasta is any meld of 7+ cards; a natural canasta contains no wild cards.",
        "Red threes are bonus cards — place them face-up immediately and draw a replacement.",
        "A team may go out only after completing at least one canasta and meeting initial meld point requirements."
      ],
      turnStructure: [
        "Draw two cards from the draw pile (or pick up the discard pile if eligible).",
        "Play melds, add to existing melds, and complete canastas.",
        "Discard one card to end your turn."
      ],
      gameplayLoop: [
        "Draw and assess your hand.",
        "Lay down melds and build toward canastas.",
        "Discard carefully to avoid helping opponents."
      ],
      scoring: [
        "Natural canasta = 500 pts, mixed canasta = 300 pts, each red three = 100 pts.",
        "Card values: Jokers 50, Aces/2s 20, 8–K 10, 4–7 and black threes 5.",
        "Going out bonus = 100 pts. First team to 5,000 points wins."
      ],
      winCondition: "First team to accumulate 5,000 points across rounds wins.",
      edgeCases: [
        "Black threes can only be discarded, never melded (except when going out).",
        "If the discard pile is frozen, only a natural pair matching the top card may pick it up."
      ],
      variants: [
        "2-player Canasta: each player draws two cards and has a separate discard pile.",
        "Hand & Foot: each player is dealt two hands — a 'hand' played first, then a 'foot'."
      ],
      safetyNotes: ["Seated card game — no physical activity required."]
    }
  },
  {
    shortId: "PHS10G",
    emoji: "🔟",
    blurb: "Complete all 10 phases in order — before your opponents do.",
    spec: {
      title: "Phase 10",
      summary:
        "A rummy-style game where players must complete 10 sequential phases — specific card combinations like 'two sets of three' or 'a run of seven.' Miss a phase and you repeat it next round while others move ahead.",
      playerCount: { min: 2, max: 6 },
      durationMinutes: 45,
      ageRating: "7+",
      requiredMaterials: [
        "Phase 10 deck (or standard deck with jokers as wild cards)",
        "paper and pencil to track each player's current phase"
      ],
      setup: [
        "Shuffle and deal 10 cards to each player.",
        "Place remaining cards as the draw pile; flip the top card to start the discard pile.",
        "Each player notes they are starting on Phase 1."
      ],
      rules: [
        "On your turn, draw one card from the draw pile or the discard pile.",
        "If you have completed your current phase, lay it down face-up before you.",
        "Once your phase is down, you may add cards to any laid-down phase on the table.",
        "End your turn by discarding one card.",
        "A round ends when one player empties their hand; only players who completed their phase advance to the next one."
      ],
      turnStructure: [
        "Draw one card from the draw pile or discard pile.",
        "Lay down your completed phase if ready, then add cards to existing phases.",
        "Discard one card to end your turn."
      ],
      gameplayLoop: [
        "Draw toward your current phase requirement.",
        "Lay the phase down when complete.",
        "Add remaining cards to phases to empty your hand."
      ],
      scoring: [
        "Penalty points for cards in hand when someone goes out: numbered cards 5 pts, Skip cards 15 pts, Wild cards 25 pts.",
        "First player to complete Phase 10 with the lowest penalty point total wins."
      ],
      winCondition:
        "First player to complete Phase 10 wins; ties are broken by lowest accumulated penalty points.",
      edgeCases: [
        "Wild cards substitute for any card in a phase but cannot be used as Skip cards.",
        "A skipped player cannot draw from the discard pile on the turn they return."
      ],
      variants: [
        "Team Phase 10: partners work together — one handles sets, the other runs.",
        "Speed Phase: no penalty points — first to finish Phase 10 wins outright."
      ],
      safetyNotes: ["Seated card game — no physical activity required."]
    }
  },
  {
    shortId: "PRESNT",
    emoji: "👑",
    blurb: "Climb to the top — or get stuck as the Scum.",
    spec: {
      title: "President",
      summary:
        "A shedding game where players race to empty their hand by playing increasingly higher cards. Finish first to become President and receive the best cards next round — finish last and become Scum, surrendering your best cards.",
      playerCount: { min: 4, max: 8 },
      durationMinutes: 30,
      ageRating: "10+",
      requiredMaterials: ["one standard 52-card deck"],
      setup: [
        "Deal the entire deck evenly among players (extra cards go to the player left of the dealer).",
        "The player holding the 3 of clubs leads the first trick of the first round.",
        "Rank order from previous rounds determines turn priority in all subsequent rounds."
      ],
      rules: [
        "Play a card (or set of equal cards) that is higher in rank than the last play; 2s are always the highest and clear the pile.",
        "If you cannot or choose not to play, pass — once you pass, you're out for that trick.",
        "The trick ends when all other players pass; the last player to play leads the next trick.",
        "First to empty their hand becomes President; last becomes Scum.",
        "Next round: Scum gives their two best cards to President and receives President's two least-valuable cards."
      ],
      turnStructure: [
        "Play one or more equal-ranked cards that beat the current top play, or pass.",
        "If all others passed on your play, lead the next trick with any card."
      ],
      gameplayLoop: [
        "Play higher than the pile or pass.",
        "Race to empty your hand first.",
        "Watch positions shift every round."
      ],
      scoring: [
        "No numerical score — positions are ranked each round: President, Vice President, Neutral, Vice Scum, Scum.",
        "Play as many rounds as the group likes; informally track who most often earns President."
      ],
      winCondition:
        "No formal end — play continues as long as the group enjoys, tracking who most often becomes President.",
      edgeCases: [
        "If all players pass at the start of a trick, the player who led the previous trick leads again.",
        "Revolution variant: playing four-of-a-kind flips card rankings for the rest of that round."
      ],
      variants: [
        "Special cards: assign rule effects to specific card values (e.g. 7 reverses play direction).",
        "3-player: remove one suit's 2 through 4 cards to even out hand sizes."
      ],
      safetyNotes: [
        "Seated card game — keep the social hierarchy playful and not personal.",
        "No real-world advantages or punishments outside the game."
      ]
    }
  },
  {
    shortId: "KARMAG",
    emoji: "☯️",
    blurb: "What goes around comes around — play your best, survive your worst.",
    spec: {
      title: "Karma",
      summary:
        "A shedding game with a twist: each player has face-up cards they can see, face-down 'karma' cards they cannot, and a hand to play through. When blind karma cards betray you, the pile comes right back.",
      playerCount: { min: 2, max: 6 },
      durationMinutes: 25,
      ageRating: "8+",
      requiredMaterials: ["one standard 52-card deck"],
      setup: [
        "Deal each player 3 cards face-down (karma cards — don't look), then 3 face-up on top of them, then 3 as a starting hand.",
        "Place remaining cards as the draw pile; flip the top card to start the discard pile.",
        "Before play begins, players may swap any hand cards with their own face-up cards."
      ],
      rules: [
        "Play a card equal to or higher in rank than the top discard; special rules apply — 2 resets to any card, 10 burns the entire pile.",
        "If you cannot play, pick up the entire discard pile into your hand.",
        "Draw back up to 3 cards from the draw pile after every play as long as the draw pile exists.",
        "Once your hand is empty and the draw pile is gone, play from your face-up cards, then finally your blind karma cards.",
        "First player to clear all cards — hand, face-up, and karma — wins."
      ],
      turnStructure: [
        "Play one or more equal-value cards onto the discard pile, or pick up the entire pile.",
        "Draw back to 3 cards while the draw pile remains.",
        "Progress to face-up and karma cards once your hand and the draw pile are gone."
      ],
      gameplayLoop: [
        "Play a legal card or pick up the pile.",
        "Keep your hand at 3 during the draw phase.",
        "Work through hand → face-up → blind karma."
      ],
      scoring: [
        "No points — first player to clear all their cards wins.",
        "Play multiple rounds and tally wins for a longer session."
      ],
      winCondition: "First player to play all hand, face-up, and karma cards wins.",
      edgeCases: [
        "If four identical ranks sit on top of the discard pile, it burns automatically regardless of any other rule.",
        "A blind karma card played illegally forces that player to pick up the entire discard pile."
      ],
      variants: [
        "Power cards: assign extra abilities to certain ranks (e.g. 7 forces the next player to play lower).",
        "Team Karma: partners share a face-up and karma set and can pass hand cards once per round."
      ],
      safetyNotes: ["Seated card game — no physical activity required."]
    }
  },
  {
    shortId: "SPITGM",
    emoji: "💨",
    blurb: "Speed, reflexes, and chaos — both players go at once.",
    spec: {
      title: "Spit",
      summary:
        "A lightning-fast two-player race. Both players simultaneously flip cards onto shared center piles and scramble to play all their tableau cards in ascending or descending sequence. No turns — whoever clears their pile first wins.",
      playerCount: { min: 2, max: 2 },
      durationMinutes: 10,
      ageRating: "7+",
      requiredMaterials: ["one standard 52-card deck"],
      setup: [
        "Divide the deck evenly (26 cards each).",
        "Each player deals their cards into 5 face-down tableau piles of 1, 2, 3, 4, and 5 cards, then flips the top card of each pile.",
        "Place remaining cards face-down as each player's personal spit pile."
      ],
      rules: [
        "Both players simultaneously shout 'Spit!' and each flips one card from their spit pile to the center, creating two shared piles.",
        "Players simultaneously play tableau cards onto either center pile if the card is one rank higher or lower than the top card.",
        "Flip new cards from tableau piles to fill vacated spots.",
        "When no moves exist, both players spit again.",
        "First player to empty both spit pile and tableau wins the round."
      ],
      turnStructure: [
        "Both players act simultaneously at all times — there are no individual turns.",
        "Play tableau cards to center piles whenever a legal move exists.",
        "Call 'Spit!' together when neither player can move."
      ],
      gameplayLoop: [
        "Scan both center piles for legal plays.",
        "Play as fast as possible — no waiting.",
        "Flip tableau cards to fill empty columns."
      ],
      scoring: [
        "Round winner takes the smaller center pile; the loser takes the larger one.",
        "Play until one player has no cards at all — that player wins the match."
      ],
      winCondition:
        "First player to have zero cards remaining — no tableau, no spit pile — wins.",
      edgeCases: [
        "Simultaneous grabs of the same pile: the faster player keeps it.",
        "If both spit piles are empty and no moves exist, each player's current cards are reshuffled and a new layout is dealt."
      ],
      variants: [
        "Three-pile Spit: add a third shared center pile for more options and chaos.",
        "Timed rounds: cap each round at 90 seconds — fewer cards remaining wins."
      ],
      safetyNotes: [
        "Keep movements controlled — no slamming cards to avoid damage or injury."
      ]
    }
  },
  {
    shortId: "SPEEDG",
    emoji: "🏃",
    blurb: "Race to empty your hand — no waiting, no turns.",
    spec: {
      title: "Speed",
      summary:
        "A two-player head-to-head race where both players simultaneously try to play all their cards onto two shared center piles. Cards must be one rank above or below the top card. Fastest hands win.",
      playerCount: { min: 2, max: 2 },
      durationMinutes: 10,
      ageRating: "7+",
      requiredMaterials: ["one standard 52-card deck"],
      setup: [
        "Deal 20 cards to each player; each holds 5 cards in hand and places the rest face-down as their draw pile.",
        "Place two face-down replacement piles in the center and two face-down starter piles between them.",
        "Both players simultaneously flip the two starter piles to begin."
      ],
      rules: [
        "Both players act simultaneously — there are no turns.",
        "Play a hand card onto either center pile if it is one rank higher or lower (Ace wraps between King and 2).",
        "Immediately draw from your draw pile to keep 5 cards in hand.",
        "If both players stall, simultaneously flip one replacement card each onto the center piles.",
        "First to empty their draw pile and hand wins."
      ],
      turnStructure: [
        "Both players act simultaneously — there are no individual turns.",
        "Play a hand card to a center pile, then draw to refill to 5.",
        "Flip replacement cards together when neither can move."
      ],
      gameplayLoop: [
        "Scan both center piles for a ±1 rank match.",
        "Play fast, draw immediately to refill.",
        "Flip replacement cards when both players are stuck."
      ],
      scoring: [
        "No points — first player to empty their hand and draw pile wins the round.",
        "Best two out of three rounds wins the match."
      ],
      winCondition: "First to play all cards wins the round; best of three wins the match.",
      edgeCases: [
        "If both replacement piles run out with no valid moves, shuffle all center and replacement cards and restart the layout.",
        "Only one hand may be used to play cards at a time."
      ],
      variants: [
        "4-pile Speed: use all four Aces face-up as base piles; build up by suit to Kings.",
        "Slow Speed: count to three before playing — great for first-timers."
      ],
      safetyNotes: [
        "Keep movements controlled — no slamming cards to avoid damage or injury."
      ]
    }
  },
  {
    shortId: "ERATSC",
    emoji: "🐀",
    blurb: "Slap the pile fast — patterns reward the quickest hands.",
    spec: {
      title: "Egyptian Rat Screw",
      summary:
        "A fast-paced slapping card game where players flip cards onto a center pile and race to slap special patterns — doubles, sandwiches, and more. Win the pile, collect the deck, be the last standing.",
      playerCount: { min: 2, max: 8 },
      durationMinutes: 20,
      ageRating: "7+",
      requiredMaterials: ["one standard 52-card deck"],
      setup: [
        "Shuffle and deal all cards evenly face-down; players hold their stack without looking.",
        "Determine the first player; play proceeds clockwise.",
        "Agree on which slap patterns are active before starting."
      ],
      rules: [
        "On your turn, flip your top card face-up onto the center pile.",
        "Any player may slap the pile when a valid pattern appears: doubles (two consecutive same-rank cards), sandwich (same rank with one card between), or top-bottom match.",
        "First to slap a valid pattern wins the entire center pile and adds it to the bottom of their stack.",
        "Illegal slap (no pattern): that player gives one card to each other player.",
        "Face card challenge: if a face card is played, the next player must play that many non-face cards or the face-card player wins the pile; another face card resets the count."
      ],
      turnStructure: [
        "Active player flips their top card onto the center pile.",
        "All players watch for slap patterns.",
        "First to slap a valid pattern wins the pile and leads next."
      ],
      gameplayLoop: [
        "Flip a card.",
        "Watch for doubles, sandwiches, and face-card challenges.",
        "Slap fast — win the pile."
      ],
      scoring: [
        "No points — the player who collects the entire deck wins.",
        "Players are eliminated when they run out of cards (with one chance to slap back in)."
      ],
      winCondition: "Last player with cards remaining wins.",
      edgeCases: [
        "Simultaneous slaps: the player with the most hand physically on the pile wins.",
        "A player with no cards may still slap back into the game on the next valid pattern."
      ],
      variants: [
        "Marriage rule: King followed immediately by Queen (or vice versa) is a valid slap.",
        "Run of four: four consecutive same-suit cards burns the pile to the player who completed the run."
      ],
      safetyNotes: [
        "Slap the pile firmly but not aggressively — protect others' hands.",
        "Trim nails and remove rings before playing to avoid scratches."
      ]
    }
  },
  {
    shortId: "SNAPGM",
    emoji: "👏",
    blurb: "Shout Snap before anyone else when the cards match.",
    spec: {
      title: "Snap",
      summary:
        "One of the fastest reflex card games ever made. Players take turns flipping cards onto personal piles. When two visible piles share the same rank, the first to shout 'Snap!' wins both piles. Last player with cards wins.",
      playerCount: { min: 2, max: 6 },
      durationMinutes: 10,
      ageRating: "5+",
      requiredMaterials: ["one standard 52-card deck (two decks for 5–6 players)"],
      setup: [
        "Shuffle and deal all cards evenly face-down to players.",
        "Players hold their cards in a face-down stack without looking.",
        "Determine the first player; play proceeds clockwise."
      ],
      rules: [
        "On your turn, flip your top card face-up onto your personal discard pile.",
        "If your top card matches the rank of any other player's top discard, any player may shout 'Snap!'.",
        "First to shout 'Snap!' correctly takes both matching piles and adds them to the bottom of their hand.",
        "False Snap (no matching ranks): that player gives one card to each other player.",
        "A player who runs out of cards is eliminated."
      ],
      turnStructure: [
        "Active player flips their top card onto their own discard pile.",
        "All players watch for matching ranks across all discard piles.",
        "First to shout 'Snap!' on a real match wins both piles."
      ],
      gameplayLoop: [
        "Flip a card.",
        "Watch all visible piles for a rank match.",
        "Shout first — or pay the penalty."
      ],
      scoring: ["No points — last player with cards remaining wins."],
      winCondition: "Last player with cards in their hand wins.",
      edgeCases: [
        "Simultaneous Snap: piles go to a central Snap pool; won by the next valid caller.",
        "If the deck runs out, each player reshuffles their discard pile into their hand."
      ],
      variants: [
        "Snap pool: simultaneous snaps go to a central pool won by the next valid snap.",
        "Blind Snap: players flip cards without looking — much harder and funnier."
      ],
      safetyNotes: [
        "Keep reactions verbal — no slamming hands to avoid injuries.",
        "Great for all ages; young children may enjoy a slight reaction-time head start."
      ]
    }
  },
  {
    shortId: "SLAPJK",
    emoji: "✋",
    blurb: "Slap the Jack — fastest hand takes the pile.",
    spec: {
      title: "Slap Jack",
      summary:
        "A classic reflex game where players take turns flipping cards onto a center pile. The moment a Jack appears, every player races to slap it. First hand on the pile wins all the cards. Collect the whole deck to win.",
      playerCount: { min: 2, max: 8 },
      durationMinutes: 15,
      ageRating: "5+",
      requiredMaterials: ["one standard 52-card deck"],
      setup: [
        "Shuffle and deal all cards evenly face-down to players.",
        "Players keep their cards in a face-down pile without peeking.",
        "Determine the first player; play proceeds clockwise."
      ],
      rules: [
        "On your turn, flip your top card face-up onto the center pile.",
        "When a Jack is flipped, any player may slap the pile — the first hand on the pile wins all the center cards.",
        "An illegal slap (no Jack on top) costs that player one card to the player who last played.",
        "Players eliminated by running out of cards get one chance to slap back in on the next Jack.",
        "The player who collects the entire deck wins."
      ],
      turnStructure: [
        "Active player flips their top card onto the center pile.",
        "All players watch for a Jack.",
        "First to slap a Jack wins the whole pile."
      ],
      gameplayLoop: [
        "Flip a card onto the pile.",
        "Watch for a Jack.",
        "Slap it first — or lose a card for the mistake."
      ],
      scoring: ["No numerical scoring — the player who collects all 52 cards wins."],
      winCondition: "The player who holds all the cards wins.",
      edgeCases: [
        "If a slap buries the Jack under other cards, the pile still goes to the fastest slapper.",
        "Simultaneous slaps: the bottom hand wins — closest physically to the pile."
      ],
      variants: [
        "Double Jacks: players must slap with both hands at once for an extra challenge.",
        "Wild card: designate one additional card (e.g. red Queen) as a bonus slap target."
      ],
      safetyNotes: [
        "Slap the pile — not other players' hands. Agree on this before starting.",
        "Remove rings and watch straps before playing."
      ]
    }
  },
  {
    shortId: "SPADGM",
    emoji: "♠️",
    blurb: "Bid your tricks — and never underestimate Spades.",
    spec: {
      title: "Spades",
      summary:
        "A partnership trick-taking game where Spades always trump. Teams bid how many tricks they expect to win each round, then race to hit that bid exactly. Underbid and collect bags; overbid and lose big.",
      playerCount: { min: 4, max: 4 },
      durationMinutes: 45,
      ageRating: "10+",
      requiredMaterials: ["one standard 52-card deck", "paper and pencil for scoring"],
      setup: [
        "Partners sit across from each other; deal all 52 cards (13 per player).",
        "Each player reviews their hand and bids the number of tricks they expect to win.",
        "Add partners' bids together for the team bid; play begins left of the dealer."
      ],
      rules: [
        "Lead any card except a Spade until Spades are 'broken' by a player unable to follow suit.",
        "Each player must follow the led suit if possible; otherwise play any card including Spades.",
        "The trick is won by the highest Spade, or the highest card of the led suit if no Spades were played.",
        "Nil bid: a player bids zero tricks; success earns 100 bonus points, failure costs 100.",
        "After 13 tricks, compare tricks won to the team bid and score accordingly."
      ],
      turnStructure: [
        "Lead player plays a card face-up; other players follow suit or play any card.",
        "Highest Spade (or highest led-suit card if no Spades) wins the trick.",
        "Trick winner collects the cards and leads the next trick."
      ],
      gameplayLoop: [
        "Lead a card.",
        "Follow suit or trump with Spades.",
        "Win the trick and lead the next."
      ],
      scoring: [
        "Making your bid: score 10 × bid, plus 1 point per overtrick ('bag').",
        "10 accumulated bags = lose 100 points. Failing your bid = minus 10 × bid.",
        "First team to 500 points wins; falling to -200 is eliminated."
      ],
      winCondition: "First team to reach 500 points wins.",
      edgeCases: [
        "Blind Nil: bid zero without looking at cards for a 200-point bonus — or penalty on failure.",
        "If a team reaches exactly 500, they win only if they made their bid that round."
      ],
      variants: [
        "Cut-throat Spades: 3-player game where each player bids and scores individually.",
        "Jokers wild: include both Jokers as the top two trumps, ranked above the Ace of Spades."
      ],
      safetyNotes: ["Seated card game — no physical activity required."]
    }
  },
  {
    shortId: "HARTGM",
    emoji: "♥️",
    blurb: "Dodge hearts, fear the Queen of Spades, shoot the moon.",
    spec: {
      title: "Hearts",
      summary:
        "A trick-taking game where the goal is to avoid collecting hearts and the deadly Queen of Spades. But if you dare to collect every heart and the Queen — you 'Shoot the Moon' and flip the score on everyone else.",
      playerCount: { min: 3, max: 6 },
      durationMinutes: 40,
      ageRating: "8+",
      requiredMaterials: ["one standard 52-card deck", "paper and pencil for scoring"],
      setup: [
        "For 4 players, deal all 52 cards (13 each); for other counts, remove small clubs to equalize hands.",
        "Players secretly pass 3 cards to the left, then right, then across, then no passing (rotating each round).",
        "The player with the 2 of clubs leads the first trick."
      ],
      rules: [
        "Players must follow the led suit if possible; otherwise they may play any card.",
        "The highest card of the led suit wins the trick — there is no trump suit.",
        "Hearts may not be led until hearts are 'broken' (a heart or Queen of Spades discarded to a trick).",
        "Each heart = 1 penalty point; Queen of Spades = 13 penalty points.",
        "Shooting the Moon: one player takes all 13 hearts and the Queen — they score 0, all others score 26."
      ],
      turnStructure: [
        "Lead player plays any legal card; others follow suit or discard.",
        "Highest card of the led suit wins the trick.",
        "Trick winner collects the cards and leads the next."
      ],
      gameplayLoop: [
        "Lead a safe card.",
        "Follow suit or dump penalty cards when you cannot.",
        "Track hearts and the Queen of Spades closely."
      ],
      scoring: [
        "Each heart = 1 penalty point; Queen of Spades = 13 penalty points.",
        "Shooting the Moon: shooter scores 0, everyone else scores 26.",
        "First player to reach 100 points ends the game; lowest score wins."
      ],
      winCondition:
        "When any player reaches 100 penalty points, the game ends and the lowest score wins.",
      edgeCases: [
        "Jack of Diamonds variant: taking the Jack of Diamonds subtracts 10 points from your score.",
        "If two players tie for lowest at game end, play one sudden-death round."
      ],
      variants: [
        "Omnibus Hearts: Jack of Diamonds = -10 points, adding a desirable card to pursue.",
        "Partnership Hearts: 4 players in 2 teams — partners' scores are combined each round."
      ],
      safetyNotes: ["Seated card game — no physical activity required."]
    }
  },
  {
    shortId: "EUCHRG",
    emoji: "🃏",
    blurb: "Call trump, lead your team, win three tricks.",
    spec: {
      title: "Euchre",
      summary:
        "A fast 4-player partnership trick-taking game with a 24-card deck. One team calls trump and must win 3 of 5 tricks. The Jack of trump (Right Bower) and same-color Jack (Left Bower) are the two highest cards — knowing when to call is everything.",
      playerCount: { min: 4, max: 4 },
      durationMinutes: 30,
      ageRating: "10+",
      requiredMaterials: [
        "one standard 52-card deck with 2s through 8s removed (24 cards remain)",
        "scorekeeper or scoring pegs"
      ],
      setup: [
        "Partners sit across from each other; deal 5 cards each in two rounds (2-3 or 3-2).",
        "Flip the top remaining card face-up as the potential trump; offer it to each player in turn to accept or pass.",
        "If all four players pass, the up card is turned down and players bid for any other trump suit."
      ],
      rules: [
        "The Jack of the trump suit (Right Bower) is the highest card; the Jack of the same-color non-trump suit (Left Bower) is second highest and counts as trump.",
        "The team that called trump must win at least 3 of 5 tricks; winning all 5 is a march.",
        "Players must follow the led suit if possible — Left Bower counts as trump, not its face suit.",
        "A player may go alone: their partner sits out; winning all 5 tricks alone scores 4 points.",
        "If the calling team wins fewer than 3 tricks, the opponents are 'Euchred' and score 2 points."
      ],
      turnStructure: [
        "Lead player plays any card face-up; others follow suit or play any card.",
        "Highest trump wins, or highest led-suit card if no trumps played.",
        "Trick winner collects and leads the next trick."
      ],
      gameplayLoop: [
        "Evaluate your hand and bid or pass during the trump-calling phase.",
        "Lead strong cards to control tricks.",
        "Win three — or get Euchred trying."
      ],
      scoring: [
        "Calling team wins 3–4 tricks: 1 point. Wins all 5 (march): 2 points.",
        "Going alone and winning all 5: 4 points.",
        "Euchre (fewer than 3 tricks): opposing team scores 2 points.",
        "First team to 10 points wins."
      ],
      winCondition: "First team to reach 10 points wins.",
      edgeCases: [
        "Stick the dealer: if all players pass twice, the dealer must call trump — no second pass.",
        "Farmer's Hand: if dealt three or more 9s and 10s, a player may declare and force a redeal."
      ],
      variants: [
        "No-trump Euchre: players may once per game call 'no trump' — highest card of led suit always wins.",
        "Canadian Loner: a player going alone may exchange one card with their partner's hand first."
      ],
      safetyNotes: ["Seated card game — no physical activity required."]
    }
  },
  {
    shortId: "PTCHGM",
    emoji: "🎯",
    blurb: "Bid high, set trump, and take what you promised.",
    spec: {
      title: "Pitch",
      summary:
        "A bidding trick-taking game where the highest bidder names trump and leads the first trick. Players score for capturing the high trump, low trump, Jack of trump, and most game-point cards — the classic four points of Pitch.",
      playerCount: { min: 2, max: 7 },
      durationMinutes: 35,
      ageRating: "10+",
      requiredMaterials: ["one standard 52-card deck", "paper and pencil for scoring"],
      setup: [
        "Deal 6 cards to each player.",
        "Players bid in turn starting left of the dealer — minimum bid of 2, maximum of 4 (or 'smear' for all 4 points).",
        "Highest bidder wins the right to lead and set trump."
      ],
      rules: [
        "The first card played by the highest bidder determines the trump suit for that hand.",
        "Players must follow the led suit if possible; otherwise they may play any card including trump.",
        "The four scoreable points are: High (highest trump in play), Low (lowest trump in play), Jack (Jack of trump if dealt), and Game (most card-point value in tricks).",
        "A player who fails to make their bid loses that bid value from their score (goes 'set').",
        "Non-bidding players can only score positively — they cannot go negative."
      ],
      turnStructure: [
        "Lead player plays any card; others follow suit or play off-suit.",
        "Highest trump wins; otherwise highest card of led suit wins.",
        "Trick winner leads the next trick."
      ],
      gameplayLoop: [
        "Bid what you can realistically make.",
        "Lead trump on the first trick to set the suit.",
        "Capture High, Low, Jack, and Game points."
      ],
      scoring: [
        "High, Low, Jack, and Game each score 1 point if captured.",
        "Make your bid: score your captured points. Fail your bid: lose the bid value.",
        "First player or team to reach 11 points wins."
      ],
      winCondition: "First to reach 11 points (or an agreed target) wins.",
      edgeCases: [
        "If the Jack of trump was not dealt to any player, that point is simply not awarded that hand.",
        "Ties for Game points: no one scores Game for that hand."
      ],
      variants: [
        "6-point Pitch: add the Off-Jack (same-color suit Jack) and Joker as two additional scoring cards.",
        "Partnership Pitch: 4 players in 2 teams with combined scoring."
      ],
      safetyNotes: ["Seated card game — no physical activity required."]
    }
  },
  {
    shortId: "BSGAME",
    emoji: "🤥",
    blurb: "Lie. Bluff. Call it out. Don't get caught.",
    spec: {
      title: "BS",
      summary:
        "A bluffing card game where players claim to play cards of increasing rank face-down. Suspect a lie? Call BS. If you're right, they take the whole pile. If you're wrong, you do. First to empty their hand wins.",
      playerCount: { min: 3, max: 8 },
      durationMinutes: 20,
      ageRating: "8+",
      requiredMaterials: ["one standard 52-card deck (two decks for 6+ players)"],
      setup: [
        "Shuffle and deal all cards evenly; players keep their hand secret.",
        "The player with the Ace of Spades (or lowest club) starts.",
        "Establish the rank sequence: Aces, then 2s, 3s, up through Kings, then repeat."
      ],
      rules: [
        "On your turn, place 1–4 cards face-down in the center and announce the current required rank.",
        "You must claim the correct rank in sequence — but you can play any cards you actually like.",
        "Any player may call 'BS!' before the next player's turn begins.",
        "If called and you lied: you take the entire pile. If called and you told the truth: the caller takes the pile.",
        "First player to discard all their cards wins."
      ],
      turnStructure: [
        "Play 1–4 cards face-down and announce the required rank.",
        "Any player may call 'BS!' immediately.",
        "If unchallenged, the cards stay and the next player goes."
      ],
      gameplayLoop: [
        "Decide whether to play honestly or bluff.",
        "Watch for tells when others play.",
        "Call BS at exactly the right moment."
      ],
      scoring: [
        "No numerical scoring — first player to empty their hand wins.",
        "Track round wins for a longer match."
      ],
      winCondition: "First player to discard all their cards wins the round.",
      edgeCases: [
        "Simultaneous BS calls: both reveal; the caller who called first (or is left of the active player) wins the call.",
        "A player who just won the pile must wait one full turn before calling BS again."
      ],
      variants: [
        "Cheat variant: players name any rank they like — not just the required sequence.",
        "Team BS: partners across the table can signal each other to help coordinate bluffs."
      ],
      safetyNotes: [
        "Keep bluffing in the spirit of fun — call the cards, not the person.",
        "Seated card game — no physical activity required."
      ]
    }
  },
  {
    shortId: "CHEATG",
    emoji: "🎭",
    blurb: "Play cards face-down and hope nobody notices.",
    spec: {
      title: "Cheat",
      summary:
        "Players take turns placing cards face-down and claiming any rank they choose. Suspect a lie? Call 'Cheat!' If you're right, the liar takes the pile. If you're wrong, you take it. Strategy, memory, and a great poker face win.",
      playerCount: { min: 3, max: 8 },
      durationMinutes: 20,
      ageRating: "8+",
      requiredMaterials: ["one standard 52-card deck"],
      setup: [
        "Shuffle and deal all cards evenly; players keep their hand secret.",
        "Determine the first player; play proceeds clockwise."
      ],
      rules: [
        "On your turn, place 1–4 cards face-down in the center and declare any rank of your choice.",
        "Any player may call 'Cheat!' before the next player acts.",
        "If challenged and you lied: you take the entire pile.",
        "If challenged and you told the truth: the challenger takes the entire pile.",
        "First player to play all their cards wins."
      ],
      turnStructure: [
        "Place 1–4 cards face-down and announce any rank.",
        "Other players may call 'Cheat!' immediately.",
        "Reveal if challenged; otherwise the turn passes to the next player."
      ],
      gameplayLoop: [
        "Decide what to claim and whether to bluff.",
        "Judge other players' body language and timing.",
        "Challenge only when confident — the pile is the price of being wrong."
      ],
      scoring: ["No points — first player to empty their hand wins."],
      winCondition: "First player to play all their cards wins.",
      edgeCases: [
        "Multiple cards claimed: if challenged, all played cards are revealed and any lie triggers the penalty.",
        "A player with no cards remaining and a final successful challenge wins immediately."
      ],
      variants: [
        "Exact count: players must also correctly state how many cards they are playing.",
        "Open neighbors: each player's hand is visible only to the players seated directly beside them."
      ],
      safetyNotes: [
        "Keep challenges friendly — call the bluff, not the person.",
        "Seated card game — no physical activity required."
      ]
    }
  },
  {
    shortId: "SKULLG",
    emoji: "💀",
    blurb: "Bet on your own bluff — and never flinch.",
    spec: {
      title: "Skull",
      summary:
        "A pure bluffing and betting game. Each player places cards face-down — flowers or one skull. Then players bet on how many total cards they can flip without hitting a skull. Win two rounds to claim victory.",
      playerCount: { min: 3, max: 6 },
      durationMinutes: 20,
      ageRating: "10+",
      requiredMaterials: [
        "Skull game set, or DIY: 4 opaque cards per player — 3 marked as flowers, 1 as skull (index cards work)"
      ],
      setup: [
        "Each player gets 4 cards: 3 flowers and 1 skull — mark them clearly if using DIY cards.",
        "Players place their personal mat (or a face-down card) in front of them as their pile space.",
        "Decide who goes first; play proceeds clockwise."
      ],
      rules: [
        "On your turn, either add a card face-down to your own pile, or open bidding by naming how many total cards you can flip without hitting a skull.",
        "Once bidding starts, each player either raises the bid or passes — last remaining bidder must attempt the flip.",
        "The winning bidder flips that many cards, starting from their own pile first, then choosing any face-down cards from others.",
        "All flowers flipped successfully: the bidder wins a round token.",
        "Any skull flipped: the bidder discards one of their own cards face-down and permanently out of the game."
      ],
      turnStructure: [
        "Add a card face-down to your pile, or open with a bid.",
        "Bid phase: raise or pass until one bidder remains.",
        "Winning bidder flips the declared number of cards."
      ],
      gameplayLoop: [
        "Build your pile strategically — flowers to invite high bids, skull to trap.",
        "Read others' pile sizes and betting patterns.",
        "Bid high to win; never flip a skull."
      ],
      scoring: [
        "Win 2 round tokens to win the game.",
        "Flipping a skull removes one of your cards permanently — no cards means elimination."
      ],
      winCondition: "First player to collect 2 round tokens wins.",
      edgeCases: [
        "If the winning bidder flips their own skull first, they still lose a card — there is no immunity for self-set traps.",
        "A player down to 1 card must place it face-down each round — opponents can read this as a near-certain skull."
      ],
      variants: [
        "Speed Skull: skip the pile-building phase — everyone bids immediately after placing exactly one card.",
        "Team Skull: partners share a win-token pool and use agreed-upon table signals."
      ],
      safetyNotes: [
        "Seated game — no physical activity required.",
        "If using DIY cards, ensure they are fully opaque so the design cannot be seen through."
      ]
    }
  },
  {
    shortId: "SPOONS",
    emoji: "🥄",
    blurb: "Grab a spoon before they're gone — or you're out.",
    spec: {
      title: "Spoons",
      summary:
        "A fast and frantic game where players pass cards around trying to collect four of a kind — then quietly grab a spoon. Once any spoon is taken, everyone scrambles. Last player without a spoon is eliminated.",
      playerCount: { min: 3, max: 13 },
      durationMinutes: 20,
      ageRating: "6+",
      requiredMaterials: [
        "one standard 52-card deck",
        "spoons — one fewer than the number of players"
      ],
      setup: [
        "Place spoons in the center of the table — one fewer than the number of players.",
        "From the deck, keep only enough sets of four matching ranks for the number of players; shuffle and deal 4 cards each.",
        "Players hold their 4 cards and prepare to pass one card at a time to the left."
      ],
      rules: [
        "All players simultaneously pick up the incoming card and pass one card face-down to the player on their left — no hoarding.",
        "Once a player collects four of a kind, they may quietly take a spoon from the center.",
        "Once any spoon is taken, any player may grab a spoon regardless of their hand.",
        "The player left without a spoon is eliminated and one spoon is removed for the next round.",
        "Play continues until one player remains."
      ],
      turnStructure: [
        "All players simultaneously pick up one incoming card and pass one card left.",
        "Continue passing rapidly until someone takes a spoon.",
        "Everyone scrambles for the remaining spoons."
      ],
      gameplayLoop: [
        "Pick up, decide, pass — repeat as fast as possible.",
        "Watch for the subtle spoon grab at all times.",
        "React the moment a spoon moves."
      ],
      scoring: [
        "No points — last player remaining wins.",
        "Letter variant: each time you miss a spoon, collect a letter from S-P-O-O-N-S — spell it and you're out."
      ],
      winCondition: "Last player remaining in the game wins.",
      edgeCases: [
        "Two players grab the same spoon simultaneously: the player who is last to let go loses — use a 'last touch' rule.",
        "Spoons must remain visible in the center; hiding a spoon in your lap is not allowed."
      ],
      variants: [
        "Spoons letters: instead of elimination, collect letters to spell SPOONS — first to spell it is out.",
        "Forks edition: replace spoons with forks for extra noise and chaos."
      ],
      safetyNotes: [
        "Use plastic or wooden spoons — metal utensils can cause injury during fast grabs.",
        "Reach only for the nearest spoon; avoid lunging across other players."
      ]
    }
  },
  {
    shortId: "NN9GRM",
    emoji: "🎲",
    blurb: "Keep the pile under 99 — or bust out.",
    spec: {
      title: "99",
      summary:
        "A running-total card game where players add their card's value to a shared count. Never push the pile over 99 — or lose a life. Special cards reverse, hold, or reset the total. Last player with lives wins.",
      playerCount: { min: 2, max: 8 },
      durationMinutes: 20,
      ageRating: "7+",
      requiredMaterials: [
        "one standard 52-card deck",
        "tokens or coins — 3 per player as lives"
      ],
      setup: [
        "Deal 3 cards to each player; place remaining cards face-down as the draw pile.",
        "Give each player 3 tokens as lives.",
        "The first player plays a card and announces the starting total."
      ],
      rules: [
        "On your turn, play one card face-up and announce the new running total aloud.",
        "Draw one card immediately to refill your 3-card hand.",
        "Special cards: 4 = reverse play direction, 9 = hold (total stays the same), 10 = subtract 10 from total, King = set total to exactly 99.",
        "If your play pushes the total over 99 and you have no special card to save you, you must play and lose one life.",
        "A player who loses all 3 lives is eliminated."
      ],
      turnStructure: [
        "Play one card face-up and announce the new total.",
        "Draw one card to refill your hand.",
        "Next player goes."
      ],
      gameplayLoop: [
        "Check the running total.",
        "Play a card and call the new count.",
        "Use special cards to manipulate the total before it hits 99."
      ],
      scoring: [
        "Lose a life each time you push the total over 99.",
        "Lose all 3 lives and you are eliminated.",
        "Last player with at least one life remaining wins."
      ],
      winCondition: "Last player with at least one life remaining wins.",
      edgeCases: [
        "If the draw pile runs out, reshuffle the discard pile (minus the top card) to form a new draw pile.",
        "If all remaining players are forced over 99 simultaneously, all lose a life and a new round begins at zero."
      ],
      variants: [
        "Team 99: partners share lives and may pass one card to each other once per round.",
        "Quick 99: each player starts with only 1 life — one mistake and you're out."
      ],
      safetyNotes: ["Seated card game — no physical activity required."]
    }
  },
  {
    shortId: "KINGSG",
    emoji: "🤴",
    blurb: "Draw a card, follow its challenge — Kings rule the table.",
    spec: {
      title: "Kings",
      summary:
        "A rule-based card game where each card drawn assigns a fun challenge or table rule. Players track participation with tokens — no alcohol or risky dares involved. Fast, unpredictable, and a guaranteed crowd-pleaser at any age.",
      playerCount: { min: 3, max: 10 },
      durationMinutes: 25,
      ageRating: "14+",
      requiredMaterials: [
        "one standard 52-card deck",
        "tokens or score tracker (5 per player)",
        "a cup or bowl for the center"
      ],
      setup: [
        "Spread all 52 cards face-down in a circle around the central cup.",
        "Give each player 5 tokens as their starting balance.",
        "Agree on a challenge for each card rank before starting (see variants for ideas)."
      ],
      rules: [
        "On your turn, draw one card from the ring without breaking the ring and immediately perform the assigned challenge.",
        "Example challenges — Ace: make a table rule; 2: give 2 tokens to anyone; 3: take 3 tokens; 7: everyone points up, last person loses a token; King: add to the center cup (4th King triggers a group challenge).",
        "All challenges are non-physical: use tokens, questions, jokes, or social table rules — no alcohol or daring stunts.",
        "Breaking the ring when drawing costs that player 1 token.",
        "The game ends when all four Kings have been drawn."
      ],
      turnStructure: [
        "Draw one card from the ring without breaking the circle.",
        "Perform the assigned challenge immediately.",
        "Play passes to the next player."
      ],
      gameplayLoop: [
        "Draw a card.",
        "Execute its challenge.",
        "Watch the token economy shift around the table."
      ],
      scoring: [
        "Track tokens throughout play.",
        "The player with the most tokens when the 4th King is drawn wins."
      ],
      winCondition:
        "The player with the most tokens after the 4th King is drawn wins.",
      edgeCases: [
        "If a player cannot complete a challenge (e.g. they don't know the answer), they may pay 2 tokens to skip it.",
        "If multiple players dispute a rule card, majority vote settles the interpretation."
      ],
      variants: [
        "Custom deck: before the game, write unique challenges on index cards for each rank.",
        "High-stakes finish: token values double for the final 10 cards in the ring."
      ],
      safetyNotes: [
        "This is a challenge card game only — absolutely no alcohol, no physical dares, and no challenges involving personal boundaries.",
        "Any player may opt out of any challenge by paying 2 tokens — no pressure or exclusion."
      ]
    }
  },
  {
    shortId: "KEMPSG",
    emoji: "🤝",
    blurb: "Signal your partner without tipping off the other team.",
    spec: {
      title: "Kemps",
      summary:
        "A team card game where partners race to collect four of a kind and signal each other secretly. Call 'Kemps!' on your partner's signal to win — or 'Counter Kemps!' when you spot the other team's signal first.",
      playerCount: { min: 4, max: 8 },
      durationMinutes: 20,
      ageRating: "8+",
      requiredMaterials: ["one standard 52-card deck"],
      setup: [
        "Split into teams of two; partners sit across from each other.",
        "Partners secretly agree on a signal (a gesture or subtle expression) before the round — do not let opponents see.",
        "Deal 4 cards to each player and place 4 cards face-up in the center as the exchange pile."
      ],
      rules: [
        "All players simultaneously and freely swap cards between their hand and the center face-up cards — there are no turns.",
        "When the center cards stop being actively swapped, any player may call 'Swap!' to deal 4 new face-up center cards.",
        "When a player has four of a kind, they give their secret signal to their partner.",
        "The partner calls 'Kemps!' — their team scores a point if the four of a kind is confirmed.",
        "Any opposing player who spots the signal and calls 'Counter Kemps!' before the partner calls 'Kemps!' wins the point instead."
      ],
      turnStructure: [
        "All players swap cards with the center simultaneously — there are no individual turns.",
        "Call 'Swap!' when center cards go stale to refresh them.",
        "Signal and call 'Kemps!' (or 'Counter Kemps!') when ready."
      ],
      gameplayLoop: [
        "Swap cards rapidly to build four of a kind.",
        "Give your agreed signal when you have it.",
        "Watch opponents' signals and call Counter Kemps when you spot one."
      ],
      scoring: [
        "Successful 'Kemps!': calling team scores 1 point.",
        "Successful 'Counter Kemps!': opposing team scores 1 point.",
        "False call of either type: calling team loses 1 point. First team to 5 wins."
      ],
      winCondition: "First team to reach 5 points wins the match.",
      edgeCases: [
        "Both partners call 'Kemps!' simultaneously: the team still scores 1 point — no penalty.",
        "Signals must be subtle and pre-agreed; loudly obvious signals (mouthing the word) may be vetoed by the group."
      ],
      variants: [
        "Double signals: teams use two signals — one for 'I have it' and one for 'call it now'.",
        "KEMPS letters: instead of points, spell K-E-M-P-S over losses — first team to spell it is eliminated."
      ],
      safetyNotes: [
        "Keep all signals and play above the table at all times.",
        "Seated card game — no physical activity required."
      ]
    }
  }
];

function buildCardGame(entry: (typeof raw)[number]): ClassicGame {
  const spec = GameSpecSchema.parse({
    id: entry.shortId,
    commercialUseAllowed: false,
    ...entry.spec
  });
  return { shortId: entry.shortId, emoji: entry.emoji, blurb: entry.blurb, spec };
}

export const CARD_GAMES_FLAT: ReadonlyArray<ClassicGame> = raw.map(buildCardGame);

export function findCardGame(shortId: string): ClassicGame | undefined {
  const normalized = shortId.toUpperCase();
  return CARD_GAMES_FLAT.find((g) => g.shortId === normalized);
}

// Crazy Eights is already defined in classics.ts — pull it in for the Matching category.
const crazyEights = CLASSIC_GAMES.find((g) => g.shortId === "CRZY8S")!;

function getGame(shortId: string): ClassicGame {
  if (shortId === "CRZY8S") return crazyEights;
  const game = CARD_GAMES_FLAT.find((g) => g.shortId === shortId);
  if (!game) throw new Error(`Card game not found: ${shortId}`);
  return game;
}

export const CARD_GAME_CATEGORIES: ReadonlyArray<CardGameCategory> = [
  {
    id: "party",
    name: "High Energy / Party Favorites",
    emoji: "🥳",
    tagline: "Loud, fast, and no one's sitting still!",
    games: ["SPOONS", "NN9GRM", "KINGSG", "KEMPSG"].map(getGame)
  },
  {
    id: "bluffing",
    name: "Bluffing / Social",
    emoji: "🤥",
    tagline: "Keep a straight face or pay the price!",
    games: ["BSGAME", "CHEATG", "SKULLG"].map(getGame)
  },
  {
    id: "matching",
    name: "Matching / Pairing",
    emoji: "🃏",
    tagline: "Build it, match it, win it!",
    games: ["CRZY8S", "GOLFCD", "RUMMYG", "CANSTG", "PHS10G"].map(getGame)
  },
  {
    id: "shedding",
    name: "Shedding",
    emoji: "💨",
    tagline: "First one out wins, last one standing loses!",
    games: ["PRESNT", "KARMAG", "SPITGM", "SPEEDG"].map(getGame)
  },
  {
    id: "slapping",
    name: "Slapping / Reflex",
    emoji: "✋",
    tagline: "Blink and you'll lose!",
    games: ["ERATSC", "SNAPGM", "SLAPJK"].map(getGame)
  },
  {
    id: "trump",
    name: "Trump / Trick-Taking",
    emoji: "♠️",
    tagline: "Play the right card at the right time!",
    games: ["SPADGM", "HARTGM", "EUCHRG", "PTCHGM"].map(getGame)
  }
];
