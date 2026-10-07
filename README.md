# 🌍 Impact Quest

### 🎮 Real-Time Multiplayer Decision-Making Game

**Impact Quest** is a real-time multiplayer decision-making game for **2–5 players**. Players join the same room from separate browsers or devices and face realistic scenarios where they must make strategic decisions with limited resources.

In each round, every player receives **100 points** and decides how to distribute them across four possible actions. Their choices are scored based on the impact of each action, allowing players to compare their individual results and the overall team impact.

The game combines **multiplayer interaction, decision-making, resource allocation, scoring, and real-world problem-solving** into a competitive experience.

---

## 🚀 Play the Game

### 🎮 [Play Impact Quest Live](https://impact-quest.onrender.com)

No installation is required for the live version.

Players can join from different browsers or devices using the same room code.

---

## 🕹️ How to Play

### 1. Create a Room
One player creates a room and receives a unique **5-character room code**.

### 2. Invite Players
Share the room code with other players.

The game supports **2–5 players** in a room.

### 3. Start the Game
The host starts the game once at least two players have joined.

### 4. Make Your Decision
Each round presents a real-world decision scenario with **four choices**.

Every player receives exactly:

**100 points**

Players must distribute those points across the four choices in increments of **5 points**.

### 5. Beat the Clock
Each round has a **60-second timer**.

Players must submit their decisions before the timer ends.

### 6. Earn Impact Points
Each choice has an impact rating.

Your allocation and the impact rating of each choice determine your round score.

### 7. Complete Three Rounds
Players compete through **three different scenarios**.

### 8. Become the Impact Champion
After the final round, players see the leaderboard.

The player with the highest total individual score becomes:

🏆 **Impact Champion**

If multiple players have the same highest score, they share the title.

---

## 🌎 What Is Impact Quest About?

Impact Quest is designed around the idea that real-world problems often require people to make decisions with **limited resources and competing priorities**.

The game encourages players to think about:

- 🌱 Sustainability
- 🏙️ Community needs
- ❤️ Public well-being
- 🚑 Emergency response
- 💧 Resource allocation
- 🤝 Team impact
- 🧠 Strategic decision-making

Instead of simply finding one "correct" answer, players must decide how they would use limited resources and see the impact of their choices.

---

## ⭐ Key Features

- 🎮 Real-time multiplayer gameplay
- 👥 2–5 players per room
- 🔑 Unique room codes
- 🌐 Play across separate browsers and devices
- ⚡ Real-time player synchronization
- ⏱️ 60-second decision timer
- 💯 100-point allocation system
- 🎯 Four choices per scenario
- 📊 Individual impact scoring
- 🤝 Team impact calculation
- 🔄 Three game rounds
- 🏆 Final leaderboard
- 👑 Impact Champion winner
- 📱 Responsive web interface

---

## 🧠 Scoring System

Each player receives **100 points** for every scenario.

Players distribute those points across four choices.

Each choice has an **impact rating from 0–100**.

The round score is calculated as:

```text
Round Score =
Σ (Points Allocated × Impact Rating) / 100

The scores from all three rounds are added together:

Final Score =
Round 1 Score + Round 2 Score + Round 3 Score

The team impact is calculated using the players' individual totals.

The player with the highest final score becomes the Impact Champion.

⏱️ Time Limit

Each scenario has a 60-second decision timer.

If a player does not submit before the timer expires, the game automatically uses an even allocation:

25 / 25 / 25 / 25

This allows the multiplayer game to continue without waiting indefinitely for a player.

🛠️ Technologies Used
Frontend
HTML5
CSS3
JavaScript
Backend
Node.js
Express.js
Real-Time Multiplayer
Socket.IO
WebSockets
Deployment
Render
Development
Visual Studio Code
npm

🏗️ How the Multiplayer System Works

Impact Quest uses Socket.IO to synchronize players in real time.

The server manages:

Room creation
Room joining
Player lists
Host management
Game state
Round progression
60-second timers
Player decisions
Score calculation
Final leaderboard

The browser communicates with the Node.js server through real-time Socket.IO events.

Player 1 Browser
       │
       │
       ▼
   Socket.IO
       │
       ▼
 Node.js Server
       │
       ▼
   Game State
       │
       ├───────────────┐
       ▼               ▼
Player 1 Browser   Player 2 Browser

This allows players on separate devices to participate in the same game session.

🧪 Test the Game Locally
Requirements
Node.js 20 or newer
npm
VS Code
1. Install dependencies

Open the project folder in VS Code and run:

npm install
2. Start the development server
npm run dev
3. Open the game

Go to:

http://localhost:3000
👥 Test Multiplayer Locally

You can test multiplayer using two browser sessions.

Player 1
Open http://localhost:3000
Enter your name.
Create a room.
Copy the room code.
Player 2
Open http://localhost:3000 in another browser or Incognito window.
Enter a different name.
Enter the room code.
Join the room.

Then:

Host starts the game.
Both players make their decisions.
Submit the allocations.
Complete all three rounds.
Check the final leaderboard.
📱 Test on Another Device

The game can also be tested on another device connected to the same Wi-Fi network.

Start the server on your computer.
Find your computer's local IPv4 address.
Connect the phone to the same Wi-Fi.
Open:
http://<computer-ip-address>:3000

For example:

http://192.168.1.10:3000

The local IP address only works within the same network.

For players outside your network, use the deployed version:

🌐 https://impact-quest.onrender.com
🚀 Deployment

The multiplayer server is deployed using Render.

Live Game

https://impact-quest.onrender.com

The GitHub repository contains the complete source code for the game.

When changes are pushed to the connected GitHub repository, Render can deploy the updated application.

📁 Project Structure
ImpactQuest/
│
├── public/
│   ├── index.html       # Game interface
│   ├── game.js         # Multiplayer client and game logic
│   └── style.css       # Responsive game design
│
├── server.js            # Node.js server, rooms, game state and scoring
├── package.json         # Project configuration and dependencies
├── package-lock.json    # Dependency versions
├── README.md            # Project documentation
└── .gitignore           # Ignored files

🔐 Multiplayer Room Rules
Each room supports 2–5 players.
Every player must have a unique name within the room.
The host starts the game.
Players receive 100 points per round.
Points must be allocated in increments of 5.
Each round lasts 60 seconds.
There are 3 scenarios.
The highest final score wins.
Tied highest scores share the Impact Champion title.
🎯 Project Goals

Impact Quest was created to explore how multiplayer technology can be combined with decision-making and real-world problem-solving.

The project focuses on:

Real-time web communication
Multiplayer game architecture
Client-server communication
Game state management
Resource allocation mechanics
Scoring algorithms
Responsive web design
Deployment of a Node.js application
🔮 Future Improvements

Planned improvements include:

🌍 More real-world scenarios
👥 Support for larger multiplayer rooms
🏆 Global leaderboards
📈 Player performance history
🧑‍🤝‍🧑 Team-based game modes
📚 Educational explanations after each scenario
🎖️ Player achievements and badges
🔄 Improved reconnect support
💾 Persistent game history
🎨 Additional themes and visual improvements
💡 Why I Built Impact Quest

I wanted to build more than a traditional multiplayer game.

Impact Quest combines competition with thoughtful decision-making, allowing players to explore how different choices can affect people, communities, and the environment.

The project also gave me practical experience building a real-time multiplayer application from frontend to backend and deployment.

👩‍💻 Project

Impact Quest – Real-Time Multiplayer Decision-Making Game

Built with:
    HTML • CSS • JavaScript • Node.js • Express.js • Socket.IO

🎮 Live Demo

https://impact-quest.onrender.com


### One important correction I made

Your old README says:

> `impact-quest.git`

But your repository is now:

> **`impact-quest-multiplayer-game`**

So I intentionally removed the old repository-specific `git remote` instructions. A visitor doesn't need to see your old repository name.

I also moved **"Play the Game" near the top**. That's important because if a recruiter opens your GitHub repository, they can immediately understand the project and click the live demo.

### I recommend one more GitHub change

In your repository's **About** section, use:

**Description:**

> 🌍 Real-time multiplayer decision-making game for 2–5 players with live scoring, resource allocation, and real-world scenarios.

**Website:**

`https://impact-quest.onrender.com`

Then a stranger visiting your GitHub will see something like:

> **Impact Quest – Real-Time Multiplayer Game**  
> 🌍 Real-time multiplayer decision-making game for 2–5 players...  
> **Website → Play Impact Quest**

That will make your project much clearer and more professional.
