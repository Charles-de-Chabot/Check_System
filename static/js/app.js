//VARIABLES
let isCommandListVisible = true;

document.addEventListener("DOMContentLoaded", function(){
    loadQuickStats();
    setInterval(loadQuickStats, 5000)
})

/**
 * methode qui affiche les stats rapide
 * @returns JSON
 */
async function loadQuickStats(){
    try {
        const response = await fetch("/api/quick-stats");
        const data = await response.json();
        document.getElementById("cpuQuick").textContent = data.cpu + "%"
        document.getElementById("ramQuick").textContent = data.ram + "%"
        document.getElementById("diskQuick").textContent = data.disk + "%"
    } catch (error) {
        console.log(error);
    }
}

/**
 * methode qui permet de switch entre commande et monitoring
 */
function switchView(view){
    // On récupère les éléments du DOM
    const commandsView = document.getElementById("commandsView");
    const LiveView = document.getElementById("liveView");
    const btnCommands = document.getElementById("btnCommands")
    const btnLive = document.getElementById("btnLive")

    if (view === "live") {
        commandsView.style.display = "none";
        LiveView.style.display = "block";
        btnCommands.classList.remove("active");
        btnLive.classList.add("active");
        // TODO : Start auto-refresh
    } else {
        commandsView.style.display = "block";
        LiveView.style.display = "none";
        btnCommands.classList.add("active");
        btnLive.classList.remove("active");
        // TODO : Strop auto-refresh
    }
}

/**
 * methode qui permet de filtrer les commandes 
 * 
 */
function filterCommands(category, sourceButton){
    const buttons = document.querySelectorAll(".filter-btn");
    const items = document.querySelectorAll(".command-item");

    buttons.forEach((btn) => btn.classList.remove("active"));
    if(sourceButton){
        sourceButton.classList.add("active");
    }

    items.forEach((item) => {
        if(category === "all" || item.dataset.category === category){
            item.style.display = "flex";
        }else{
            item.style.display = "none";
        }
    })
}

/**
 * methode qui permet de masquer toutes les cartes de commandes 
 */
function toggleCommandList(){
    const grid = document.getElementById("commandsGrid");
    const icon = document.getElementById("toggleIcon");

    isCommandListVisible = !isCommandListVisible;

    grid.style.display = isCommandListVisible ? "grid" : "none";
    icon.textContent = isCommandListVisible ? "🔻" : "🔺"
}


function executeCommand(cmd){
    saveToHistory(cmd)
    document.getElementById("cmdInput").value = cmd
    document.getElementById("commandForm").onsubmit();
}
function saveToHistory(cmd){

}

function clearHistory(){

}

function exportResults(){

}

function copyLastResult(){

}
