import { useState, useMemo } from 'react';
import styles from '../../styles/ModuleSettings.module.css';
import Buttons from '../ui/Buttons/Buttons';

const AddHierarchy = ({ onClose, onSubmit, hierarchyData }) => {
    const computed = useMemo(() => {
        const data = [...hierarchyData];

        const locationMap = {};
        data.forEach((loc) => {
            locationMap[loc.location_id] = loc;
        });

        const computeDepth = (loc) => {
            if (loc.parent_location_id === null) return 0;
            const parent = locationMap[loc.parent_location_id];
            return parent ? 1 + computeDepth(parent) : 0;
        };

        data.forEach((loc) => {
            loc.depth = computeDepth(loc);
        });

        const typeDepthMap = {};
        data.forEach((loc) => {
            const type = loc.location_type.toLowerCase();
            if (typeDepthMap[type] === undefined) {
                typeDepthMap[type] = loc.depth;
            } else {
                typeDepthMap[type] = Math.min(typeDepthMap[type], loc.depth);
            }
        });


        const levelOrder = Object.keys(typeDepthMap).sort(
            (a, b) => typeDepthMap[a] - typeDepthMap[b]
        );

        const hierarchyByLevel = {};
        levelOrder.forEach((level) => {
            hierarchyByLevel[level] = [];
        });
        
        data.forEach((loc) => {
            const level = loc.location_type.toLowerCase();
            const obj = {
                id: loc.location_id,
                name: loc.location_name,
                parent_id: loc.parent_location_id,
            };
            hierarchyByLevel[level].push(obj);
        });
        
        const hierarchyLevels = levelOrder.map((level) => ({
            id: level,
            label: level.charAt(0).toUpperCase() + level.slice(1),
        }));
        console.log(hierarchyLevels);

        return {
            levelOrder,
            hierarchyByLevel,
            hierarchyLevels,
        };
    }, [hierarchyData]);

    const { levelOrder, hierarchyLevels } = computed;
    const [combinedHierarchyData, setCombinedHierarchyData] = useState(
        computed.hierarchyByLevel
    );

    const [maxId, setMaxId] = useState(() => {
        return Math.max(
            ...hierarchyData.map((loc) => Number(loc.location_id)),
            0
        );
    });

    const initialStates = useMemo(
        () => ({
            selected: levelOrder.reduce(
                (acc, level) => ({ ...acc, [level]: '' }),
                {}
            ),
            newEntryData: levelOrder.reduce(
                (acc, level) => ({ ...acc, [level]: [] }),
                {}
            ),
            showNewEntryFields: levelOrder.reduce(
                (acc, level) => ({ ...acc, [level]: false }),
                {}
            ),
        }),
        [levelOrder]
    );

    const [selectedHierarchy, setSelectedHierarchy] = useState(
        initialStates.selected
    );
    const [newEntryData, setNewEntryData] = useState(
        initialStates.newEntryData
    );
    const [showNewEntryFields, setShowNewEntryFields] = useState(
        initialStates.showNewEntryFields
    );
    const [confirmedEntries, setConfirmedEntries] = useState({});

    const getFilteredOptions = (level) => {
        if (!combinedHierarchyData[level]) return [];

        if (levelOrder.indexOf(level) === 0) {
            return combinedHierarchyData[level];
        }

        const currentLevelIndex = levelOrder.indexOf(level);
        const parentLevel = levelOrder[currentLevelIndex - 1];
        const parentSelectedId = selectedHierarchy[parentLevel];

        return combinedHierarchyData[level].filter(
            (option) => String(option.parent_id) === String(parentSelectedId)
        );
    };

    const handleHierarchyChange = (level, value) => {
        setSelectedHierarchy((prev) => {
            const newHierarchy = { ...prev, [level]: value };
            const levelIndex = hierarchyLevels.findIndex((l) => l.id === level);

            hierarchyLevels.forEach((l, index) => {
                if (index > levelIndex) {
                    newHierarchy[l.id] = '';
                    setShowNewEntryFields((prev) => ({
                        ...prev,
                        [l.id]: false,
                    }));
                }
            });

            return newHierarchy;
        });
    };

    const handleNewEntryChange = (level, index, field, value) => {
        setNewEntryData((prev) => ({
            ...prev,
            [level]: prev[level].map((entry, i) =>
                i === index ? { ...entry, [field]: value } : entry
            ),
        }));
    };

    const addNewEntry = (level) => {
        const currentLevelIndex = levelOrder.indexOf(level);
        const parentLevel =
            currentLevelIndex > 0 ? levelOrder[currentLevelIndex - 1] : null;
        const parentId = parentLevel ? selectedHierarchy[parentLevel] : null;

        setNewEntryData((prev) => ({
            ...prev,
            [level]: [
                ...prev[level],
                {
                    name: '',
                    description: '',
                    parent_id: parentId,
                },
            ],
        }));
        setShowNewEntryFields((prev) => ({
            ...prev,
            [level]: true,
        }));
    };

    const removeEntry = (level, index) => {
        setNewEntryData((prev) => {
            const updatedEntries = {
                ...prev,
                [level]: prev[level].filter((_, i) => i !== index),
            };

            if (updatedEntries[level].length === 0) {
                setShowNewEntryFields((prev) => ({
                    ...prev,
                    [level]: false,
                }));
            }

            return updatedEntries;
        });
    };

    const confirmEntries = (level) => {
        const validEntries = newEntryData[level].filter((entry) =>
            entry.name.trim()
        );
        if (validEntries.length > 0) {
            const currentLevelIndex = levelOrder.indexOf(level);
            const parentLevel =
                currentLevelIndex > 0
                    ? levelOrder[currentLevelIndex - 1]
                    : null;
            const parentId = parentLevel
                ? selectedHierarchy[parentLevel]
                : null;

            const newEntries = validEntries.map((entry) => {
                const nextId = maxId + 1;
                setMaxId(nextId);
                return {
                    id: nextId,
                    name: entry.name,
                    description: entry.description,
                    parent_id: parentId,
                };
            });

            setConfirmedEntries((prev) => ({
                ...prev,
                [level]: [...(prev[level] || []), ...newEntries],
            }));

            setCombinedHierarchyData((prev) => ({
                ...prev,
                [level]: [...prev[level], ...newEntries],
            }));

            setNewEntryData((prev) => ({
                ...prev,
                [level]: [],
            }));
            setShowNewEntryFields((prev) => ({
                ...prev,
                [level]: false,
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const allNewEntries = [];

        levelOrder.forEach((level) => {
            if (confirmedEntries[level]) {
                confirmedEntries[level].forEach((entry) => {
                    allNewEntries.push({
                        location_id: entry.id,
                        location_name: entry.name,
                        description: entry.description,
                        parent_location_id: entry.parent_id,
                        location_type:
                            level.charAt(0).toUpperCase() + level.slice(1),
                        active_flag: '1',
                    });
                });
            }
        });

        onSubmit(allNewEntries);
    };

    return (
        <div className={styles.hierarchyFormContainer}>
            <div className={styles.hierarchyFormHeader}>
                <div className={styles.headerTitles}>
                    <div className="title">Add New Hierarchy Level</div>
                    <p className="sub_title">
                        Fill in the details for each level of the hierarchy
                    </p>
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

            <form onSubmit={handleSubmit} className={styles.hierarchyForm}>
                <div className={styles.hierarchyLevelsContainer}>
                    {hierarchyLevels.map((level) => (
                        <div key={level.id} className={styles.hierarchyLevel}>
                            <div className={styles.levelHeader}>
                                <div className={styles.levelHeaderContent}>
                                    <div className="sub_titles">
                                        {level.label}
                                    </div>
                                </div>
                                <div className={styles.levelActions}>
                                    {!showNewEntryFields[level.id] ? (
                                        <img
                                            src="icons/plus.svg"
                                            alt="Add"
                                            className={`${styles.actionIcon} ${
                                                levelOrder.indexOf(level.id) >
                                                    0 &&
                                                !selectedHierarchy[
                                                    levelOrder[
                                                        levelOrder.indexOf(
                                                            level.id
                                                        ) - 1
                                                    ]
                                                ]
                                                    ? styles.disabled
                                                    : ''
                                            }`}
                                            onClick={() => {
                                                if (
                                                    levelOrder.indexOf(
                                                        level.id
                                                    ) === 0 ||
                                                    selectedHierarchy[
                                                        levelOrder[
                                                            levelOrder.indexOf(
                                                                level.id
                                                            ) - 1
                                                        ]
                                                    ]
                                                ) {
                                                    addNewEntry(level.id);
                                                }
                                            }}
                                        />
                                    ) : (
                                        newEntryData[level.id].length > 0 && (
                                            <img
                                                src="icons/save.svg"
                                                alt="Add"
                                                className={`${styles.actionIcon}`}
                                                onClick={() =>
                                                    confirmEntries(level.id)
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            </div>

                            <div className={styles.levelContent}>
                                {!showNewEntryFields[level.id] ? (
                                    <div className={styles.levelInputGroup}>
                                        <select
                                            value={selectedHierarchy[level.id]}
                                            onChange={(e) =>
                                                handleHierarchyChange(
                                                    level.id,
                                                    e.target.value
                                                )
                                            }
                                            disabled={
                                                levelOrder.indexOf(level.id) >
                                                    0 &&
                                                !selectedHierarchy[
                                                    levelOrder[
                                                        levelOrder.indexOf(
                                                            level.id
                                                        ) - 1
                                                    ]
                                                ]
                                            }
                                            className={styles.hierarchySelect}>
                                            <option value="">
                                                Select {level.label}
                                            </option>
                                            {getFilteredOptions(level.id).map(
                                                (option) => (
                                                    <option
                                                        key={option.id}
                                                        value={option.id}>
                                                        {option.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                        <img
                                            src="icons/search.svg"
                                            alt="Search"
                                            className={styles.searchIcon}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.newEntryFields}>
                                        {newEntryData[level.id].map(
                                            (entry, index) => (
                                                <div
                                                    key={index}
                                                    className={
                                                        styles.newEntryInputs
                                                    }>
                                                    <input
                                                        type="text"
                                                        value={entry.name}
                                                        onChange={(e) =>
                                                            handleNewEntryChange(
                                                                level.id,
                                                                index,
                                                                'name',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder={`Enter ${level.label} name`}
                                                        className={
                                                            styles.newEntryInput
                                                        }
                                                    />
                                                    <input
                                                        type="text"
                                                        value={
                                                            entry.description
                                                        }
                                                        onChange={(e) =>
                                                            handleNewEntryChange(
                                                                level.id,
                                                                index,
                                                                'description',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder={`Enter ${level.label} description`}
                                                        className={
                                                            styles.newEntryInput
                                                        }
                                                    />
                                                    <img
                                                        src="icons/close.svg"
                                                        alt="Remove"
                                                        className={
                                                            styles.actionIcon
                                                        }
                                                        onClick={() =>
                                                            removeEntry(
                                                                level.id,
                                                                index
                                                            )
                                                        }
                                                    />
                                                </div>
                                            )
                                        )}
                                        <img
                                            src="icons/plus.svg"
                                            alt="Add Another"
                                            className={styles.actionIcon}
                                            onClick={() =>
                                                addNewEntry(level.id)
                                            }
                                        />
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

export default AddHierarchy;
