const inputs = document.querySelectorAll('input');
const output = document.getElementById('output');
const foyda = document.getElementById('foyda');

// === ЛОГИКА КАЛЬКУЛЯТОРА ===
function liveCalculate() {
    const a = parseFloat(document.getElementById('valA').value) || 0;
    const b = parseFloat(document.getElementById('valB').value) || 0;
    const c = parseFloat(document.getElementById('valC').value) || 0;

    // Защита от деления на 0 при комиссии 100%
    if (c >= 100) {
        output.innerText = "Ошибка (Комиссия ≥ 100%)";
        output.style.color = "red";
        return;
    }

    let d = 1 - c / 100;
    const result = (a * (b / 100) + 5000 + b) / d;
    const benefit = (a * (b / 100) + 5000);
    
    output.style.color = "#007bff";
    output.innerText = result.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + " сум";
    foyda.innerText = benefit.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + " сум";
}

inputs.forEach(input => {
    input.addEventListener('input', liveCalculate);
});
liveCalculate();


// === ЗАПРОС К БЭКЕНДУ НА FASTAPI ===
async function analyzeProduct() {
    const urlInput = document.getElementById('uzumUrl').value;
    if (!urlInput.includes('uzum.uz')) {
        alert('Пожалуйста, введите корректную ссылку на Uzum!');
        return;
    }

    document.getElementById('loader').style.display = 'block';
    document.getElementById('infoBox').style.display = 'none';

    try {
        const response = await fetch('http://127.0.0.1:8000/api/get-category', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlInput })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('resCategory').innerText = data.final_category;
            document.getElementById('resCompetitorPrice').innerText = data.price_without_card || 'Не найдена';
            
            if (data.commission && !data.commission.error) {
                const fboPercentText = data.commission.FBO; 
                document.getElementById('resFbo').innerText = fboPercentText;
                
                const cleanPercent = parseFloat(fboPercentText.replace('%', '').replace(',', '.'));
                
                if (!isNaN(cleanPercent)) {
                    document.getElementById('valC').value = cleanPercent;
                    liveCalculate(); 
                }
            } else {
                document.getElementById('resFbo').innerText = 'Не найдено';
            }
            
            document.getElementById('infoBox').style.display = 'block';
        } else {
            alert('Ошибка: ' + (data.detail || 'Неизвестная ошибка'));
        }
    } catch (error) {
        alert('Ошибка сети! Убедитесь, что сервер FastAPI запущен.');
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
}