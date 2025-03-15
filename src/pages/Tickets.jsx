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
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterRegion, setFilterRegion] = useState('all');
    const [filterDistrict, setFilterDistrict] = useState('all');

    // Mock data for tickets
    const mockTickets = [
        {
            id: 'TKT-001',
            subject: 'Meter not communicating',
            category: 'Technical Issue',
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
            category: 'Data Issue',
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
        // Simulating API call with setTimeout
        const fetchTickets = () => {
            setLoading(true);
            setTimeout(() => {
                let filteredTickets = [...mockTickets];

                // Apply filters
                if (filterStatus !== 'all') {
                    filteredTickets = filteredTickets.filter(ticket => ticket.status === filterStatus);
                }
                if (filterCategory !== 'all') {
                    filteredTickets = filteredTickets.filter(ticket => ticket.category === filterCategory);
                }
                if (filterRegion !== 'all') {
                    filteredTickets = filteredTickets.filter(ticket => ticket.region === filterRegion);
                }
                if (filterDistrict !== 'all') {
                    filteredTickets = filteredTickets.filter(ticket => ticket.district === filterDistrict);
                }

                // Default sort by latest updated date
                filteredTickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

                setTickets(filteredTickets);
                setTotalPages(Math.ceil(filteredTickets.length / 10));
                setLoading(false);
            }, 500);
        };

        fetchTickets();
    }, [filterStatus, filterCategory, filterRegion, filterDistrict]);

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

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
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

    return (
        <div className={styles.tickets_container}>
            <div className={styles.tickets_header}>
                <h1 className='title'>Support Tickets</h1>
                <Buttons
                    label="Create New Ticket"
                    variant="primary"
                    onClick={handleCreateTicket}
                    icon="/icons/plus.svg"
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

            <div className={styles.tickets_filters}>
                <div className={styles.filter_item}>
                    <select
                        value={filterStatus}
                        onChange={handleFilterChange}
                        className={styles.select_with_arrow}
                    >
                        <option value="all">Select Status</option>
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

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