import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import styles from '../styles/TicketDetails.module.css';
import Buttons from '../components/ui/Buttons/Buttons';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNewTicket = id === 'new';

    const [loading, setLoading] = useState(!isNewTicket);
    const [ticket, setTicket] = useState(null);
    const [activities, setActivities] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [statusChange, setStatusChange] = useState('');

    useEffect(() => {
        if (!isNewTicket) {
            const fetchTicket = async () => {
                try {
                    setLoading(true);
                    const res = await apiClient.get(`/tickets/${id}`);
                    const data = res.data;
                    const formattedTicket = {
                        id: data.TicketId,
                        subject: data.Subject,
                        description: data.Description,
                        status: data.Status.toLowerCase(),
                        priority: data.Priority.toLowerCase(),
                        category: data.Category.toLowerCase(),
                        region: data.Region,
                        createdAt: data.CreatedAt || new Date().toISOString(),
                        updatedAt: data.LastUpdated || new Date().toISOString(),
                        createdBy: data.ConsumerName || 'User',
                    };

                    setTicket(formattedTicket);
                } catch (err) {
                    console.error('Failed to fetch ticket:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchTicket();
        }
    }, [id, isNewTicket]);

    const handleStatusChange = async (e) => {
        e.preventDefault();

        if (!statusChange || !ticket || statusChange === ticket.status) return;

        try {
            const res = await apiClient.patch(`/tickets/${ticket.id}`, {
                Status:
                    statusChange.charAt(0).toUpperCase() +
                    statusChange.slice(1),
            });

            const updatedStatus = res.data.Status.toLowerCase();

            // Update UI state
            setTicket((prev) => ({
                ...prev,
                status: updatedStatus,
                updatedAt: new Date().toISOString(),
            }));

            const newActivity = {
                id: activities.length + 1,
                type: 'status',
                author: 'Admin User',
                text: `Ticket status changed to "${updatedStatus}"`,
                timestamp: new Date().toISOString(),
            };

            setActivities((prev) => [...prev, newActivity]);
            setStatusChange('');
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleSubmitReply = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        const newActivity = {
            id: activities.length + 1,
            type: 'comment',
            author: 'Admin User',
            text: replyText,
            timestamp: new Date().toISOString(),
        };

        setActivities((prev) => [...prev, newActivity]);
        setReplyText('');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!ticket) {
        return <div className={styles.loading}>Ticket not found.</div>;
    }

    return (
        <div className={styles.ticket_details_container}>
            <div className={styles.ticket_header}>
                <div className={styles.header_right}>
                    <span
                        className={`${styles.back_arrow} ${styles.icon_hover}`}
                        onClick={() => navigate('/admin/tickets')}>
                        <img src="icons/arrow-down.svg" alt="Back" />
                    </span>
                    <div>
                        <h1 className="title">{ticket.subject}</h1>
                        <div className={styles.ticket_id}>
                            Ticket ID: {ticket.id}
                        </div>
                    </div>
                </div>

                <div className={styles.ticket_actions}>
                    <div className={styles.status_dropdown_container}>
                        <label className={styles.status_dropdown_label}>
                            Ticket Status:
                        </label>
                        <select
                            className={styles.status_dropdown}
                            value={statusChange || ticket.status}
                            onChange={(e) => setStatusChange(e.target.value)}>
                            <option value="open">Open</option>
                            <option value="pending">Pending</option>
                            <option value="closed">Closed</option>
                        </select>
                        {statusChange && statusChange !== ticket.status && (
                            <Buttons
                                label="Update"
                                variant="primary"
                                onClick={handleStatusChange}
                                size="small"
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.ticket_layout}>
                <div className={styles.ticket_main}>
                    <div className={styles.ticket_description}>
                        <h2 className={styles.activity_title}>Description</h2>
                        <div className={styles.description_content}>
                            {ticket.description}
                        </div>
                    </div>

                    <div className={styles.ticket_activities}>
                        <h2 className={styles.activity_title}>Activity</h2>
                        <div className={styles.activity_list}>
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className={styles.activity_item}>
                                    <div className={styles.activity_avatar}>
                                        {activity.author.charAt(0)}
                                    </div>
                                    <div className={styles.activity_content}>
                                        <div className={styles.activity_header}>
                                            <span
                                                className={
                                                    styles.activity_author
                                                }>
                                                {activity.author}
                                            </span>
                                            <span
                                                className={
                                                    styles.activity_time
                                                }>
                                                {formatDate(activity.timestamp)}
                                            </span>
                                        </div>
                                        <div className={styles.activity_text}>
                                            {activity.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.reply_form}>
                        <h2 className={styles.reply_title}>Add Reply</h2>
                        <form onSubmit={handleSubmitReply}>
                            <div className={styles.form_group}>
                                <textarea
                                    className={styles.form_textarea}
                                    value={replyText}
                                    onChange={(e) =>
                                        setReplyText(e.target.value)
                                    }
                                    placeholder="Type your reply here..."
                                    required
                                />
                            </div>
                            <Buttons
                                label="Post Reply"
                                variant="primary"
                                type="submit"
                            />
                        </form>
                    </div>
                </div>

                <div className={styles.ticket_sidebar}>
                    <div className={styles.ticket_info_card}>
                        <div className={styles.card_title}>
                            <h3>Ticket Information</h3>
                        </div>
                        <div className={styles.info_row}>
                            <span className={styles.info_label}>Status:</span>
                            <span
                                className={`${styles.status_badge} ${
                                    styles[`status_${ticket.status}`]
                                }`}>
                                {ticket.status}
                            </span>
                        </div>
                        <div className={styles.info_row}>
                            <span className={styles.info_label}>Priority:</span>
                            <span>{ticket.priority}</span>
                        </div>
                        <div className={styles.info_row}>
                            <span className={styles.info_label}>Category:</span>
                            <span>{ticket.category}</span>
                        </div>
                        <div className={styles.info_row}>
                            <span className={styles.info_label}>Region:</span>
                            <span>{ticket.region}</span>
                        </div>
                        <div className={styles.info_row}>
                            <span className={styles.info_label}>Created:</span>
                            <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                        <div className={styles.info_row}>
                            <span className={styles.info_label}>
                                Last Updated:
                            </span>
                            <span>{formatDate(ticket.updatedAt)}</span>
                        </div>
                        <div className={styles.info_row}>
                            <span className={styles.info_label}>
                                Created By:
                            </span>
                            <span>{ticket.createdBy}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
