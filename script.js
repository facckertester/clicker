// Данные игры
let points = 0;
let clickValue = 0.1111;
let passiveIncome = 0;
let clickUpgradeCost = 7.772;
let buildingCost = 44;
let buildings = [];
let clickLevel = 0;

// Авторизация и регистрация
let users = JSON.parse(localStorage.getItem('users')) || [];

function showRegister() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';
}

function showLogin() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('registerSection').style.display = 'none';
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('game').style.display = 'block';
        loadGameData();
    } else {
        alert('Неверный логин или пароль!');
    }
}

function register() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    if (users.find(u => u.username === username)) {
        alert('Такой аккаунт уже существует!');
        return;
    }

    const newUser = { username, password, points: 0, clickValue, buildings: [] };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Регистрация успешна!');
    showLogin();
}

// Загрузка данных игры
function loadGameData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    points = currentUser.points;
    clickValue = currentUser.clickValue;
    buildings = currentUser.buildings;
    updateUI();
}

// Обновление UI
function updateUI() {
    document.getElementById('pointsDisplay').textContent = `Поинты: ${points.toFixed(4)}`;
    document.getElementById('clickValue').textContent = clickValue.toFixed(4);
    document.getElementById('passiveIncome').textContent = passiveIncome.toFixed(4);

    // Выводим здания
    let buildingsHtml = '';
    buildings.forEach((building, index) => {
        buildingsHtml += `
            <p>${building.name} (Уровень: ${building.level}) - Стоимость улучшения: ${building.upgradeCost.toFixed(4)}</p>
            <button onclick="upgradeBuilding(${index})">Улучшить здание</button>
        `;
    });

    document.getElementById('buildings').innerHTML = buildingsHtml;
}

// Клик
document.getElementById('clickButton').addEventListener('click', () => {
    points += clickValue;
    saveGameData();
    updateUI();
});

// Улучшение клика
document.getElementById('upgradeClickButton').addEventListener('click', () => {
    if (points >= clickUpgradeCost) {
        points -= clickUpgradeCost;
        clickValue += 0.1;
        clickUpgradeCost *= 1.2;
        saveGameData();
        updateUI();
    } else {
        alert('Недостаточно поинтов для улучшения клика!');
    }
});

// Улучшение зданий
function upgradeBuilding(index) {
    const building = buildings[index];
    if (points >= building.upgradeCost) {
        points -= building.upgradeCost;
        building.level++;
        building.upgradeCost *= 1.1;  // Увеличиваем стоимость улучшения здания
        passiveIncome += building.income; // Увеличиваем пассивный доход
        saveGameData();
        updateUI();
    } else {
        alert('Недостаточно поинтов для улучшения здания!');
    }
}

// Сохранение данных
function saveGameData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    currentUser.points = points;
    currentUser.clickValue = clickValue;
    currentUser.buildings = buildings;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Пассивный доход
setInterval(() => {
    points += passiveIncome;
    saveGameData();
    updateUI();
}, 1000);
