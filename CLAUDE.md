# Study Arcade: how to add a game

- One game = one self-contained HTML file in `games/<name>.html` (full document: doctype, head, viewport meta, and the `.lib-back` link to `../`).
- Then add one entry at the TOP of the `GAMES` array in `index.html`: file, title, subject, topic, age ("Age 9" / "Age 13"), icon, c (color), added (YYYY-MM-DD), key (the game's localStorage key), kind ("stars" or "xp"), total.
- Content comes only from the worksheet/test/notes the user sends. If an answer key exists, every answer must match it.
- Commit and push to `main`; GitHub Pages publishes automatically.

## Before building: learner first (required for every game)
1. Write a short learner profile: age, language (what they read, what they hear), what they already know, what they like, how they will play (alone or with a parent, phone or computer).
2. Pick the approach from the profile, not from the content. Examples:
   - Age 3 to 4: play first, every tap does something, nothing is "wrong", everything is spoken and captioned, real objects to count ("give me 3"), very large targets, a parent gate for settings and exits.
   - Age 9: pictures and concrete examples before rules.
   - Age 13: humor, challenge, their own world.
   - Adult exam in English (e.g. SIE): the English term is the thing to learn. Show the term large with a 🔊 pronunciation, a Hebrew gloss, and the exam's own wording; drill term to meaning both ways; drill confusable pairs; move from Hebrew to English gradually; practice before the final exam.
3. Explain every non-trivial idea step by step: a tiny concrete example first, then the rule, and say why.
4. Review with adversarial agents before publishing: facts (if any), a test-wiseness attacker (if there is an exam), an age-specific learner or child-development reviewer, and a design and accessibility auditor (screenshots at phone, small phone and tablet sizes; contrast, focus, keyboard, reduced motion).
5. Design and accessibility are part of the requirement: a cohesive professional look, readable at every size, WCAG AA contrast, visible focus, keyboard operable, respects reduced motion.
