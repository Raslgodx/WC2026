const MATCHES = [
    { id: 'm1', team1: { name: 'Германия', flag: 'de' }, team2: { name: 'Парагвай', flag: 'py' }, bracket: 'left', pos: 0, time: '29 июня 23:30' },
    { id: 'm2', team1: { name: 'Франция', flag: 'fr' }, team2: { name: 'Швеция', flag: 'se' }, bracket: 'left', pos: 1, time: '30 июня 00:00' },
    { id: 'm3', team1: { name: 'ЮАР', flag: 'za' }, team2: { name: 'Канада', flag: 'ca' }, bracket: 'left', pos: 2, time: '28 июня 22:00', locked: true },
    { id: 'm4', team1: { name: 'Нидерланды', flag: 'nl' }, team2: { name: 'Марокко', flag: 'ma' }, bracket: 'left', pos: 3, time: '30 июня 04:00' },
    { id: 'm5', team1: { name: 'Португалия', flag: 'pt' }, team2: { name: 'Хорватия', flag: 'hr' }, bracket: 'left', pos: 4, time: '2 июля 02:00' },
    { id: 'm6', team1: { name: 'Испания', flag: 'es' }, team2: { name: 'Австрия', flag: 'at' }, bracket: 'left', pos: 5, time: '2 июля 22:00' },
    { id: 'm7', team1: { name: 'США', flag: 'us' }, team2: { name: 'Босния', flag: 'ba' }, bracket: 'left', pos: 6, time: '1 июля 03:00' },
    { id: 'm8', team1: { name: 'Бельгия', flag: 'be' }, team2: { name: 'Сенегал', flag: 'sn' }, bracket: 'left', pos: 7, time: '1 июля 23:00' },
    { id: 'm9', team1: { name: 'Бразилия', flag: 'br' }, team2: { name: 'Япония', flag: 'jp' }, bracket: 'right', pos: 0, time: '29 июня 20:00' },
    { id: 'm10', team1: { name: 'Кот-д\'Ивуар', flag: 'ci' }, team2: { name: 'Норвегия', flag: 'no' }, bracket: 'right', pos: 1, time: '30 июня 20:00' },
    { id: 'm11', team1: { name: 'Мексика', flag: 'mx' }, team2: { name: 'Эквадор', flag: 'ec' }, bracket: 'right', pos: 2, time: '1 июля 04:00' },
    { id: 'm12', team1: { name: 'Англия', flag: 'gb-eng' }, team2: { name: 'ДРК', flag: 'cd' }, bracket: 'right', pos: 3, time: '1 июля 19:00' },
    { id: 'm13', team1: { name: 'Аргентина', flag: 'ar' }, team2: { name: 'Кабо-Верде', flag: 'cv' }, bracket: 'right', pos: 4, time: '3 июля 01:00' },
    { id: 'm14', team1: { name: 'Австралия', flag: 'au' }, team2: { name: 'Египет', flag: 'eg' }, bracket: 'right', pos: 5, time: '3 июля 21:00' },
    { id: 'm15', team1: { name: 'Швейцария', flag: 'ch' }, team2: { name: 'Алжир', flag: 'dz' }, bracket: 'right', pos: 6, time: '3 июля 06:00' },
    { id: 'm16', team1: { name: 'Колумбия', flag: 'co' }, team2: { name: 'Гана', flag: 'gh' }, bracket: 'right', pos: 7, time: '4 июля 04:30' },
];

const DEADLINE = new Date('2026-06-29T16:00:00Z');

let dbData = { predictions: {}, results: {} };
let username = '';

function flagImg(code) {
    return '<img src="flags/' + code + '.webp" class="flag-icon" alt="">';
}

async function loadDB() {
    try {
        const res = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/data.json', {
            headers: { 'Authorization': 'token ' + GITHUB_TOKEN }
        });
        if (!res.ok) return;
        const file = await res.json();
        const text = decodeURIComponent(escape(atob(file.content.replace(/\n/g, ''))));
        dbData = JSON.parse(text);
    } catch (e) {
        console.log('Load error:', e);
    }
}

async function saveDB() {
    let sha = null;
    try {
        const res = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/data.json', {
            headers: { 'Authorization': 'token ' + GITHUB_TOKEN }
        });
        if (res.ok) {
            const file = await res.json();
            sha = file.sha;
        }
    } catch {}

    const body = {
        message: 'Update predictions - ' + new Date().toISOString(),
        content: btoa(unescape(encodeURIComponent(JSON.stringify(dbData, null, 2))))
    };
    if (sha) body.sha = sha;

    const res = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/data.json', {
        method: 'PUT',
        headers: {
            'Authorization': 'token ' + GITHUB_TOKEN,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    return res.ok;
}

window.startPredicting = async function() {
    username = document.getElementById('username').value.trim();
    if (!username) {
        alert('Пожалуйста, введи своё имя и фамилию');
        return;
    }

    if (username.length < 3) {
        alert('Пожалуйста, введи имя и фамилию');
        return;
    }

    await loadDB();

    if (dbData.predictions[username] && dbData.predictions[username].predictions) {
        document.querySelector('.auth-section').classList.add('hidden');
        document.getElementById('alreadyVoted').classList.remove('hidden');
        return;
    }

    document.querySelector('.auth-section').classList.add('hidden');
    document.getElementById('bracketSection').classList.remove('hidden');
};

const userPredictions = {};

window.selectTeam = function(matchId, teamNum, btn) {
    var match = MATCHES.find(function(m) { return m.id === matchId; });
    if (match && match.locked) return;

    var slot = btn.closest('.match-slot');
    slot.querySelectorAll('.team-btn').forEach(function(b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
    userPredictions[matchId] = teamNum;
    updateBracket();
};

function updateBracket() {
    var qfSlots = document.querySelectorAll('.qf-slot');

    for (var i = 0; i < 4; i++) {
        var m1 = MATCHES[i * 2];
        var m2 = MATCHES[i * 2 + 1];
        var t1 = userPredictions[m1.id] === 1 ? m1.team1 : (userPredictions[m1.id] === 2 ? m1.team2 : null);
        var t2 = userPredictions[m2.id] === 1 ? m2.team1 : (userPredictions[m2.id] === 2 ? m2.team2 : null);
        qfSlots[i].innerHTML = t1 && t2
            ? '<div class="qf-team">' + flagImg(t1.flag) + '<span>' + t1.name + '</span></div><div class="qf-team">' + flagImg(t2.flag) + '<span>' + t2.name + '</span></div>'
            : '<div class="qf-empty">1/4</div>';
    }

    for (var i = 0; i < 4; i++) {
        var m1 = MATCHES[8 + i * 2];
        var m2 = MATCHES[8 + i * 2 + 1];
        var t1 = userPredictions[m1.id] === 1 ? m1.team1 : (userPredictions[m1.id] === 2 ? m1.team2 : null);
        var t2 = userPredictions[m2.id] === 1 ? m2.team1 : (userPredictions[m2.id] === 2 ? m2.team2 : null);
        qfSlots[4 + i].innerHTML = t1 && t2
            ? '<div class="qf-team">' + flagImg(t1.flag) + '<span>' + t1.name + '</span></div><div class="qf-team">' + flagImg(t2.flag) + '<span>' + t2.name + '</span></div>'
            : '<div class="qf-empty">1/4</div>';
    }
}

window.submitPredictions = async function() {
    var required = MATCHES.filter(function(m) { return !m.locked; }).length;
    var made = Object.keys(userPredictions).length;
    if (made < required) {
        alert('Пожалуйста, сделай прогноз во всех доступных матчах');
        return;
    }

    var btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Отправка...';

    dbData.predictions[username] = {
        predictions: userPredictions,
        timestamp: new Date().toISOString()
    };
    var ok = await saveDB();

    if (ok) {
        document.getElementById('bracketSection').classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
    } else {
        alert('Ошибка при сохранении. Попробуй ещё раз.');
        btn.disabled = false;
        btn.textContent = 'Отправить прогноз';
    }
};

window.showUserPredictions = function(name) {
    var entry = dbData.predictions[name];
    if (!entry) return;
    var preds = entry.predictions || entry;

    var html = '<div class="participants-header"><button class="nav-btn" onclick="hideUserPredictions()">← Назад</button><h2>' + name + '</h2></div>';
    html += '<div class="user-predictions-list">';

    MATCHES.forEach(function(m) {
        var chosen = preds[m.id] === 1 ? m.team1 : (preds[m.id] === 2 ? m.team2 : null);
        if (!chosen) return;
        html += '<div class="user-pred-item">' +
            '<div class="user-pred-teams">' + flagImg(m.team1.flag) + ' ' + m.team1.name + ' vs ' + m.team2.name + ' ' + flagImg(m.team2.flag) + '</div>' +
            '<div class="user-pred-choice">Выбор: ' + flagImg(chosen.flag) + ' <strong>' + chosen.name + '</strong></div>' +
            '</div>';
    });

    html += '</div>';
    document.getElementById('participantsSection').innerHTML = html;
};

window.hideUserPredictions = function() {
    renderParticipants();
};

function renderParticipants() {
    var names = Object.keys(dbData.predictions);
    if (names.length === 0) {
        document.getElementById('participantsSection').innerHTML = '<div class="no-results"><h2>Никто ещё не проголосовал</h2></div>';
        return;
    }

    var html = '<div class="participants-list">';
    names.sort().forEach(function(name) {
        html += '<button class="participant-btn" onclick="showUserPredictions(\'' + name.replace(/'/g, "\\'") + '\')">' + name + '</button>';
    });
    html += '</div>';
    document.getElementById('participantsSection').innerHTML = html;
}

async function checkDeadline() {
    await loadDB();

    if (new Date() > DEADLINE) {
        document.querySelector('.auth-section').classList.add('hidden');
        document.querySelector('.deadline-banner').classList.add('hidden');
        document.getElementById('participantsSection').classList.remove('hidden');
        renderParticipants();
    }
}

function renderMatch(m) {
    var locked = m.locked ? ' locked' : '';
    return '<div class="match-slot' + locked + '" data-match="' + m.id + '">' +
        '<div class="match-time">' + m.time + '</div>' +
        '<button class="team-btn" onclick="selectTeam(\'' + m.id + '\',1,this)"' + (m.locked ? ' disabled' : '') + '>' +
        flagImg(m.team1.flag) + '<span>' + m.team1.name + '</span></button>' +
        '<button class="team-btn" onclick="selectTeam(\'' + m.id + '\',2,this)"' + (m.locked ? ' disabled' : '') + '>' +
        flagImg(m.team2.flag) + '<span>' + m.team2.name + '</span></button>' +
        '</div>';
}

function renderBracket() {
    var leftMatches = document.getElementById('col-left-matches');
    var leftQF = document.getElementById('col-left-qf');
    var rightQF = document.getElementById('col-right-qf');
    var rightMatches = document.getElementById('col-right-matches');

    for (var i = 0; i < 8; i++) {
        leftMatches.innerHTML += renderMatch(MATCHES[i]);
        if (i % 2 === 0) {
            leftQF.innerHTML += '<div class="qf-slot"><div class="qf-empty">1/4</div></div>';
        }
    }

    for (var i = 0; i < 8; i++) {
        rightMatches.innerHTML += renderMatch(MATCHES[8 + i]);
        if (i % 2 === 0) {
            rightQF.innerHTML += '<div class="qf-slot"><div class="qf-empty">1/4</div></div>';
        }
    }
}

checkDeadline();
renderBracket();
