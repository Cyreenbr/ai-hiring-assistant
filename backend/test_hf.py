import requests
import json

HF_TOKEN = "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"

API_URL = "https://router.huggingface.co/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {HF_TOKEN}",
    "Content-Type": "application/json"
}

payload = {
    "model": "meta-llama/Llama-3.1-8B-Instruct",  
    "messages": [
        {"role": "user", "content": "Bonjour ! Est-ce que mon token fonctionne ?"}
    ],
    "max_tokens": 100
}

print("🔍 Test du token Hugging Face...\n")

response = requests.post(API_URL, headers=headers, data=json.dumps(payload))

print("🟦 Statut HTTP :", response.status_code)
print("🟪 Réponse brute :")
print(response.text)

try:
    data = response.json()
    print("\n🟩 Réponse du modèle :")
    print(data["choices"][0]["message"]["content"])
except:
    print("\n⚠️ Impossible d'extraire la réponse.")
