import { createRoot } from 'react-dom/client';
import './global.css';
import App from './App.jsx';

// Import and initialize console interceptor (🔁 this sends warnings/errors to backend)
import interceptConsole from './utils/consoleInterceptor.js';
interceptConsole();

createRoot(document.getElementById('root')).render(<App />);
