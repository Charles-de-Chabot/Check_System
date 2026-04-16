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
    } else {
        commandsView.style.display = "block";
        LiveView.style.display = "none";
        btnCommands.classList.add("active");
        btnLive.classList.remove("active");
    }
}