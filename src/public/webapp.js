let tg = window.Telegram.WebApp;

tg.expand();

document.addEventListener('DOMContentLoaded', function() {
    tg.ready();
    loadUserInfo();
    loadPortfolio();
    loadSignals();
    loadSettings();
});

function loadUserInfo() {
    let userInfo = document.getElementById('user-info');
    if (tg.initDataUnsafe.user) {
        userInfo.innerHTML = `
            <p>Користувач: ${tg.initDataUnsafe.user.first_name} ${tg.initDataUnsafe.user.last_name || ''}</p>
            <p>Telegram ID: ${tg.initDataUnsafe.user.id}</p>
        `;
    } else {
        userInfo.innerHTML = '<p>Інформація про користувача недоступна</p>';
    }
}

function loadPortfolio() {
    let portfolioContent = document.getElementById('portfolio-content');
    portfolioContent.innerHTML = '<p>Завантаження портфоліо...</p>';
    
    fetch('/api/portfolio')
        .then(response => response.json())
        .then(data => {
            let html = '<ul>';
            data.forEach(item => {
                html += `<li>${item.asset}: ${item.amount} (${item.value} USD)</li>`;
            });
            html += '</ul>';
            portfolioContent.innerHTML = html;
        })
        .catch(error => {
            portfolioContent.innerHTML = '<p>Помилка завантаження портфоліо</p>';
            console.error('Помилка:', error);
        });
}

function loadSignals() {
    let signalsContent = document.getElementById('signals-content');
    signalsContent.innerHTML = '<p>Завантаження сигналів...</p>';
    
    fetch('/api/signals')
        .then(response => response.json())
        .then(data => {
            let html = '<ul>';
            data.forEach(signal => {
                html += `<li>${signal.type} | ${signal.pair} | ${signal.direction} | Вхід: ${signal.entryPrice}</li>`;
            });
            html += '</ul>';
            signalsContent.innerHTML = html;
        })
        .catch(error => {
            signalsContent.innerHTML = '<p>Помилка завантаження сигналів</p>';
            console.error('Помилка:', error);
        });
}

function loadSettings() {
    let settingsContent = document.getElementById('settings-content');
    settingsContent.innerHTML = `
        <p>Частота сигналів: <select id="signal-frequency">
            <option value="all">Всі</option>
            <option value="daily">Щоденно</option>
            <option value="weekly">Щотижня</option>
        </select></p>
        <p>Сповіщення: <input type="checkbox" id="notifications-enabled" checked></p>
        <button onclick="saveSettings()">Зберегти налаштування</button>
    `;
}

function saveSettings() {
    let frequency = document.getElementById('signal-frequency').value;
    let notificationsEnabled = document.getElementById('notifications-enabled').checked;
    
    fetch('/api/settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frequency, notificationsEnabled }),
    })
    .then(response => response.json())
    .then(data => {
        tg.showPopup({
            title: 'Успіх',
            message: 'Налаштування збережено',
            buttons: [{ type: 'close' }]
        });
    })
    .catch(error => {
        console.error('Помилка збереження налаштувань:', error);
        tg.showPopup({
            title: 'Помилка',
            message: 'Не вдалося зберегти налаштування',
            buttons: [{ type: 'close' }]
        });
    });
}

// Додайте кнопку "Закрити" в верхньому правому куті
tg.MainButton.setText('Закрити').show().onClick(function() {
    tg.close();
});