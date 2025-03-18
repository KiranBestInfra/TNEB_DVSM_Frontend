import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from '../styles/TicketDetails.module.css';
import Buttons from '../components/ui/Buttons/Buttons';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNewTicket = id === 'new';

    const [loading, setLoading] = useState(!isNewTicket);
    const [ticket, setTicket] = useState(isNewTicket ? {
        subject: '',
        description: '',
        status: 'open',
        priority: 'medium',
        category: 'technical',
        region: ''
    } : null);

    const [activities, setActivities] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [statusChange, setStatusChange] = useState('');

    // Mock data
    const mockTicket = {
        id: 'TKT-001',
        subject: 'Meter not communicating',
        description: 'The smart meter at Chennai Central substation has stopped communicating data for the past 24 hours. Initial diagnostics show no hardware issues. We need assistance to resolve this connectivity problem to restore data flow.',
        status: 'open',
        priority: 'high',
        category: 'technical',
        createdAt: '2024-03-10T10:30:00',
        updatedAt: '2024-03-10T14:15:00',
        assignedTo: 'John Smith',
        region: 'Chennai',
        createdBy: 'Admin User'
    };

    const mockActivities = [
        {
            id: 1,
            type: 'comment',
            author: 'Admin User',
            text: 'I have created this ticket for the non-communicating meter at Chennai Central substation.',
            timestamp: '2024-03-10T10:30:00'
        },
        {
            id: 2,
            type: 'status',
            author: 'System',
            text: 'Ticket status changed from "New" to "Open"',
            timestamp: '2024-03-10T10:32:00'
        },
        {
            id: 3,
            type: 'assignment',
            author: 'System',
            text: 'Ticket assigned to John Smith',
            timestamp: '2024-03-10T10:45:00'
        },
        {
            id: 4,
            type: 'comment',
            author: 'John Smith',
            text: 'I\'m looking into this issue. Will conduct remote diagnostics first to see if we can identify the problem.',
            timestamp: '2024-03-10T11:20:00'
        },
        {
            id: 5,
            type: 'comment',
            author: 'Admin User',
            text: 'Any updates on this issue? The meter is still not connecting.',
            timestamp: '2024-03-10T14:15:00'
        }
    ];

    // Staff options for assignment
    const staffOptions = [
        { id: 1, name: 'John Smith' },
        { id: 2, name: 'Mary Johnson' },
        { id: 3, name: 'Robert Davis' },
        { id: 4, name: 'Jennifer Wilson' },
        { id: 5, name: 'Michael Brown' }
    ];

    // Region options
    const regionOptions = [
        { id: 1, name: 'Chennai' },
        { id: 2, name: 'Coimbatore' },
        { id: 3, name: 'Madurai' },
        { id: 4, name: 'Trichy' },
        { id: 5, name: 'Salem' }
    ];

    useEffect(() => {
        if (!isNewTicket) {
            // Simulating API call with setTimeout
            setLoading(true);
            setTimeout(() => {
                setTicket(mockTicket);
                setActivities(mockActivities);
                setLoading(false);
            }, 500);
        }
    }, [isNewTicket, id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTicket(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitReply = (e) => {
        e.preventDefault();

        if (replyText.trim()) {
            const newActivity = {
                id: activities.length + 1,
                type: 'comment',
                author: 'Admin User',
                text: replyText,
                timestamp: new Date().toISOString()
            };

            setActivities(prev => [...prev, newActivity]);
            setReplyText('');
        }
    };

    const handleStatusChange = (e) => {
        e.preventDefault();

        if (statusChange && statusChange !== ticket.status) {
            const newActivity = {
                id: activities.length + 1,
                type: 'status',
                author: 'Admin User',
                text: `Ticket status changed from "${ticket.status}" to "${statusChange}"`,
                timestamp: new Date().toISOString()
            };

            setActivities(prev => [...prev, newActivity]);
            setTicket(prev => ({
                ...prev,
                status: statusChange
            }));
            setStatusChange('');
        }
    };

    const handleCreateTicket = (e) => {
        e.preventDefault();
        // Simulate API call to create ticket
        alert('Ticket created successfully!');
        navigate('/admin/tickets');
    };

    // Format date to readable format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (isNewTicket) {
        return (
            <div className={styles.ticket_details_container}>
                <Link to="/admin/tickets" className={styles.back_link}>
                    ← Back to Tickets
                </Link>
                <h1 className={styles.ticket_title}>Create New Ticket</h1>

                <div className={styles.ticket_main}>
                    <form onSubmit={handleCreateTicket}>
                        <div className={styles.ticket_description} style={{ padding: '20px' }}>
                            <div className="form_row">
                                <div className="form_group">
                                    <label className="form_label">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={ticket.subject}
                                        onChange={handleInputChange}
                                        placeholder="Enter ticket subject"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form_row">
                                <div className="form_group">
                                    <label className="form_label">Description</label>
                                    <textarea
                                        name="description"
                                        value={ticket.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe the issue in detail"
                                        rows={5}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form_row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form_group">
                                    <label className="form_label">Priority</label>
                                    <select
                                        name="priority"
                                        value={ticket.priority}
                                        onChange={handleInputChange}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>

                                <div className="form_group">
                                    <label className="form_label">Category</label>
                                    <select
                                        name="category"
                                        value={ticket.category}
                                        onChange={handleInputChange}
                                    >
                                        <option value="technical">Technical</option>
                                        <option value="billing">Billing</option>
                                        <option value="account">Account</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form_row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form_group">
                                    <label className="form_label">Region</label>
                                    <select
                                        name="region"
                                        value={ticket.region}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Region</option>
                                        {regionOptions.map(region => (
                                            <option key={region.id} value={region.name}>
                                                {region.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form_row" style={{ marginTop: '20px' }}>
                                <Buttons
                                    label="Create Ticket"
                                    variant="primary"
                                    type="submit"
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.ticket_details_container}>
            <div className={styles.ticket_header}>
                <div className={styles.header_left}>
                    {/* <div>
                        <span
                            className={`${styles.back_arrow} ${styles.icon_hover}`}
                            onClick={() => navigate('/admin/tickets')}
                        >
                        </span>
                    </div> */}
                    <div className={styles.header_right}>
                    <span 
                        className={`${styles.back_arrow} ${styles.icon_hover}`}
                        onClick={() => navigate('/admin/tickets')}
                    >
                        <img src="icons/arrow-down.svg" alt="Back"/>
                    </span>
                    <div>
                    <h1 className='title'>{ticket.subject}</h1>
                    <div className={styles.ticket_id}>Ticket ID: {ticket.id}</div>
                    </div>
                    </div>
                    
                   
                    
                </div>

                <div className={styles.ticket_actions}>
                    <div className={styles.status_dropdown_container}>
                        <label className={styles.status_dropdown_label}>Ticket Status:</label>
                        <select
                            className={styles.status_dropdown}
                            value={statusChange || ticket.status}
                            onChange={(e) => setStatusChange(e.target.value)}
                        >
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
                            {activities.map(activity => (
                                <div key={activity.id} className={styles.activity_item}>
                                    <div className={styles.activity_avatar}>
                                        {activity.author.charAt(0)}
                                    </div>
                                    <div className={styles.activity_content}>
                                        <div className={styles.activity_header}>
                                            <span className={styles.activity_author}>{activity.author}</span>
                                            <span className={styles.activity_time}>{formatDate(activity.timestamp)}</span>
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
                                    onChange={(e) => setReplyText(e.target.value)}
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
                            <span className={styles.info_value}>
                                <span className={`${styles.status_badge} ${styles[`status_${ticket.status}`]}`}>
                                    {ticket.status}
                                </span>
                            </span>
                        </div>

                        <div className={styles.info_row}>
                            <span className={styles.info_label}>Priority:</span>
                            <span className={styles.info_value}>{ticket.priority}</span>
                        </div>

                        <div className={styles.info_row}>
                            <span className={styles.info_label}>Category:</span>
                            <span className={styles.info_value}>{ticket.category}</span>
                        </div>

                        <div className={styles.info_row}>
                            <span className={styles.info_label}>Region:</span>
                            <span className={styles.info_value}>{ticket.region}</span>
                        </div>

                        <div className={styles.info_row}>
                            <span className={styles.info_label}>Created:</span>
                            <span className={styles.info_value}>{formatDate(ticket.createdAt)}</span>
                        </div>

                        <div className={styles.info_row}>
                            <span className={styles.info_label}>Last Updated:</span>
                            <span className={styles.info_value}>{formatDate(ticket.updatedAt)}</span>
                        </div>

                        <div className={styles.info_row}>
                            <span className={styles.info_label}>Created By:</span>
                            <span className={styles.info_value}>{ticket.createdBy}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails; 