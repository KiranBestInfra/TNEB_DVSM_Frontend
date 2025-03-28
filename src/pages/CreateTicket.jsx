import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/CreateTicket.module.css';
import Buttons from '../components/ui/Buttons/Buttons';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        consumer_no: '',
        consumer_name: '',
        email: '',
        mobile: '',
        issue_category: '',
        priority: '',
        description: '',
        attachments: []
    });
    const [consumerDetails, setConsumerDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ticket, setTicket] = useState(null);

    useEffect(() => {
        if (id) {
            // Fetch ticket details if editing/viewing
            // For now using dummy data
            const dummyTicket = {
                ticket_id: id,
                consumer_no: "CON001",
                consumer_name: "John Doe",
                email: "john@example.com",
                mobile: "9876543210",
                issue_category: "Billing",
                priority: "High",
                status: "Open",
                description: "Incorrect billing amount",
                reported_date: "2024-03-15",
                last_updated: "2024-03-16",
                assigned_to: "Admin User",
                resolution_notes: "",
                attachments: []
            };
            setTicket(dummyTicket);
            setFormData(dummyTicket);
        }
    }, [id]);

    const handleConsumerSearch = async (consumer_no) => {
        try {
            setIsLoading(true);
            // Simulate API call with dummy data
            setTimeout(() => {
                const dummyConsumer = {
                    consumer_name: "John Doe",
                    email: "john@example.com",
                    mobile: "9876543210"
                };
                setConsumerDetails(dummyConsumer);
                setFormData(prev => ({
                    ...prev,
                    consumer_name: dummyConsumer.consumer_name,
                    email: dummyConsumer.email,
                    mobile: dummyConsumer.mobile
                }));
                setIsLoading(false);
            }, 1000);
        } catch (err) {
            setError("Error fetching consumer details");
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Add validation for mobile number
        if (name === 'mobile') {
            // Only allow numbers
            const numbersOnly = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: numbersOnly
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'consumer_no' && value.length >= 5) {
            handleConsumerSearch(value);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            
            // Get existing tickets from localStorage
            const existingTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
            
            // Generate sequential ticket ID
            const nextTicketNumber = existingTickets.length + 1;
            const newTicketId = `TKT-${nextTicketNumber.toString().padStart(3, '0')}`;

            // Create a new ticket object
            const newTicket = {
                id: newTicketId,
                subject: formData.issue_category,
                category: formData.issue_category,
                description: formData.description,
                status: 'open',
                priority: formData.priority.toLowerCase(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                assignedTo: 'Unassigned',
                region: 'Chennai', // Default region
                district: 'Chennai Central', // Default district
                consumer_no: formData.consumer_no,
                consumer_name: formData.consumer_name,
                email: formData.email,
                mobile: formData.mobile
            };
            
            // Add new ticket to the array
            existingTickets.push(newTicket);
            
            // Save back to localStorage
            localStorage.setItem('tickets', JSON.stringify(existingTickets));

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            navigate('/admin/tickets');
        } catch (error) {
            setError('Failed to save ticket');
        } finally {
            setIsLoading(false);
        }
    };

    const isViewMode = id !== undefined;

    return (
        <div className={styles.ticket_details_container}>
            <div className={styles.header_section}>
                <h1 className="title">
                    {isViewMode ? 'Ticket Details' : 'Create New Ticket'}
                </h1>
                <Buttons
                    label="Back to Tickets"
                    onClick={() => navigate('/admin/tickets')}
                    variant="secondary"
                    icon="icons/arrow-left.svg"
                />
            </div>

            {error && (
                <div className="error">
                    <span className="error_icon">
                        <img src="/icons/error-mark.svg" alt="warning" />
                    </span>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form_container}>
                <div className={styles.form_row}>
                    <div className={styles.form_group}>
                        <div className="search_cont">
                            <input
                                type="text"
                                name="consumer_no"
                                value={formData.consumer_no}
                                onChange={handleInputChange}
                                className={styles.form_input}
                                disabled={isViewMode}
                                required
                                placeholder="Consumer No"
                            />
                        </div>
                    </div>
                    <div className={styles.form_group}>
                        <div className="search_cont">
                            <input
                                type="text"
                                name="consumer_name"
                                value={formData.consumer_name}
                                onChange={handleInputChange}
                                className={styles.form_input}
                                placeholder="Consumer Name"
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.form_row}>
                    <div className={styles.form_group}>
                        <div className="search_cont">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={styles.form_input}
                                placeholder="Email"
                            />
                        </div>
                    </div>
                    <div className={styles.form_group}>
                        <div className="search_cont">
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleInputChange}
                                className={styles.form_input}
                                placeholder="Mobile"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                maxLength="10"
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.form_row}>
                    <div className={styles.form_group}>
                        <div className="search_cont">
                            <select
                                name="issue_category"
                                value={formData.issue_category}
                                onChange={handleInputChange}
                                className={styles.form_select}
                                disabled={isViewMode}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Billing">Billing</option>
                                <option value="Meter Issue">Meter Issue</option>
                                <option value="Connection Issue">Connection Issue</option>
                                <option value="Other">Other</option>
                            </select>
                            <span className="arrow_icon arrowicon_placement">
                                <img src="icons/arrow-down.svg" alt="category" />
                            </span>
                        </div>
                    </div>
                    <div className={styles.form_group}>
                        <div className="search_cont">
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                className={styles.form_select}
                                disabled={isViewMode}
                                required
                            >
                                <option value="">Select Priority</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                            <span className="arrow_icon arrowicon_placement">
                                <img src="icons/arrow-down.svg" alt="priority" />
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.form_group}>
                    <div className="search_cont">
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className={styles.form_textarea}
                            disabled={isViewMode}
                            required
                            placeholder="Description"
                        />
                    </div>
                </div>

                {isViewMode && (
                    <>
                        <div className={styles.form_row}>
                            <div className={styles.form_group}>
                                <div className="search_cont">
                                    <input
                                        type="text"
                                        value={ticket?.reported_date}
                                        className={styles.form_input}
                                        disabled
                                        placeholder="Reported Date"
                                    />
                                </div>
                            </div>
                            <div className={styles.form_group}>
                                <div className="search_cont">
                                    <input
                                        type="text"
                                        value={ticket?.last_updated}
                                        className={styles.form_input}
                                        disabled
                                        placeholder="Last Updated"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.form_row}>
                            <div className={styles.form_group}>
                                <div className="search_cont">
                                    <input
                                        type="text"
                                        value={ticket?.status}
                                        className={styles.form_input}
                                        disabled
                                        placeholder="Status"
                                    />
                                </div>
                            </div>
                            <div className={styles.form_group}>
                                <div className="search_cont">
                                    <input
                                        type="text"
                                        value={ticket?.assigned_to}
                                        className={styles.form_input}
                                        disabled
                                        placeholder="Assigned To"
                                    />
                                </div>
                            </div>
                        </div>

                        {ticket?.resolution_notes && (
                            <div className={styles.form_group}>
                                <div className="search_cont">
                                    <textarea
                                        value={ticket.resolution_notes}
                                        className={styles.form_textarea}
                                        disabled
                                        placeholder="Resolution Notes"
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}

                {!isViewMode && (
                    <div className={styles.form_group}>
                        <div className="search_cont">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                multiple
                                className={styles.form_file}
                            />
                        </div>
                    </div>
                )}

                {formData.attachments.length > 0 && (
                    <div className={styles.attachment_section}>
                        <label className={styles.form_label}>Attached Files</label>
                        <div className={styles.attachment_list}>
                            {formData.attachments.map((file, index) => (
                                <div key={index} className={styles.attachment_item}>
                                    <img
                                        src="/icons/file.svg"
                                        alt="File"
                                        className={styles.attachment_icon}
                                    />
                                    <span>{file.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.form_actions}>
                    <Buttons
                        label="Cancel"
                        onClick={() => navigate('/admin/tickets')}
                        variant="secondary"
                    />
                    {!isViewMode && (
                        <Buttons
                            label="Submit"
                            type="submit"
                            variant="primary"
                            isLoading={isLoading}
                        />
                    )}
                </div>
            </form>
        </div>
    );
};

export default TicketDetails; 