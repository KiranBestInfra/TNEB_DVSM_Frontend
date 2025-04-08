import { PDFViewer as ReactPDFViewer } from '@react-pdf/renderer';
import Documents from './Documents';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

const PDFViewer = () => {
    const { invoiceId, meterNo } = useParams();
    const [billData, setBillData] = useState(null);

    useEffect(() => {
        const fetchBillData = async () => {
            try {
                if (invoiceId && meterNo) {
                    const response = await apiClient.get(
                        `/invoice?id=${invoiceId}`
                    );
                    const data = response.data;
                    setBillData(data);
                }
            } catch (error) {
                console.error('Error fetching bill data:', error);
            }
        };
        fetchBillData();
    }, [invoiceId, meterNo]);

    if (!billData) {
        return <div>Loading...</div>;
    }

    return (
        <ReactPDFViewer
            style={{
                width: '100vw',
                height: '100vh',
                border: 'none',
                margin: 0,
                padding: 0,
            }}>
            <Documents billData={billData} invoiceId={invoiceId} />
        </ReactPDFViewer>
    );
};

export default PDFViewer;
