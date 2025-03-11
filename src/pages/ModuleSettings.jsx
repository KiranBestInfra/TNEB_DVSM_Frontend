import { useEffect, useState } from 'react';
import styles from '../styles/ModuleSettings.module.css';
import Table from '../components/ui/Table/Tables';
import Buttons from '../components/ui/Buttons/Buttons';
import AddHierarchy from '../components/ModuleSettings/AddHierarchy';
import AddMasterData from '../components/ModuleSettings/AddMasterData';
import BulkUpload from '../components/ModuleSettings/BulkUpload';
import { apiClient } from '../api/client';
import axios from 'axios';
import { baseURL } from '../api/config';

const ModuleSettings = () => {
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);
    const [activeForm, setActiveForm] = useState(null);
    const showHierarchyForm = activeForm === 'hierarchy';
    const showMasterDataForm = activeForm === 'masterData';
    const showBulkUploadForm = activeForm === 'bulkUpload';
    const showColumnVisibilityForm = activeForm === 'columnVisibility';
    const [hierarchyData, setHierarchyData] = useState([]);
    const API_BASE_URL = baseURL()

    const [masterData, setMasterData] = useState({
        quarterTypes: [],
        designations: [],
        buNumbers: [],
        depots: [],
        stations: [],
    });

    const [columnVisibility, setColumnVisibility] = useState({});

    const handleHierarchySubmit = async (newEntries) => {
        try {
            const response = await apiClient.post(
                '/edit/hierarchy',
                newEntries
            );

            if (response.status === 'success') {
                setInfo('Successfully added hierarchy');
                fetchHierarchy();
            }
        } catch (error) {
            setError('Error adding hierarchy');
        }
    };

    const handleMasterDataSubmit = (
        showNewMasterFields,
        newMasterEntryData,
        selectedMasterData
    ) => {
        Object.keys(showNewMasterFields).forEach((type) => {
            if (showNewMasterFields[type] && newMasterEntryData[type].name) {
                const newEntry = {
                    id: Date.now(),
                    name: newMasterEntryData[type].name,
                    description: newMasterEntryData[type].description,
                };

                setMasterData((prev) => ({
                    ...prev,
                    [type + 's']: [...(prev[type + 's'] || []), newEntry],
                }));
            }
        });

        setActiveForm(null);
    };

    const handleBulkUpload = async (formData) => {
        try {
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            await axios.post(
                `${API_BASE_URL}/consumers/bulk-upload`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );

            setInfo('Successfully Uploaded');
            setActiveForm(null);

            setTimeout(() => {
                setInfo(null);
            }, 3000);
        } catch (error) {
            setError('Error uploading file');

            setTimeout(() => {
                setError(null);
            }, 3000);
            console.error('Error uploading file:', error);
        }
    };

    const toggleForm = (formName) => {
        setActiveForm(activeForm === formName ? null : formName);
    };

    const fetchHierarchy = async () => {
        try {
            const response = await apiClient.get(`/hierarchy`);
            const data = response.data;
            setHierarchyData(data);
        } catch (error) {
            setError('Error fetching hierarchy');
        }
    };

    useEffect(() => {
        fetchHierarchy();
    }, []);

    return (
        <div className={styles.main_content}>
            {error && (
                <div style={{ marginBottom: '20px' }} className="error">
                    <span className="error_icon">
                        <img src="icons/error-mark.svg" alt="warning" />
                    </span>
                    {error}
                </div>
            )}

            {info && (
                <div style={{ marginBottom: '20px' }} className="info">
                    {info}
                </div>
            )}

            <div className="adminheader">
                <h1 className="title"></h1>
                <div className="header_actions">
                    {/* <Buttons
                        label="Configure Columns"
                        variant={
                            showColumnVisibilityForm ? 'outline' : 'primary'
                        }
                        icon="icons/columns.svg"
                        iconPosition="left"
                        onClick={() => toggleForm('columnVisibility')}
                        style={{ marginRight: '1rem' }}
                        disabled={
                            showHierarchyForm ||
                            showMasterDataForm ||
                            showBulkUploadForm
                        }

                    /> */}

                    <Buttons
                        label="Bulk Upload"
                        variant={showBulkUploadForm ? 'outline' : 'primary'}
                        icon="icons/upload.svg"
                        iconPosition="left"
                        onClick={() => toggleForm('bulkUpload')}
                        style={{ marginRight: '1rem' }}
                        disabled={
                            showHierarchyForm ||
                            showMasterDataForm ||
                            showColumnVisibilityForm
                        }
                    />
                    <Buttons
                        label="Add Master Data"
                        variant={showMasterDataForm ? 'outline' : 'primary'}
                        icon="icons/plus.svg"
                        iconPosition="left"
                        onClick={() => toggleForm('masterData')}
                        style={{ marginRight: '1rem' }}
                        disabled={
                            showHierarchyForm ||
                            showBulkUploadForm ||
                            showColumnVisibilityForm
                        }
                    />
                    <Buttons
                        label="Add Hierarchy"
                        variant={showHierarchyForm ? 'outline' : 'primary'}
                        icon="icons/plus.svg"
                        iconPosition="left"
                        onClick={() => toggleForm('hierarchy')}
                        disabled={
                            showMasterDataForm ||
                            showBulkUploadForm ||
                            showColumnVisibilityForm
                        }
                    />
                </div>
            </div>

            {showMasterDataForm && (
                <AddMasterData
                    onClose={() => setActiveForm(null)}
                    onSubmit={handleMasterDataSubmit}
                    masterData={masterData}
                />
            )}

            {showHierarchyForm && (
                <AddHierarchy
                    onClose={() => setActiveForm(null)}
                    onSubmit={handleHierarchySubmit}
                    hierarchyData={hierarchyData}
                />
            )}

            {showBulkUploadForm && (
                <BulkUpload
                    onClose={() => setActiveForm(null)}
                    onUpload={handleBulkUpload}
                />
            )}

            {/* {showColumnVisibilityForm && (
                <ColumnVisibility
                    onClose={() => setActiveForm(null)}
                    onSave={handleColumnVisibilitySubmit}
                    initialVisibility={columnVisibility}
                />
            )} */}

            <div className={styles.table_container}>
                <Table
                    // data={hierarchyData.quarterNos.map(qn => ({
                    //     ...getFullHierarchyPath(qn),
                    //     description: qn.description
                    // }))}/
                    data={hierarchyData}
                    columns={[
                        { key: 'location_name', label: 'Hierarchy' },
                        {
                            key: 'parent_location_name',
                            label: 'Parent Hierarchy',
                        },
                        {
                            key: 'location_type',
                            label: 'Hierarchy Type',
                        },
                        {
                            key: 'active_flag',
                            label: 'Status',
                            render: (flag) =>
                                flag == 1 ? 'Active' : 'In Active',
                        },
                    ].filter((col) => columnVisibility[col.key] !== false)}
                    sortable={true}
                    searchable={true}
                    pagination={true}
                    rowsPerPageOptions={[5, 10, 25]}
                    initialRowsPerPage={10}
                    emptyMessage="No hierarchy levels found"
                />
            </div>
        </div>
    );
};

export default ModuleSettings;
