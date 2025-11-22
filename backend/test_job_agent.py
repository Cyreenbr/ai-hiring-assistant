import asyncio
from app.agents.job_analyzer import JobAnalyzerAgent

async def main():
    agent = JobAnalyzerAgent()

    # Exemple d'offre d'emploi
    job_description = """
Nous recherchons un Développeur Python pour rejoindre notre équipe.
Compétences requises : Python, FastAPI, PostgreSQL, Git, Docker.
Soft skills : autonomie, communication, esprit d'équipe.
Expérience : 2 ans minimum.
Missions : développer des API, maintenir des scripts, collaborer avec l’équipe data.
Formation : Bac+3 ou Bac+5 en informatique.
"""

    print("🔍 Analyse de l'offre d'emploi...\n")

    result = await agent.analyze_job(job_description)

    print("🟩 Résultat JSON :")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
