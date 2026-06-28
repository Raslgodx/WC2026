const ADMIN_KEY = 'rasl123';

const MATCHES = [
    { id: 'm1', team1: { name: 'Германия', flag: 'de' }, team2: { name: 'Парагвай', flag: 'py' } },
    { id: 'm2', team1: { name: 'Франция', flag: 'fr' }, team2: { name: 'Швеция', flag: 'se' } },
    { id: 'm3', team1: { name: 'ЮАР', flag: 'za' }, team2: { name: 'Канада', flag: 'ca' } },
    { id: 'm4', team1: { name: 'Нидерланды', flag: 'nl' }, team2: { name: 'Марокко', flag: 'ma' } },
    { id: 'm5', team1: { name: 'Португалия', flag: 'pt' }, team2: { name: 'Хорватия', flag: 'hr' } },
    { id: 'm6', team1: { name: 'Испания', flag: 'es' }, team2: { name: 'Австрия', flag: 'at' } },
    { id: 'm7', team1: { name: 'США', flag: 'us' }, team2: { name: 'Босния', flag: 'ba' } },
    { id: 'm8', team1: { name: 'Бельгия', flag: 'be' }, team2: { name: 'Сенегал', flag: 'sn' } },
    { id: 'm9', team1: { name: 'Бразилия', flag: 'br' }, team2: { name: 'Япония', flag: 'jp' } },
    { id: 'm10', team1: { name: 'Кот-д\'Ивуар', flag: 'ci' }, team2: { name: 'Норвегия', flag: 'no' } },
    { id: 'm11', team1: { name: 'Мексика', flag: 'mx' }, team2: { name: 'Эквадор', flag: 'ec' } },
    { id: 'm12', team1: { name: 'Англия', flag: 'gb-eng' }, team2: { name: 'ДРК', flag: 'cd' } },
    { id: 'm13', team1: { name: 'Аргентина', flag: 'ar' }, team2: { name: 'Кабо-Верде', flag: 'cv' } },
    { id: 'm14', team1: { name: 'Австралия', flag: 'au' }, team2: { name: 'Египет', flag: 'eg' } },
    { id: 'm15', team1: { name: 'Швейцария', flag: 'ch' }, team2: { name: 'Алжир', flag: 'dz' } },
    { id: 'm16', team1: { name: 'Колумбия', flag: 'co' }, team2: { name: 'Гана', flag: 'gh' } },
];

function flagImg(code) {
    return '<img src="flags/' + code + '.webp" class="flag-icon" alt="">';
}

let dbData = { predictions: {}, results: {} };
let refreshInterval = null;

async function loadDB() {
    try {
        const res = await fetch(JSONBIN_URL + '/latest', {
            headers: { 'X-Access-Key': JSONBIN_KEY }
        });
        if (res.ok) {
            const data = await res.json();
            dbData = data.record;
        }
    } catch (e) {
        console.log('Load error:', e);
    }
}

async function saveDB() {
    try {
        const res = await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
                'X-Access-Key': JSONBIN_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dbData)
        });
        return res.ok;
    } catch (e) {
        console.log('Save error:', e);
        return false;
    }
}

window.adminLogin = async function() {
    const key = document.getElementById('adminKey').value;
    if (key !== ADMIN_KEY) {
        alert('Неверный ключ');
        return;
    }

    document.querySelector('.admin-auth').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    await loadDB();
    renderPredictions();
    renderResultsForm();

    refreshInterval = setInterval(async function() {
        await loadDB();
        renderPredictions();
    }, 10000);
};

function renderPredictions() {
    const container = document.getElementById('allPredictions');
    const preds = dbData.predictions || {};
    const names = Object.keys(preds);

    const counter = document.getElementById('predCounter');
    if (counter) counter.textContent = names.length;

    if (names.length === 0) {
        container.innerHTML = '<p style="color: #aaa;">Пока нет прогнозов</p>';
        return;
    }

    container.innerHTML = '';
    names.forEach(name => {
        const entry = preds[name];
        const userPreds = entry.predictions || entry;
        const timestamp = entry.timestamp;

        const card = document.createElement('div');
        card.className = 'prediction-card';

        let timeHtml = '';
        if (timestamp) {
            const d = new Date(timestamp);
            const dateStr = d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            timeHtml = '<div class="prediction-time">' + dateStr + '</div>';
        }

        let list = '';
        MATCHES.forEach(match => {
            const chosen = userPreds[match.id] === 1 ? match.team1.name : (userPreds[match.id] === 2 ? match.team2.name : '—');
            list += '<p>' + flagImg(match.team1.flag) + ' ' + match.team1.name + ' vs ' + match.team2.name + ' ' + flagImg(match.team2.flag) + ': <strong>' + chosen + '</strong></p>';
        });
        card.innerHTML = '<h3>' + name + '</h3>' + timeHtml + list;
        container.appendChild(card);
    });
}

function renderResultsForm() {
    const container = document.getElementById('resultsForm');
    container.innerHTML = '';
    const res = dbData.results || {};

    MATCHES.forEach(match => {
        const row = document.createElement('div');
        row.className = 'result-row';
        row.innerHTML =
            '<label>' + flagImg(match.team1.flag) + ' ' + match.team1.name + ' vs ' + match.team2.name + ' ' + flagImg(match.team2.flag) + '</label>' +
            '<select data-match="' + match.id + '">' +
            '<option value="">Не сыгран</option>' +
            '<option value="1"' + (res[match.id] === 1 ? ' selected' : '') + '>' + flagImg(match.team1.flag) + ' ' + match.team1.name + '</option>' +
            '<option value="2"' + (res[match.id] === 2 ? ' selected' : '') + '>' + flagImg(match.team2.flag) + ' ' + match.team2.name + '</option>' +
            '</select>';
        container.appendChild(row);
    });
}

window.saveResults = async function() {
    const results = {};
    document.querySelectorAll('#resultsForm select').forEach(sel => {
        if (sel.value) results[sel.dataset.match] = parseInt(sel.value);
    });
    dbData.results = results;
    const ok = await saveDB();
    alert(ok ? 'Результаты сохранены!' : 'Ошибка при сохранении');
    if (ok) {
        renderPredictions();
        renderResultsForm();
    }
};
