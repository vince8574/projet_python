import PropTypes from 'prop-types';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { pdfjsVersion } from '../config/pdfjsVersion.js';

function PdfViewer({ pdfUrl }) {
    return (
        <div style={{ height: '500px' }}>
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`}>
                <Viewer fileUrl={pdfUrl} />
            </Worker>
        </div>
    );
}

// 🔥 Définir PropTypes pour éviter l'erreur ESLint
PdfViewer.propTypes = {
    pdfUrl: PropTypes.string.isRequired,  // `pdfUrl` doit être une string et obligatoire
};
export default PdfViewer;




