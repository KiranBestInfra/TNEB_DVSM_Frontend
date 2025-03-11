import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from '../styles/ConTickets.module.css';
import Table from '../components/ui/Table/Tables';
import Buttons from '../components/ui/Buttons/Buttons';

const ConTickets = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([
        {
            ticket_id: 'TKT001',
            title: 'Billing Discrepancy',
            category: 'Billing',
            priority: 'High',
            status: 'Open',
            created_at: '2024-03-15',
            last_updated: '2024-03-16'
        },
        {
            ticket_id: 'TKT002',
            title: 'Meter Reading Issue',
            category: 'Meter Issue',
            priority: 'Medium',
            status: 'Closed',
            created_at: '2024-02-20',
            last_updated: '2024-02-22'
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const [ticketStats, setTicketStats] = useState({
        totalTickets: 5,
        openTickets: 2,
        inProgressTickets: 1,
        resolvedTickets: 1,
        closedTickets: 1,
        lastMonthTotalTickets: 3,
        averageResponseTime: '24h',
        resolutionRate: '80'
    });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
        total: 0,
    });

    const updateUrlParams = (page, limit) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page);
        newParams.set('limit', limit);
        setSearchParams(newParams, { replace: true });
    };

    const handlePageChange = (page, limit) => {
        updateUrlParams(page, limit);
    };

    const handleAddTicket = () => {
        navigate('/user/tickets/new');
    };

    const handleViewTicket = (ticket) => {
        navigate(`/user/tickets/${ticket.ticket_id}`);
    };

    const renderStatCard = (title, value, icon, subtitle1, subtitle2, showTrend = false) => {
        let comparisonValue = value - ticketStats.lastMonthTotalTickets;

        return (
            <div className={styles.total_units_container}>
                <div className={styles.stat_card}>
                    <div className={styles.stat_card_left}>
                        <div className="titles">{title}</div>
                        <p className={styles.stat_number}>
                            {value}
                            {showTrend && (
                                <span className={comparisonValue > 0 ? 'icons_increased' : 'icons_decreased'}>
                                    <img
                                        src={comparisonValue > 0 ? 'icons/arrow-trend-up.svg' : 'icons/arrow-trend-down.svg'}
                                        alt={comparisonValue > 0 ? 'Trend Up' : 'Trend Down'}
                                    />
                                </span>
                            )}
                        </p>
                    </div>
                    <div className={styles.stat_card_right}>
                        <span className="icons">
                            <img src={icon} alt={`${title} Icon`} />
                        </span>
                    </div>
                </div>
                <div className={styles.active_units_container}>
                    {subtitle1 && <div className="sub_title">{subtitle1}</div>}
                    {subtitle2 && <div className="sub_title">{subtitle2}</div>}
                </div>
            </div>
        );
    };

    const columns = [
        { key: 'ticket_id', label: 'Ticket ID' },
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'priority', label: 'Priority' },
        {
            key: 'status',
            label: 'Status',
            render: (status) => {
                const statusMap = {
                    'Open': <span className={styles.status_open}>Open</span>,
                    'In Progress': <span className={styles.status_progress}>In Progress</span>,
                    'Resolved': <span className={styles.status_resolved}>Resolved</span>,
                    'Closed': <span className={styles.status_closed}>Closed</span>
                };
                return statusMap[status] || status;
            }
        },
        {
            key: 'created_at',
            label: 'Created Date',
            render: (value) => new Date(value).toLocaleDateString()
        },
        {
            key: 'last_updated',
            label: 'Last Updated',
            render: (value) => new Date(value).toLocaleDateString()
        }
    ];

    return (
        <div className={styles.tickets_container}>
            {error && (
                <div className="error">
                    <span className="error_icon">
                        <img src="icons/error-mark.svg" alt="warning" />
                    </span>
                    {error}
                </div>
            )}

            <div className={styles.header_section}>
                <h1 className="title">Support Ticket</h1>
                <Buttons
                    label="New Ticket"
                    onClick={handleAddTicket}
                    variant="primary"
                    icon="icons/plus.svg"
                />
            </div>

            <div className={styles.stats_section}>
                {renderStatCard(
                    'Total Tickets',
                    ticketStats.totalTickets,
                    'icons/support-tickets.svg',
                    `${ticketStats.lastMonthTotalTickets} Last Month`,
                    null,
                    true
                )}
                {renderStatCard(
                    'Open Tickets',
                    ticketStats.openTickets,
                    'icons/envelope-open.svg',
                    `Average Response: ${ticketStats.averageResponseTime}`,
                    null
                )}
                {renderStatCard(
                    'In Progress',
                    ticketStats.inProgressTickets,
                    'icons/progress-complete.svg',
                    'Being Processed',
                    null
                )}
                {renderStatCard(
                    'Resolved',
                    ticketStats.resolvedTickets,
                    'icons/list-check.svg',
                    `Resolution Rate: ${ticketStats.resolutionRate}%`,
                    null
                )}
                {renderStatCard(
                    'Closed',
                    ticketStats.closedTickets,
                    'icons/closed-ticket.svg',
                    'Permanently Closed',
                    null
                )}
            </div>

            <div className={styles.table_section}>
                <Table
                    data={tickets}
                    columns={columns}
                    onView={handleViewTicket}
                    loading={isLoading}
                    sortable={true}
                    searchable={true}
                    pagination={true}
                    serverPagination={pagination}
                    emptyMessage="No tickets found"
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default ConTickets;