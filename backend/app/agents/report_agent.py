from typing import Dict, Any, List


class ReportAgent:
    """
    Agent chargé de transformer :
      - l'analyse du CV
      - l'analyse de l'offre
      - le résultat de matching

    en un rapport RH structuré (texte + markdown).
    """

    def _format_list(self, items: List[str]) -> str:
        if not items:
            return "- (aucun)\n"
        return "".join(f"- {it}\n" for it in items)

    async def generate_report(
        self,
        cv_analysis: Dict[str, Any],
        job_analysis: Dict[str, Any],
        matching: Dict[str, Any],
    ) -> Dict[str, Any]:
        # --- Récupération des infos principales ---
        name = cv_analysis.get("name", "Candidat(e)")
        profile_summary = cv_analysis.get("profile_summary", "")

        job_title = job_analysis.get("title", "Poste non spécifié")
        contract_type = job_analysis.get("contract_type", "inconnu")
        location = job_analysis.get("location", "non précisée")

        scores = matching.get("scores", {})
        global_score = scores.get("global", 0)
        tech_score = scores.get("technical", 0)
        soft_score = scores.get("soft_skills", 0)
        exp_score = scores.get("experience", 0)

        tech_match = matching.get("technical", {})
        matched_tech = tech_match.get("matched", [])
        missing_tech = tech_match.get("missing", [])

        soft_match = matching.get("soft_skills", {})
        matched_soft = soft_match.get("matched", [])
        missing_soft = soft_match.get("missing", [])

        llm_analysis = matching.get("llm_analysis", {})
        llm_summary = llm_analysis.get("summary", "")
        llm_reco = llm_analysis.get("recommendation", "")

        # --- Sections du rapport ---
        introduction = (
            f"Ce rapport présente une analyse détaillée de la candidature de **{name}** "
            f"pour le poste de **{job_title}** ({contract_type}), basé(e) à **{location}**.\n\n"
        )

        profil_section = "## 1. Profil du candidat\n\n"
        if profile_summary:
            profil_section += f"{profile_summary}\n\n"
        else:
            profil_section += "_Aucun résumé de profil n'a été détecté dans le CV._\n\n"

        scores_section = "## 2. Synthèse des scores de matching\n\n"
        scores_section += (
            f"- **Score global** : **{global_score}/100**\n"
            f"- **Score technique** : **{tech_score}/100**\n"
            f"- **Score soft skills** : **{soft_score}/100**\n"
            f"- **Score expérience** : **{exp_score}/100**\n\n"
        )

        tech_section = "## 3. Matching technique\n\n"
        tech_section += "**Compétences techniques correspondantes :**\n\n"
        tech_section += self._format_list(matched_tech) + "\n"
        tech_section += "**Compétences techniques manquantes ou à renforcer :**\n\n"
        tech_section += self._format_list(missing_tech) + "\n"

        soft_section = "## 4. Matching soft skills\n\n"
        if matched_soft or missing_soft:
            soft_section += "**Soft skills correspondantes :**\n\n"
            soft_section += self._format_list(matched_soft) + "\n"
            soft_section += "**Soft skills manquantes ou peu visibles dans le CV :**\n\n"
            soft_section += self._format_list(missing_soft) + "\n"
        else:
            soft_section += (
                "_Aucune soft skill explicite n'a été détectée dans le CV. "
                "Il peut être pertinent de les expliciter dans une section dédiée (Soft Skills / Qualités)._ \n\n"
            )

        llm_section = "## 5. Analyse qualitative de la candidature\n\n"
        if llm_summary:
            llm_section += f"**Résumé IA :** {llm_summary}\n\n"
        if llm_reco:
            llm_section += f"**Recommandation IA :** {llm_reco}\n\n"

        conclusion = "## 6. Conclusion RH\n\n"
        if global_score >= 70:
            conclusion += (
                "La candidature de ce profil apparaît **fortement alignée** avec les besoins du poste. "
                "Une prise de contact pour entretien est vivement recommandée.\n"
            )
        elif global_score >= 50:
            conclusion += (
                "La candidature présente un **potentiel intéressant**, avec certains axes d'amélioration "
                "techniques et/ou comportementaux. Un entretien peut permettre de clarifier ces points.\n"
            )
        else:
            conclusion += (
                "La candidature semble **partiellement adaptée** au poste. Une mise en correspondance "
                "avec des offres plus alignées pourrait être envisagée.\n"
            )

        # Corps complet du rapport en Markdown
        markdown_report = (
            f"# Rapport de matching – {name} / {job_title}\n\n"
            + introduction
            + profil_section
            + scores_section
            + tech_section
            + soft_section
            + llm_section
            + conclusion
        )

        return {
            "candidate_name": name,
            "job_title": job_title,
            "global_score": global_score,
            "sections": {
                "introduction": introduction,
                "profil": profil_section,
                "scores": scores_section,
                "technical": tech_section,
                "soft_skills": soft_section,
                "llm_analysis": llm_section,
                "conclusion": conclusion,
            },
            "markdown": markdown_report,
        }
