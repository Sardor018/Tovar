// 1. Tablarni almashtirish
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`section-${tab}`).classList.remove('hidden');
    
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

// 2. Kalkulyator mantiqi
function liveCalculate() {
    const a = parseFloat(document.getElementById('valA').value) || 0;
    const b = parseFloat(document.getElementById('valB').value) || 0;
    const c = parseFloat(document.getElementById('valC').value) || 0;

    let result = (a * (b / 100) + 5000 + b) / (1 - c / 100);
    let benefit = (a * (b / 100) + 5000);
    
    document.getElementById('output').innerText = Math.round(result).toLocaleString('ru-RU') + " сум";
    document.getElementById('foyda').innerText = Math.round(benefit).toLocaleString('ru-RU') + " сум";
}

// 3. Generator mantiqi
async function startBulkGeneration() {
    const count = parseInt(document.getElementById('input-count').value) || 1;
    const prefix = document.getElementById('input-prefix').value.trim();
    const statusText = document.getElementById('status-text');
    const statusContainer = document.getElementById('status-container');
    const progressBar = document.getElementById('progress-bar');
    
    statusContainer.classList.remove('hidden');
    const zip = new JSZip();
    const template = document.getElementById('export-template-uz');
    
    for (let i = 1; i <= count; i++) {
        const code = prefix + "-" + Math.random().toString(36).substring(2, 7).toUpperCase();
        statusText.innerText = `Tayyorlanmoqda: ${i}/${count}`;
        progressBar.style.width = `${(i / count) * 100}%`;
        
        const canvas = await html2canvas(template, { scale: 1 });
        const imgData = canvas.toDataURL("image/jpeg", 0.9).split(',')[1];
        zip.file(`${i}_card_${code}.jpg`, imgData, { base64: true });
    }
    
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "NeuroTech_Cards.zip";
    link.click();
    statusText.innerText = "Tayyor! ✅";
}

document.querySelectorAll('input').forEach(inp => inp.addEventListener('input', liveCalculate));