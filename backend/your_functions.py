import os
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyMuPDFLoader
import cohere

# Set up the Cohere API Key
os.environ["COHERE_API_KEY"] = "replace_with_your_cohere_api_key"
# Go to cohere's official page and generate a new api key and paste it here

# Initialize Cohere client
cohere_client = cohere.Client(os.getenv("COHERE_API_KEY"))

chain = None

# Store vector stores for each chat session
vector_stores = []

# Function to use Cohere's language model for answering queries
def cohere_answer(query):
    response = cohere_client.generate(
        model="command-r-plus-08-2024",  # Updated model ID
        prompt=query,
        max_tokens=100,
        temperature=1.0,
    )
    return response.generations[0].text.strip()


# Modify the load_doc function to clear the vector store for the current chat
def load_doc(pdf_file, chat_index):
    global chain
    try:
        loader = PyMuPDFLoader(pdf_file)
        documents = loader.load()
        if not documents or len(documents) == 0:
            return "Error: Document loading failed."

        print(f"Loaded {len(documents)} documents")
        embedding = HuggingFaceEmbeddings()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        text = text_splitter.split_documents(documents)

        if not text or len(text) == 0:
            return "Error: Document splitting failed."

        db = Chroma.from_documents(text, embedding)

        # Clear and reset the vector store for the current chat
        if len(vector_stores) <= chat_index:
            vector_stores.append(db)
        else:
            vector_stores[chat_index] = db  # Overwrite the vector store

        # No need to initialize LLM chain here since we are using Cohere directly in the query
        return 'Document has successfully been loaded'
    except Exception as e:
        return f"Error: {e}"

def answer_query(query, chat_index):
    # Check if the vector store for the chat exists
    if chat_index >= len(vector_stores):
        return "Please load a document first for this chat."

    try:
        # Retrieve relevant documents from the vector store
        db = vector_stores[chat_index]
        retrieved_docs = db.similarity_search(query, k=3)  # Adjust k as needed

        # Combine the text from retrieved documents
        context = "\n".join([doc.page_content for doc in retrieved_docs])
        combined_prompt = f"Context: {context}\n\nUser's question: {query}"

        # Generate the answer using Cohere's language model with the context
        answer = cohere_answer(combined_prompt)

        return answer
    except Exception as e:
        return f"Error: {e}"



def signup_user(email, password):
    # Your logic for user signup
    if email and password:
        return f"User with email {email} has been successfully signed up."
    else:
        return "Signup failed. Please provide both email and password."

# Flask and Firebase integration code remains the same
# You can use the code you had for the Flask routes and Firebase authentication.
