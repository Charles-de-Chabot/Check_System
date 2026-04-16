//VARIABLES
let isCommandListVisible = true;
let commandHistory = JSON.parse(localStorage.getItem("cmdHistory") || "[]");
let historyIndex = -1;

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
    document.getElementById("commandForm").submit();
}
function saveToHistory(cmd){
    if (cmd && !commandHistory.includes(cmd)){
        commandHistory.unshift(cmd); // unshift: ajoute un élément a la première place du tableau
        if (commandHistory.length > 50){
            commandHistory.pop() // pop: supprime le dernier élément du tableau
        }
    }
    localStorage.setItem("cmdHistory", JSON.stringify(commandHistory))
}

function clearHistory(){
    if (confirm("Effacer tout l'historique de commande?")){
        commandHistory = [];
        localStorage.removeItem("cmdHistory");
        document.getElementById("commandHistory").innerHTML = ""
        alert("✔️ Historique effacé")
    }
}

function exportResults(){
    downloadResult();
}

function copyLastResult(){
    const result = document.getElementById("resultContent");
    if (result){
        copyResult();
    }else{
        showNotification("⚠️​ Aucun réultat à copier")
    }
}

function copyResult(){
    const text = document.getElementById("resultContent").textContent
    navigator.clipboard.writeText(text).then(() => {
        showNotification("✔️ Résultat copié dans le presse-papier")
    })
}

function downloadResult(){
    const text = document.getElementById("resultContent").textContent;
    const blob = new Blob([text], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `check_system_${new Date().getTime()}.txt`;
    link.click();
    showNotification("💾 Résultat téléchargé")
}

function showNotification(message){
    const notif = document.createElement("div");
    notif.className = "notification";
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add("show"), 10);
    setTimeout(() => {
        notif.classList.remove("show");
        setTimeout(() => notif.remove(), 300);
    }, 2000)
}

function fillPingCommand(){
    const host = prompt("🌐 Entrz l'hôte à pinguer:\n\n 8.8.8.8 (DNS Google)\n 1.1.1.1 (DNS Cloudflare)")
    if(host){
        executeCommand("ping " + host)
    }
}

function fillKillCommand (){
    const pid = prompt("⚠️ Entrez le PID du processus à arrêter\n\n (Utilisez 'processus' pour voir la liste)", "");
    if(pid && !isNaN(pid)){
        executeCommand("kill " + pid);
    }
}
