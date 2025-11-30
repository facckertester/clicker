// Инициализация данных пользователя
let user = {
    username: '',
    password: '',
    points: 0.0000,
    income: 0.1111,
    level: 1,
    clickPrice: 7.772,
    multiplier: 1,
    buildings: [
        { name: 'Ферма', price: 44.0000, income: 0.1234, level: 1, maxLevel: 1000 },
        { name: 'Шахта', price: 88.0000, income: 0.2500, level: 1, maxLevel: 1000 },
        { name: 'Лесопилка', price: 132.0000, income: 0.3750, level: 1, maxLevel: 1000 },
        // Добавьте другие здания по аналогии
    ],
    upgrades: [],
    passiveIncome: 0
};

// Сохранение данных в localStorage
const saveData = () => {
    localStorage.setItem('userData', JSON.stringify(user));
};

// Загрузка данных при старте
const loadGame = () => {
    let savedData = JSON.parse(localStorage.getItem('userData'));
    if (savedData) {
        user = savedData;
    }
    updateUI();
};

// Обновление UI
const updateUI = () => {
    document.getElementById('points-display').textContent = `Поинты: ${user.points.toFixed(4)}`;
    document.getElementById('passive-income').textContent = `Пассивный доход: ${user.passiveIncome.toFixed(4)}`;
    document.getElementById('click-btn').textContent = `Клик: ${user.income.toFixed(4)}`;
    document.getElementById('level-info').textContent = `Уровень кнопки: ${user.level} | Цена улучшения: ${user.clickPrice.toFixed(4)}`;

    // Обновляем список зданий
    const buildingsDiv = document.getElementById('buildings');
    buildingsDiv.innerHTML = '';
    user.buildings.forEach((building, index) => {
        const buildingDiv = document.createElement('div');
        buildingDiv.classList.add('building');
        buildingDiv.innerHTML = `
            <p>${building.name}</p>
            <p>Уровень: ${building.level} | Цена: ${building.price.toFixed(4)} | Доход: ${building.income.toFixed(4)} в секунду</p>
            <button onclick="upgradeBuilding(${index})">Улучшить</button>
        `;
        buildingsDiv.appendChild(buildingDiv);
    });

    // Показать или скрыть "Убер Пупер Турбо Здание"
    if (user.buildings.every(b => b.level >= 800)) {
        document.getElementById('ultimate-building').style.display = 'block';
    }
};

// Клик по кнопке
document.getElementById('click-btn').addEventListener('click', () => {
    user.points += user.income * user.multiplier;
    updateUI();
});

// Улучшение кнопки
const upgradeButton = () => {
    if (user.points >= user.clickPrice) {
        user.points -= user.clickPrice;
        user.level++;
        user.income += 0.1111;
        user.clickPrice *= 1.1;
        updateUI();
    }
};

// Улучшение здания
const upgradeBuilding = (index) => {
    const building = user.buildings[index];
    if (user.points >= building.price) {
        user.points -= building.price;
        building.level++;
        building.income += 0.0001;
        building.price *= 1.1;
        updateUI();
    }
};

// Регистрируем пользователя
document.getElementById('register-btn').addEventListener('click', () => {
    user.username = document.getElementById('username').value;
    user.password = document.getElementById('password').value;
    alert('Регистрация прошла успешно!');
});

// Вход в игру
document.getElementById('login-btn').addEventListener('click', () => {
    user.username = document.getElementById('username').value;
    user.password = document.getElementById('password').value;
    document.getElementById('login-menu').style.display = 'none';
    document.getElementById('game-menu').style.display = 'block';
    loadGame();
});

// Автосохранение данных каждую секунду
setInterval(saveData, 1000);

// Таймер паука с дебафами
const spawnSpider = () => {
    const randomChance = Math.random();
    const spiderTimer = document.getElementById('spider-timer');
    
    if (randomChance < 0.25) {
        // Паук раздавлен
        spiderTimer.textContent = 'Паук был раздавлен.';
    } else if (randomChance < 0.5) {
        // Паук дает дебаф
        user.income *= 0.001;
        user.passiveIncome *= 0.001;
        spiderTimer.textContent = 'Дебаф: Все доходы снижены на х0.001.';
        setTimeout(() => {
            user.income /= 0.001;
            user.passiveIncome /= 0.001;
            updateUI();
        }, 36000); // 36 секунд
    } else if (randomChance < 0.75) {
        // Паук дает бонус
        user.income *= 100;
        user.passiveIncome *= 100;
        spiderTimer.textContent = 'Бонус: Все доходы увеличены в 100 раз.';
        setTimeout(() => {
            user.income /= 100;
            user.passiveIncome /= 100;
            updateUI();
        }, 11000); // 11 секунд
    }

    setTimeout(spawnSpider, 180000); // 3 минуты
};

spawnSpider();
