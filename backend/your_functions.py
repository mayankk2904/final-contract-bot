from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.llms import HuggingFaceHub
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyMuPDFLoader
import os

os.environ["HUGGINGFACEHUB_API_TOKEN"] = "replace_with_your_access_token"

chain = None

def load_doc(pdf_file):
    global chain
    try:
        loader = PyMuPDFLoader(pdf_file)
        documents = loader.load()
        embedding = HuggingFaceEmbeddings()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        text = text_splitter.split_documents(documents)
        db = Chroma.from_documents(text, embedding)
        llm = HuggingFaceHub(repo_id="OpenAssistant/oasst-sft-1-pythia-12b", model_kwargs={"temperature": 1.0, "max_length": 256})
        chain = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=db.as_retriever(), return_source_documents=False)
        return 'Document has successfully been loaded'
    except Exception as e:
        return f"Error: {e}"

def answer_query(query):
    # Only run the chain if the document has been loaded
    if chain is None:
        return "Please load a document first."
    
    try:
        # Process the query and get the answer
        answer = chain.run(query)
        
        # Extract only the useful part of the answer
        # Here, we'll assume the answer starts with "Answer:" and ends at the end of the response
        if "Answer:" in answer:
            answer = answer.split("Answer:", 1)[1].strip()
        else:
            # If the response does not contain "Answer:", use the entire response
            answer = answer.strip()
        
        # Return just the answer without the document content
        return answer
    except Exception as e:
        return f"Error: {e}"

def signup_user(email, password):
    # Add your logic for user signup (e.g., storing user credentials in Firebase or any DB)
    # For demonstration purposes:
    if email and password:
        return f"User with email {email} has been successfully signed up."
    else:
        return "Signup failed. Please provide both email and password."
