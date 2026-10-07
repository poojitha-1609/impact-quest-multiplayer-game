(() => {
  const socket = io();
  const app = document.querySelector("#app");
  const notice = document.querySelector("#notice");

  let room = null;
  let allocation = [25, 25, 25, 25];
  let clockInterval = null;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function showNotice(message = "") {
    notice.textContent = message;
    notice.hidden = !message;
  }

  function leaveRoom() {
    socket.emit("leave-room");
    room = null;
    clearInterval(clockInterval);
    showNotice();
    render();
  }

  function renderHome() {
    app.innerHTML = `
      <section class="hero">
        <p class="eyebrow">A team decision game</p>
        <h1>Make decisions.<br><span>Create impact.</span></h1>
        <p class="hero-copy">Join your friends for three fast-paced community challenges. Share your resources, compare your choices, and see the impact your team can make.</p>
      </section>
      <section class="home-grid" aria-label="Create or join a game">
        <form class="card" id="create-form">
          <p class="eyebrow">Start a new game</p>
          <h2>Create a room</h2>
          <p>Host a game with up to 4 other players (5 players total).</p>
          <label class="field">Your name
            <input name="name" maxlength="20" autocomplete="nickname" placeholder="Enter your name" required>
          </label>
          <button class="button" type="submit">Create room</button>
        </form>
        <form class="card" id="join-form">
          <p class="eyebrow">Have a room code?</p>
          <h2>Join a room</h2>
          <p>Enter your name and the five-character code from your host.</p>
          <label class="field">Your name
            <input name="name" maxlength="20" autocomplete="nickname" placeholder="Enter your name" required>
          </label>
          <label class="field">Room code
            <input name="code" maxlength="5" autocapitalize="characters" placeholder="e.g. A7K9P" required>
          </label>
          <button class="button button-secondary" type="submit">Join room</button>
        </form>
      </section>
      <aside class="rules"><strong>How to play:</strong> Play three scenarios. In each 60-second round, allocate exactly 100 points across four responses in steps of 5. Each response has an impact rating: your round score is the sum of (points allocated × impact rating ÷ 100). Round scores add to your total; the highest total after Round 3 wins. If time runs out, unsubmitted points are split evenly for that round.</aside>
    `;

    app.querySelector("#create-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = new FormData(event.currentTarget).get("name");
      socket.emit("create-room", name);
    });

    app.querySelector("#join-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      socket.emit("join-room", {
        name: data.get("name"),
        code: data.get("code")
      });
    });
  }

  function renderWaitingRoom() {
    const isHost = room.playerId === room.hostId;
    const players = room.players.map((player) => `
      <div class="player-row">
        <span class="player-name"><span class="player-dot"></span>${escapeHtml(player.name)}</span>
        ${player.id === room.hostId ? '<span class="tag">HOST</span>' : ""}
      </div>
    `).join("");

    app.innerHTML = `
      <div class="room-heading">
        <div>
          <p class="eyebrow">Waiting room</p>
          <h1 class="room-code">${escapeHtml(room.code)}</h1>
          <p class="copy-hint">Share this code with your friends.</p>
        </div>
        <button class="button button-secondary" id="leave-button" type="button">Leave room</button>
      </div>
      <div class="columns">
        <section class="card">
          <div class="section-heading"><h2>Players</h2><span class="tag">${room.players.length} / 5</span></div>
          <div class="player-list">${players}</div>
          ${isHost
            ? `<button class="button" id="start-button" type="button" ${room.players.length < 2 ? "disabled" : ""}>Start game</button>`
            : '<p class="waiting-state">Waiting for the host to start the game…</p>'}
          ${isHost && room.players.length < 2 ? '<p class="waiting-state">Invite at least one more player to begin.</p>' : ""}
        </section>
        <aside class="card">
          <p class="eyebrow">Before you begin</p>
          <h2>Three rounds. One champion.</h2>
          <p>Each round gives you 60 seconds to decide how to spend 100 impact points.</p>
          <div class="rules"><strong>Scoring:</strong> Points allocated to higher-impact choices earn more for your score. Your team score is the average of the players’ scores.</div>
        </aside>
      </div>
    `;

    app.querySelector("#leave-button").addEventListener("click", leaveRoom);
    app.querySelector("#start-button")?.addEventListener("click", () => socket.emit("start-game"));
  }

  function formatTime() {
    if (!room.endsAt) return "00:00";
    const seconds = Math.max(0, Math.ceil((room.endsAt - Date.now()) / 1000));
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  function updateTimer() {
    const timer = app.querySelector("#timer");
    if (timer) timer.textContent = formatTime();
  }

  function beginTimer() {
    clearInterval(clockInterval);
    updateTimer();
    clockInterval = setInterval(updateTimer, 250);
  }

  function getTeamScore() {
    if (!room.players.length) return 0;
    return Math.round(room.players.reduce((total, player) => total + player.score, 0) / room.players.length);
  }

  function renderPlaying() {
    const currentPlayer = room.players.find((player) => player.id === room.playerId);
    const submitted = currentPlayer?.submitted;
    const progress = room.roundCount === 0 ? 0 : ((room.roundIndex + 1) / room.roundCount) * 100;
    const resources = room.round.resources.map((resource, index) => `
      <div class="resource-card">
        <div class="resource-line">
          <span class="resource-name">${escapeHtml(resource.name)}</span>
          <span class="impact-score">Impact rating ${resource.impact}/100</span>
        </div>
        <div class="resource-controls">
          <button class="step-button" type="button" data-step="${index}" data-change="-5" aria-label="Remove 5 points from ${escapeHtml(resource.name)}">−</button>
          <input class="allocation-input" type="number" min="0" max="100" step="5" value="${allocation[index]}" data-allocation="${index}" aria-label="Points for ${escapeHtml(resource.name)}" ${submitted ? "disabled" : ""}>
          <button class="step-button" type="button" data-step="${index}" data-change="5" aria-label="Add 5 points to ${escapeHtml(resource.name)}" ${submitted ? "disabled" : ""}>+</button>
        </div>
      </div>
    `).join("");

    app.innerHTML = `
      <div class="game-heading">
        <div>
          <div class="round-meta"><span>ROUND ${room.roundIndex + 1} / ${room.roundCount}</span><span id="timer" class="timer">${formatTime()}</span></div>
          <div class="round-progress" role="progressbar" aria-label="Game progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
            <span style="width: ${progress}%"></span>
          </div>
          <h1 class="scenario-title">${escapeHtml(room.round.title)}</h1>
          <p class="scenario-description">${escapeHtml(room.round.description)}</p>
        </div>
        <button class="button button-secondary" id="leave-button" type="button">Leave</button>
      </div>
      <div class="game-layout">
        <section class="card">
          <div class="section-heading"><h2>Allocate your points</h2><span class="tag">100 points</span></div>
          <p class="muted">Use points in steps of 5. Your round score is the sum of (points allocated × impact rating ÷ 100), rounded to the nearest whole point.</p>
          <div class="resource-list">${resources}</div>
          <div class="allocation-total"><span>Allocated</span><span id="total-value" class="total-value">100 / 100</span></div>
          <button class="button submit-button" id="submit-button" type="button" ${submitted ? "disabled" : ""}>${submitted ? "Decision submitted" : "Submit decision"}</button>
          ${submitted ? '<p class="waiting-state">Your decision is locked. Waiting for the other players…</p>' : ""}
        </section>
        <aside>
          <section class="card">
            <p class="eyebrow">Team status</p>
            <h2>${room.players.filter((player) => player.submitted).length} of ${room.players.length} submitted</h2>
            <div class="player-list">${room.players.map((player) => `
              <div class="player-row">
                <span>${escapeHtml(player.name)}</span>
                <span class="tag">${player.submitted ? "READY" : "CHOOSING"}</span>
              </div>`).join("")}
            </div>
          </section>
          <section class="card score-card">
            <p class="eyebrow">Team impact so far</p>
            <span class="score-number">${getTeamScore()}</span>
            <span class="score-caption">points across completed rounds</span>
          </section>
        </aside>
      </div>
    `;

    beginTimer();
    app.querySelector("#leave-button").addEventListener("click", leaveRoom);
    app.querySelectorAll("[data-step]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.step);
        allocation[index] = Math.max(0, Math.min(100, allocation[index] + Number(button.dataset.change)));
        syncAllocationControls();
      });
    });
    app.querySelectorAll("[data-allocation]").forEach((input) => {
      input.addEventListener("input", () => {
        const index = Number(input.dataset.allocation);
        const value = Number(input.value);
        allocation[index] = Number.isInteger(value) ? Math.max(0, Math.min(100, value)) : 0;
        syncAllocationControls();
      });
    });
    app.querySelector("#submit-button").addEventListener("click", () => {
      if (allocation.reduce((total, amount) => total + amount, 0) !== 100) {
        showNotice("Your four choices must add up to exactly 100 points.");
        return;
      }
      showNotice();
      socket.emit("submit-decision", allocation);
    });
  }

  function syncAllocationControls() {
    allocation.forEach((amount, index) => {
      const input = app.querySelector(`[data-allocation="${index}"]`);
      if (input && Number(input.value) !== amount) input.value = amount;
    });
    const total = allocation.reduce((sum, amount) => sum + amount, 0);
    const totalElement = app.querySelector("#total-value");
    if (totalElement) {
      totalElement.textContent = `${total} / 100`;
      totalElement.classList.toggle("invalid", total !== 100);
    }
  }

  function renderResults() {
    clearInterval(clockInterval);
    const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
    const teamScore = getTeamScore();
    const isFinished = room.status === "finished";
    const isHost = room.playerId === room.hostId;
    const currentPlayer = room.players.find((player) => player.id === room.playerId);
    const highScore = sortedPlayers[0]?.score ?? 0;
    const winners = sortedPlayers.filter((player) => player.score === highScore);
    const winnerNames = winners.map((player) => escapeHtml(player.name)).join(" & ");
    const results = sortedPlayers.map((player) => {
      const rank = sortedPlayers.findIndex((entry) => entry.score === player.score) + 1;
      return `
        <div class="result-row">
          <span class="player-name"><span class="player-dot"></span>${rank}. ${escapeHtml(player.name)}${isFinished && player.score === highScore ? " · CHAMPION" : ""}${player.timedOut ? " · auto-split" : ""}</span>
          <strong>+${player.roundScore} <span class="muted">/ ${player.score} total</span></strong>
        </div>
      `;
    }).join("");
    const allocations = room.round.resources.map((resource, index) => `
      <div class="result-row"><span>${escapeHtml(resource.name)} <span class="muted">× ${resource.impact}%</span></span><strong>${currentPlayer?.allocation?.[index] ?? 0} pts</strong></div>
    `).join("");
    const winnerTitle = winners.length > 1 ? "Tied champions" : "Impact Champion";

    app.innerHTML = `
      <section class="hero">
        <p class="eyebrow">${isFinished ? "All three rounds complete" : `Round ${room.roundIndex + 1} of ${room.roundCount} complete`}</p>
        <h1>${isFinished ? "Quest complete." : "Impact report."}<br><span>${isFinished ? "Look what you built." : escapeHtml(room.round.title)}</span></h1>
        <p class="hero-copy">${isFinished ? "The team has finished every challenge. Here are the final standings." : "Your choices are in. See how the team performed this round."}</p>
      </section>
      ${isFinished ? `
        <section class="champion-card" aria-label="${winnerTitle}">
          <span class="champion-emblem" aria-hidden="true">★</span>
          <div>
            <p class="eyebrow">${winnerTitle}</p>
            <h2>${winnerNames}</h2>
            <p>${highScore} total impact points</p>
          </div>
        </section>
      ` : ""}
      <div class="game-layout">
        <section class="card">
          <div class="section-heading"><h2>${isFinished ? "Final leaderboard" : "Leaderboard"}</h2><span class="tag">Team impact ${teamScore}</span></div>
          <div class="result-list">${results}</div>
          ${!isFinished && isHost ? '<button class="button submit-button" id="next-round" type="button">Start next round</button>' : ""}
          ${!isFinished && !isHost ? '<p class="waiting-state">Waiting for the host to start the next round…</p>' : ""}
          ${isFinished ? '<p class="waiting-state">Final team impact is the average of every player’s total score.</p>' : ""}
        </section>
        <aside class="card">
          <p class="eyebrow">Your decision</p>
          <h2>${escapeHtml(currentPlayer?.name ?? "Player")}</h2>
          <div class="result-list">${allocations}</div>
          <p class="muted">Each allocation is weighted by that response’s impact rating to calculate your round score.</p>
          <div class="score-card">
            <span class="score-number">+${currentPlayer?.roundScore ?? 0}</span>
            <span class="score-caption">impact points this round</span>
          </div>
        </aside>
      </div>
      ${isFinished ? '<div class="results-actions"><button class="button button-secondary" id="home-button" type="button">Back to home</button></div>' : ""}
    `;

    app.querySelector("#next-round")?.addEventListener("click", () => socket.emit("next-round"));
    app.querySelector("#home-button")?.addEventListener("click", () => {
      leaveRoom();
    });
  }

  function render() {
    clearInterval(clockInterval);
    if (!room) return renderHome();
    if (room.status === "waiting") return renderWaitingRoom();
    if (room.status === "playing") return renderPlaying();
    renderResults();
  }

  socket.on("room-state", (state) => {
    showNotice();
    const roundChanged = !room || room.roundIndex !== state.roundIndex;
    room = state;
    if (roundChanged) allocation = [25, 25, 25, 25];
    render();
  });

  socket.on("action-error", showNotice);
  socket.on("connect_error", () => showNotice("Could not connect to the game server. Refresh the page to try again."));
  socket.on("disconnect", () => showNotice("Connection lost. Trying to reconnect…"));

  renderHome();
})();
