import faiss
import numpy as np

class VectorStore:
    def __init__(self, dimension: int):
        self.index = faiss.IndexFlatL2(dimension)

    def add(self, vectors):
        self.index.add(np.array(vectors).astype("float32"))

    def search(self, query_vector, top_k=3):
        """
        Recherche les top_k vecteurs les plus proches du query_vector.
        """
        query_vector = np.array(query_vector).astype("float32")
        distances, indices = self.index.search(query_vector, top_k)
        return indices
