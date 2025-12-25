# AI Hiring Assistant — Guide d'utilisation

Ce guide explique comment utiliser la fonctionnalité d'entretiens vidéo, les flows de test et les bonnes pratiques.

## Pré-requis
- Node.js + npm
- Python 3.10+ (venv)
- ffmpeg installé et disponible dans le `PATH` (pour conversion audio)

## Démarrage rapide (mode local avec stubs)

1. Lancer les stubs (trois terminaux séparés):

```powershell
cd backend
uvicorn backend.stubs.stt_stub:app --port 9000
uvicorn backend.stubs.analysis_stub:app --port 9001
uvicorn backend.stubs.questions_stub:app --port 9002
```

2. Copier l'exemple d'env et lancer l'API principale:

```powershell
copy backend\.env.example backend\.env
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

3. Lancer le frontend:

```powershell
cd frontend
npm install
npm run dev
```

4. Ouvrir l'application dans le navigateur (par défaut `http://localhost:3000`) et aller à l'onglet **Entretiens**.

## Flux d'utilisation

1. `Démarrer l'enregistrement` — autorisez la caméra et le micro.
2. Répondez aux questions (ou parlez librement) puis `Arrêter`.
3. `Envoyer la vidéo` — la vidéo est sauvegardée côté serveur et un `download_url` est renvoyé.
4. `Générer questions` — crée 3–5 questions personnalisées (ou via `QUESTIONS_URL`).
5. `Demander transcription` ou `Analyser réponse` — le backend appelle `STT_URL` puis `ANALYSIS_URL` pour obtenir transcription/score.
6. Si l'analyse propose des follow-ups, elles s'ajoutent aux questions.
7. `Générer rapport` — un rapport JSON est créé et téléchargeable via le lien renvoyé.

## Endpoints utiles
- `POST /api/interviews/upload` — upload multipart `file` → { filename, download_url }
- `POST /api/interviews/transcribe/{filename}` — force transcription
- `POST /api/interviews/generate_questions` — génère questions
- `POST /api/interviews/analyze/{filename}` — transcrit + analyse
- `POST /api/interviews/report/{filename}` — génère rapport JSON

## Configuration des services distants
- `STT_URL` : endpoint qui accepte multipart `file` et renvoie `{ "text": "..." }`.
- `ANALYSIS_URL` : endpoint JSON `{ "transcript": "..." }` → renvoie scores/follow_ups/recommendation.
- `QUESTIONS_URL` : endpoint JSON `{ "candidate_name":"","job_description":"" }` → `{ "questions": [...] }`.

Placez ces URLs dans `backend/.env` (ou configuration d'environnement) ou utilisez les stubs locaux.

## Dépannage
- Si la conversion audio échoue, vérifiez `ffmpeg -version`.
- Si vous avez une erreur CORS, vérifiez `backend/app/main.py` pour `allow_origins`.
- Si l'upload retourne une erreur 413, vérifiez la taille du fichier et les limites du serveur.

## Améliorations possibles
- Génération de PDF pour les rapports
- Analyse vidéo (pose/émotion)
- Enrichir UI (PDF viewer, player intégré)

---
Pour toute question ou si vous souhaitez que je génère le PDF automatiquement, dites-le et je l'ajoute.
