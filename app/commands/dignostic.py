import datetime
import psutil #psutil is a cross-platform library for retrieving information on running processes and system utilization (CPU, memory, disks, network, sensors) in Python.

def temperature_command() ->str:
    try:
        temps = psutil.sensors_temperatures()
        if not temps:
            return "🌡️ Temérature non disponible sur ce système"
        result = "🌡️ Température:\n\n"
        for name, entries in temps.items():
            result += f"{name}: \n"
            for entry in entries:
                result += f" {entry.label or name}: {entry.current}°C\n"
        
        return result
    except AttributeError:
        return "🌡️ Capteur de températures non disponible"
    
def users_command() ->str:
    users = psutil.users()
    if not users:
        return "​👤 Aucun utilisateur connecté"
    
    result = "​👤 Utilisateur connectés: \n\n"
    for user in users: 
        started = datetime.datetime.fromtimestamp(user.started).strftime("%d/%m/%Y %H:%M")
        result += f"User: {user.name}\n"
        result += f" Teminal: {user.terminal or 'N/A'}\n"
        result += f" Hôte: {user.host or 'N/A'}\n"
        result += f" Depuis: {started} \n\n"

    return result

def battery_command() ->str:
    battery = psutil.sensors_battery()
    if battery is None: 
        return "🔌 Pas de batterie détectée (PC de bureau?)"
    
    percent = battery.percent
    plugged = "Branché" if battery.power_plugged else "Sur batterie"
    time_left = ""
    if not battery.power_plugged and battery.secsleft != psutil.POWER_TIME_UNLIMITED:
        hours = battery.secsleft // 3600
        minutes = {battery.secsleft %3600} // 60
        time_left = f"\n Temps restant: {hours}h {minutes}min"

    bar = "█" * int(percent // 5) + "░" * (20 - int(percent // 5))
    return f"🔋 Batterie: {percent}%\n {bar}\n Etat: {plugged}{time_left}"

def security_command() ->str:

    result = "🔐 Audit de Sécurité Systeme:\n\n"

    users = psutil.users()
    result += f"👤 Utilisateur actifs: {len(users)}\n"
    for user in users:
        result += f"  ● {user.name} depuis {user.host or 'local'}\n"

    result += "\n"

    connections = psutil.net_connections(kind = "inet")
    suspicious_port = [conn for conn in connections if hasattr(conn, "laddr") and conn.laddr.port > 49152]

    result += f"🥸​ Port suspects (>49152): {len(suspicious_port)}\n"

    result += "\n"

    elevated = 0
    for proc in psutil.process_iter(["name", "username"]):
        try:
            if proc.info["username"] and "SYSTEM" in proc.info["username"].upper():
                elevated += 1
        except Exception:
            pass
    
    result += f"⚠️​ Processus privilégiés: {elevated}\n"

    result += "\n"

    result += "​📊​ Etat général:\n"
    cpu = psutil.cpu_percent(interval=1)
    if cpu > 80: 
        result += "  ⚠️ Utilisation CPU élevée détectée\n"
    else: 
        result += "  🎆 Utilisation normal du CPU"

    mem = psutil.virtual_memory()
    if mem > 85:
        result += "  ⚠️ Mémoire RAM Critique\n"
    else:
        result += "  🎆 Mémoire RAM Normal\n"
        
    return result

def logs_command() -> str:
    result = "📜 Logs Système (Dernières activités: \n\n)"
    result += "🔁​ Processus Récents:\n"
    processes = []
    for proc in psutil.process_iter(["pid", "name", "create_time"]):
        try:
            processes.append(proc.info)
        except Exception:
            pass

    processes = sorted(processes, key=lambda item: item["create_time"] or 0, reverse=True)[:10]

    for proc in processes: 
        create_time = datetime.datetime.fromtimestamp(proc["create_time"]).strftime("%H:%M:%S")
        result += f"[{create_time}] Démarré: {proc['name']} (PID: {proc['pid']})\n"
    
    result += "\n📊 Statistiques réseau:\n"
    net = psutil.net_io_counters()
    result += f"Total paquts reçu: {net.packets_recv:,}\n"
    result += f"Total paquets envoyés: {net.packets_sent:,}\n"
    result += f"Erreur de réception: {net.errin}\n"
    result += f"Erreurs d'envoi: {net.errout}\n"

    return result

