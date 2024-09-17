import pyrebase

firebase_config = {
    "apiKey": "AIzaSyAUi0hL6cKqxjOp1qv4KvAxBDMjYJ486fo",
    "authDomain": "contract-chatbot-9d881.firebaseapp.com",
    "projectId": "contract-chatbot-9d881",
    "storageBucket": "contract-chatbot-9d881.appspot.com",
    "messagingSenderId": "120237478234",
    "appId": "1:120237478234:web:9893d78c59e8b701c7a363",
    "measurementId": "G-5TYVBN6SN3",
    "databaseURL": ""
}

firebase = pyrebase.initialize_app(firebase_config)
auth = firebase.auth()

# Function to handle user signup with email and password
def signup_user(email, password):
    try:
        user = auth.create_user_with_email_and_password(email, password)
        return {"message": "Signup successful", "user": user}
    except Exception as e:
        return {"error": str(e)}

