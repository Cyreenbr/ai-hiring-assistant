from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
import os
from dotenv import load_dotenv
import json

# Charger les variables d'environnement
load_dotenv()

class JobAnalyzerAgent:
    def __init__(self):
        # Vérifier que la clé API existe
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError(
                "GOOGLE_API_KEY non trouvée. "
                "Vérifiez que le fichier .env existe dans le dossier backend "
                "et contient : GOOGLE_API_KEY=votre_clé"
            )
        
        print(f"✓ Clé API chargée : {api_key[:10]}...")
        
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.3
        )
        
        self.analysis_prompt = PromptTemplate(
            input_variables=["job_description"],
            template="""
Analysez cette offre d'emploi et extrayez les informations structurées.

Offre d'emploi :
{job_description}

Fournissez une analyse détaillée au format JSON avec :
- title: Titre du poste
- technical_skills: Liste des compétences techniques requises
- soft_skills: Liste des compétences interpersonnelles
- experience_level: Niveau d'expérience requis
- education_level: Niveau d'études requis
- responsibilities: Liste des responsabilités principales
- keywords: Liste des mots-clés importants

Répondez UNIQUEMENT avec un objet JSON valide.
"""
        )
        
        self.chain = self.analysis_prompt | self.llm | StrOutputParser()
    
    async def analyze_job(self, job_description: str):
        try:
            result = await self.chain.ainvoke({"job_description": job_description})
            
            # Nettoyer la réponse
            result = result.strip()
            if result.startswith("```json"):
                result = result[7:]
            if result.startswith("```"):
                result = result[3:]
            if result.endswith("```"):
                result = result[:-3]
            result = result.strip()
            
            try:
                parsed = json.loads(result)
                return parsed
            except json.JSONDecodeError:
                return {"raw_analysis": result}
                
        except Exception as e:
            return {"error": str(e)}