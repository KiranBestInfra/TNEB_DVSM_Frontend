import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import PDFViewer from './components/Documents/PDFViewer';

// Get the bill data that was passed to the window
const billData = window.billData;

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <PDFViewer billData={billData} />
    </StrictMode>
); 