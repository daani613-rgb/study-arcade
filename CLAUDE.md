# Study Arcade: how to add a game

- One game = one self-contained HTML file in `games/<name>.html` (full document: doctype, head, viewport meta, and the `.lib-back` link to `../`).
- Then add one entry at the TOP of the `GAMES` array in `index.html`: file, title, subject, topic, age ("Age 9" / "Age 13"), icon, c (color), added (YYYY-MM-DD), key (the game's localStorage key), kind ("stars" or "xp"), total.
- Content comes only from the worksheet/test/notes the user sends. If an answer key exists, every answer must match it.
- Commit and push to `main`; GitHub Pages publishes automatically.
