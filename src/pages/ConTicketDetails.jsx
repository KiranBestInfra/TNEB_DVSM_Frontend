import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/ConTicketDetails.module.css';
import Buttons from '../components/ui/Buttons/Buttons';

const ConTicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [timeline, setTimeline] = useState([]);
    const [formData, setFormData] = useState({
        ticket_id: '',
        consumer_no: '',
        title: '',
        issue_category: '',
        priority: '',
        description: '',
        attachments: []
    });
    const [commentFiles, setCommentFiles] = useState([]);
    const [commentDragActive, setCommentDragActive] = useState(false);

    useEffect(() => {
        if (id) {
            fetchTicketDetails();
        } else {
            setIsLoading(false);
        }
    }, [id]);

    const fetchTicketDetails = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch ticket details - Using dummy data for now
            const dummyTicket = {
                ticket_id: id,
                consumer_no: "CON001",
                title: "Billing Issue",
                issue_category: "Billing",
                priority: "High",
                status: "Open",
                description: "Incorrect billing amount for March 2024. The bill shows Rs. 5000 more than usual consumption.",
                reported_date: "2024-03-15",
                last_updated: "2024-03-16",
                assigned_to: "Support Team",
                resolution_notes: "Our team is reviewing your billing history and meter readings. We'll get back to you within 24 hours.",
                attachments: [
                    { name: "March_Bill.pdf" },
                    { name: "Meter_Reading.jpg" }
                ]
            };

            // Dummy timeline data
            const dummyTimeline = [
                {
                    date: "2024-03-16 14:30",
                    action: "Status Updated",
                    details: "Ticket status changed to In Progress",
                    user: "Support Team"
                },
                {
                    date: "2024-03-15 10:00",
                    action: "Ticket Created",
                    details: "New ticket created",
                    user: "John Doe"
                }
            ];

            // Dummy comments with profile pictures
            const dummyComments = [
                {
                    id: 1,
                    user: "John Doe",
                    content: "Please review my latest meter reading attached.",
                    timestamp: "2024-03-15 10:30",
                    profile_pic: "icons/user-profile.svg",
                    attachments: [
                        { name: "meter_reading.jpg", url: "/uploads/meter_reading.jpg" }
                    ]
                },
                {
                    id: 2,
                    user: "Support Team",
                    content: "We're looking into this. Will update you shortly.",
                    timestamp: "2024-03-15 11:00",
                    profile_pic: "icons/user-profile.svg",
                    attachments: []
                }
            ];

            setFormData(dummyTicket);
            setTimeline(dummyTimeline);
            setComments(dummyComments);
        } catch (err) {
            setError('Failed to fetch ticket details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files]
        }));
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            setFormData(prev => ({
                ...prev,
                attachments: [...prev.attachments, ...files]
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError(null);

            // Here you would typically make an API call to create/update the ticket
            // For now, we'll just simulate an API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            navigate('/consumer/tickets');
        } catch (err) {
            setError('Failed to submit ticket. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCommentFileChange = (e) => {
        const files = Array.from(e.target.files);
        setCommentFiles(prev => [...prev, ...files]);
    };

    const handleCommentDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setCommentDragActive(true);
        } else if (e.type === "dragleave") {
            setCommentDragActive(false);
        }
    };

    const handleCommentDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCommentDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            setCommentFiles(prev => [...prev, ...files]);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() && commentFiles.length === 0) return;

        try {
            // In a real implementation, this would be an API call
            const newCommentObj = {
                id: comments.length + 1,
                user: "John Doe",
                content: newComment,
                timestamp: new Date().toISOString(),
                profile_pic: "/avatars/user-1.jpg",
                attachments: commentFiles.map(file => ({
                    name: file.name,
                    url: URL.createObjectURL(file)
                }))
            };

            setComments([...comments, newCommentObj]);
            setNewComment('');
            setCommentFiles([]);
        } catch (err) {
            setError('Failed to add reply. Please try again.');
        }
    };

    const isViewMode = id !== undefined;

    if (isLoading) {
        return (
            <div className={styles.loading_container}>
                <div className={styles.loader}></div>
                <p>Loading ticket details...</p>
            </div>
        );
    }

    return (
        <div className={styles.ticket_details_container}>
            <div className={styles.header_section}>
                <h1 className="title">{isViewMode ? 'Ticket Details' : 'Create New Ticket'}</h1>
                <Buttons
                    label="Back to Tickets"
                    onClick={() => navigate('/consumer/tickets')}
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

            <div className={styles.content_grid}>
                <div className={styles.main_content}>
                    <form onSubmit={handleSubmit} className={styles.form_container}>
                        {isViewMode && (
                            <div className={styles.form_row}>
                                <div className={styles.form_group}>
                                    <div className="search_cont">
                                        <input
                                            type="text"
                                            value={formData.ticket_id}
                                            className={styles.form_input}
                                            disabled
                                            placeholder="Ticket ID"
                                        />
                                    </div>
                                </div>
                                <div className={styles.form_group}>
                                    <div className="search_cont">
                                        <input
                                            type="text"
                                            value={formData.status}
                                            className={`${styles.form_input} ${formData.status ? styles[`status_${formData.status.toLowerCase()}`] : ''}`}
                                            disabled
                                            placeholder="Status"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={styles.form_row}>
                            <div className={styles.form_group}>
                                <div className="search_cont">
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className={styles.form_input}
                                        disabled={isViewMode}
                                        required
                                        placeholder="Ticket Title"
                                    />
                                </div>
                            </div>
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
                                        <img src="icons/arrow-down.svg" alt="Select Category" />
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.form_row}>
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
                                    </select>
                                    <span className="arrow_icon arrowicon_placement">
                                        <img src="icons/arrow-down.svg" alt="Select Priority" />
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
                                    placeholder="Describe your issue in detail"
                                />
                            </div>
                        </div>

                        {!isViewMode && (
                            <div className={styles.form_group}>
                                <div
                                    className={`${styles.drag_drop_container} ${dragActive ? styles.drag_active : ''}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        multiple
                                        className={styles.file_input}
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className={styles.drag_drop_label}>
                                        <img src="icons/cloud-upload-alt.svg" alt="Upload" className={styles.upload_icon} />
                                        <span className={styles.drag_text}>
                                            Drag and drop files here or <span className={styles.browse_text}>browse</span>
                                        </span>
                                        <span className={styles.file_hint}>Supported formats: PDF, JPG, PNG, DOC (Max 5MB)</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {formData.attachments && formData.attachments.length > 0 && (
                            <div className={styles.attachment_section}>
                                <label className={styles.form_label}>Attached Files</label>
                                <div className={styles.attachment_list}>
                                    {formData.attachments.map((file, index) => (
                                        <div key={index} className={styles.attachment_item}>
                                            <img
                                                src="icons/clip-file.svg"
                                                alt="File"
                                                className={styles.attachment_icon}
                                            />
                                            <span>{file.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isViewMode && formData.resolution_notes && (
                            <div className={styles.form_group}>
                                <div className="search_cont">
                                    <textarea
                                        value={formData.resolution_notes}
                                        className={styles.form_textarea}
                                        disabled
                                        placeholder="Resolution Notes"
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.form_actions}>
                            <Buttons
                                label="Cancel"
                                onClick={() => navigate('/consumer/tickets')}
                                variant="secondary"
                            />
                            {!isViewMode && (
                                <Buttons
                                    label="Submit Ticket"
                                    type="submit"
                                    variant="primary"
                                    isLoading={isLoading}
                                />
                            )}
                        </div>
                    </form>

                    {isViewMode && (
                        <div className={styles.comments_section}>
                            <h2>Messages</h2>
                            <div className={styles.comments_list}>
                                {comments.map((comment) => (
                                    <div key={comment.id} className={styles.comment_item}>
                                        <div className={styles.comment_avatar}>
                                            <img src={comment.profile_pic} alt={comment.user} />
                                        </div>
                                        <div className={styles.comment_content_wrapper}>
                                            <div className={styles.comment_header}>
                                                <span className={styles.comment_user}>{comment.user}</span>
                                                <span className={styles.comment_time}>{new Date(comment.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className={styles.comment_content}>{comment.content}</p>
                                            {comment.attachments && comment.attachments.length > 0 && (
                                                <div className={styles.comment_attachments}>
                                                    {comment.attachments.map((file, index) => (
                                                        <div key={index} className={styles.attachment_item}>
                                                            <img
                                                                src="icons/clip-file.svg"
                                                                alt="File"
                                                                className={styles.attachment_icon}
                                                            />
                                                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                                {file.name}
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleAddComment} className={styles.comment_form}>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a reply..."
                                    className={styles.comment_input}
                                />
                                <div
                                    className={`${styles.comment_upload_container} ${commentDragActive ? styles.drag_active : ''}`}
                                    onDragEnter={handleCommentDrag}
                                    onDragLeave={handleCommentDrag}
                                    onDragOver={handleCommentDrag}
                                    onDrop={handleCommentDrop}
                                >
                                    <input
                                        type="file"
                                        onChange={handleCommentFileChange}
                                        multiple
                                        className={styles.file_input}
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        id="comment-file-upload"
                                    />
                                    <label htmlFor="comment-file-upload" className={styles.comment_upload_label}>
                                        <img src="icons/cloud-upload-alt.svg" alt="Upload" className={styles.upload_icon} />
                                        <span className={styles.upload_text}>
                                            Attach files
                                        </span>
                                    </label>
                                </div>
                                {commentFiles.length > 0 && (
                                    <div className={styles.comment_attachments}>
                                        {commentFiles.map((file, index) => (
                                            <div key={index} className={styles.attachment_item}>
                                                <img
                                                    src="icons/file.svg"
                                                    alt="File"
                                                    className={styles.attachment_icon}
                                                />
                                                <span>{file.name}</span>
                                                <button
                                                    type="button"
                                                    className={styles.remove_attachment}
                                                    onClick={() => setCommentFiles(files => files.filter((_, i) => i !== index))}
                                                >
                                                    <img src="icons/close.svg" alt="Remove" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className={styles.comment_actions}>
                                    <Buttons
                                        label="Reply"
                                        type="submit"
                                        variant="primary"
                                        icon="icons/reply.svg"
                                    />
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {isViewMode && (
                    <div className={styles.sidebar}>
                        <div className={styles.timeline_section}>
                            <h2>Activities</h2>
                            <div className={styles.timeline_list}>
                                {timeline.map((event, index) => (
                                    <div key={index} className={styles.timeline_item}>
                                        <div className={styles.timeline_dot}></div>
                                        <div className={styles.timeline_content}>
                                            <div className={styles.timeline_header}>
                                                <span className={styles.timeline_action}>{event.action}</span>
                                                <span className={styles.timeline_date}>{event.date}</span>
                                            </div>
                                            <p className={styles.timeline_details}>{event.details}</p>
                                            <span className={styles.timeline_user}>{event.user}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConTicketDetails;