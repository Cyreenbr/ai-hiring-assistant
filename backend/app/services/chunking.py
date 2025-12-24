from langchain.text_splitter import RecursiveCharacterTextSplitter

def split_into_chunks(text: str, chunk_size: int = 400, overlap: int = 40):
    """
    Coupe un long texte en petits morceaux (chunks) avec un overlap.
    """
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)

        # Avance avec overlap pour garder de la continuité
        start = end - overlap

    return chunks
