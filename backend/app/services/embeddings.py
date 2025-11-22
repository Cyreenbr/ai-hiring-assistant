from sentence_transformers import SentenceTransformer

# Modèle d’embedding global
emb_model = SentenceTransformer("all-MiniLM-L6-v2")

def embed_chunks(chunks: list[str]):
    """
    Prend une liste de textes (chunks) et retourne leurs embeddings.
    """
    return emb_model.encode(chunks)
