/*
 * BIG BROTHER 25 — SEASON CONFIGURATION
 * Official BB25 competition names + BB Multiverse twist configuration.
 *
 * Competition NAMES and WEEK PLACEMENT below are taken directly from the
 * official Big Brother Wiki's competition history table for the season.
 * Most competition DESCRIPTIONS are reconstructed from the competition's
 * name and its Multiverse theme rather than a verified play-by-play (see
 * README) — a handful (premiere night, Week 1 HOH/POV) are more detailed
 * where fuller recap coverage was available.
 */
window.BB25_CONFIG = Object.freeze({
  seasonId: "bb25-custom",
  seasonNumber: 25,
  originalYear: 2023,
  defaultCastSize: 17,

  teams: [],

  ratingKeys: ["general","physical","mental","social","strategic"],
  relationshipKeys: ["friendship","trust","loyalty","rivalry","respect","attraction"],

  /* ---------------------------- TWIST TIMING ---------------------------- */
  seventeenthHouseguestReveal: 1,
  netherRegionWeeks: [2,3,4,5,6],
  invincibilityWeek: 4,
  zombieWeek: 7,
  zombieResolutionWeek: 8,
  comicWeekWeek: 11,
  secondDoubleEvictionWeek: 12,
  juryThresholdPlacement: 9,

  /* Official BB25 competition names, weeks, and Multiverse theme. */
  competitionSchedule: [
    {week:1,type:"premiere-nom-scramble",name:"Puzzling Headlines",category:"mental",universe:"Scramble-verse",description:"The first group of four houseguests race to unscramble a wall of BB-themed headlines. Whoever finishes last is automatically nominated for eviction before an HOH is even crowned."},
    {week:1,type:"premiere-nom-humili",name:"Kicking Butt",category:"physical",universe:"Humili-verse",description:"The second group of four houseguests face a Humili-verse obstacle built around the house's \"butt-kicking machine\" theme. Whoever finishes last is automatically nominated for eviction."},
    {week:1,type:"premiere-nom-comic",name:"Goo-Pocalypse",category:"physical",universe:"Comic-verse",description:"The third group of four houseguests battle through a goo-covered obstacle inspired by the Comic-verse bedroom. Whoever finishes last is automatically nominated for eviction."},
    {week:1,type:"premiere-nom-scary",name:"Hold On Fright",category:"physical",universe:"Scary-verse",description:"The fourth group of four houseguests face a spooky endurance challenge. Whoever finishes last is automatically nominated for eviction — and also spends time in the Nether Region before rejoining the house with a warning for the others."},
    {week:1,type:"hoh",name:"Crash Course in Comics",category:"mental",universe:"Comic-verse",description:"Houseguests not already nominated by the four premiere competitions face off in a Comic-verse trivia and precision challenge. The winner becomes the season's first Head of Household — and must decide which two of the four premiere nominees to save."},
    {week:1,type:"pov",name:"Atomic Wedgie",category:"physical",universe:"Humili-verse",description:"A Humili-verse obstacle course built around wedgie-themed sight gags and precision challenges. Fastest houseguest through wins the season's first Power of Veto."},

    {week:2,type:"hoh",name:"Escape The Nether Region",category:"physical",universe:"Scary-verse",description:"Houseguests race through a maze themed around the Nether Region, escaping one obstacle at a time. Fastest houseguest through wins HOH."},
    {week:2,type:"pov",name:"Twisted Tasks",category:"physical",universe:"Scramble-verse",description:"A multi-stage obstacle course where houseguests complete a series of physical tasks in a scrambled, ever-changing order. Fastest total time wins the Veto."},

    {week:3,type:"hoh",name:"Snot-a-Winner",category:"physical",universe:"Humili-verse",description:"A Humili-verse endurance and precision challenge themed around the house's \"snotting\" gag. Last houseguest standing — or highest score — wins HOH, along with the dubious honor of being \"snotted\" at random for the next 24 hours."},
    {week:3,type:"pov",name:"Cock-a-Doodle Zoom",category:"physical",universe:"Comic-verse",description:"A speed-and-precision course themed around the Comic-verse's \"Humanimal\" characters. The winner takes home the Veto — and the loser is stuck wearing a superhero chicken costume for the week."},

    {week:4,type:"hoh",name:"Revenge of the Pressure Cooker",category:"physical",universe:"Scary-verse",description:"A Scary-verse endurance challenge that ratchets up the heat, literally and figuratively, the longer houseguests hang on. Last one remaining wins HOH."},
    {week:4,type:"pov",name:"Artifact Stack",category:"physical",universe:"Comic-verse",description:"Houseguests race to stack a tower of oversized Comic-verse artifacts without it toppling. First to complete a stable stack wins the Veto."},
    {week:4,type:"invincibility",name:"Power Path",category:"mental",universe:"Comic-verse",description:"Four houseguests chosen by a fan vote compete individually and in secret for the BB Power of Invincibility. The winner may use it to immediately save one of the next two evictees — including themselves — and bring them back into the game, or let the power quietly expire."},

    {week:5,type:"hoh",name:"BB Odd Couples",category:"mental",universe:"Scramble-verse",description:"A matching-and-memory quiz built around mismatched houseguest pairings from throughout the season. Most correct matches wins HOH."},
    {week:5,type:"pov",name:"Sludge Stackers",category:"physical",universe:"Comic-verse",description:"Houseguests race through a sludge-covered obstacle, stacking pieces along the way. First to complete their stack wins the Veto."},

    {week:6,type:"hoh",name:"Name That Toot",category:"mental",universe:"Humili-verse",description:"A Humili-verse sound-matching quiz — houseguests listen to a series of embarrassing noises and have to identify which houseguest made which. Most correct answers wins HOH, and kicks off Humili-week for the rest of the house."},
    {week:6,type:"pov",name:"Buddy Ball",category:"physical",universe:"general",description:"A partnered ball-relay obstacle course. The fastest houseguest (with their partner's help) wins the Power of Veto."},

    {week:7,type:"hoh",name:"Attack of the 50 Foot Meatball",category:"physical",universe:"Comic-verse",description:"A giant-monster-movie-themed obstacle course, the first half of the Scary Week Double Eviction. Fastest houseguest through wins the first HOH of the night."},
    {week:7,type:"pov",name:"Sweaty Scrimmage",category:"physical",universe:"Scramble-verse",description:"A fast-paced sports-relay Veto competition run under the pressure of double-eviction time constraints."},
    {week:7,type:"hoh-round2",name:"Soul Mates",category:"mental",universe:"Scary-verse",description:"A rapid matching quiz pairing up houseguests and BB trivia — the second HOH of the Scary Week Double Eviction night. Winner immediately becomes HOH for the night's second cycle."},
    {week:7,type:"pov-round2",name:"Monster Kill",category:"physical",universe:"general",description:"A fast, high-stakes obstacle Veto run to close out the Scary Week Double Eviction. Both evictees from tonight's cycles will return as Big Brother Zombies rather than leaving for good — for now."},

    {week:8,type:"resurrection-rumble",name:"Resurrection Rumble",category:"physical",universe:"Scary-verse",description:"With no HOH or Veto this week, the two Big Brother Zombies from last week's double eviction face off for a game advantage heading into their final showdown."},
    {week:8,type:"do-or-die",name:"Do or Die",category:"physical",universe:"Scary-verse",description:"The season's two Zombies face off one final time. The winner returns to the game as if never evicted; the loser is out of the house for good."},

    {week:9,type:"hoh",name:"We Come in Pieces",category:"physical",universe:"Comic-verse",description:"A puzzle-assembly obstacle course themed around a Comic-verse alien invasion. First to assemble their piece and buzz in wins HOH."},
    {week:9,type:"pov",name:"BB Exorcism",category:"physical",universe:"Scary-verse",description:"A haunted-house-themed endurance and nerve challenge. Last houseguest standing wins the Power of Veto."},

    {week:10,type:"hoh",name:"Humili-Gram",category:"mental",universe:"Humili-verse",description:"Houseguests are quizzed on embarrassing messages and moments from throughout the summer. Most correct answers wins HOH."},
    {week:10,type:"pov",name:"OTEV the Zinging Robot",category:"physical",universe:"Scramble-verse",description:"A classic OTEV-style scavenger hunt: a robotic character gives clues leading houseguests to find hidden tokens. Last houseguest remaining after the elimination rounds wins the Veto."},

    {week:11,type:"hoh",name:"BB Comics",category:"mental",universe:"Comic-verse",description:"Houseguests study a wall of custom comic-book covers featuring the cast, then race to recreate the exact lineup from a set that includes convincing fakes. Fastest correct time wins HOH — operating in secret for the week under the Power of Invisibility."},
    {week:11,type:"pov",name:"Superhero Training Academy",category:"physical",universe:"Comic-verse",description:"An obstacle course built like a superhero boot camp. Fastest houseguest through wins the first of this week's two Vetoes, made possible by the Power of Multiplicity."},
    {week:11,type:"luxury",name:"Time to Take Flight",category:"physical",universe:"Comic-verse",description:"A luxury competition with a cash prize on the line — no effect on nominations or eviction."},
    {week:11,type:"pov-multiplicity",name:"Second Chance Veto",category:"physical",universe:"Comic-verse",description:"The Power of Multiplicity puts a second Power of Veto up for grabs the same week. Whoever wins can use it on top of — or instead of — the results of the week's first Veto."},

    {week:12,type:"hoh",name:"Johnny Mac: Demented Dentist",category:"physical",universe:"Scary-verse",description:"A dentist-office-themed obstacle course, first HOH of the week's double eviction. Fastest houseguest through wins."},
    {week:12,type:"pov",name:"Embarrassing Expedition",category:"physical",universe:"Humili-verse",description:"A Humili-verse obstacle race through a gauntlet of embarrassing costumes and tasks. Fastest houseguest wins the Veto."},
    {week:12,type:"hoh-round2",name:"Triple Feature",category:"mental",universe:"Scramble-verse",description:"A movie-trivia quiz covering three clip packages from the summer, the second HOH of the night's double eviction."},
    {week:12,type:"pov-round2",name:"Drive-In Drop",category:"physical",universe:"general",description:"A precision-drop Veto competition run to close out the night's second eviction cycle."},

    {week:13,type:"hoh",name:"Superhero Smackdown",category:"physical",universe:"Comic-verse",description:"A head-to-head elimination bracket of Comic-verse-themed physical challenges. Last houseguest standing wins HOH."},
    {week:13,type:"pov",name:"Swamp Slasher",category:"physical",universe:"Scary-verse",description:"A swamp-obstacle Veto competition full of Scary-verse jump scares. Fastest houseguest through wins."},
    {week:13,type:"luxury",name:"Trick or Treat",category:"physical",universe:"Scary-verse",description:"A Halloween-timed luxury competition with a cash prize on the line — no effect on nominations or eviction."},

    {week:14,type:"hoh",name:"Chenbot Volume #1",category:"mental",universe:"Comic-verse",description:"A trivia quiz built around Julie Chen Moonves's hosting history, framed as a Comic-verse collector's issue. Most correct answers wins HOH."},
    {week:14,type:"pov",name:"Scrambled Timeline",category:"mental",universe:"Scramble-verse",description:"Houseguests are quizzed on the exact chronological order of the summer's key events. Most correct placements wins the final regular-season Veto."},
    {week:14,type:"final-hoh-1",name:"When Universes Collide",category:"physical",universe:"All Multiverses",description:"The final three houseguests face an endurance challenge combining elements of all four Multiverse themes. Last one holding on wins Part 1 and advances directly to Part 3."},
    {week:14,type:"final-hoh-2",name:"Multiverse Mix-Up",category:"mental",universe:"All Multiverses",description:"The two houseguests who didn't win Part 1 race to correctly sort the season's key events and competitions across all four Multiverses. Fastest correct time wins Part 2 and advances to Part 3."},
    {week:14,type:"final-hoh-3",name:"Jury Verse",category:"mental",universe:"All Multiverses",description:"A live trivia showdown between the winners of Parts 1 and 2, built around facts and statements from the season's jury. Most correct answers wins the title of Final HOH."}
  ],

  /* --------------------------- TWIST REFERENCE --------------------------- */
  twists: [
    {
      id: "bb-multiverse",
      name: "BB Break-In & the BB Multiverse",
      week: 1,
      summary: "Three Big Brother legends broke into the house before the season with a \"Time Laser\" to change their own fates — the attempt backfired and cracked open the BB Multiverse instead. Four alternate universes (Comic-verse, Humili-verse, Scary-verse, and Scramble-verse), each tied to a bedroom theme, take turns twisting the season at any point, from small punishments to game-changing twists."
    },
    {
      id: "premiere-nomination-comps",
      name: "Premiere Nomination Competitions & HOH Save",
      week: 1,
      summary: "On premiere night, the houseguests split into four groups of four for four separate Multiverse-themed competitions — one per universe. The loser of each automatically becomes a nominee, putting four houseguests on the block before an HOH is even crowned. The remaining houseguests then compete for HOH; the winner saves two of the four nominees, leaving the other two on the block, and plays the rest of the week as a normal HOH."
    },
    {
      id: "seventeenth-houseguest",
      name: "The Seventeenth Houseguest",
      week: 1,
      summary: "After the sixteen-person cast is revealed and the premiere competitions conclude, a surprise seventeenth houseguest joins the game — safe from the very first round of nominations, but eligible for everything from that point on."
    },
    {
      id: "nether-region",
      name: "The Nether Region",
      week: 2,
      summary: "Starting Week 2, the runner-up of each week's HOH competition must send a houseguest (other than the HOH or nominees, who are immune) into the Nether Region, granting that houseguest safety for the week. The most recent houseguest sent to the Nether Region is ineligible to play in that week's Veto."
    },
    {
      id: "invincibility",
      name: "BB Power of Invincibility",
      week: 4,
      summary: "During Week 4, four fan-chosen houseguests compete in a secret individual competition for the Power of Invincibility. The winner can use it to immediately save one of the next two evictees — including themselves — and bring them back into the game, or let it expire unused. If it's used, the HOH whose nominee was saved gets to compete in the next HOH despite normally sitting out."
    },
    {
      id: "humili-week",
      name: "Humili-Week",
      week: 6,
      summary: "Week 6 is dedicated to the Humili-verse: every houseguest but the HOH has to rotate through the Have-Not Room, and the HOH announces who's safe at the nomination ceremony with a pie to the face instead of the usual ceremony."
    },
    {
      id: "scary-week-double-eviction",
      name: "Scary Week Double Eviction & BB Zombies",
      week: 7,
      summary: "Week 7 is a double eviction with a twist: instead of leaving for good, both evictees become Big Brother Zombies and move back into the house that same night. The following week has no HOH or Veto competition at all — instead, the two Zombies face off for the right to fully return to the game, while the loser is gone for good. Because there were no competitions that week, the outgoing HOH is allowed to compete again the week after."
    },
    {
      id: "classic-jury-format",
      name: "Classic Jury Format",
      week: 7,
      summary: "At the start of Week 7, the season reverts to a Jury of Seven instead of the more recent Jury of Nine."
    },
    {
      id: "comic-week",
      name: "BB Comic-Week",
      week: 11,
      summary: "All of Week 11 runs under Comic-verse superpowers: the HOH operates in total secret for the whole week under the Power of Invisibility (and — per the same precedent as the real season — is allowed to compete again the following week despite normally sitting out), and the Power of Multiplicity puts a second, fully separate Power of Veto competition up for grabs the same week."
    }
  ],

  notes: [
    "17-houseguest custom cast (16 at premiere, plus a surprise 17th houseguest revealed after the premiere competitions)",
    "Premiere night runs four separate nomination competitions, one per Multiverse universe, before the first HOH is even crowned",
    "Nether Region runs weeks 2-6",
    "BB Power of Invincibility is a one-time fan-chosen advantage in Week 4",
    "Humili-Week is Week 6",
    "Scary Week Double Eviction & BB Zombies run Weeks 7-8",
    "Classic Jury of Seven starts Week 7",
    "BB Comic-Week (Invisible HOH + a second Veto) is Week 11",
    "A second, ordinary double-eviction happens in Week 12",
    "Final 3 uses the three-part Final HOH format",
    "Custom relationships and alliances can be entered before simulation"
  ]
});
