import os
import requests
import numpy as np

HF_TOKEN = os.getenv("HF_TOKEN")

def embed_chunks(chunks):
    vectors = []
    for text in chunks:
        resp = requests.post(
            "https://api-inference.huggingface.co/embeddings/sentence-transformers/all-MiniLM-L6-v2",
            headers={"Authorization": f"Bearer {HF_TOKEN}"},
            json={"inputs": text}
        )
        vectors.append(resp.json()["embeddings"])
    return np.array(vectors)
