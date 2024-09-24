from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth
from your_functions import load_doc, answer_query, signup_user
from flask_cors import CORS
import os

# Initialize the Flask app
app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('your_firebase_file.json')

# you can get this json file by going into the project overview of your created project, then into the overview dropdown
# go to project settings. In the project settings, choose the service accounts tab and select on the python radio button
# and the above json file will be downloaded. Paste that downloaded file either in the same directory as app.py or give its
# relative path in the above code.

firebase_admin.initialize_app(cred)

# Create a directory to store uploaded files if it doesn't exist
if not os.path.exists('uploads'):
    os.makedirs('uploads')

@app.route('/load_doc', methods=['POST'])
def load_document():
    if 'pdf' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['pdf']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    chat_index = int(request.args.get('chat_index'))
    file_path = os.path.join('uploads', file.filename)
    file.save(file_path)

    # Process the file for the specific chat
    result = load_doc(file_path, chat_index)
    return jsonify(result)

@app.route('/answer_query', methods=['POST'])
def get_answer():
    data = request.json
    query = data['query']
    chat_index = int(request.args.get('chat_index'))
    answer = answer_query(query, chat_index)
    return jsonify(answer)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    try:
        user = auth.create_user(
            email=email,
            password=password
        )
        return jsonify(f"User {user.email} created successfully."), 200
    except Exception as e:
        return jsonify(f"Error: {e}"), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password']
    try:
        user = auth.get_user_by_email(email)
        return jsonify({"message": "User logged in successfully", "user": user.email}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000)
