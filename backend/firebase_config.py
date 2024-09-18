import pyrebase

firebase_config = {
    "apiKey": "your_api_key",
    "authDomain": "your_auth_domain",
    "projectId": "your_project_id",
    "storageBucket": "your_storage_bucket",
    "messagingSenderId": "your_sender_id",
    "appId": "your_app_id",
    "measurementId": "your_measurement_id",
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

