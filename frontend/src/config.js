// Centralized API configuration
// Reads from REACT_APP_API_URL environment variable
// Falls back to localhost:3001 for local development

export const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';
