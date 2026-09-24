# Nayanmar Trails — Quest Experience Master Design

**Status:** v0.1 product/design baseline  
**Product:** Nayanmar Trails  
**Evidence foundation:** Pramana  
**Primary audience:** families, school-age learners, Gen Z, young adults, temple visitors  
**Languages:** English and Tamil, independently authored  
**Design principle:** gamify discovery, memory, curiosity, geography, source literacy and reflection — never “how devotional” a person is.

---

## 1. Product mission

Nayanmar Trails should do more than catalogue saints, sthalams and textual relationships. The long-term goal is to help the next generation **recognise the Nayanmars, remember their stories, understand why the stories matter, connect the stories to sacred geography, and learn how tradition and evidence differ**.

The Quest experience is a game-like layer on top of the existing Nayanmar Trails explorer. It does not replace the reference product. It creates an inviting doorway into it.

A successful session should produce a real-world outcome:

> A young visitor enters a Shiva temple, sees the row of 63 Nayanmars, recognises one or more of them, remembers a story or value, and wants to know more.

The core success metric is therefore **memory and voluntary retelling**, not raw screen time.

---

## 2. Non-negotiable principles

### 2.1 What we gamify

We may reward:
- discovery;
- recall;
- identifying a saint from clues;
- connecting a saint to a traditional place or textual locus;
- distinguishing source categories;
- reconstructing information from evidence;
- completing a story quest;
- returning after time has passed and remembering correctly;
- thoughtful reflection.

### 2.2 What we do not gamify

We do not:
- assign “bhakti points”;
- rank users by devotion;
- rank saints;
- create competitive devotional leaderboards;
- use loot boxes, random rewards, gambling mechanics or dark patterns;
- turn the Nayanmars into combat characters;
- invent supernatural powers or fantasy lore;
- imply that selecting a particular devotional answer makes the player spiritually superior;
- optimise for compulsive streaks or indefinite engagement.

The tone should feel **sacred, curious, intelligent and contemporary**, not preachy and not arcade-like.

---

## 3. Experience architecture

Nayanmar Trails has two complementary layers:

### Explorer

The existing product remains the authoritative discovery/reference experience:
- 63 Nayanmars;
- stories;
- Tēvāram relationships;
- sthalams;
- traditional place claims;
- independent historical/epigraphic evidence where present;
- Pramana source trails.

### Quest

The Quest layer turns the same grounded material into short interactive learning journeys.

The default session target is **25–30 minutes**, generally composed of two or three saint quests. A single saint quest should normally take **8–15 minutes**, depending on age and reading speed.

The intended loop is:

**Hook → Story → Choice → Sacred geography → Pramana Detective → Memory challenge → Reflection → Unlock**

The user should always be able to exit a quest and return to the normal Explorer.

---

## 4. The signature mechanics

### 4.1 Story Quest

A story begins with curiosity, not exposition. The learner encounters a question, image, situation or clue before seeing the full summary.

Choices are used to encourage prediction and reflection. They **never rewrite the traditional narrative**. The historical/traditional story remains fixed.

Example:
- “Before you reveal the story: what do you think this story will care about most?”
- The player chooses.
- The traditional narrative is then revealed.
- The game explains that the choice was a prediction, not a right/wrong theological test.

### 4.2 Sacred Geography

The learner connects a saint to places.

Possible challenges:
- match birthplace tradition to the correct traditional place;
- match mukti-place tradition;
- identify a Tēvāram-linked sthalam;
- distinguish a traditional place from a reviewed modern map point;
- find a site on the map when a reviewed mapping exists.

A place must never be promoted from traditional reference to modern geographic fact merely for gameplay.

### 4.3 Pramana Detective

This is the core intellectual differentiator.

The player learns to ask:
- Is this a traditional account?
- Is it supported by a primary textual witness?
- Is it edition metadata?
- Is there independent inscriptional evidence?
- Is this only a product reconstruction?
- Is the claim not established?

The game rewards **correct source reading**, not belief or disbelief.

Example:
- “The Periya Puranam tradition portrays Kannappar offering his eyes to Shiva.” → supported as traditional narrative.
- “Therefore every narrated detail is independently verified history.” → not established.

### 4.4 Who Am I?

Clues appear one at a time. The player may answer early or reveal more.

Example clue pattern:
1. “I am remembered as a hunter.”
2. “My worship did not follow formal ritual.”
3. “My traditional story culminates in the offering of my own eyes.”

This mechanic is highly scalable across all 63 and should eventually become a repeatable recall mode.

### 4.5 Memory Shrine

Completing a saint unlocks a calm visual tile rather than coins or XP.

Each tile contains:
- saint name;
- visual/symbol;
- one memorable story idea;
- associated place(s), qualified by evidence type;
- source layer;
- one learner-selected reflection.

The long-term visual goal is a shrine/grid of all 63.

The progress language is **“discovered”**, not “captured”, “owned” or “defeated”.

### 4.6 Reflection

Reflection is not graded.

The user selects what stayed with them:
- sincerity;
- courage;
- service;
- humility;
- steadfastness;
- compassion;
- discipline;
- another context-specific idea.

The product may later return this reflection to the learner during spaced recall.

---

## 5. Reward model

Use restrained, culturally appropriate visual rewards:
- a deepam lights;
- a flower is added to a garland;
- a saint tile is revealed;
- a sacred-map point becomes available;
- another quest path opens.

Do not use:
- currency;
- loot crates;
- randomised rewards;
- “daily streak lost” pressure;
- public ranking.

A player should feel: **“I discovered and remembered something.”**

---

## 6. Pramana grounding contract

Quest is a presentation layer over Pramana. It must never become an alternate source of truth.

Every quest statement belongs to one of these classes:

- **traditional_reference** — traditional/reference material; not independently historical merely because it is in the graph;
- **primary_text_metadata** — grounded in a textual witness; narration does not automatically become historical verification;
- **edition_metadata** — edition-qualified metadata such as Tēvāram author/patikam/talam relationships;
- **epigraphic_primary** — independent inscriptional evidence only when Pramana explicitly links it;
- **product_inference** — UI geometry, sequencing or learning presentation; never source evidence.

### Hard rules

1. AI or templating may generate hints, ordering and presentation only from approved records.
2. It may not invent saint episodes.
3. It may not turn an uncertain place identity into a precise modern temple.
4. It may not convert a traditional narrative into independently verified biography.
5. It may not infer a historical route from map geometry.
6. Every Pramana Detective answer must be explainable from the evidence category.
7. When the evidence is insufficient, the correct product behaviour is to say **“not established”**.

---

## 7. Language policy

English and Tamil are **separate editorial products**.

Tamil must not be produced by transliterating English phrasing or by mechanically mirroring English sentence structure. It should read as if a native Tamil editor wrote it for a contemporary family audience.

### Tamil tone

Target:
- natural spoken-literary Tamil;
- devotional without becoming archaic;
- short sentences for challenge screens;
- richer Tamil for story reveals;
- source terminology preserved accurately;
- avoid unnecessary English words inside Tamil UI.

### English tone

Target:
- clear Indian English;
- warm, concise, intelligent;
- no exoticising language;
- no “myth vs fact” framing that dismisses tradition;
- distinguish traditional narrative from historical verification neutrally.

English and Tamil may differ in sentence structure and paragraph rhythm while preserving meaning and evidence scope.

---

## 8. Age design

The same underlying quest can support presentation modes later.

### Explorer Junior — approximately 8–11
- shorter copy;
- more images;
- 2–3 choices;
- direct hints;
- stronger recognition games.

### Explorer — approximately 12–17
- default Quest tone;
- source classification;
- map challenges;
- memory tests;
- reflection.

### Deep Dive — older teens/adults
- more source detail;
- evidence locators;
- compare traditional and textual layers;
- optional primary-source exploration.

v0.1 ships one responsive mode suitable for roughly ages 10+ without feeling childish to an adult.

---

## 9. Session design

A 25–30 minute session should eventually combine two or three short saint quests.

A typical session:

1. **2 min — Hook**
2. **5 min — Story**
3. **4 min — Challenge**
4. **4 min — Geography**
5. **4 min — Pramana Detective**
6. **4 min — Who Am I / recall**
7. **3 min — Reflection + unlock**
8. optional next saint

No countdown is required. The experience should not punish slower readers.

---

## 10. v0.1 vertical slice — Kannappar

Kannappar is the first pilot because:
- the story has an immediate emotional hook;
- the visual identity is distinctive;
- the Pramana curiosity layer already contains a concise English/Tamil summary;
- Pramana records two traditional-place associations;
- the story is ideal for teaching the difference between traditional narrative and independent historical verification.

### Current approved source basis

**Story**
- saint: `nayanmar.09`
- source work: Periya Puranam
- authority: `traditional_reference`
- Pramana curiosity source commit: `0f01a1db8f94db489125df8c57cebb294b7529d6`
- presentation policy: reader-facing summary of traditional narrative; not independently verified biography

**Traditional places**
- `உடுப்பூர்` — birthplace tradition
- `திருக்காளத்தி` — mukti-place tradition
- authority: `traditional_reference`
- historical_verified: false
- graph source commit: `1f2cec34c5b4412fe3178884a38a51dbca6eb452`

The game must not silently convert திருக்காளத்தி into a precise modern temple identification unless Pramana later exports that reviewed mapping.

### Kannappar quest stages

1. **Enter the quest**
   - “Quest 01 of 63”
   - approximate time;
   - evidence badge;
   - no score pressure.

2. **Prediction**
   - learner chooses what they think the story will emphasise;
   - no answer is marked spiritually correct.

3. **Story reveal**
   - concise English/Tamil summary;
   - explicit Traditional Narrative badge;
   - source scope visible.

4. **Story memory**
   - identify the final extreme act in the traditional narrative;
   - correct answer: offering his own eyes.

5. **Sacred geography**
   - distinguish `உடுப்பூர்` as birthplace tradition and `திருக்காளத்தி` as mukti-place tradition;
   - explicitly state that these are traditional references.

6. **Pramana Detective**
   - classify safe and unsafe claims;
   - teach “traditional narrative” versus “independently verified biography”.

7. **Who Am I?**
   - identify Kannappar from escalating clues.

8. **Reflection**
   - learner selects what stayed with them;
   - no right/wrong answer.

9. **Memory Shrine unlock**
   - “1 of 63 discovered”;
   - deepam visual;
   - one-card recap;
   - option to replay or return to Explorer.

---

## 11. v0.2 content candidates

After the Kannappar vertical slice is stable:

### Appar
Design themes:
- transformation;
- service;
- uzhavāram;
- Tēvāram;
- geographic breadth;
- distinguish traditional biography from edition-linked sthalams.

### Karaikkal Ammaiyar
Design themes:
- renunciation;
- unusual iconography;
- memorable identity;
- Kailasa traditional narrative;
- challenge simplistic assumptions about what a saint “should” look like.

These three together provide deliberately different emotional and visual experiences.

---

## 12. AI roadmap

AI should personalise **questions and hints**, not invent tradition.

A future learner model may track:
- saint-name recall;
- story recall;
- place recall;
- confusion pairs;
- evidence-category understanding;
- preferred challenge style;
- interval since last successful recall.

Examples:
- If a learner confuses Appar and Sambandar, surface discriminating clues later.
- If story recall is strong but geography weak, increase place challenges.
- If a learner answers after one clue repeatedly, move to harder Who Am I rounds.
- If evidence classification is weak, reintroduce Pramana Detective with simpler examples.

All generated prompts must be constrained to a grounded fact bundle supplied by Pramana.

---

## 13. Accessibility and parent trust

Quest must:
- work without audio;
- never auto-play sound;
- retain keyboard navigation;
- expose clear focus states;
- support screen readers where feasible;
- avoid infinite scroll traps;
- allow immediate exit;
- store only local learning progress in v0.1;
- avoid public profiles;
- avoid child-facing social features;
- avoid behavioural advertising mechanics.

A parent should be comfortable handing the device to a child without needing to supervise every screen.

---

## 14. Analytics

Track product learning events, not psychological pressure.

Useful events:
- quest opened;
- quest started;
- step completed;
- hint revealed;
- answer correct/incorrect;
- Pramana category understood;
- quest completed;
- replay;
- return after N days;
- recall success.

Do not optimise for:
- maximum uninterrupted session duration;
- streak anxiety;
- notification frequency;
- compulsive re-entry.

---

## 15. Success criteria

The strongest tests are outside the UI.

After one week, can the learner:
- recognise Kannappar?
- name one defining part of his traditional story?
- remember at least one associated traditional place?
- explain that the Periya Puranam account is presented as traditional narrative rather than independently verified biography?
- tell a family member something about him without reopening the app?

If yes, the Quest layer is doing its job.

---

## 16. Implementation sequence

### v0.1 — current implementation
- master design contract;
- separate Quest entry point;
- Kannappar interactive vertical slice;
- English and independently authored Tamil;
- Story Quest;
- Sacred Geography challenge;
- Pramana Detective;
- Who Am I;
- reflection;
- Memory Shrine unlock;
- local progress persistence;
- analytics;
- mobile + desktop QA.

### v0.2
- Appar quest;
- Karaikkal Ammaiyar quest;
- shared 25–30 minute session;
- three-saint Memory Shrine;
- first spaced-recall return experience.

### v0.3
- data-driven quest authoring pipeline from Pramana;
- adaptive challenge selection;
- review workflow for English/Tamil editorial approval.

### v1
- scalable path across all 63;
- parent/teacher-friendly session modes;
- temple-visit companion mode where reviewed geography exists;
- long-term memory measurements.

---

## 17. Product decision log

- Quest is additive; Explorer remains the reference product.
- No devotional scoring.
- No saint rankings.
- No addictive streak mechanics.
- Pramana remains the evidence authority.
- Traditional narrative remains explicitly labelled.
- Tamil and English are independently authored.
- The first production pilot is Kannappar.
- The first reward is a Memory Shrine tile and deepam, not XP.
- The first intelligence mechanic is Pramana Detective.
- The north-star outcome is recognition, memory and voluntary retelling.


---

## 18. v0.2 cohort checkpoint — seven live quests

The first scale checkpoint is deliberately **seven experiences** before any attempt to expand to all 63.

### Naalvar

1. **Appar · Tirunavukkarasar**
   - transformation;
   - uzhavāram service;
   - Tēvāram edition metadata;
   - traditional birthplace/mukti-place roles;
   - route inference kept separate from historical chronology.

2. **Sambandar**
   - jñāna-pāl traditional narrative;
   - first hymn as story-memory anchor;
   - Tēvāram edition metadata;
   - traditional place roles;
   - story evidence kept separate from hymn metadata.

3. **Sundarar · Arurar**
   - wedding interruption and palm-leaf traditional narrative;
   - intimate/conversational bhakti as the memory anchor;
   - Tēvāram edition metadata;
   - traditional place roles.

4. **Manikkavasakar**
   - **Naalvar / Tirumurai 8 companion, not a 64th Nayanmar**;
   - Tiruvācakam/Tirukkōvaiyār source structure;
   - qualified textual loci;
   - Kōyil/Chidambaram product mapping remains qualified;
   - Tirukkazhukkunram explicit section-title locus;
   - Uttarakosamangai remains a literary/textual reference and is not promoted into the formal 276-site Tēvāram catalogue;
   - section-order playback never becomes biographical travel history.

### Featured Nayanmars

5. **Kannappar**
   - intense traditional narrative;
   - ritual/form versus sincerity memory hook;
   - Uduppur and Tirukkalatti traditional place associations.

6. **Karaikkal Ammaiyar**
   - renunciation;
   - distinctive sacred iconography;
   - Kailasa traditional narrative;
   - Karaikkal / Tiruvālangādu place memory.

7. **Poosalar**
   - inward/mental temple;
   - no-wealth / inner-consecration story hook;
   - Tiruninravur appears in both birthplace and mukti-place traditional roles.

### Cohort product behaviour

- A Quest Hub is the front door rather than a Kannappar-only launcher.
- Completion is stored locally per quest.
- The Memory Shrine counts only numbered Nayanmars toward **x / 63**.
- Manikkavasakar completion is shown separately as a **Naalvar companion**.
- All seven quests use the same reusable engine:
  **prediction → story → memory → geography/locus → Pramana Detective → Who Am I → reflection → Memory Shrine**.
- English and Tamil are independently authored. Tamil is not a sentence-by-sentence translation layer.
- The cohort is the stop point for product review before authoring the next expansion batch.

### Cohort acceptance criteria

Before the next expansion, verify that a learner can:
- distinguish the four Naalvar correctly;
- remember at least one defining story/value cue for each quest;
- connect each numbered saint to at least one qualified place association;
- explain why traditional narrative, edition metadata and independent historical proof are not interchangeable;
- understand why Manikkavasakar does not become a 64th Nayanmar;
- complete the experience comfortably on 375/400px mobile in either language.
