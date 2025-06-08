const hraciInp = document.getElementById("hraci");
const kolaInp = document.getElementById("kola");
const playerDiv = document.getElementById("playerDiv");
const nameDiv = document.createElement("div");
const matchDiv = document.createElement("div");
let players = [];
let playedMatches = [];
let currentRound = 1;
let totalRounds = 1;

function playersSubmit() {
    playerDiv.style.display = "none";
    document.body.appendChild(nameDiv);

    const numPlayers = parseInt(hraciInp.value);
    totalRounds = parseInt(kolaInp.value);

    for (let i = 0; i < hraciInp.value; i++){
        const input = document.createElement("input");
        const label = document.createElement("label");
        const br = document.createElement("br");

        input.type = "text";
        input.id = "input"+i;
        label.htmlFor = "input"+i;
        label.innerText = `Zadej jméno ${i+1}. hráče:`;

        nameDiv.appendChild(label);
        nameDiv.appendChild(input);
        nameDiv.appendChild(br);
    }

    const buttonEl = document.createElement("button");
    buttonEl.onclick = function() {names(); };
    buttonEl.innerText = "Odeslat jména";
    nameDiv.appendChild(buttonEl);
}

function names() {
    nameDiv.style.display = "none";
    document.body.appendChild(matchDiv);

    players = [];
    for (let i = 0; i < parseInt(hraciInp.value); i++) {
        players.push({ name: document.getElementById("input" + i).value, elo: 0 });
    }

    generateMatches();
}

function generateMatches() {
    matchDiv.innerHTML = "";
    const heading = document.createElement("h2");
    heading.innerText = `Kolo ${currentRound} z ${totalRounds}`;
    matchDiv.appendChild(heading);

    // Seřadíme hráče podle ELO sestupně
    players.sort((a, b) => b.elo - a.elo);

    const matched = [];
    const used = new Array(players.length).fill(false);

    for (let i = 0; i < players.length; i++) {
        if (used[i]) continue;
        let found = false;
        for (let j = i + 1; j < players.length; j++) {
            if (used[j]) continue;

            if (!hasPlayedBefore(players[i].name, players[j].name)) {
                matched.push([players[i], players[j]]);
                used[i] = true;
                used[j] = true;
                playedMatches.push([players[i].name, players[j].name]);
                found = true;
                break;
            }
        }
        if (!found && !used[i]) {
            matched.push([players[i], null]); // volný los
            used[i] = true;
        }
    }

    matched.forEach((pair, index) => {
        if (pair[1] === null) {
            const letOff = document.createElement("p");
            letOff.innerText = `Volný los: ${pair[0].name} (2 body zdarma)`;
            matchDiv.appendChild(letOff);
            pair[0].elo += 2;
        } else {
            const div = document.createElement("div");
            div.className = "match";

            const label1 = document.createElement("label");
            label1.innerText = pair[0].name;
            const player1 = document.createElement("input");
            player1.type = "radio";
            player1.name = "match" + index;
            player1.value = "1";

            const labelRemiza = document.createElement("label");
            labelRemiza.innerText = "remíza";
            const remiza = document.createElement("input");
            remiza.type = "radio";
            remiza.name = "match" + index;
            remiza.value = "0.5";

            const label2 = document.createElement("label");
            label2.innerText = pair[1].name;
            const player2 = document.createElement("input");
            player2.type = "radio";
            player2.name = "match" + index;
            player2.value = "2";

            div.appendChild(label1);
            div.appendChild(player1);
            div.appendChild(labelRemiza);
            div.appendChild(remiza);
            div.appendChild(label2);
            div.appendChild(player2);
            matchDiv.appendChild(div);
        }
    });

    const button = document.createElement("button");
    button.innerText = currentRound < totalRounds ? "Další kolo" : "Ukončit turnaj";
    button.onclick = submitMatches;
    matchDiv.appendChild(button);
}

function hasPlayedBefore(playerA, playerB) {
    return playedMatches.some(
        pair =>
            (pair[0] === playerA && pair[1] === playerB) ||
            (pair[0] === playerB && pair[1] === playerA)
    );
}

function submitMatches() {
    const matchesCount = document.querySelectorAll(".match").length;
    for (let i = 0; i < matchesCount; i++) {
        const radios = document.getElementsByName("match" + i);
        let selected = null;
        radios.forEach(radio => {
            if (radio.checked) {
                selected = radio.value;
            }
        });

        if (selected === null) {
            alert("Prosím vyber výsledek pro všechny zápasy!");
            return;
        }

        const pair = getPairByIndex(i);
        if (selected === "1") {
            pair[0].elo += 2;
        } else if (selected === "2") {
            pair[1].elo += 2;
        } else if (selected === "0.5") {
            pair[0].elo += 1;
            pair[1].elo += 1;
        }
    }

    if (currentRound < totalRounds) {
        currentRound++;
        generateMatches();
    } else {
        showResults();
    }
}

function getPairByIndex(index) {
    const matches = [];
    const used = new Array(players.length).fill(false);
    for (let i = 0; i < players.length; i++) {
    if (used[i]) continue;
        for (let j = i + 1; j < players.length; j++) {
            if (used[j]) continue;
            if (hasPlayedBefore(players[i].name, players[j].name) || !hasPlayedBefore(players[i].name, players[j].name)) {
                matches.push([players[i], players[j]]);
                used[i] = true;
                used[j] = true;
                break;
            }
        }
    }
    return matches[index];
}

function showResults() {
    matchDiv.innerHTML = "<h2>Konečné pořadí:</h2>";
    players.sort((a, b) => b.elo - a.elo);
    players.forEach((player, index) => {
        const p = document.createElement("p");
        p.innerText = `${index + 1}. ${player.name} – ${player.elo} bodů`;
        matchDiv.appendChild(p);
    });
}