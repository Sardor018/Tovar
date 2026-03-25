const API_BASE_URL = "https://data-bekend.onrender.com"; //

// --- Переключатель вкладок ---
// Функция переключения между Анализатором и Генератором
function switchTab(tab) {
    // Скрываем все разделы с контентом
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    
    // Показываем только выбранный раздел
    document.getElementById(`section-${tab}`).classList.remove('hidden');
    
    // Обновляем визуальный стиль кнопок переключателя
    const btnAn = document.getElementById('tab-btn-analyzer');
    const btnGen = document.getElementById('tab-btn-generator');
    
    if(tab === 'analyzer') {
        btnAn.className = "px-6 py-2 rounded-full font-bold shadow-md bg-purple-600 text-white transition";
        btnGen.className = "px-6 py-2 rounded-full font-bold shadow-md bg-white text-gray-700 transition";
    } else {
        btnGen.className = "px-6 py-2 rounded-full font-bold shadow-md bg-pink-500 text-white transition";
        btnAn.className = "px-6 py-2 rounded-full font-bold shadow-md bg-white text-gray-700 transition";
    }
}

// --- Модуль: Анализатор ---
async function autoWakeServer() {
    const statusText = document.getElementById('serverStatus');
    const analyzeBtn = document.getElementById('analyzeBtn');
    try {
        const response = await fetch(`${API_BASE_URL}/api/ping`);
        if (response.ok) {
            statusText.innerText = `🟢 Сервер готов!`;
            statusText.style.color = "#28a745";
            analyzeBtn.classList.remove('bg-gray-400');
            analyzeBtn.classList.add('bg-purple-600');
            setTimeout(() => statusText.style.display = 'none', 3000);
        }
    } catch (e) { setTimeout(autoWakeServer, 3000); }
}

function liveCalculate() {
    const a = parseFloat(document.getElementById('valA').value) || 0;
    const b = parseFloat(document.getElementById('valB').value) || 0;
    const c = parseFloat(document.getElementById('valC').value) || 0;
    
    let d = 1 - c / 100;
    const result = (a * (b / 100) + 5000 + b) / d;
    const benefit = (a * (b / 100) + 5000);
    
    document.getElementById('output').innerText = Math.round(result).toLocaleString('ru-RU') + " сум";
    document.getElementById('foyda').innerText = Math.round(benefit).toLocaleString('ru-RU') + " сум";
}

// --- Модуль: Генератор ---
async function startBulkGeneration() {
    await document.fonts.ready;
    const count = parseInt(document.getElementById('input-count').value) || 1;
    const prefix = document.getElementById('input-prefix').value.trim();
    const bot = document.getElementById('input-bot').value.trim();
    const sumUz = document.getElementById('input-sum').value;
    
    const statusCont = document.getElementById('status-container');
    statusCont.classList.remove('hidden');
    
    const zip = new JSZip();
    const folderUz = zip.folder("Uzbek_Cards");
    
    for(let i=1; i<=count; i++) {
        const code = prefix + "-" + Math.random().toString(36).substring(2,7).toUpperCase();
        document.getElementById('render-code-uz').innerText = code;
        document.getElementById('render-sum-uz').innerText = sumUz;
        
        // Генерация QR
        new QRious({
            element: document.getElementById('qr-canvas-uz'),
            value: `https://t.me/${bot.replace('@','')}`,
            size: 130
        });

        const canvas = await html2canvas(document.getElementById('export-template-uz'), { scale: 2 });
        folderUz.file(`${i}_card_${code}.jpg`, canvas.toDataURL("image/jpeg", 0.9).split(',')[1], {base64: true});
        
        document.getElementById('progress-bar').style.width = (i/count*100) + "%";
    }
    
    const blob = await zip.generateAsync({type:"blob"});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "Uzum_Cards.zip";
    link.click();
}

// Инициализация
document.querySelectorAll('input').forEach(inp => inp.addEventListener('input', liveCalculate));
autoWakeServer();