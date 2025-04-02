import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import styles from '../styles/Tickets.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Table from '../components/ui/Table/Tables';

const BASE_URL = 'http://localhost:3000/api/v1/tickets';

const Tickets = () => {
    const navigate = useNavigate();
    const [allTickets, setAllTickets] = useState([]);
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

    const mockEDCs = [
        { id: 'EDC001', name: 'Chennai EDC' },
        { id: 'EDC002', name: 'Coimbatore EDC' },
        { id: 'EDC003', name: 'Madurai EDC' },
        { id: 'EDC004', name: 'Trichy EDC' },
        { id: 'EDC005', name: 'Salem EDC' },
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
        { id: 'SS010', name: 'Fairlands SS', edcId: 'EDC005' },
    ];

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get('/tickets');
                setAllTickets(res.data);
            } catch (error) {
                console.error('Failed to fetch tickets:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    useEffect(() => {
        let filtered = [...allTickets];

        if (filterCategory !== 'all')
            filtered = filtered.filter((t) => t.Category === filterCategory);
        if (filterRegion !== 'all')
            filtered = filtered.filter((t) => t.Region === filterRegion);
        if (filterDistrict !== 'all')
            filtered = filtered.filter((t) => t.District === filterDistrict);
        if (filterEDC !== 'all')
            filtered = filtered.filter((t) => t.edcId === filterEDC);
        if (filterSubstation !== 'all')
            filtered = filtered.filter(
                (t) => t.substationId === filterSubstation
            );
        if (filterFeeder !== 'all')
            filtered = filtered.filter((t) => t.feederId === filterFeeder);

        filtered.sort(
            (a, b) => new Date(b.LastUpdated) - new Date(a.LastUpdated)
        );
        setTickets(filtered);
        setTotalPages(Math.ceil(filtered.length / 10));
    }, [
        allTickets,
        filterCategory,
        filterRegion,
        filterDistrict,
        filterEDC,
        filterSubstation,
        filterFeeder,
    ]);

    const handleCreateTicket = () => navigate('/admin/tickets/new');
    const handleViewTicket = (ticketId) =>
        navigate(`/admin/tickets/${ticketId}`);

    const handleDeleteTicket = async (ticket) => {
        try {
            await apiClient.delete(`/tickets/${ticket.TicketId}`);
            setAllTickets((prev) =>
                prev.filter((t) => t.TicketId !== ticket.TicketId)
            );
        } catch (error) {
            console.error('Error deleting ticket:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return (
            date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }) +
            ' ' +
            date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
            })
        );
    };

    const tableColumns = [
        {
            key: 'sNo',
            label: 'S.No',
            render: (_, row) =>
                tickets.findIndex((t) => t.TicketId === row.TicketId) + 1,
        },
        { key: 'TicketId', label: 'Ticket ID' },
        { key: 'Subject', label: 'Subject' },
        { key: 'Category', label: 'Category' },
        { key: 'Description', label: 'Description' },
        { key: 'Region', label: 'Region' },
        { key: 'District', label: 'District' },
        {
            key: 'Status',
            label: 'Status',
            render: (value) => (
                <span
                    className={`${styles.status_badge} ${
                        styles[`status_${value.toLowerCase()}`]
                    }`}>
                    {value}
                </span>
            ),
        },
        {
            key: 'LastUpdated',
            label: 'Last Updated',
            render: formatDate,
        },
    ];

    const getUnique = (key) => [
        ...new Set(allTickets.map((t) => t[key]).filter(Boolean)),
    ];
    const getFilteredSubstations = () =>
        filterEDC === 'all'
            ? mockSubstations
            : mockSubstations.filter((s) => s.edcId === filterEDC);

    return (
        <div className={styles.tickets_container}>
            <div className={styles.tickets_header}>
                <h1 className="title">Support Tickets</h1>
                <Buttons
                    label="Create New Ticket"
                    variant="primary"
                    onClick={handleCreateTicket}
                    icon="icons/plus.svg"
                />
            </div>

            {/* Dashboard */}
            <div className={styles.dashboard}>
                <div className={`${styles.widget} ${styles.widget_total}`}>
                    <div className={styles.widget_value}>
                        {allTickets.length}
                    </div>
                    <div className={styles.widget_label}>Total Tickets</div>
                </div>
                <div className={`${styles.widget} ${styles.widget_open}`}>
                    <div className={styles.widget_value}>
                        {
                            allTickets.filter(
                                (t) => t.Status.toLowerCase() === 'open'
                            ).length
                        }
                    </div>
                    <div className={styles.widget_label}>Open Tickets</div>
                </div>
                <div className={`${styles.widget} ${styles.widget_pending}`}>
                    <div className={styles.widget_value}>
                        {
                            allTickets.filter(
                                (t) => t.Status.toLowerCase() === 'pending'
                            ).length
                        }
                    </div>
                    <div className={styles.widget_label}>Pending Tickets</div>
                </div>
                <div className={`${styles.widget} ${styles.widget_closed}`}>
                    <div className={styles.widget_value}>
                        {
                            allTickets.filter(
                                (t) => t.Status.toLowerCase() === 'closed'
                            ).length
                        }
                    </div>
                    <div className={styles.widget_label}>Closed Tickets</div>
                </div>
                <div className={`${styles.widget} ${styles.widget_critical}`}>
                    <div className={styles.widget_value}>
                        {
                            allTickets.filter(
                                (t) => t.Priority.toLowerCase() === 'critical'
                            ).length
                        }
                    </div>
                    <div className={styles.widget_label}>Critical Tickets</div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.tickets_filters}>
                <div className={styles.filter_item}>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className={styles.select_with_arrow}>
                        <option value="all">Select Category</option>
                        {getUnique('Category').map((val) => (
                            <option key={val} value={val}>
                                {val}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.filter_item}>
                    <select
                        value={filterRegion}
                        onChange={(e) => setFilterRegion(e.target.value)}
                        className={styles.select_with_arrow}>
                        <option value="all">Select Region</option>
                        {getUnique('Region').map((val) => (
                            <option key={val} value={val}>
                                {val}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.filter_item}>
                    <select
                        value={filterDistrict}
                        onChange={(e) => setFilterDistrict(e.target.value)}
                        className={styles.select_with_arrow}>
                        <option value="all">Select District</option>
                        {getUnique('District').map((val) => (
                            <option key={val} value={val}>
                                {val}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.filter_item}>
                    <select
                        value={filterEDC}
                        onChange={(e) => {
                            setFilterEDC(e.target.value);
                            setFilterSubstation('all');
                        }}
                        className={styles.select_with_arrow}>
                        <option value="all">Select EDC</option>
                        {mockEDCs.map((edc) => (
                            <option key={edc.id} value={edc.id}>
                                {edc.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.filter_item}>
                    <select
                        value={filterSubstation}
                        onChange={(e) => {
                            setFilterSubstation(e.target.value);
                            setFilterFeeder('all');
                        }}
                        className={styles.select_with_arrow}>
                        <option value="all">Select Substation</option>
                        {getFilteredSubstations().map((sub) => (
                            <option key={sub.id} value={sub.id}>
                                {sub.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.filter_item}>
                    <select
                        value={filterFeeder}
                        onChange={(e) => setFilterFeeder(e.target.value)}
                        className={styles.select_with_arrow}
                        disabled>
                        <option value="all">Select Feeder</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading tickets...</div>
            ) : tickets.length === 0 ? (
                <div className={styles.empty_state}>
                    <div className={styles.empty_state_title}>
                        No tickets found
                    </div>
                    <div className={styles.empty_state_message}>
                        There are no tickets matching your current filters
                    </div>
                </div>
            ) : (
                <Table
                    data={tickets}
                    columns={tableColumns}
                    loading={loading}
                    emptyMessage="No tickets found"
                    onRowClick={null}
                    onView={(ticket) => handleViewTicket(ticket.TicketId)}
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
