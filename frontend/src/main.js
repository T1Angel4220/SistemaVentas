import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setupApiFetchInterceptor } from './config/fetchInterceptor.js';
import './index.css';
import App from './App';
setupApiFetchInterceptor();
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(App, {}) }));
