# ЧМ-2026 Прогнозы

Сайт для прогнозов плей-офф Чемпионата мира 2026. Данные хранятся в JSON-файле на GitHub.

## Настройка

### 1. Создай репозиторий

1. Создай новый репозиторий на GitHub (можно приватный)
2. Загрузи все файлы проекта

### 2. Создай GitHub токен

1. Перейди в [Settings → Developer settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. Нажми **Generate new token**
3. Дай имя (например `wc2026`)
4. В **Repository access** выбери **Only select repositories** → выбери свой репозиторий
5. В **Permissions** → **Repository permissions** → **Contents** выбери **Read and write**
6. Нажми **Generate token** и скопируй его

### 3. Настрой конфиг

Открой `config.js` и замени:

```js
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN';  // ← вставь токен
const GITHUB_REPO = 'YOUR_USERNAME/YOUR_REPO';  // ← username/repo
```

Пример: если репозиторий `https://github.com/ivan/wc2026`, то:
```js
const GITHUB_REPO = 'ivan/wc2026';
```

### 4. Включи GitHub Pages

1. В репозитории перейди в **Settings → Pages**
2. В **Source** выбери **Deploy from a branch**
3. Ветка: **main**, папка: **/ (root)**
4. Нажми **Save**

### 5. Создай data.json

В репозитории создай файл `data.json` со следующим содержимым:

```json
{
  "predictions": {},
  "results": {}
}
```

Сайт будет доступен по адресу: `https://username.github.io/repo-name/`

## Страницы

- `/index.html` — главная, прогнозы
- `/table.html` — таблица результатов
- `/admin.html` — админ панель

## Админ панель

Ссылка: `/admin.html`
Ключ: `WC2026_ADMIN_2026`

## Дедлайн

Приём прогнозов на 1/16 финала: 28 июня 2026, 21:00 МСК
