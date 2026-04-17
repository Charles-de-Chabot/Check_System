//VARIABLES
let isCommandListVisible = true;
let commandHistory = JSON.parse(localStorage.getItem("cmdHistory") || "[]");
let historyIndex = -1;

let cpuChart;
let ramChart;
let diskChart;
let networkChart;
let autoRefresh = false;
let refreshInterval = 2000;
let refreshTimer = null;
let lastNetBytes = {sent: 0, recv: 0, time: Date.now()};

document.addEventListener("DOMContentLoaded", function(){
    loadCommandHistory();
    updateSystemTime();
    setInterval(updateSystemTime, 1000)
    loadQuickStats();
    setInterval(loadQuickStats, 5000)
    initAutoComplete();
    initCharts();
})


/**
 * Récupère les statistiques rapides (CPU, RAM, Disque) via l'API
 * et met à jour les éléments correspondants dans le DOM.
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
 * Bascule l'affichage entre la vue "Commandes" et la vue "Monitoring Live".
 * @param {string} view - Le nom de la vue à afficher ('live' ou autre pour les commandes).
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
 * Filtre les commandes affichées par catégorie.
 * @param {string} category - La catégorie de commandes à afficher (ou 'all' pour tout afficher).
 * @param {HTMLElement} sourceButton - Le bouton cliqué pour lui appliquer le style actif.
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
 * Affiche ou masque la grille contenant la liste des commandes rapides.
 */
function toggleCommandList(){
    const grid = document.getElementById("commandsGrid");
    const icon = document.getElementById("toggleIcon");

    isCommandListVisible = !isCommandListVisible;

    grid.style.display = isCommandListVisible ? "grid" : "none";
    icon.textContent = isCommandListVisible ? "🔻" : "🔺"
}

/**
 * Exécute une commande en remplissant le champ de saisie et en soumettant le formulaire.
 * @param {string} cmd - La commande à exécuter.
 */
function executeCommand(cmd){
    saveToHistory(cmd)
    document.getElementById("cmdInput").value = cmd
    document.getElementById("commandForm").submit();
}

/**
 * Sauvegarde une commande dans l'historique du navigateur (localStorage).
 * Limite l'historique aux 50 dernières commandes.
 * @param {string} cmd - La commande à sauvegarder.
 */
function saveToHistory(cmd){
    if (cmd && !commandHistory.includes(cmd)){
        commandHistory.unshift(cmd); // unshift: ajoute un élément a la première place du tableau
        if (commandHistory.length > 50){
            commandHistory.pop() // pop: supprime le dernier élément du tableau
        }
    }
    localStorage.setItem("cmdHistory", JSON.stringify(commandHistory))
}

/**
 * Efface l'historique des commandes après confirmation de l'utilisateur.
 */
function clearHistory(){
    if (confirm("Effacer tout l'historique de commande?")){
        commandHistory = [];
        localStorage.removeItem("cmdHistory");
        document.getElementById("commandHistory").innerHTML = ""
        alert("✔️ Historique effacé")
    }
}

/**
 * Exporte les résultats de la dernière commande (alias de downloadResult).
 */
function exportResults(){
    downloadResult();
}

/**
 * Vérifie si un résultat est présent avant de le copier dans le presse-papier.
 */
function copyLastResult(){
    const result = document.getElementById("resultContent");
    if (result){
        copyResult();
    }else{
        showNotification("⚠️​ Aucun réultat à copier")
    }
}

/**
 * Copie le texte du résultat actuel dans le presse-papier du système.
 */
function copyResult(){
    const text = document.getElementById("resultContent").textContent
    navigator.clipboard.writeText(text).then(() => {
        showNotification("✔️ Résultat copié dans le presse-papier")
    })
}

/**
 * Télécharge le contenu du résultat sous forme de fichier texte (.txt).
 */
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

/**
 * Affiche une notification temporaire à l'écran.
 * @param {string} message - Le message à afficher dans la notification.
 */
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

/**
 * Demande à l'utilisateur de saisir un hôte et prépare la commande "ping".
 */
function fillPingCommand(){
    const host = prompt("🌐 Entrz l'hôte à pinguer:\n\n 8.8.8.8 (DNS Google)\n 1.1.1.1 (DNS Cloudflare)")
    if(host){
        executeCommand("ping " + host)
    }
}

/**
 * Demande à l'utilisateur de saisir un PID et prépare la commande "kill".
 */
function fillKillCommand (){
    const pid = prompt("⚠️ Entrez le PID du processus à arrêter\n\n (Utilisez 'processus' pour voir la liste)", "");
    if(pid && !isNaN(pid)){
        executeCommand("kill " + pid);
    }
}

/**
 * Charge l'historique des commandes sauvegardé dans le datalist de l'input pour autocomplétion.
 */
function loadCommandHistory(){
    const datalist = document.getElementById("commandHistory");
    commandHistory.forEach((cmd) => {
        const option = document.createElement("option");
        option.value = cmd;
        datalist.append(option)
    })
}

/**
 * Met à jour l'heure système affichée dans le footer de l'application.
 */
function updateSystemTime(){
    const now = new Date();
    document.getElementById("systemTime").textContent = now.toLocaleString("fr-FR");
}

/**
 * Initialise la saisie semi-automatique pour le champ de commande,
 * en affichant des suggestions en fonction du début de la saisie utilisateur.
 */
function initAutoComplete(){
    const input = document.getElementById("cmdInput"); 
    const hints = document.getElementById("hints");
    const commands = [
        "cpu",
        "ram",
        "espace",
        "dashboard",
        "ping",
        "network",
        "ports",
        "processus",
        "sevices",
        "kill",
        "users",
        "security",
        "logs",
        "sysinfo",
        "uptime",
        "temp",
        "battery",
        "health",
        "help"
    ];
    input.addEventListener("input", function(){
        const value = this.value.toLowerCase();
        if (value.length > 0) {
            const matches = commands.filter((cmd) => cmd.startsWith(value));
            if (matches.length > 0 && matches[0] !== value){
                hints.textContent = "💡 " + matches.slice(0,3).join(", ")
                hints.style.display = "block";
            }else{
                hints.style.display = "none";
            }
        } else {
            hints.style.display = "none";
        }
    })
}

/**
 * Alterne l'état de l'actualisation automatique pour la vue de monitoring en temps réel.
 */
function toggleAutoResfresh(){
    autoRefresh = !autoRefresh;
    const btn = document.getElementById("autoRefreshBtn");

    if (autoRefresh) {
        btn.textContent = "⏸️"
        btn.title = "Pause"
        startAutoRefresh();
    } else {
        btn.textContent = "▶️"
        btn.title = "Play"
        stopAutoRefresh();
    }
}

/**
 * Démarre le rafraîchissement automatique des données de monitoring.
 */
function startAutoRefresh(){
    if (!autoRefresh){
        autoRefresh = true;
        document.getElementById("autoRefreshBtn").textContent = "⏸️";
    }
    fetchLiveData();
    if (refreshTimer) {
        clearInterval(refreshTimer)
    }
    refreshTimer = setInterval(fetchLiveData, refreshInterval)
}

/**
 * Stoppe le rafraîchissement automatique des données de monitoring.
 */
function stopAutoRefresh(){
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

/**
 * Récupère les données de monitoring en temps réel depuis l'API et met à jour les graphiques.
 */
async function fetchLiveData(){
    try {
        const response = await fetch("/api/live-monitoring");
        const data = await response.json();
        
        updateChart(cpuChart, data.cpu);
        updateChart(ramChart, data.ram);
        updateChart(diskChart, data.disk);
        updateNetworkChart(data.network);

        document.getElementById("cpuLiveValue").textContent = data.cpu + "%";
        document.getElementById("ramLiveValue").textContent = data.ram + "%";
        document.getElementById("diskLiveValue").textContent = data.disk + "%";

        const now = Date.now();
        const timeDiff = (now - lastNetBytes.time) /1000;
        const uploadSpeed = Math.round((data.network.sent - lastNetBytes.sent) / timeDiff - 1024);
        const downloadSpeed = Math.round((data.network.recv - lastNetBytes.recv) / timeDiff - 1024);

        document.getElementById("networkLiveValue").textContent = `⭡${uploadSpeed} ⭣${downloadSpeed} KB/s`;

        lastNetBytes = {
            sent: data.network.sent,
            recv: data.network.recv,
            time: now
        }

        updateDetailStats(data);


    } catch (error) {
        console.log("Erreur fetch monitoring: ", error);
        
    }
}

/**
 * Met à jour un graphique (CPU, RAM, Disque) avec une nouvelle valeur, tout en limitant l'historique.
 * @param {Chart} chart - L'instance du graphique Chart.js à mettre à jour.
 * @param {number} value - La nouvelle valeur à ajouter au graphique.
 */
function updateChart(chart, value){
    const now = new Date().toLocaleString("fr-FR")

    chart.data.labels.push(now);
    chart.data.datasets[0].data.push(value);

    if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.update("none");
}

/**
 * Met à jour le graphique réseau avec les nouvelles vitesses d'upload et download.
 * @param {object} networkData - Les données et configuration du graphique réseau.
 */
function updateNetworkChart(networkData){
    const now = new Date().toLocaleString("fr-FR")
    const timeDiff = (Date.now() - lastNetBytes.time) / 1000;
    
    const uploadSpeed = Math.round((networkData.sent - lastNetBytes.sent) / timeDiff - 1024);
    const downloadSpeed = Math.round((networkData.recv - lastNetBytes.recv) / timeDiff - 1024);

    networkChart.data.labels.push(now);
    networkChart.data.datasets[0].data.push(uploadSpeed);
    networkChart.data.datasets[1].data.push(downloadSpeed);

    if (networkChart.data.labels.length > 20) {
        networkChart.data.labels.shift();
        networkChart.data.datasets[0].data.shift();
        networkChart.data.datasets[1].data.shift();
    }

    networkChart.update("none");
    
}

/**
 * Met à jour les statistiques détaillées (Actuellement non implémentée).
 */
function updateDetailStats(){
    // TODO : MAJ détail de stats
    
}

/**
 * Initialise les instances Chart.js pour les graphiques de monitoring (CPU, RAM, Disque, Réseau).
 */
function initCharts() {
  const chartConfig = {
    type: "line",
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 750,
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "#94a3b8",
            callback: function (value) {
              return value + "%";
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "#94a3b8",
            maxTicksLimit: 10,
          },
        },
      },
    },
  };

  cpuChart = new Chart(document.getElementById("cpuChart"), {
    ...chartConfig,
    data: {
      labels: [],
      datasets: [
        {
          label: "CPU %",
          data: [],
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
  });

  ramChart = new Chart(document.getElementById("ramChart"), {
    ...chartConfig,
    data: {
      labels: [],
      datasets: [
        {
          label: "RAM %",
          data: [],
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
  });

  diskChart = new Chart(document.getElementById("diskChart"), {
    ...chartConfig,
    data: {
      labels: [],
      datasets: [
        {
          label: "Disk %",
          data: [],
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
  });

  networkChart = new Chart(document.getElementById("networkChart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Upload",
          data: [],
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Download",
          data: [],
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 750,
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#94a3b8",
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "#94a3b8",
            callback: function (value) {
              return value + " KB/s";
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "#94a3b8",
            maxTicksLimit: 10,
          },
        },
      },
    },
  });
}
