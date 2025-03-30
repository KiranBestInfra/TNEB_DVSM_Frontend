import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/CreateTicket.module.css';
import Buttons from '../components/ui/Buttons/Buttons';

const CreateTicket = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        Subject: '',
        Category: '',
        Description: '',
        Region: '',
        District: '',
        ConsumerNo: '',
        ConsumerName: '',
        Email: '',
        Mobile: '',
        Priority: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const regionDistrictMap = {
        Chennai: ['North', 'South', 'Central'],
        Coimbatore: ['North', 'South'],
        Madurai: ['East', 'West'],
        Trichy: ['East', 'West'],
        Salem: ['North', 'South']
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'Mobile') {
            const numbersOnly = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({ ...prev, [name]: numbersOnly }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);

            const ticketId = `TICKET${Date.now()}`;
            const payload = {
                ...formData,
                TicketId: ticketId,
                Status: 'Open',
                LastUpdated: new Date().toISOString(),
                EDC_Substations: 'Substation A'
            };

            await axios.post('http://localhost:3000/api/v1/tickets', payload);
            navigate('/admin/tickets');
        } catch (err) {
            setError('Failed to create ticket');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.ticket_details_container}>
            <div className={styles.header_section}>
                <h1 className="title">Create New Ticket</h1>
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
                        <input
                            type="text"
                            name="ConsumerNo"
                            value={formData.ConsumerNo}
                            onChange={handleInputChange}
                            className={styles.form_input}
                            required
                            placeholder="Consumer No"
                        />
                    </div>
                    <div className={styles.form_group}>
                        <input
                            type="text"
                            name="ConsumerName"
                            value={formData.ConsumerName}
                            onChange={handleInputChange}
                            className={styles.form_input}
                            required
                            placeholder="Consumer Name"
                        />
                    </div>
                </div>

                <div className={styles.form_row}>
                    <div className={styles.form_group}>
                        <input
                            type="email"
                            name="Email"
                            value={formData.Email}
                            onChange={handleInputChange}
                            className={styles.form_input}
                            required
                            placeholder="Email"
                        />
                    </div>
                    <div className={styles.form_group}>
                        <input
                            type="tel"
                            name="Mobile"
                            value={formData.Mobile}
                            onChange={handleInputChange}
                            className={styles.form_input}
                            placeholder="Mobile"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength="10"
                            required
                        />
                    </div>
                </div>

                <div className={styles.form_group}>
                    <input
                        type="text"
                        name="Subject"
                        value={formData.Subject}
                        onChange={handleInputChange}
                        className={styles.form_input}
                        placeholder="Subject"
                        required
                    />
                </div>

                <div className={styles.form_row}>
                    <div className={styles.form_group}>
                        <select
                            name="Category"
                            value={formData.Category}
                            onChange={handleInputChange}
                            className={styles.form_select}
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Billing">Billing</option>
                            <option value="Meter Issue">Meter Issue</option>
                            <option value="Connection Issue">Connection Issue</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className={styles.form_group}>
                        <select
                            name="Priority"
                            value={formData.Priority}
                            onChange={handleInputChange}
                            className={styles.form_select}
                            required
                        >
                            <option value="">Select Priority</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>
                </div>

                <div className={styles.form_row}>
                    <div className={styles.form_group}>
                        <select
                            name="Region"
                            value={formData.Region}
                            onChange={handleInputChange}
                            className={styles.form_select}
                            required
                        >
                            <option value="">Select Region</option>
                            {Object.keys(regionDistrictMap).map(region => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.form_group}>
                        <select
                            name="District"
                            value={formData.District}
                            onChange={handleInputChange}
                            className={styles.form_select}
                            required
                            disabled={!formData.Region}
                        >
                            <option value="">Select District</option>
                            {regionDistrictMap[formData.Region]?.map(district => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.form_group}>
                    <textarea
                        name="Description"
                        value={formData.Description}
                        onChange={handleInputChange}
                        className={styles.form_textarea}
                        required
                        placeholder="Description"
                    />
                </div>

                <div className={styles.form_actions}>
                    <Buttons
                        label="Cancel"
                        onClick={() => navigate('/admin/tickets')}
                        variant="secondary"
                    />
                    <Buttons
                        label="Submit"
                        type="submit"
                        variant="primary"
                        isLoading={isLoading}
                    />
                </div>
            </form>
        </div>
    );
};

export default CreateTicket;
