import { useEffect, useMemo, useState } from 'react';
import styles from '../styles/Consumers.module.css';
import Table from '../components/ui/Table/Tables';
import Buttons from '../components/ui/Buttons/Buttons';
import { apiClient } from '../api/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

const Consumers = () => {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddUnit, setShowAddUnit] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
        total: 0,
    });
    const [hierarchyData, setHierarchyData] = useState([]);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        flat_no: '',
        meter_serial: '',
        consumer_id: '',
        consumer_name: '',
        consumer_type: '',
        meter_type: '',
        mobile_number: '',
        email_address: '',
        permanent_address: '',
        billing_address: '',
    });
    const { isAdmin } = useAuth();
    const basePath = isAdmin() ? '/admin' : '/user';

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

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

        return {
            levelOrder,
            hierarchyByLevel,
        };
    }, [hierarchyData]);

    const [selectedHierarchy, setSelectedHierarchy] = useState(
        computed.levelOrder.reduce(
            (acc, level) => ({ ...acc, [level]: '' }),
            {}
        )
    );

    const getFilteredOptions = (level) => {
        if (!computed.hierarchyByLevel[level]) return [];

        if (computed.levelOrder.indexOf(level) === 0) {
            return computed.hierarchyByLevel[level];
        }

        const currentLevelIndex = computed.levelOrder.indexOf(level);
        const parentLevel = computed.levelOrder[currentLevelIndex - 1];
        const parentSelectedId = selectedHierarchy[parentLevel];

        return computed.hierarchyByLevel[level].filter(
            (option) => String(option.parent_id) === String(parentSelectedId)
        );
    };

    const handleHierarchyChange = (level, value) => {
        setSelectedHierarchy((prev) => {
            const newHierarchy = { ...prev, [level]: value };
            const levelIndex = computed.levelOrder.indexOf(level);

            computed.levelOrder.forEach((l, index) => {
                if (index > levelIndex) {
                    newHierarchy[l.id] = '';
                }
            });

            return newHierarchy;
        });
    };

    const handleView = (consumer_uid) => {
        navigate(`${basePath}/consumers/view/${consumer_uid}`);
    };

    const handleAddUnit = (e) => {
        e.preventDefault();
        setShowAddUnit(false);
    };

    const fetchUnits = async (page, limit, communicationStatus) => {
        try {
            setLoading(true);
            const response = await apiClient.get(
                `/consumers?page=${page}&limit=${limit}${
                    communicationStatus
                        ? `&communicationStatus=${communicationStatus}`
                        : ''
                }`
            );
            setUnits(response.data || []);
            setPagination({
                currentPage: response.pagination.currentPage,
                totalPages: response.pagination.totalPages,
                totalCount: response.pagination.totalCount,
                limit: response.pagination.limit,
                hasNextPage: response.pagination.hasNextPage,
                hasPrevPage: response.pagination.hasPrevPage,
            });
        } catch (err) {
            console.error('Error fetching units:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateUrlParams = (page, limit) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page);
        newParams.set('limit', limit);
        setSearchParams(newParams, { replace: true });
    };

    const handlePageChange = (page, limit) => {
        updateUrlParams(page, limit);
    };

    const handleSearch = (value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set('search', value);
        } else {
            newParams.delete('search');
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    function removeInitials(str) {
        return str.replace(/^[A-Za-z]{1,2}\s/, '');
    }

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
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const communicationStatus = searchParams.get('communicationStatus');

        fetchUnits(page, limit, communicationStatus);
        fetchHierarchy();
    }, [searchParams]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isHierarchyComplete = computed.levelOrder.every(
            (level) => selectedHierarchy[level]
        );

        if (!isHierarchyComplete) {
            alert('Please select all location fields');
            return;
        }

        const blockData = hierarchyData.find(
            (loc) => loc.location_id === Number(selectedHierarchy['block'])
        );

        const submissionData = {
            ...formData,
            parent_hierarchy_id: selectedHierarchy['city'],
            block_name: blockData?.location_name || '',
        };

        try {
            const res = await apiClient.post(`/consumer`, submissionData);
            if (res.status == 'success') {
                setFormData({
                    flat_no: '',
                    meter_serial: '',
                    consumer_id: '',
                    consumer_name: '',
                    consumer_type: '',
                    meter_type: '',
                    mobile_number: '',
                    email_address: '',
                    permanent_address: '',
                    billing_address: '',
                });
                alert('Successfullly Inserted.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            alert('Error submitting form. Please try again.');
        }
    };

    const renderAddUnitForm = () => {
        return (
            <div className={styles.add_unit_form}>
                <form className="form_group">
                    <div className="form_row">
                        {computed.levelOrder.slice(0, 3).map((level) => (
                            <div className="form_group" key={level}>
                                <div className="search_cont">
                                    <select
                                        name={level}
                                        required
                                        value={selectedHierarchy[level]}
                                        onChange={(e) =>
                                            handleHierarchyChange(
                                                level,
                                                e.target.value
                                            )
                                        }
                                        disabled={
                                            computed.levelOrder.indexOf(level) >
                                                0 &&
                                            !selectedHierarchy[
                                                computed.levelOrder[
                                                    computed.levelOrder.indexOf(
                                                        level
                                                    ) - 1
                                                ]
                                            ]
                                        }>
                                        <option value="">
                                            Select{' '}
                                            {level.charAt(0).toUpperCase() +
                                                level.slice(1)}
                                        </option>
                                        {getFilteredOptions(level).map(
                                            (option) => (
                                                <option
                                                    key={option.id}
                                                    value={option.id}>
                                                    {option.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                    <span className="icons icon_placement">
                                        <img
                                            src="icons/arrow-down.svg"
                                            alt="dropdown"
                                        />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="form_row">
                        {computed.levelOrder.slice(3).map((level) => (
                            <div className="form_group" key={level}>
                                <div className="search_cont">
                                    <select
                                        name={level}
                                        required
                                        value={selectedHierarchy[level]}
                                        onChange={(e) =>
                                            handleHierarchyChange(
                                                level,
                                                e.target.value
                                            )
                                        }
                                        disabled={
                                            !selectedHierarchy[
                                                computed.levelOrder[
                                                    computed.levelOrder.indexOf(
                                                        level
                                                    ) - 1
                                                ]
                                            ]
                                        }>
                                        <option value="">
                                            Select{' '}
                                            {level.charAt(0).toUpperCase() +
                                                level.slice(1)}
                                        </option>
                                        {getFilteredOptions(level).map(
                                            (option) => (
                                                <option
                                                    key={option.id}
                                                    value={option.id}>
                                                    {option.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                    <span className="icons icon_placement">
                                        <img
                                            src="icons/arrow-down.svg"
                                            alt="dropdown"
                                        />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="form_row">
                        <div className="form_group">
                            <div className="search_cont">
                                <input
                                    type="text"
                                    name="flat_no"
                                    value={formData.flat_no}
                                    onChange={handleInputChange}
                                    placeholder="Flat No"
                                />
                                <span className="icons icon_placement">
                                    <img src="icons/unit.svg" alt="unit" />
                                </span>
                            </div>
                        </div>
                        <div className="form_group">
                            <div className="search_cont">
                                <input
                                    type="text"
                                    name="meter_serial"
                                    value={formData.meter_serial}
                                    onChange={handleInputChange}
                                    placeholder="Meter No"
                                    required
                                />
                                <span className="icons icon_placement">
                                    <img src="icons/unit.svg" alt="unit" />
                                </span>
                            </div>
                        </div>
                        <div className="form_group">
                            <div className="search_cont">
                                <input
                                    type="text"
                                    name="consumer_id"
                                    value={formData.consumer_id}
                                    onChange={handleInputChange}
                                    placeholder="Consumer ID"
                                    required
                                />
                                <span className="icons icon_placement">
                                    <img src="icons/type.svg" alt="type" />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="form_row">
                        <div className="form_group">
                            <div className="search_cont">
                                <input
                                    type="text"
                                    name="consumer_name"
                                    value={formData.consumer_name}
                                    onChange={handleInputChange}
                                    placeholder="Consumer Name"
                                    required
                                />
                                <span className="icons icon_placement">
                                    <img src="icons/type.svg" alt="type" />
                                </span>
                            </div>
                        </div>
                        <div className="form_group">
                            <div className="search_cont">
                                <select
                                    name="consumer_type"
                                    value={formData.consumer_type}
                                    onChange={handleInputChange}
                                    required>
                                    <option value="">Consumer Type</option>
                                    <option value="residential">
                                        Residential
                                    </option>
                                    <option value="commercial">
                                        Commercial
                                    </option>
                                    <option value="industrial">
                                        Industrial
                                    </option>
                                    <option value="sez">SEZ</option>
                                </select>
                                <span className="icons icon_placement">
                                    <img
                                        src="icons/arrow-down.svg"
                                        alt="dropdown"
                                    />
                                </span>
                            </div>
                        </div>
                        <div className="form_group">
                            <div className="search_cont">
                                <select
                                    name="meter_type"
                                    value={formData.meter_type}
                                    onChange={handleInputChange}
                                    required>
                                    <option value="">Meter Type</option>
                                    <option value="postpaid">Postpaid</option>
                                    <option value="prepaid">Prepaid</option>
                                </select>
                                <span className="icons icon_placement">
                                    <img
                                        src="icons/arrow-down.svg"
                                        alt="dropdown"
                                    />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="form_row">
                        <div className="form_group">
                            <div className="search_cont">
                                <input
                                    type="tel"
                                    name="mobile_number"
                                    value={formData.mobile_number}
                                    onChange={handleInputChange}
                                    placeholder="Mobile Number"
                                    required
                                />
                                <span className="icons icon_placement">
                                    <img src="icons/phone.svg" alt="phone" />
                                </span>
                            </div>
                        </div>
                        <div className="form_group">
                            <div className="search_cont">
                                <input
                                    type="email"
                                    name="email_address"
                                    value={formData.email_address}
                                    onChange={handleInputChange}
                                    placeholder="Email Address"
                                    required
                                />
                                <span className="icons icon_placement">
                                    <img src="icons/email.svg" alt="email" />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="form_row">
                        <div className="form_group">
                            <div className="search_cont">
                                <textarea
                                    name="permanent_address"
                                    value={formData.permanent_address}
                                    onChange={handleInputChange}
                                    placeholder="Permanent Address"
                                    required
                                    rows="3"
                                    className="w-full p-2"></textarea>
                            </div>
                        </div>
                        <div className="form_group">
                            <div className="search_cont">
                                <textarea
                                    name="billing_address"
                                    value={formData.billing_address}
                                    onChange={handleInputChange}
                                    placeholder="Billing Address"
                                    required
                                    rows="3"
                                    className="w-full p-2"></textarea>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.units_header}>
                <h1 className="title">
                    {showAddUnit
                        ? 'Add Consumer'
                        : searchParams.get('communicationStatus') ===
                          'communicating'
                        ? 'Communicating Consumers'
                        : searchParams.get('communicationStatus') ===
                          'non-communicating'
                        ? 'Non-Communicating Consumers'
                        : 'All Consumers'}
                </h1>
                <div className="header_actions">
                    {!showAddUnit && (
                        <>
                            {searchParams.get('communicationStatus') && (
                                <Buttons
                                    label="Show All"
                                    variant="outline"
                                    onClick={() => {
                                        const newParams = new URLSearchParams(
                                            searchParams
                                        );
                                        newParams.delete('communicationStatus');
                                        setSearchParams(newParams);
                                    }}
                                    icon="icons/list.svg"
                                    iconPosition="left"
                                />
                            )}
                            <Buttons
                                label="Add Consumer"
                                variant="primary"
                                icon="icons/plus.svg"
                                iconPosition="left"
                                onClick={() => setShowAddUnit(true)}
                            />
                        </>
                    )}
                    {showAddUnit && (
                        <div className={styles.action_buttons}>
                            <Buttons
                                label="Cancel"
                                variant="outline"
                                onClick={() => setShowAddUnit(false)}
                                icon="icons/cancel.svg"
                                iconPosition="left"
                            />
                            <Buttons
                                label="Save"
                                variant="primary"
                                type="button"
                                icon="icons/update.svg"
                                iconPosition="left"
                                onClick={handleSubmit}
                            />
                        </div>
                    )}
                </div>
            </div>

            {showAddUnit ? (
                renderAddUnitForm()
            ) : (
                <div className={styles.units_table_container}>
                    <Table
                        data={units}
                        columns={[
                            { key: 's_no', label: 'S.No' },
                            { key: 'uid', label: 'UID' },
                            { key: 'consumer_id', label: 'Consumer ID' },
                            {
                                key: 'consumer_name',
                                label: 'Consumer Name',
                                render: (name) => removeInitials(name),
                            },
                            { key: 'block_name', label: 'Block Name' },
                            { key: 'flat_no', label: 'Flat No' },
                            {
                                key: 'meter_serial',
                                label: 'Meter No',
                                render: (meterNo, row) => (
                                    <div className={styles.meter_status}>
                                        <span
                                            className={`${
                                                styles.status_indicator
                                            } ${
                                                row.is_communicating
                                                    ? styles.communicating
                                                    : styles.non_communicating
                                            }`}
                                        />
                                        {meterNo}
                                    </div>
                                ),
                            },
                            { key: 'consumer_type', label: 'Consumer Type' },
                            { key: 'meter_type', label: 'Meter Type' },
                        ]}
                        sortable={true}
                        searchable={true}
                        loading={loading}
                        pagination={true}
                        emptyMessage="No units found"
                        rowsPerPageOptions={[5, 10, 50]}
                        initialRowsPerPage={10}
                        serverPagination={pagination}
                        onPageChange={handlePageChange}
                        onView={(row) => handleView(row.uid)}
                        onRowClick={(row) => handleView(row.uid)}
                        onSearch={handleSearch}
                        text="Consumer"
                    />
                </div>
            )}
        </div>
    );
};

export default Consumers;
