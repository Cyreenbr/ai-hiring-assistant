import requests
import json

# Test de connexion
response = requests.get("http://localhost:8000/health")
print("Health check:", response.json())

# Test d'analyse d'offre
job_data = {
    "description": """
    DEVELOPPEUR FULL STACK - CDI - PARIS
    
    Nous recherchons un développeur Full Stack passionné pour rejoindre notre équipe.
    
    Compétences requises :
    - React.js et TypeScript
    - Node.js et Express
    - PostgreSQL
    - Docker et Kubernetes
    - Git
    
    Expérience : 3-5 ans
    Formation : Bac+5 en informatique
    
    Soft skills : Travail en équipe, communication, autonomie
    
    Avantages : Télétravail 3j/semaine, tickets restaurant, mutuelle
    """
}

response = requests.post(
    "http://localhost:8000/api/jobs/analyze",
    json=job_data
)

print("\nStatut:", response.status_code)
print("\nAnalyse de l'offre:")
print(json.dumps(response.json(), indent=2, ensure_ascii=False))