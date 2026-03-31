import asyncio
import os
import sys
from dotenv import load_dotenv
import pandas as pd
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.config import settings
from app.services.embedding import embedding_service
from supabase import create_client, Client

async def parse_file(file_path: str) -> list[dict]:
    docs = []
    logger.info(f"Attempting to parse file: {file_path}")
    try:
        if file_path.endswith('.parquet'):
            df = pd.read_parquet(file_path, engine='pyarrow').head(5000)
            # CORRECTED: Using 'Text' with a capital T for the parquet file column.
            for _, row in df.iterrows():
                text = str(row.get('Text', '')) # <-- THE FIX IS HERE
                if text and len(text) > 200:
                    docs.append({'content': text, 'metadata': {
                        'source': 'indian_judgments.parquet',
                        'case_name': str(row.get('case_name', 'Unknown')),
                        'court': str(row.get('court', 'Unknown')),
                    }})
        elif file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
            for _, row in df.iterrows():
                text = str(row.get('text', '')) # <-- This one is correct (lowercase)
                if text and len(text) > 100:
                    docs.append({'content': text, 'metadata': {
                        'source': 'legal_text_classification.csv',
                        'category': str(row.get('category', 'Uncategorized'))
                    }})
        
        if not docs:
            logger.warning(f"File {os.path.basename(file_path)} was read, but no valid documents were extracted. Check column names and content filters.")
        else:
            logger.info(f"Successfully parsed {len(docs)} documents from {os.path.basename(file_path)}.")

    except Exception as e:
        logger.critical(f"A critical error occurred while parsing {file_path}: {e}", exc_info=True)
    
    return docs

# --- The main() function remains the same as the previous robust version ---

async def main():
    load_dotenv()
    
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key or "YOUR_SUPABASE_URL_HERE" in supabase_url:
        logger.error("Supabase URL or Key not found or not configured in .env file.")
        return

    supabase: Client = create_client(supabase_url, supabase_key)
    logger.info("Connected to Supabase.")

    try:
        count_res = supabase.table('documents').select('*', count='exact').limit(0).execute()
        if count_res.count > 0:
            logger.warning(f"Supabase 'documents' table already contains {count_res.count} rows. Aborting upload to prevent duplicates.")
            return
    except Exception as e:
        logger.error(f"Could not check document count in Supabase. Ensure the 'documents' table exists and the 'vector' extension is enabled. Error: {e}")
        return

    all_docs = []
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    
    files_to_process = ["indian_judgments.parquet", "legal_text_classification.csv"]
    for filename in files_to_process:
        path = os.path.join(data_dir, filename)
        if os.path.exists(path):
            parsed_docs = await parse_file(path)
            all_docs.extend(parsed_docs)
        else:
            logger.warning(f"Dataset file not found, skipping: {path}")

    if not all_docs:
        logger.error("No valid documents were extracted from any files in the 'data' directory. Aborting upload.")
        return

    logger.info(f"Found {len(all_docs)} total documents to process for embedding.")

    contents = [doc['content'] for doc in all_docs]
    logger.info("Generating embeddings for all documents... (This may take several minutes)")
    embeddings = embedding_service.embed_texts(contents)
    logger.info("Embeddings generated.")

    documents_to_insert = [
        {'content': doc['content'], 'metadata': doc['metadata'], 'embedding': emb}
        for doc, emb in zip(all_docs, embeddings)
    ]

    batch_size = 100
    for i in range(0, len(documents_to_insert), batch_size):
        batch = documents_to_insert[i:i+batch_size]
        logger.info(f"Uploading batch {i//batch_size + 1} of {len(documents_to_insert)//batch_size + 1}...")
        try:
            supabase.table('documents').insert(batch).execute()
        except Exception as e:
            logger.error(f"Error uploading batch: {e}")
            
    logger.info("Data loading complete.")

if __name__ == "__main__":
    asyncio.run(main())
