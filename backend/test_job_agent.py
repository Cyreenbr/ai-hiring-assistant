import asyncio
from app.agents.job_analyzer import JobAnalyzerAgent

async def main():
    agent = JobAnalyzerAgent()

    # Exemple d'offre d'emploi
    job_description = """
Sujet 1 : Dashboard Workflow & Supervision des processus (6 mois)
Fonctionnalités clés :

Visualisation avancée des instances BPMN : États, transitions, logs et variables de contexte.

Indicateurs clés (KPIs) : Taux d’erreur, durée moyenne d’exécution, respect des SLA, taux de succès.

Gestion des erreurs : Redéclenchement sélectif, correction manuelle, assignation automatique à un opérateur.

Interface d’intervention : Exécution directe des tâches utilisateurs Camunda (user tasks) via UI.

Vue timeline & historique graphique : Traçabilité complète des jetons BPMN, logs d’exécution et payloads associés.

🎯 Concevoir un tableau de bord intelligent et interactif permettant de piloter en temps réel les workflows Camunda, d’assurer une gestion proactive des erreurs et de faciliter les interventions manuelles.

Innovations SaaS & Valeur ajoutée :

Workflow Insights : Moteur d’analyse prédictive des causes d’erreurs récurrentes basé sur l’historique.

Dashboards dynamiques et personnalisables selon le rôle utilisateur.

Monitoring multi-tenant : Chaque client voit uniquement ses processus avec métriques dédiées.

Intégration notification intelligente : Slack, Teams, mail et alerting automatisé.

Mode simulation : Relecture et validation d’un workflow avant déploiement réel.

🎯 Un outil d’observabilité “temps réel” qui transforme la gestion des workflows en un cockpit décisionnel automatisé.
"""

    print("🔍 Analyse de l'offre d'emploi...\n")

    result = await agent.analyze_job(job_description)

    print("🟩 Résultat JSON :")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
