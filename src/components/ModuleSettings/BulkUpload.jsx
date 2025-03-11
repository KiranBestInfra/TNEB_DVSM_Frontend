import { useState } from 'react';
import * as XLSX from 'xlsx';
import styles from '../../styles/ModuleSettings.module.css';
import Buttons from '../ui/Buttons/Buttons';

const REQUIRED_HIERARCHY_COLUMNS = [
    'BLOCK_NAME',
    'FLAT_NO',
    'METER_SERIAL',
    'CONSUMER_ID',
    'CONSUMER_NAME',
    'CONSUMER_TYPE',
    'METER_TYPE',
    'HIERARCHY_ID',
];

const REQUIRED_CONSUMER_COLUMNS = [
    'BLOCK_NAME',
    'FLAT_NO',
    'METER_SERIAL',
    'CONSUMER_ID',
    'CONSUMER_NAME',
    'CONSUMER_TYPE',
    'METER_TYPE',
    'HIERARCHY_ID',
];

const BulkUpload = ({ onClose, onUpload }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [validationStatus, setValidationStatus] = useState(null);

    const validateExcelStructure = (data) => {
        if (!data || data.length === 0) {
            throw new Error('Excel file is empty');
        }

        const headers = Object.keys(data[0]).map((header) =>
            header.toUpperCase()
        );

        // Check for required hierarchy columns
        const missingHierarchyColumns = REQUIRED_HIERARCHY_COLUMNS.filter(
            (col) => !headers.includes(col)
        );

        // Check for required consumer columns
        const missingConsumerColumns = REQUIRED_CONSUMER_COLUMNS.filter(
            (col) => !headers.includes(col)
        );

        if (missingHierarchyColumns.length > 0) {
            throw new Error(
                `Missing required hierarchy columns: ${missingHierarchyColumns.join(
                    ', '
                )}`
            );
        }

        if (missingConsumerColumns.length > 0) {
            throw new Error(
                `Missing required consumer columns: ${missingConsumerColumns.join(
                    ', '
                )}`
            );
        }

        return true;
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
            setError('Please upload a valid Excel file (.xlsx or .xls)');
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setError(null);
        validateFile(selectedFile);
    };

    const validateFile = async (selectedFile) => {
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    validateExcelStructure(jsonData);
                    setValidationStatus('valid');
                    setError(null);
                } catch (err) {
                    setValidationStatus('invalid');
                    setError(err.message);
                }
            };
            reader.readAsArrayBuffer(selectedFile);
        } catch (err) {
            setValidationStatus('invalid');
            setError('Error reading file. Please try again.');
        }
    };

    const handleUpload = async () => {
        if (!file || validationStatus !== 'valid') return;

        try {
            const formData = new FormData();
            formData.append('file', file);
            await onUpload(formData);
            onClose();
        } catch (err) {
            setError('Error uploading file. Please try again.');
        }
    };

    return (
        <div className={styles.bulkUploadContainer}>
            <div className={styles.bulkUploadHeader}>
                <div className={styles.headerTitles}>
                    <div className="title">Bulk Upload Consumers</div>
                    <p className="sub_title">
                        Upload consumer data using Excel template
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <Buttons
                        label="Cancel"
                        variant="outline"
                        onClick={onClose}
                    />
                    <Buttons
                        label="Upload"
                        variant="primary"
                        onClick={handleUpload}
                        disabled={!file || validationStatus !== 'valid'}
                        icon="icons/upload.svg"
                        iconPosition="left"
                    />
                </div>
            </div>

            <div className={styles.bulkUploadContent}>
                <div className={styles.uploadSection}>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className={styles.fileInput}
                        id="excelUpload"
                    />
                    <label htmlFor="excelUpload" className={styles.uploadLabel}>
                        <img src="icons/google-sheets.svg" alt="upload" />
                        <span>Click to upload or drag and drop</span>
                        <span className={styles.fileTypes}>
                            .xlsx or .xls files only
                        </span>
                    </label>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.templateSection}>
                    <a
                        href="files/Download-ConsumerData-Template.xlsx"
                        download>
                        Download Template
                    </a>
                </div>
            </div>
        </div>
    );
};

export default BulkUpload;
