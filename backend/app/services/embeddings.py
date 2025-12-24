from sentence_transformers import SentenceTransformer
import numpy as np

# Modèle d'embedding local, gratuit et rapide
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def embed_chunks(chunks):
    """
    Encode une liste de chunks en vecteurs embeddings.
    """
    vectors = model.encode(chunks, convert_to_numpy=True)
    return vectors

def embed_query(text: str):
    """
    Encode une requête (question ou instruction) pour le retrieval.
    """
    vector = model.encode([text], convert_to_numpy=True)[0]
    return vector
