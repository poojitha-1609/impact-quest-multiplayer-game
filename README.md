# Impact Quest

Impact Quest is a real-time multiplayer decision game for 2–5 players. Players join the same room from separate browsers or devices, allocate 100 points during each of five scenarios, and compare their individual and team impact scores.

## Requirements

- Node.js 20 or newer
- npm (included with Node.js)
- VS Code

## Start the game in VS Code

1. Open this folder in VS Code.
2. Open **Terminal → New Terminal**.
3. Install the project dependencies:

   ```powershell
   npm install
   ```

4. Start the development server:

   ```powershell
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
6. To stop the server, focus the terminal and press **Ctrl+C**.

Use `npm start` to start the server without Node's automatic file watcher. The server reads the hosting provider's `PORT` environment variable automatically.
If your computer does not allow Node.js to listen on the network, start it for this computer only with `$env:HOST="127.0.0.1"; npm run dev` in PowerShell. A localhost-only server cannot be reached from a phone.

## Test multiplayer locally

1. Open `http://localhost:3000` in a regular browser window.
2. Create a room and copy its five-character room code.
3. Open the same URL in an Incognito/private window or another browser.
4. Join with a different player name and the room code.
5. The host starts the game. Both players allocate exactly 100 points and submit.
6. Complete the five rounds and compare the leaderboard.

Both browsers connect to the same server process. The game server controls the 60-second round timer and scoring. If a player does not submit before time runs out, their points are split evenly for that round.

## Test on a phone on the same Wi-Fi

1. Find your computer's local IPv4 address (on Windows, run `ipconfig` in a terminal).
2. Keep the server running and make sure the phone is on the same Wi-Fi.
3. On the phone, open `http://<computer-ip-address>:3000`, replacing the example with the computer's IPv4 address.
4. If the page cannot load, check that Windows Firewall allows Node.js on your private network.

This local address only works on the same network. To let people elsewhere play, deploy the Node.js server to a host that supports persistent Node.js processes and WebSockets, then test the deployed URL. Rooms are stored in server memory, so this starter version is intended for one server instance; a multi-instance deployment needs shared Socket.IO and room state.

## Publish with GitHub and Render

### 1. Put the project on GitHub

Create an empty repository on GitHub (do not add a README or license there), then open the VS Code terminal in this project folder. Replace the URL below with the repository URL GitHub gives you:

```powershell
git init
git add .
git commit -m "Build Impact Quest multiplayer game"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/impact-quest.git
git push -u origin main
```

The `.gitignore` file keeps `node_modules` and `.env` out of the upload. Never put passwords, tokens, or private keys in the repository.

### 2. Deploy the server on Render

1. Sign in to Render and choose **New → Web Service**.
2. Connect the GitHub repository containing this project.
3. Choose the Node runtime if prompted.
4. Use `npm install` for the build command and `npm start` for the start command.
5. Create the service and wait for its deploy to finish.
6. Open the `https://...onrender.com` URL Render displays.

The server serves the website and Socket.IO from the same address; no separate static-site service or extra environment variables are needed. Keep a single server instance because rooms are stored in memory.

### 3. Verify the public game

Open the Render URL in two different browsers or devices. Create a room in one, join it from the other using the room code, and play through all five rounds. Share and submit the Render URL, not a `localhost` address. If you later change the code, push the changes to GitHub and wait for Render to deploy the update.

## Game rules

- Each room supports 2–5 players total, including the host.
- The host starts the game after at least two players have joined.
- There are five scenarios, each with four response choices.
- Each player allocates exactly 100 points in increments of 5.
- Each choice has an impact rating from 0 to 100. A player's round score is the sum of each allocation multiplied by its rating, divided by 100 and rounded to the nearest whole number.
- Round scores add to each player's individual total. The team impact is the average individual total.
- After each round, the host starts the next one. The player with the highest final individual total is the Impact Champion.
- Each round lasts 60 seconds. A player who does not submit in time receives an even 25/25/25/25 allocation for that round.

## Project structure

```text
ImpactQuest/
├── public/
│   ├── game.js       # Browser UI and Socket.IO client
│   ├── index.html    # Main page
│   └── style.css     # Responsive visual design
├── README.md         # Setup, testing, and game rules
├── package.json      # Scripts and dependencies
├── package-lock.json # Exact installed dependency versions (created by npm install)
└── server.js         # Express server, rooms, rounds, timer, and scoring
```
