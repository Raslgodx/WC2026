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

async function loadStandings() {
    let data = { predictions: {}, results: {} };
    try {
        const res = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/data.json', {
            headers: { 'Authorization': 'token ' + GITHUB_TOKEN }
        });
        if (res.ok) {
            const file = await res.json();
            const text = decodeURIComponent(escape(atob(file.content.replace(/\n/g, ''))));
            data = JSON.parse(text);
        }
    } catch (e) {
        console.log('Load error:', e);
    }

    document.getElementById('loading').classList.add('hidden');

    const preds = data.predictions || {};
    const res = data.results || {};
    const names = Object.keys(preds);

    if (names.length === 0) {
        document.getElementById('noResults').classList.remove('hidden');
        return;
    }

    const hasResults = Object.keys(res).length > 0;

    const standings = names.map(name => {
        const entry = preds[name];
        const userPreds = entry.predictions || entry;
        let correct = 0;
        if (hasResults) {
            MATCHES.forEach(match => {
                if (res[match.id] && userPreds[match.id] === res[match.id]) {
                    correct++;
                }
            });
        }
        return { name, points: correct };
    });

    standings.sort((a, b) => b.points - a.points);

    const tbody = document.getElementById('standingsBody');
    standings.forEach((entry, i) => {
        const row = document.createElement('tr');
        row.innerHTML = '<td>' + (i + 1) + '</td><td>' + entry.name + '</td><td>' + entry.points + '</td>';
        tbody.appendChild(row);
    });

    document.getElementById('standingsSection').classList.remove('hidden');
}

loadStandings();
