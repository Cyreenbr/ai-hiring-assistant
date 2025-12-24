import os
from app.agents.cv_rag_agent import CVRAGAgent
from app.agents.job_analyzer import JobAnalyzerAgent
from app.agents.matching_agent import MatchingAgent


class OrchestratorAgent:
    """
    Agent responsable d'enchaîner :
    - Analyse du CV (RAG)
    - Analyse de l'offre
    - Matching des deux résultats
    """

    def __init__(self):
        self.cv_agent = CVRAGAgent()
        self.job_agent = JobAnalyzerAgent()
        self.match_agent = MatchingAgent()

    async def analyze_all(self, cv_path: str, job_text: str):
        """
        Analyse complète :
        1. CV
        2. Offre
        3. Matching
        """

        # 1️⃣ Analyse CV via RAG
        cv_analysis = await self.cv_agent.analyze_cv(cv_path)

        # 2️⃣ Analyse Offre
        job_analysis = await self.job_agent.analyze_job(job_text)

        # 3️⃣ Matching
        matching = await self.match_agent.match(cv_analysis, job_analysis)

        # 4️⃣ Retour global
        return {
            "cv_analysis": cv_analysis,
            "job_analysis": job_analysis,
            "matching": matching
        }

    # Compatibilité avec anciens appels (si tu avais run())
    async def run(self, cv_path: str, job_text: str):
        return await self.analyze_all(cv_path, job_text)
