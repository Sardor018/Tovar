// Находим все инпуты и поле вывода
const inputs = document.querySelectorAll('input');
const output = document.getElementById('output');

// Функция самого расчета
function liveCalculate() {
    const a = parseFloat(document.getElementById('valA').value) || 0;
    const b = parseFloat(document.getElementById('valB').value) || 0;
    const c = parseFloat(document.getElementById('valC').value) || 1;

    // Проверка на деление на ноль (чтобы не было Infinity)
    if (c === 0) {
        output.innerText = "Ошибка (C=0)";
        output.style.color = "red";
        return;
    }

    const result = (a * (b / 100) + 5000 + b) / (c/100);
    const benefit = (a * (b / 100));
    const formattedBenefit = benefit.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
    // Выводим результат красиво
    output.style.color = "#007bff";
    output.innerText = result.toLocaleString('ru-RU', {
        maximumFractionDigits: 2
    });
    foyda.innerText = formattedBenefit;
}

// Вешаем событие 'input' на каждое поле
// Оно срабатывает мгновенно при вводе, удалении или вставке текста
inputs.forEach(input => {
    input.addEventListener('input', liveCalculate);
});

// Запускаем один раз при загрузке, чтобы показать начальный результат
liveCalculate();