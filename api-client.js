// Configuration for the Vercel Backend
// When running locally with Flask, it uses http://127.0.0.1:8000
// When deploying, change this to your Vercel URL (e.g., https://your-project.vercel.app)
const API_BASE_URL = 'https://photo-gallery-one-brown.vercel.app';


const API = {
    async login(email, password) {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return response.json();
    },

    async signup(username, email, password) {
        const response = await fetch(`${API_BASE_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        return response.json();
    },

    async submitFeedback(name, email, message) {
        const response = await fetch(`${API_BASE_URL}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message })
        });
        return response.json();
    },

    async getFeedback(token) {
        const response = await fetch(`${API_BASE_URL}/api/feedback`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    }
};
