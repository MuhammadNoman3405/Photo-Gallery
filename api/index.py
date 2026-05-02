import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime

app = Flask(__name__)
# Enable CORS for all routes so GitHub Pages can access the API
CORS(app)

# Use Neon DATABASE_URL from Vercel Envs, or default to a local SQLite file for testing
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///local_gallery.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'my-super-secret-key-123')

db = SQLAlchemy(app)

# --- Database Models ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text, nullable=False)

class GalleryImage(db.Model):
    __tablename__ = 'gallery_images'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    image_data = db.Column(db.Text, nullable=False) # Base64 string

# Ensure tables are created (especially helpful for local SQLite)
with app.app_context():
    db.create_all()

# --- Routes ---
@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({"status": "Backend is running!"})

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('username'):
        return jsonify({"error": "Missing required fields"}), 400

    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 400

    hashed_password = generate_password_hash(data['password'])
    new_user = User(username=data['username'], email=data['email'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    token = jwt.encode({
        'user_id': new_user.id,
        'username': new_user.username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({"message": "User created successfully", "token": token, "username": new_user.username}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"error": "Invalid email or password"}), 401

    token = jwt.encode({
        'user_id': user.id,
        'username': user.username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({"message": "Login successful", "token": token, "username": user.username}), 200

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('email') or not data.get('message'):
        return jsonify({"error": "Missing fields"}), 400

    new_feedback = Feedback(name=data['name'], email=data['email'], message=data['message'])
    db.session.add(new_feedback)
    db.session.commit()

    return jsonify({"message": "Feedback submitted successfully"}), 201

@app.route('/api/feedback', methods=['GET'])
def get_feedback():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Missing or invalid token"}), 401
    
    token = auth_header.split(" ")[1]
    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if data['username'] != 'Noman':
            return jsonify({"error": "Unauthorized"}), 403
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    all_feedback = Feedback.query.all()
    result = []
    for f in all_feedback:
        result.append({
            "id": f.id,
            "name": f.name,
            "email": f.email,
            "message": f.message
        })
    return jsonify(result), 200

@app.route('/api/images', methods=['POST'])
def upload_image():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Missing or invalid token"}), 401
    
    token = auth_header.split(" ")[1]
    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if data['username'] != 'Noman':
            return jsonify({"error": "Unauthorized"}), 403
    except Exception:
        return jsonify({"error": "Invalid or expired token"}), 401

    payload = request.get_json()
    if not payload or not payload.get('title') or not payload.get('category') or not payload.get('image_data'):
        return jsonify({"error": "Missing fields"}), 400

    new_image = GalleryImage(
        title=payload['title'],
        category=payload['category'],
        image_data=payload['image_data']
    )
    db.session.add(new_image)
    db.session.commit()

    return jsonify({"message": "Image uploaded successfully", "id": new_image.id}), 201

@app.route('/api/images', methods=['GET'])
def get_images():
    images = GalleryImage.query.order_by(GalleryImage.id.desc()).all()
    result = []
    for img in images:
        result.append({
            "id": img.id,
            "title": img.title,
            "category": img.category,
            "src": img.image_data
        })
    return jsonify(result), 200

# For local testing
if __name__ == '__main__':
    app.run(port=8000, debug=True)
