import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

/**
 * Sends a study generation request to the backend.
 * Uses FormData to handle text input and PDF file uploads together.
 */
export async function generateResource(params) {
  try {
    const formData = new FormData();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        formData.append(key, params[key]);
      }
    });

    const response = await api.post('/api/study/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}


