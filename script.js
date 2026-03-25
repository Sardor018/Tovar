// ============================================================================
// 1. ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК
// ============================================================================
function switchTab(tab) {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    
    // Показываем нужную вкладку
    document.getElementById(`section-${tab}`).classList.remove('hidden');
    
    // Элементы кнопок
    const btnAn = document.getElementById('tab-btn-analyzer');
    const btnGen = document.getElementById('tab-btn-generator');
    
    // Меняем стили активной кнопки
    if(tab === 'analyzer') {
        btnAn.className = "w-1/2 px-6 py-3 rounded-full font-bold transition-all bg-purple-600 text-white shadow-lg";
        btnGen.className = "w-1/2 px-6 py-3 rounded-full font-bold transition-all text-gray-500 hover:bg-gray-100";
    } else {
        btnGen.className = "w-1/2 px-6 py-3 rounded-full font-bold transition-all bg-pink-500 text-white shadow-lg";
        btnAn.className = "w-1/2 px-6 py-3 rounded-full font-bold transition-all text-gray-500 hover:bg-gray-100";
    }
}


// ============================================================================
// 2. ЛОГИКА АНАЛИЗАТОРА И КАЛЬКУЛЯТОРА
// ============================================================================
const inputsAnalyzer = document.querySelectorAll('#section-analyzer input');
const output = document.getElementById('output');
const foyda = document.getElementById('foyda');

const API_BASE_URL = "https://data-bekend.onrender.com"; 

async function autoWakeServer() {
    const statusText = document.getElementById('serverStatus');
    const analyzeBtn = document.getElementById('analyzeBtn');
    let seconds = 0;
    let isAwake = false;

    const timer = setInterval(() => {
        seconds++;
        if (!isAwake) {
            statusText.innerText = `🟡 Сервер просыпается... Прошло: ${seconds} сек.`;
        }
    }, 1000);

    while (!isAwake) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/ping`);
            
            if (response.ok) {
                isAwake = true;
                clearInterval(timer);

                statusText.innerText = `🟢 Сервер готов! (за ${seconds} сек.)`;
                statusText.style.color = "#28a745";
                
                analyzeBtn.disabled = false;
                analyzeBtn.style.background = "#7000ff";
                analyzeBtn.innerText = "Получить данные";
                
                console.log("Сервер проснулся успешно!");

                setTimeout(() => {
                    statusText.style.display = 'none';
                }, 3000);
            }
        } catch (error) {
            console.log("Сервер еще спит, ждем...");
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        if (seconds > 120) {
            clearInterval(timer);
            statusText.innerText = '🔴 Не удалось разбудить сервер за 2 минуты.';
            break;
        }
    }
}

function liveCalculate() {
    const a = parseFloat(document.getElementById('valA').value) || 0;
    const b = parseFloat(document.getElementById('valB').value) || 0;
    const c = parseFloat(document.getElementById('valC').value) || 0;

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

inputsAnalyzer.forEach(input => {
    input.addEventListener('input', liveCalculate);
});

async function analyzeProduct() {
    const urlInput = document.getElementById('uzumUrl').value;
    if (!urlInput.includes('uzum.uz')) {
        alert('Пожалуйста, введите корректную ссылку на Uzum!');
        return;
    }

    document.getElementById('loader').style.display = 'block';
    document.getElementById('infoBox').style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/api/get-category`, {
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

// Запускаем расчеты и сервер при загрузке
liveCalculate();
autoWakeServer();


// ============================================================================
// 3. ЛОГИКА ГЕНЕРАТОРА КАРТОЧЕК С ОТЗЫВАМИ
// ============================================================================
function generateRandomString(length) {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function startBulkGeneration() {
    await document.fonts.ready;

    const countInput = document.getElementById("input-count").value;
    const prefixInput = document.getElementById("input-prefix").value.trim();
    const sumInput = document.getElementById("input-sum").value.trim();
    const botInput = document.getElementById("input-bot").value.trim();

    const count = parseInt(countInput) || 10;
    const btn = document.getElementById("btn-generate");
    const statusContainer = document.getElementById("status-container");
    const statusText = document.getElementById("status-text");
    const progressBar = document.getElementById("progress-bar");

    const sumUz = sumInput;
    const sumRu = sumInput.replace(/SO'M/gi, "СУМ").replace(/so'm/gi, "сум");

    document.getElementById("render-sum-uz").innerText = sumUz;
    document.getElementById("render-sum-ru").innerText = sumRu;
    document.getElementById("render-bot-uz").innerText = botInput;
    document.getElementById("render-bot-ru").innerText = botInput;

    const tgUrl = "https://t.me/" + botInput.replace("@", "");

    new QRious({
        element: document.getElementById("qr-canvas-uz"),
        value: tgUrl,
        size: 130,
        level: "H",
    });
    new QRious({
        element: document.getElementById("qr-canvas-ru"),
        value: tgUrl,
        size: 130,
        level: "H",
    });

    const exportUz = document.getElementById("export-template-uz");
    const exportRu = document.getElementById("export-template-ru");

    btn.disabled = true;
    btn.classList.add("opacity-50", "cursor-not-allowed");
    statusContainer.classList.remove("hidden");

    const zip = new JSZip();
    const folderUz = zip.folder("1_FRONT_Uzbek");
    const folderRu = zip.folder("2_BACK_Russian");
    const codesList = [];

    try {
        for (let i = 1; i <= count; i++) {
            const randomPart = generateRandomString(5);
            const uniqueCode = prefixInput ? `${prefixInput}-${randomPart}` : randomPart;
            
            codesList.push(uniqueCode);

            document.getElementById("render-code-uz").innerText = uniqueCode;
            document.getElementById("render-code-ru").innerText = uniqueCode;

            statusText.innerText = `Создаем дизайн ${i} из ${count}...`;
            progressBar.style.width = `${(i / count) * 100}%`;

            await delay(300);

            const canvasUz = await html2canvas(exportUz, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
                logging: false,
            });
            const imgDataUz = canvasUz.toDataURL("image/jpeg", 0.92);
            folderUz.file(`${i}_front_${uniqueCode}.jpg`, imgDataUz.split(",")[1], { base64: true });

            const canvasRu = await html2canvas(exportRu, {
                scale: 1,
                backgroundColor: null,
                logging: false,
            });
            const imgDataRu = canvasRu.toDataURL("image/jpeg", 0.92);
            folderRu.file(`${i}_back_${uniqueCode}.jpg`, imgDataRu.split(",")[1], { base64: true });
        }

        statusText.innerText = `Добавляем файл со списком кодов...`;
        
        const codesContent = codesList.join("\n");
        zip.file("secret_codes.txt", codesContent);

        statusText.innerText = `Упаковываем в ZIP архив...`;

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "Uzum_Promo_Cards_With_Codes.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        statusText.innerText = `✅ Успешно! Создано ${count} карточек и файл со списком кодов.`;
        statusText.classList.remove("text-pink-700");
        statusText.classList.add("text-green-700");
    } catch (error) {
        console.error("Ошибка:", error);
        statusText.innerText = `❌ Ошибка генерации.`;
        statusText.classList.remove("text-pink-700");
        statusText.classList.add("text-red-700");
    } finally {
        btn.disabled = false;
        btn.classList.remove("opacity-50", "cursor-not-allowed");

        setTimeout(() => {
            statusContainer.classList.add("hidden");
            statusText.classList.remove("text-green-700", "text-red-700");
            statusText.classList.add("text-pink-700");
            progressBar.style.width = "0%";
        }, 5000);
    }
}