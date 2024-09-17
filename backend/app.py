from flask import Flask, request, jsonify
from firebase_config import auth
from your_functions import load_doc, answer_query
from your_functions import signup_user
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

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

    file_path = os.path.join('uploads', file.filename)
    file.save(file_path)

    # Process the file
    result = load_doc(file_path)
    return jsonify(result)

@app.route('/answer_query', methods=['POST'])
def get_answer():
    data = request.json
    query = data['query']
    answer = answer_query(query)
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
    token = request.json['token']
    try:
        user = auth.sign_in_with_custom_token(token)
        return jsonify({"message": "User logged in successfully", "user": user})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000)
