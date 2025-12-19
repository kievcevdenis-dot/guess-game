// ========================================
// 1. ОСНОВНЫЕ ПЕРЕМЕННЫЕ И ЭЛЕМЕНТЫ
// ========================================

// Находим все нужные элементы на странице
const userGuessInput = document.getElementById('userGuess');
const checkButton = document.getElementById('checkBtn');
const restartButton = document.getElementById('restartBtn');
const hintText = document.getElementById('hintText');
const attemptsCount = document.getElementById('attemptsCount');
const bestScore = document.getElementById('bestScore');
const historyList = document.getElementById('historyList');
const rangeSlider = document.getElementById('rangeSlider');
const rangeValue = document.getElementById('rangeValue');

// Настройки сложности (диапазоны чисел)
const difficultySettings = {
    1: { min: 1, max: 50, label: "1-50" },     // Легко
    2: { min: 1, max: 100, label: "1-100" },   // Средне
    3: { min: 1, max: 200, label: "1-200" },   // Сложно
    4: { min: 1, max: 500, label: "1-500" },   // Эксперт
    5: { min: 1, max: 1000, label: "1-1000" }  // Безумие
};

// Переменные игры
let secretNumber;
let attempts;
let gameOver;
let currentDifficulty = 3; // По умолчанию "Сложно" (1-200)

// ========================================
// 2. ФУНКЦИЯ НАЧАЛА НОВОЙ ИГРЫ
// ========================================

function startNewGame() {
    // Получаем настройки текущей сложности
    const settings = difficultySettings[currentDifficulty];
    
    // Генерируем случайное число в заданном диапазоне
    secretNumber = Math.floor(Math.random() * (settings.max - settings.min + 1)) + settings.min;
    
    // Сбрасываем счётчики
    attempts = 0;
    gameOver = false;
    
    // Обновляем интерфейс
    updateDisplay();
    clearHistory();
    userGuessInput.value = '';
    userGuessInput.focus();
    
    // Обновляем текст сложности
    rangeValue.textContent = settings.label;
    
    console.log(`Новая игра! Загадано: ${secretNumber} (диапазон: ${settings.min}-${settings.max})`);
}

// ========================================
// 3. ФУНКЦИЯ ПРОВЕРКИ ЧИСЛА
// ========================================

function checkGuess() {
    // Если игра окончена, ничего не делаем
    if (gameOver) return;
    
    // Получаем число из поля ввода
    const userGuess = parseInt(userGuessInput.value);
    
    // Проверяем, что введено корректное число
    if (isNaN(userGuess)) {
        showMessage("Пожалуйста, введите число!", "warning");
        userGuessInput.focus();
        return;
    }
    
    const settings = difficultySettings[currentDifficulty];
    if (userGuess < settings.min || userGuess > settings.max) {
        showMessage(`Число должно быть от ${settings.min} до ${settings.max}!`, "warning");
        userGuessInput.value = '';
        userGuessInput.focus();
        return;
    }
    
    // Увеличиваем счётчик попыток
    attempts++;
    
    // Сравниваем число с загаданным
    let resultClass, hint, icon;
    
    if (userGuess === secretNumber) {
        // УГАДАЛ!
        resultClass = "correct";
        hint = "🎉 Угадал!";
        icon = "fas fa-trophy";
        gameOver = true;
        showMessage(`Поздравляю! Вы угадали число ${secretNumber} за ${attempts} попыток!`, "success");
        updateBestScore();
    } else if (userGuess < secretNumber) {
        // МЕНЬШЕ
        resultClass = "too-low";
        hint = "⬆️ Больше!";
        icon = "fas fa-arrow-up";
        showMessage("Моё число БОЛЬШЕ. Попробуй ещё!", "warning");
    } else {
        // БОЛЬШЕ
        resultClass = "too-high";
        hint = "⬇️ Меньше!";
        icon = "fas fa-arrow-down";
        showMessage("Моё число МЕНЬШЕ. Попробуй ещё!", "warning");
    }
    
    // Добавляем попытку в историю
    addToHistory(userGuess, resultClass, hint, icon);
    
    // Обновляем счётчик попыток
    updateDisplay();
    
    // Очищаем поле ввода и фокусируемся на нём
    userGuessInput.value = '';
    userGuessInput.focus();
}

// ========================================
// 4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ========================================

// Показать сообщение в подсказке
function showMessage(message, type = "normal") {
    hintText.textContent = message;
    hintText.className = "hint";
    
    if (type === "success") {
        hintText.classList.add("success", "pulse");
    } else if (type === "warning") {
        hintText.classList.add("warning", "pulse");
    }
}

// Обновить отображение счётчиков
function updateDisplay() {
    attemptsCount.textContent = attempts;
    
    // Получаем лучший результат из localStorage
    const savedBest = localStorage.getItem(`bestScore_${currentDifficulty}`);
    if (savedBest) {
        bestScore.textContent = savedBest;
    }
}

// Обновить лучший счёт
function updateBestScore() {
    const savedBest = localStorage.getItem(`bestScore_${currentDifficulty}`);
    
    if (!savedBest || attempts < parseInt(savedBest)) {
        localStorage.setItem(`bestScore_${currentDifficulty}`, attempts);
        bestScore.textContent = attempts;
        showMessage(`🎊 Новый рекорд: ${attempts} попыток!`, "success");
    }
}

// Добавить попытку в историю
function addToHistory(guess, className, hintText, iconClass) {
    // Убираем сообщение "история пуста"
    const emptyMsg = historyList.querySelector('.history-empty');
    if (emptyMsg) emptyMsg.remove();
    
    // Создаём новый элемент истории
    const historyItem = document.createElement('div');
    historyItem.className = `history-item ${className}`;
    historyItem.innerHTML = `
        <div class="history-number">${guess}</div>
        <div class="history-hint">
            <i class="${iconClass}"></i>
            ${hintText}
        </div>
    `;
    
    // Добавляем в начало списка
    historyList.insertBefore(historyItem, historyList.firstChild);
    
    // Ограничиваем историю 10 последними попытками
    const items = historyList.querySelectorAll('.history-item');
    if (items.length > 10) {
        items[items.length - 1].remove();
    }
}

// Очистить историю
function clearHistory() {
    historyList.innerHTML = '<div class="history-empty">Здесь будет история ваших попыток...</div>';
}

// ========================================
// 5. НАСТРОЙКА СОБЫТИЙ
// ========================================

// Нажатие кнопки "Проверить"
checkButton.addEventListener('click', checkGuess);

// Нажатие Enter в поле ввода
userGuessInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkGuess();
    }
});

// Нажатие кнопки "Новая игра"
restartButton.addEventListener('click', function() {
    startNewGame();
    showMessage("Новая игра началась! Я загадал число...", "warning");
});

// Изменение сложности через слайдер
rangeSlider.addEventListener('input', function() {
    currentDifficulty = parseInt(this.value);
    startNewGame();
    showMessage(`Уровень сложности изменён!`, "warning");
});

// ========================================
// 6. ЗАПУСК ИГРЫ
// ========================================

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', function() {
    startNewGame();
    showMessage("Я загадал число от 1 до 200. Попробуй угадать!", "warning");
});