const tg = window.Telegram.WebApp;

const app = {
    pages: {
        home: { title: 'Головна', render: renderHome },
        futuresSignals: { title: 'Фючерсні сигнали', render: renderFuturesSignals },
        spotSignals: { title: 'Спотові сигнали', render: renderSpotSignals },
        educationalMaterials: { title: 'Навчальні матеріали', render: renderEducationalMaterials },
        airdrops: { title: 'Огляд тапалок/аірдропів', render: renderAirdrops },
        payment: { title: 'Оплата і реферальна система', render: renderPayment },
        chats: { title: 'Чати', render: renderChats }
    },

    init() {
        this.createNavigation();
        this.navigateTo('home');
        tg.ready();
    },

    createNavigation() {
        const nav = document.getElementById('main-nav');
        for (const [key, { title }] of Object.entries(this.pages)) {
            const button = document.createElement('button');
            button.textContent = title;
            button.addEventListener('click', () => this.navigateTo(key));
            nav.appendChild(button);
        }
    },

    navigateTo(page) {
        const content = document.getElementById('content');
        content.innerHTML = '';
        this.pages[page].render(content);
    }
};

function renderHome(container) {
    container.innerHTML = `
        <div class="section">
            <h2>Ласкаво просимо до Trading Bot</h2>
            <p>Оберіть розділ у меню вище для перегляду інформації.</p>
        </div>
    `;
}

function renderFuturesSignals(container) {
    container.innerHTML = `
        <div class="section">
            <h2>Фючерсні сигнали</h2>
            <p>Тут будуть відображатися фючерсні сигнали.</p>
        </div>
    `;
}

function renderSpotSignals(container) {
    container.innerHTML = `
        <div class="section">
            <h2>Спотові сигнали</h2>
            <p>Тут будуть відображатися спотові сигнали.</p>
        </div>
    `;
}

function renderEducationalMaterials(container) {
    container.innerHTML = `
        <div class="section">
            <h2>Навчальні матеріали</h2>
            <p>Тут будуть доступні навчальні матеріали.</p>
        </div>
    `;
}

function renderAirdrops(container) {
    container.innerHTML = `
        <div class="section">
            <h2>Огляд тапалок/аірдропів</h2>
            <p>Тут будуть відображатися огляди тапалок та аірдропів.</p>
        </div>
    `;
}

function renderPayment(container) {
    container.innerHTML = `
        <div class="section">
            <h2>Оплата і реферальна система</h2>
            <p>Тут буде інформація про оплату та реферальну систему.</p>
        </div>
    `;
}

function renderChats(container) {
    container.innerHTML = `
        <div class="section">
            <h2>Чати</h2>
            <p>Тут будуть доступні чати.</p>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => app.init());