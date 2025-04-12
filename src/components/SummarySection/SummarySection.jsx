import React from 'react';
import { Link } from 'react-router-dom';
import styles from './SummarySection.module.css';
import RollingNumber from '../RollingNumber';

const SummarySection = ({
    widgetsData = {
        totalRegions: 0,
        totalEdcs: 0,
        totalSubstations: 0,
        totalFeeders: 0,
        commMeters: 0,
        nonCommMeters: 0,
        totalDistricts: 0,
    },
    isUserRoute = false,
    isBiUserRoute = false,
    onEdcClick = null,
    onSubstationClick = null,
    showRegions = true,
    showDistricts = false,
    showEdcs = true,
    showSubstations = true,
    showFeeders = true,
}) => {
    return (
        <div className={styles.summary_section}>
            {showRegions && (
                <div className={styles.total_regions_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/office.svg"
                            alt="Total Regions"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">
                                <Link
                                    to={
                                        isBiUserRoute
                                            ? `/bi/user/regions`
                                            : isUserRoute
                                            ? `/user/regions`
                                            : `/admin/regions`
                                    }>
                                    Regions
                                </Link>
                            </p>
                            <div className={styles.summary_value}>
                                <RollingNumber n={widgetsData.totalRegions} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showEdcs && (
                <div
                    className={styles.total_edcs_container}
                    onClick={onEdcClick}
                    style={onEdcClick ? { cursor: 'pointer' } : {}}
                    title={onEdcClick ? 'Click to view EDCs' : ''}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/electric-edc.svg"
                            alt="Total EDCs"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">
                                {isUserRoute ? (
                                    <span
                                        style={{ color: 'var(--brand-blue)' }}>
                                        EDCs{' '}
                                        {isUserRoute && onEdcClick && (
                                            <span
                                                style={{ fontSize: '0.8rem' }}>
                                                🔗
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    'EDCs'
                                )}
                            </p>
                            <div className={styles.summary_value}>
                                <RollingNumber n={widgetsData.totalEdcs} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showDistricts && (
                <div className={styles.total_substations_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/map.svg"
                            alt="Total Districts"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">Districts</p>
                            <div className={styles.summary_value}>
                                <RollingNumber
                                    n={widgetsData.totalDistricts || 0}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showSubstations && (
                <div
                    className={styles.total_substations_container}
                    onClick={onSubstationClick}
                    style={onSubstationClick ? { cursor: 'pointer' } : {}}
                    title={
                        onSubstationClick ? 'Click to view Substations' : ''
                    }>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/electric-factory.svg"
                            alt="Total Substations"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">
                                {isUserRoute ? (
                                    <span
                                        style={{ color: 'var(--brand-blue)' }}>
                                        Substations{' '}
                                        {isUserRoute && onSubstationClick && (
                                            <span
                                                style={{ fontSize: '0.8rem' }}>
                                                🔗
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    'Substations'
                                )}
                            </p>
                            <div className={styles.summary_value}>
                                <RollingNumber
                                    n={widgetsData.totalSubstations}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showFeeders && (
                <div className={styles.total_meters_container}>
                    <div className={styles.total_meters_main_info}>
                        <img
                            src="icons/electric-meter.svg"
                            alt="Total Meters"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_meters}>
                            <div className="title">Feeders</div>
                            <div className={styles.summary_value}>
                                <RollingNumber n={widgetsData.totalFeeders} />
                            </div>
                        </div>
                    </div>
                    <div className={styles.metrics_communication_info}>
                        <div className="titles">Communication Status</div>
                        <div className={styles.overall_communication_status}>
                            <div
                                className={
                                    styles.communication_status_container
                                }>
                                <div className={styles.communication_value}>
                                    {widgetsData.commMeters}
                                </div>
                                <div
                                    className={
                                        styles.communication_positive_percentage
                                    }>
                                    <img
                                        src="icons/up-right-arrow.svg"
                                        alt="Positive"
                                        className={
                                            styles.communication_positive_arrow
                                        }
                                    />
                                    {(() => {
                                        const comm =
                                            widgetsData?.commMeters ?? 0;
                                        const nonComm =
                                            widgetsData?.nonCommMeters ?? 0;
                                        const total = comm + nonComm;
                                        if (total === 0) return '0.0';
                                        return ((comm / total) * 100).toFixed(
                                            1
                                        );
                                    })()}
                                    %
                                </div>
                            </div>
                            <div
                                className={
                                    styles.communication_status_container
                                }>
                                <div className={styles.communication_value}>
                                    {widgetsData?.nonCommMeters ?? 0}
                                </div>
                                <div
                                    className={
                                        styles.communication_negative_percentage
                                    }>
                                    <img
                                        src="icons/up-right-arrow.svg"
                                        alt="Positive"
                                        className={
                                            styles.communication_negative_arrow
                                        }
                                    />
                                    {(() => {
                                        const comm =
                                            widgetsData?.commMeters ?? 0;
                                        const nonComm =
                                            widgetsData?.nonCommMeters ?? 0;
                                        const total = comm + nonComm;
                                        if (total === 0) return '0.0';
                                        return (
                                            (nonComm / total) *
                                            100
                                        ).toFixed(1);
                                    })()}
                                    %
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SummarySection;
