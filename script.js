// 1. Tablarni almashtirish funksiyasi
function switchTab(tab) {
    // Barcha bo'limlarni yashirish
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    
    // Tanlangan bo'limni ko'rsatish
    document.getElementById(`section-${tab}`).classList.remove('hidden');
    
    // Tugmalar dizaynini yangilash
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

// 2. Analizator va Kalkulyator logikasi
const API_BASE_URL = "https://data-bekend.onrender.com"; 

async function autoWakeServer() {
    // Serverni uyg'otish kodi
}

function liveCalculate() {
    // Hisoblash kodi
}

// 3. Generator logikasi
async function startBulkGeneration() {
    // Kartochka yaratish kodi
}

// Hodisalarni tinglash
document.querySelectorAll('input').forEach(inp => inp.addEventListener('input', liveCalculate));
autoWakeServer();