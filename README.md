# 🤖 Autonomous Coding Team

Ein autonomes 24/7 Coding-Team das via Telegram Aufgaben empfängt, Code schreibt und das Ergebnis automatisch auf GitHub pusht. Im Idle-Modus arbeitet das Team selbstständig an eigenen Projekten.

**Stack:** Python · CrewAI · NVIDIA API · Telegram Bot · Docker · GitHub

---

## Wie es funktioniert

```
Du (Telegram)
    │
    ▼
Orchestrator  →  plant die Umsetzung
    │
    ▼
Coder         →  implementiert den Code
    │
    ▼
Reviewer      →  prüft auf Bugs & Qualität
    │
    ▼
Tester/Docs   →  schreibt Tests & README
    │
    ▼
GitHub (main) →  projects/user/YYYYMMDD-HHMM-slug/
```

Im **Idle-Modus** ergänzt ein Researcher-Agent den Flow und wählt selbstständig Projekte aus. Output landet in `projects/idle/`.

---

## Agenten & Modelle

| Agent | Modell | Infra |
|-------|--------|-------|
| Orchestrator | nvidia/nemotron-3-super-120b-a12b | NVIDIA direkt ✅ |
| Coder | minimaxai/minimax-m2.5 | Partner-Modell |
| Reviewer | meta/llama-3.3-70b-instruct | NVIDIA direkt ✅ |
| Tester/Docs | meta/llama-3.3-70b-instruct | NVIDIA direkt ✅ |

**Coder Fallback** (automatisch bei 502/503/504/Timeout):
1. `minimaxai/minimax-m2.5` → 2. `qwen/qwen2.5-coder-32b-instruct` → 3. `meta/llama-3.3-70b-instruct`

---

## Setup

### 1. VPS vorbereiten

```bash
ssh root@178.104.178.113
bash /opt/projects/coding-team/setup-vps-v2.sh
```

### 2. `.env` befüllen

```bash
nano /opt/projects/coding-team/.env
```

```env
# NVIDIA API Keys (von https://build.nvidia.com → Get API Key)
NVIDIA_API_KEY_ORCHESTRATOR=nvapi-...
NVIDIA_API_KEY_CODER_1=nvapi-...
NVIDIA_API_KEY_CODER_2=nvapi-...      # Coder Fallback 2
NVIDIA_API_KEY_CODER_3=nvapi-...      # Coder Fallback 3
NVIDIA_API_KEY_REVIEWER=nvapi-...
NVIDIA_API_KEY_TESTER_DOCS=nvapi-...

# Telegram (Token via @BotFather, Chat ID via @userinfobot)
TELEGRAM_BOT_TOKEN=123456:abc...
TELEGRAM_CHAT_ID=123456789

# GitHub (Settings → Developer settings → Personal access tokens → Contents: Read & Write)
GITHUB_TOKEN=ghp_...
GITHUB_REPO=Eliah3/coding-team-output
GITHUB_MAIN_BRANCH=main

# Optional
IDLE_COOLDOWN=120    # Pause zwischen Idle-Projekten in Sekunden
```

### 3. Starten

```bash
cd /opt/projects/coding-team && docker compose up --build -d coding-team
```

---

## Telegram Befehle

| Befehl | Funktion |
|--------|----------|
| `/start` | Übersicht & aktueller Status |
| `/status` | Zeigt ob Team arbeitet oder bereit ist |
| `/autonomous on` | Idle-Modus aktivieren |
| `/autonomous off` | Idle-Modus deaktivieren |
| `/setgoal Python CLI Tools` | Thema für Idle-Projekte setzen |
| `/setgoal` | Thema zurücksetzen (freie Wahl) |
| `/history` | Letzte 10 Projekte anzeigen |
| _(beliebiger Text)_ | Startet einen neuen Task |

**Beispiel-Tasks:**
```
Erstelle eine REST API mit FastAPI für ein Todo-System mit SQLite
Schreibe ein Python CLI-Tool das CSV-Dateien analysiert und Statistiken ausgibt
Implementiere einen Binary Search Tree in C++ mit allen Standard-Operationen
```

---

## GitHub Output-Struktur

Alle Projekte landen direkt auf `main` — kein manuelles Mergen nötig.

```
projects/
├── user/                          ← von dir beauftragte Projekte
│   └── 20260426-1700-todo-api/
│       ├── main.py
│       ├── models.py
│       ├── test_main.py
│       └── README.md
└── idle/                          ← autonome Idle-Projekte
    └── 20260426-1830-csv-parser/
        ├── parser.py
        ├── test_parser.py
        └── README.md
```

---

## Docker Commands

```bash
# Status aller Container
docker ps

# Live Logs
docker logs coding-team -f

# Neustart
docker compose -f /opt/projects/coding-team/docker-compose.yml restart coding-team

# Rebuild nach Code-Änderungen
cd /opt/projects/coding-team && docker compose up --build -d coding-team

# Stoppen
docker compose -f /opt/projects/coding-team/docker-compose.yml stop coding-team
```

---

## Code auf VPS hochladen

```powershell
# Einzelne Datei
scp coding-team-v2\crew.py root@178.104.178.113:/opt/projects/coding-team/crew.py

# Alle Python-Dateien auf einmal
scp coding-team-v2\*.py root@178.104.178.113:/opt/projects/coding-team/
```

---

## Projekt-Manager

```bash
bash /opt/manage.sh           # Interaktives Menü
bash /opt/manage.sh start 1   # Projekt 1 starten
bash /opt/manage.sh stop 1    # Projekt 1 stoppen
bash /opt/manage.sh logs 1    # Live Logs
```

---

## Dateien

| Datei | Funktion |
|-------|----------|
| `crew.py` | CrewAI Agenten, Tasks, Fallback-Logik |
| `bot.py` | Telegram Bot, Idle-Loop, alle Befehle |
| `idle.py` | Researcher-Agent, Idle-Cycle |
| `state.py` | SQLite-Datenbank (Idle-Status, Projekte) |
| `github_integration.py` | Code-Parser, GitHub Push |
| `requirements.txt` | Python Dependencies |
| `Dockerfile` | Container-Build |
| `docker-compose.yml` | Container-Orchestrierung |

---

## Bekannte Probleme

| Problem | Ursache | Lösung |
|---------|---------|--------|
| `502 Bad Gateway` | Minimax/Qwen-Server nicht erreichbar | Automatischer Fallback auf nächsten Coder |
| `Timeout` | Kontext zu groß oder Partner-Infra langsam | 3x Retry + Modell-Fallback |
| `404 Not Found` | Falscher Modellname | Modellnamen auf build.nvidia.com prüfen |
| GitHub Push schlägt fehl | Token abgelaufen oder Repo falsch | `.env` prüfen |
| Telegram Markdown Fehler | Sonderzeichen im Output | `parse_mode="Markdown"` (nicht V2) |

---

## Infra

- **VPS:** 178.104.178.113 · Ubuntu 24.04 LTS
- **Portainer:** http://178.104.178.113:9000
- **GitHub Repo:** https://github.com/Eliah3/coding-team-output
- **NVIDIA API:** https://integrate.api.nvidia.com/v1
