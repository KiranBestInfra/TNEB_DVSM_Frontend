import React from 'react';
import styles from '../styles/AuthLayout.module.css';

const Terms = () => {
    return (
        <div className={styles.terms_container}>
            <div className={styles.terms_section}>
                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing and using this TNEB Dashboard service, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
                </p>
            </div>

            <div className={styles.terms_section}>
                <h2>2. Description of Service</h2>
                <p>
                    The TNEB Dashboard provides users with access to utility management information, including but not limited to meter data, regional statistics, and unit performance metrics. This service is provided "as is" with no guarantees regarding availability or accuracy.
                </p>
            </div>

            <div className={styles.terms_section}>
                <h2>3. User Account and Security</h2>
                <p>
                    You are responsible for maintaining the confidentiality of your account information and password. You agree to notify TNEB immediately of any unauthorized use of your account or any other breach of security.
                </p>
            </div>

            <div className={styles.terms_section}>
                <h2>4. Privacy Policy</h2>
                <p>
                    Please review our Privacy Policy, which also governs your visit to the TNEB Dashboard, to understand our privacy practices.
                </p>
            </div>

            <div className={styles.terms_section}>
                <h2>5. Limitation of Liability</h2>
                <p>
                    TNEB shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the service or any content provided on or through the service.
                </p>
            </div>

            <div className={styles.terms_section}>
                <h2>6. Modifications to Terms</h2>
                <p>
                    TNEB reserves the right to modify these terms at any time. You are responsible for reviewing these terms periodically for changes. Your continued use of the service following the posting of changes constitutes your acceptance of such changes.
                </p>
            </div>

            <div className={styles.terms_section}>
                <h2>7. Governing Law</h2>
                <p>
                    These terms shall be governed by and construed in accordance with the laws of Tamil Nadu, India, without regard to its conflict of law provisions.
                </p>
            </div>

            <div className={styles.terms_section}>
                <h2>8. Contact Information</h2>
                <p>
                    If you have any questions or concerns regarding these terms, please contact us at support@tneb.gov.in.
                </p>
            </div>
        </div>
    );
};

export default Terms; 