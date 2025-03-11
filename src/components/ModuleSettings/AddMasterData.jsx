import { useState } from 'react';
import styles from '../../styles/ModuleSettings.module.css';
import Buttons from '../ui/Buttons/Buttons';

const AddMasterData = ({ onClose, onSubmit, masterData }) => {
    const [selectedMasterData, setSelectedMasterData] = useState({
        quarterType: '',
        designation: '',
        buNumber: '',
        depot: '',
        station: ''
    });

    const [showNewMasterFields, setShowNewMasterFields] = useState({
        quarterType: false,
        designation: false,
        buNumber: false,
        depot: false,
        station: false
    });

    const [newMasterEntryData, setNewMasterEntryData] = useState({
        quarterType: { name: '', description: '' },
        designation: { name: '', description: '' },
        buNumber: { name: '', description: '' },
        depot: { name: '', description: '' },
        station: { name: '', description: '' }
    });

    const masterDataTypes = [
        { id: 'quarterType', label: 'Quarter Type' },
        { id: 'designation', label: 'Designation Master' },
        { id: 'buNumber', label: 'B.U Number' },
        { id: 'depot', label: 'Depot' },
        { id: 'station', label: 'Station' }
    ];

    const toggleNewMasterField = (type) => {
        setShowNewMasterFields(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
        if (showNewMasterFields[type]) {
            setNewMasterEntryData(prev => ({
                ...prev,
                [type]: { name: '', description: '' }
            }));
        }
    };

    const handleNewMasterEntryChange = (type, field, value) => {
        setNewMasterEntryData(prev => ({
            ...prev,
            [type]: { ...prev[type], [field]: value }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(showNewMasterFields, newMasterEntryData, selectedMasterData);
    };

    return (
        <div className={styles.masterDataFormContainer}>
            <div className={styles.hierarchyFormHeader}>
                <div className={styles.headerTitles}>
                    <div className="title">Add Master Data</div>
                    <p className="sub_title">Add new master data entries</p>
                </div>
                <div className={styles.headerActions}>
                    <Buttons
                        label="Cancel"
                        variant="outline"
                        onClick={onClose}
                    />
                    <Buttons
                        label="Save"
                        variant="primary"
                        onClick={handleSubmit}
                        icon="icons/check.svg"
                        iconPosition="left"
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.masterDataForm}>
                <div className={styles.masterDataGrid}>
                    {masterDataTypes.map((type) => (
                        <div key={type.id} className={styles.hierarchyLevel}>
                            <div className={styles.levelHeader}>
                                <div className={styles.levelHeaderContent}>
                                    <div className="sub_titles">{type.label}</div>
                                </div>
                                <div className={styles.levelActions}>
                                    {!showNewMasterFields[type.id] ? (
                                        <img
                                            src="icons/plus.svg"
                                            alt="Add"
                                            className={styles.actionIcon}
                                            onClick={() => toggleNewMasterField(type.id)}
                                        />
                                    ) : (
                                        <div className={styles.levelActions}>
                                            <img
                                                src="icons/close.svg"
                                                alt="Cancel"
                                                className={styles.actionIcon}
                                                onClick={() => toggleNewMasterField(type.id)}
                                            />
                                            <img
                                                src="icons/save.svg"
                                                alt="Save"
                                                className={styles.actionIcon}
                                                onClick={() => {/* Add save logic */}}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.levelContent}>
                                {!showNewMasterFields[type.id] ? (
                                    <div className={styles.levelInputGroup}>
                                        <select
                                            value={selectedMasterData[type.id]}
                                            onChange={(e) => setSelectedMasterData(prev => ({
                                                ...prev,
                                                [type.id]: e.target.value
                                            }))}
                                            className={styles.hierarchySelect}
                                        >
                                            <option value="">Select {type.label}</option>
                                            {(masterData[type.id + 's'] || []).map(option => (
                                                <option key={option.id} value={option.id}>
                                                    {option.name}
                                                </option>
                                            ))}
                                        </select>
                                        <img
                                            src="icons/search.svg"
                                            alt="Search"
                                            className={styles.searchIcon}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.newEntryFields}>
                                        <div className={styles.newEntryInputs}>
                                            <input
                                                type="text"
                                                value={newMasterEntryData[type.id].name}
                                                onChange={(e) => handleNewMasterEntryChange(type.id, 'name', e.target.value)}
                                                placeholder={`Enter ${type.label} name`}
                                                className={styles.newEntryInput}
                                            />
                                            <input
                                                type="text"
                                                value={newMasterEntryData[type.id].description}
                                                onChange={(e) => handleNewMasterEntryChange(type.id, 'description', e.target.value)}
                                                placeholder={`Enter ${type.label} description`}
                                                className={styles.newEntryInput}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </form>
        </div>
    );
};

export default AddMasterData; 