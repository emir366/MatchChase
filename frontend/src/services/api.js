import axios from 'axios';

const RENDER_BACKEND = 'https://matchchase.onrender.com'; 

function getBaseURL() {
  // during local dev (CRA/Vite) we want localhost if present, else use Render host
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:4000';
    }
    // production host; use render backend
    return RENDER_BACKEND;
  }
  return RENDER_BACKEND;
}

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true
});

export default api;
