import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from '../styles/Tickets.module.css';
import Table from '../components/ui/Table/Tables';
import Buttons from '../components/ui/Buttons/Buttons';
import BarChart from '../components/graphs/BarChart/BarChart';
import { apiClient } from '../api/client';
import WidgetSkeleton from '../components/ui/WidgetSkeleton/WidgetSkeleton';
import {
    parseFloatFixed,
    parseInteger,
    parseNumber,
} from '../utils/globalUtils';
import { useAuth } from '../components/AuthProvider';

const Tickets = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isStatLoading, setIsStatsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [ticketStats, setTicketStats] = useState({
        totalTickets: 0,
        openTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0,
        closedTickets: 0,
        lastMonthTotalTickets: 0,
        averageResponseTime: '0',
        customerSatisfaction: 'N/A',
        resolutionRateOfResolvedTickets: '0',
        ClosureRateOfClosedtickets: '0',
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

    const [ticketChartData, setTicketChartData] = useState({
        xAxisData: [],
        seriesData: [],
    });

    const { isAdmin } = useAuth();
    const basePath = isAdmin() ? '/admin' : '/user';

    const formatResponseTime = (timeInSeconds) => {
        const hours = (timeInSeconds / 3600).toFixed(1);
        return `${hours}h`;
    };

    const fetchWidgets = async () => {
        try {
            setIsStatsLoading(true);
            const response = await apiClient.get('/tickets/widgets');

            if (response.status === 'success') {
                const data = response.data[0];
                setTicketStats({
                    totalTickets: parseInteger(data.totalTickets),
                    openTickets: parseInteger(data.openTickets),
                    inProgressTickets: parseInteger(data.inProgressTickets),
                    resolvedTickets: parseInteger(data.resolvedTickets),
                    closedTickets: parseInteger(data.closedTickets),
                    lastMonthTotalTickets: parseInteger(
                        data.lastMonthTotalTickets
                    ),
                    averageResponseTime: formatResponseTime(
                        parseInteger(data.averageResponseTime)
                    ),
                    customerSatisfaction: data.customerSatisfaction
                        ? data.customerSatisfaction
                        : 'N/A',
                    resolutionRateOfResolvedTickets: parseFloatFixed(
                        data.resolutionRateOfResolvedTickets
                    ),
                    ClosureRateOfClosedtickets: parseFloatFixed(
                        data.ClosureRateOfClosedtickets
                    ),
                });
            }
        } catch (err) {
            console.error('Error fetching table data:', err);
        } finally {
            setIsStatsLoading(false);
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

    const fetchTicketTrends = async () => {
        try {
            const response = await apiClient.get('/tickets/trends');
            if (response.status === 'success') {
                setTicketChartData(response.data);
            }
        } catch (error) {
            console.error('Error fetching ticket trends:', error);
            setError('Failed to fetch ticket trends');
        }
    };

    const fetchTickets = async (page, limit) => {
        try {
            setIsLoading(true);
            const response = await apiClient.get(
                `/tickets?page=${page}&limit=${limit}`
            );
            if (response.status === 'success') {
                setTickets(response.data.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            setError('Failed to fetch tickets');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWidgets();
        fetchTicketTrends();
    }, []);

    useEffect(() => {
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;

        fetchTickets(page, limit);
    }, [searchParams]);

    const handleAddTicket = () => {
        navigate(`${basePath}/tickets/new`);
    };

    const handleViewTicket = (ticket) => {
        navigate(`${basePath}/tickets/${ticket.ticket_id}`);
    };

    const handleReplyTicket = (ticket) => {
        navigate(`${basePath}/tickets/${ticket.ticket_id}`);
    };

    const renderStatCard = (
        title,
        value,
        icon,
        subtitle1,
        subtitle2,
        showTrend = false
    ) => {
        let comparisonValue = value - ticketStats.lastMonthTotalTickets;

        return (
            <div className={styles.total_units_container}>
                <div className={styles.stat_card}>
                    <div className={styles.stat_card_left}>
                        <div className="titles">{title}</div>
                        <p className={styles.stat_number}>
                            {value}
                            {showTrend && (
                                <span
                                    className={
                                        comparisonValue > 0
                                            ? 'icons_increased'
                                            : 'icons_decreased'
                                    }>
                                    <img
                                        src={
                                            comparisonValue > 0
                                                ? 'icons/arrow-trend-up.svg'
                                                : 'icons/arrow-trend-down.svg'
                                        }
                                        alt={
                                            comparisonValue > 0
                                                ? 'Trend Up'
                                                : 'Trend Down'
                                        }
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
        { key: 'consumer_name', label: 'Consumer Name' },
        { key: 'consumer_id', label: 'Consumer ID' },
        { key: 'mobile', label: 'Mobile' },
        { key: 'email', label: 'Email' },
        { key: 'category', label: 'Category' },
        { key: 'priority', label: 'Priority' },
        { key: 'status', label: 'Status' },
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
                <h1 className="title"></h1>
                <Buttons
                    label="Add Ticket"
                    onClick={handleAddTicket}
                    variant="primary"
                    icon="icons/plus.svg"
                />
            </div>
            {isStatLoading ? (
                <div className={styles.stats_section}>
                    <WidgetSkeleton />
                    <WidgetSkeleton />
                    <WidgetSkeleton />
                    <WidgetSkeleton />
                    <WidgetSkeleton />
                </div>
            ) : (
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
                        `Average Response Time: ${ticketStats.averageResponseTime}`,
                        null,
                        true
                    )}
                    {renderStatCard(
                        'In Progress Tickets',
                        ticketStats.inProgressTickets,
                        'icons/progress-complete.svg',
                        `Customer Satisfaction: ${ticketStats.customerSatisfaction}`,
                        null,
                        true
                    )}
                    {renderStatCard(
                        'Resolved Tickets',
                        ticketStats.resolvedTickets,
                        'icons/list-check.svg',
                        `Resolution Rate: ${ticketStats.resolutionRateOfResolvedTickets}%`,
                        null,
                        true
                    )}
                    {renderStatCard(
                        'Closed Tickets',
                        ticketStats.closedTickets,
                        'icons/closed.svg',
                        `Closure Rate: ${ticketStats.ClosureRateOfClosedtickets}%`,
                        null,
                        true
                    )}
                </div>
            )}

            <div className={styles.metrics_row}>
                <div className={styles.metrics}>
                    <BarChart
                        title="Ticket Status Trends"
                        xAxisData={ticketChartData.xAxisData}
                        seriesData={ticketChartData.seriesData}
                        height="400px"
                        timeRange="Monthly"
                    />
                </div>
            </div>

            <div className={styles.table_section}>
                <Table
                    data={tickets}
                    columns={columns}
                    onView={handleViewTicket}
                    onEdit={handleReplyTicket}
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

export default Tickets;
