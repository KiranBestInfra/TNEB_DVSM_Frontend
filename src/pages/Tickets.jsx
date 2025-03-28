import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Tickets.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Table from '../components/ui/Table/Tables';

const Tickets = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterRegion, setFilterRegion] = useState('all');
    const [filterDistrict, setFilterDistrict] = useState('all');
    const [filterEDC, setFilterEDC] = useState('all');
    const [filterSubstation, setFilterSubstation] = useState('all');
    const [filterFeeder, setFilterFeeder] = useState('all');

    // Mock data for EDCs, Substations, and Feeders
    const mockEDCs = [
        { id: 'EDC001', name: 'Chennai EDC' },
        { id: 'EDC002', name: 'Coimbatore EDC' },
        { id: 'EDC003', name: 'Madurai EDC' },
        { id: 'EDC004', name: 'Trichy EDC' },
        { id: 'EDC005', name: 'Salem EDC' }
    ];

    const mockSubstations = [
        { id: 'SS001', name: 'Anna Nagar SS', edcId: 'EDC001' },
        { id: 'SS002', name: 'T Nagar SS', edcId: 'EDC001' },
        { id: 'SS003', name: 'Gandhipuram SS', edcId: 'EDC002' },
        { id: 'SS004', name: 'Race Course SS', edcId: 'EDC002' },
        { id: 'SS005', name: 'Goripalayam SS', edcId: 'EDC003' },
        { id: 'SS006', name: 'Thirunagar SS', edcId: 'EDC003' },
        { id: 'SS007', name: 'Srirangam SS', edcId: 'EDC004' },
        { id: 'SS008', name: 'Woraiyur SS', edcId: 'EDC004' },
        { id: 'SS009', name: 'Hasthampatti SS', edcId: 'EDC005' },
        { id: 'SS010', name: 'Fairlands SS', edcId: 'EDC005' }
    ];

    // Mock data for tickets
    const mockTickets = [
        {
            id: 'TKT-001',
            subject: 'Meter not communicating',
            category: 'General Issue',
            description: 'Customer reported that their smart meter stopped sending readings for the last 3 days.',
            status: 'open',
            priority: 'high',
            createdAt: '2024-03-10T10:30:00',
            updatedAt: '2024-03-10T14:15:00',
            assignedTo: 'John Smith',
            region: 'Chennai',
            district: 'Chennai Central'
        },
        {
            id: 'TKT-002',
            subject: 'Billing discrepancy for March',
            category: 'Billing Problem',
            description: 'Customer claims they were overcharged in their last billing cycle compared to actual usage.',
            status: 'pending',
            priority: 'medium',
            createdAt: '2024-03-08T09:45:00',
            updatedAt: '2024-03-09T11:20:00',
            assignedTo: 'Mary Johnson',
            region: 'Coimbatore',
            district: 'Coimbatore North'
        },
        {
            id: 'TKT-003',
            subject: 'Connection failure at substation',
            category: 'Connection Problem',
            description: 'Multiple customers reporting power outages in the southern sector of Madurai East.',
            status: 'closed',
            priority: 'critical',
            createdAt: '2024-03-05T14:20:00',
            updatedAt: '2024-03-07T16:30:00',
            assignedTo: 'Robert Davis',
            region: 'Madurai',
            district: 'Madurai East'
        },
        {
            id: 'TKT-004',
            subject: 'Data synchronization issue',
            category: 'Technical Issue',
            description: 'Meter readings not syncing with the central database for the last 24 hours.',
            status: 'open',
            priority: 'low',
            createdAt: '2024-03-12T08:15:00',
            updatedAt: '2024-03-12T10:45:00',
            assignedTo: 'Jennifer Wilson',
            region: 'Chennai',
            district: 'Chennai South'
        },
        {
            id: 'TKT-005',
            subject: 'API integration error',
            category: 'Integration Problem',
            description: 'Third-party payment gateway integration failing for customer payments since yesterday.',
            status: 'pending',
            priority: 'medium',
            createdAt: '2024-03-11T16:40:00',
            updatedAt: '2024-03-12T09:10:00',
            assignedTo: 'Michael Brown',
            region: 'Trichy',
            district: 'Trichy West'
        }
    ];

    useEffect(() => {
        // Get tickets from localStorage
        const fetchTickets = () => {
            setLoading(true);
            setTimeout(() => {
                // Get tickets from localStorage or use mock data if none exist
                let allTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
                
                // If no tickets in localStorage, use mock data and save it
                if (allTickets.length === 0) {
                    allTickets = mockTickets;
                    localStorage.setItem('tickets', JSON.stringify(mockTickets));
                }

                let filteredTickets = [...allTickets];

                if (filterCategory !== 'all') {
                    filteredTickets = filteredTickets.filter(ticket => ticket.category === filterCategory);
                }
                if (filterRegion !== 'all') {
                    filteredTickets = filteredTickets.filter(ticket => ticket.region === filterRegion);
                }
                if (filterDistrict !== 'all') {
                    filteredTickets = filteredTickets.filter(ticket => ticket.district === filterDistrict);
                }
                if (filterEDC !== 'all') {
                    filteredTickets = filteredTickets.filter(ticket => ticket.edcId === filterEDC);
                }
                if (filterSubstation !== 'all') {
                    filteredTickets = filteredTickets.filter(ticket => ticket.substationId === filterSubstation);
                }
                if (filterFeeder !== 'all') {
                    filteredTickets = filteredTickets.filter(ticket => ticket.feederId === filterFeeder);
                }

                // Default sort by latest updated date
                filteredTickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

                setTickets(filteredTickets);
                setTotalPages(Math.ceil(filteredTickets.length / 10));
                setLoading(false);
            }, 500);
        };

        fetchTickets();
    }, [filterCategory, filterRegion, filterDistrict, filterEDC, filterSubstation, filterFeeder]);

    const handleCreateTicket = () => {
        navigate('/admin/tickets/new');
    };

    const handleViewTicket = (ticketId) => {
        navigate(`/admin/tickets/${ticketId}`);
    };

    const handleDeleteTicket = (ticket) => {
        // In a real app, this would make an API call to delete the ticket
        console.log('Deleting ticket:', ticket.id);
        // For demo purposes, we're just showing what would happen
        alert(`Ticket ${ticket.id} would be deleted in a real application`);
    };

    const handleCategoryFilterChange = (e) => {
        setFilterCategory(e.target.value);
    };

    const handleRegionFilterChange = (e) => {
        setFilterRegion(e.target.value);
    };

    const handleDistrictFilterChange = (e) => {
        setFilterDistrict(e.target.value);
    };

    const handleEDCFilterChange = (e) => {
        setFilterEDC(e.target.value);
        setFilterSubstation('all');
        setFilterFeeder('all');
    };

    const handleSubstationFilterChange = (e) => {
        setFilterSubstation(e.target.value);
        setFilterFeeder('all');
    };

    const handleFeederFilterChange = (e) => {
        setFilterFeeder(e.target.value);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Format date to readable format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }) + ' ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Define table columns
    const tableColumns = [
        {
            key: 'sNo',
            label: 'S.No',
            render: (_, row) => {
                // Find the index of this ticket in the current filtered list
                const index = tickets.findIndex(ticket => ticket.id === row.id);
                return index + 1;
            }
        },
        { key: 'id', label: 'Ticket ID' },
        { key: 'subject', label: 'Subject' },
        { key: 'category', label: 'Category' },
        { key: 'description', label: 'Description' },
        { key: 'region', label: 'Region' },
        { key: 'district', label: 'District' },
        {
            key: 'status',
            label: 'Status',
            render: (value) => (
                <span className={`${styles.status_badge} ${styles[`status_${value}`]}`}>
                    {value}
                </span>
            )
        },
        {
            key: 'updatedAt',
            label: 'Last Updated',
            render: (value) => formatDate(value)
        },
    ];

    // Get unique values for filter dropdowns
    const getUniqueCategories = () => {
        return [...new Set(mockTickets.map(ticket => ticket.category))];
    };

    const getUniqueRegions = () => {
        return [...new Set(mockTickets.map(ticket => ticket.region))];
    };

    const getUniqueDistricts = () => {
        return [...new Set(mockTickets.map(ticket => ticket.district))];
    };

    // Calculate statistics for widgets
    const getTotalTickets = () => mockTickets.length;

    const getOpenTickets = () =>
        mockTickets.filter(ticket => ticket.status === 'open').length;

    const getPendingTickets = () =>
        mockTickets.filter(ticket => ticket.status === 'pending').length;

    const getClosedTickets = () =>
        mockTickets.filter(ticket => ticket.status === 'closed').length;

    const getCriticalTickets = () =>
        mockTickets.filter(ticket => ticket.priority === 'critical').length;

    // Get filtered substations based on selected EDC
    const getFilteredSubstations = () => {
        if (filterEDC === 'all') return mockSubstations;
        return mockSubstations.filter(sub => sub.edcId === filterEDC);
    };

    return (
        <div className={styles.tickets_container}>
            <div className={styles.tickets_header}>
                <h1 className='title'>Support Tickets</h1>
                <Buttons
                    label="Create New Ticket"
                    variant="primary"
                    onClick={handleCreateTicket}
                    icon="icons/plus.svg"
                />
            </div>

            {/* Dashboard Widgets */}
            <div className={styles.dashboard}>
                <div className={`${styles.widget} ${styles.widget_total}`}>
                    <div className={styles.widget_value}>{getTotalTickets()}</div>
                    <div className={styles.widget_label}>Total Tickets</div>
                </div>

                <div className={`${styles.widget} ${styles.widget_open}`}>
                    <div className={styles.widget_value}>{getOpenTickets()}</div>
                    <div className={styles.widget_label}>Open Tickets</div>
                </div>

                <div className={`${styles.widget} ${styles.widget_pending}`}>
                    <div className={styles.widget_value}>{getPendingTickets()}</div>
                    <div className={styles.widget_label}>Pending Tickets</div>
                </div>

                <div className={`${styles.widget} ${styles.widget_closed}`}>
                    <div className={styles.widget_value}>{getClosedTickets()}</div>
                    <div className={styles.widget_label}>Closed Tickets</div>
                </div>

                <div className={`${styles.widget} ${styles.widget_critical}`}>
                    <div className={styles.widget_value}>{getCriticalTickets()}</div>
                    <div className={styles.widget_label}>Critical Tickets</div>
                </div>
            </div>
            {/* Tickets Filters */}
            <div className={styles.tickets_filters}>
             
                {/* Category Filter */}
                <div className={styles.filter_item}>
                    <select
                        value={filterCategory}
                        onChange={handleCategoryFilterChange}
                        className={styles.select_with_arrow}
                    >
                        <option value="all">Select Category</option>
                        {getUniqueCategories().map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                {/* Region Filter */}
                <div className={styles.filter_item}>
                    <select
                        value={filterRegion}
                        onChange={handleRegionFilterChange}
                        className={styles.select_with_arrow}
                    >
                        <option value="all">Select Region</option>
                        {getUniqueRegions().map(region => (
                            <option key={region} value={region}>{region}</option>
                        ))}
                    </select>
                </div>
                {/* District Filter */}
                <div className={styles.filter_item}>
                    <select
                        value={filterDistrict}
                        onChange={handleDistrictFilterChange}
                        className={styles.select_with_arrow}
                    >
                        <option value="all">Select District</option>
                        {getUniqueDistricts().map(district => (
                            <option key={district} value={district}>{district}</option>
                        ))}
                    </select>
                </div>

                {/* New EDC Filter */}
                <div className={styles.filter_item}>
                    <select
                        value={filterEDC}
                        onChange={handleEDCFilterChange}
                        className={styles.select_with_arrow}
                    >
                        <option value="all">Select EDC</option>
                        {mockEDCs.map(edc => (
                            <option key={edc.id} value={edc.id}>{edc.name}</option>
                        ))}
                    </select>
                </div>

                {/* New Substation Filter */}
                <div className={styles.filter_item}>
                    <select
                        value={filterSubstation}
                        onChange={handleSubstationFilterChange}
                        className={styles.select_with_arrow}
                    >
                        <option value="all">Select Substation</option>
                        {getFilteredSubstations().map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                    </select>
                </div>

                {/* New Feeder Filter */}
                <div className={styles.filter_item}>
                    <select
                        value={filterFeeder}
                        onChange={handleFeederFilterChange}
                        className={styles.select_with_arrow}
                        disabled={true}
                    >
                        <option value="all">Select Feeder</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading tickets...</div>
            ) : tickets.length === 0 ? (
                <div className={styles.empty_state}>
                    <div className={styles.empty_state_title}>No tickets found</div>
                    <div className={styles.empty_state_message}>
                        There are no tickets matching your current filters
                    </div>
                    <Buttons
                        label="Create a ticket"
                        variant="primary"
                        onClick={handleCreateTicket}
                    />
                </div>
            ) : (
                <Table
                    data={tickets}
                    columns={tableColumns}
                    loading={loading}
                    emptyMessage="No tickets found"
                    onRowClick={null}
                    onView={(ticket) => handleViewTicket(ticket.id)}
                    onDelete={handleDeleteTicket}
                    showActions={true}
                    pagination={true}
                    initialRowsPerPage={10}
                    sortable={true}
                    text="ticket"
                />
            )}
        </div>
    );
};

export default Tickets; 