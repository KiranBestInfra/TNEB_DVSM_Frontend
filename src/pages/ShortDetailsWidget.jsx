import styles from '../styles/ShortDetailsWidget.module.css';
import LineChartTNEB from '../components/graphs/LineChartTNEB/LineChartTNEB';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import RollingNumber from '../components/RollingNumber';
import { useAuth } from '../components/AuthProvider';

const ShortDetailsWidget = ({
    region,
    edc,
    name,
    id = null,
    edcId = null,
    subID = null,
    substationId = null,
    edcCount,
    substationCount,
    feederCount,
    currentValue,
    previousValue,
    pageType = 'regions',
    handleRegionClick,
    showInfoIcon = true,
    graphData = {
        xAxis: [],
        series: [],
    },
}) => {
    const navigate = useNavigate();
    const { isRegion, isCircle, isSubstation } = useAuth();

    const percentageChange = isNaN(
        ((currentValue - previousValue) / previousValue) * 100
    )
        ? 0
        : ((currentValue - previousValue) / previousValue) * 100;
    const isPositiveChange = currentValue >= previousValue;

    const handleClick = () => {
        let detailsUrl = '';
        const formattedRegion =
            typeof region === 'number'
                ? region
                : region?.toLowerCase().replace(/\s+/g, '-') || '';
        const formattedName = id
            ? id
            : name
            ? name.toLowerCase().replace(/\s+/g, '-')
            : '';
        const formattedEdc = edcId
            ? edcId
            : typeof edc === 'number'
            ? edc
            : edc?.toLowerCase().replace(/\s+/g, '-') || '';
            
        const formattedSubstationId = substationId
            ? substationId
            : typeof substationId === 'number'
            ? substationId
            : substationId?.toLowerCase().replace(/\s+/g, '-') || '';

        // Determine route prefix based on user role
        let routePrefix;
        if (isRegion()) {
            routePrefix = '/user/region';
        } else if (isCircle()) {
            routePrefix = '/user/edc';
        } else if (isSubstation()) {
            routePrefix = '/user/substation';
        } else {
            routePrefix = '/admin';
        }

        switch (pageType) {
            case 'regions':
                if (isRegion()) {
                    detailsUrl = `${routePrefix}/dashboard`;
                } else {
                    detailsUrl = `${routePrefix}/regions/${formattedRegion}/details`;
                }
                break;
            case 'edcs':
                if (isRegion()) {
                    if (edc) {
                        detailsUrl = `${routePrefix}/edcs/${formattedEdc}/details`;
                    } else {
                        detailsUrl = `${routePrefix}/edcs`;
                    }
                } else if (isCircle()) {
                    detailsUrl = `${routePrefix}/${formattedEdc}/dashboard`;
                } else {
                    if (edc) {
                        detailsUrl = `${routePrefix}/${formattedRegion}/edcs/${formattedEdc}/details`;
                    } else {
                        detailsUrl = `${routePrefix}/${formattedRegion}/edcs`;
                    }
                }
                break;
            case 'substations':
                if (isRegion()) {
                    if (subID || (substationId && edc)) {
                        detailsUrl = `${routePrefix}/${edc}/substations/${subID}/details`;
                    } else if (substationId) {
                        detailsUrl = `${routePrefix}/substations/${formattedSubstationId}/feeders`;
                    } else {
                        detailsUrl = `${routePrefix}/substations/${id}/details`;
                    }
                } else if (isCircle()) {
                    if (substationId) {
                        detailsUrl = `${routePrefix}/${formattedEdc}/substations/${formattedSubstationId}/details`;
                    } else {
                        detailsUrl = `${routePrefix}/${formattedEdc}/substations`;
                    }
                } else if (isSubstation()) {
                    detailsUrl = `${routePrefix}/${formattedName}/dashboard`;
                } else {
                    if (substationId && edc) {
                        detailsUrl = `${routePrefix}/${formattedRegion}/${formattedEdc}/substations/${formattedSubstationId}/details`;
                    } else if (substationId) {
                        detailsUrl = `${routePrefix}/${formattedRegion}/substations/${formattedSubstationId}/details`;
                    } else if (edc) {
                        detailsUrl = `${routePrefix}/${formattedRegion}/${formattedEdc}/substations/${subID}/details`;
                    } else {
                        detailsUrl = `${routePrefix}/${formattedRegion}/substations/${formattedName}/details`;
                    }
                }
                break;
            case 'feeders':
                if (isRegion()) {
                    if (substationId && edc) {
                        detailsUrl = `${routePrefix}/${formattedEdc}/${formattedSubstationId}/feeders/${formattedName}/details`;
                    } else if (substationId) {
                        detailsUrl = `${routePrefix}/substations/${formattedSubstationId}/feeders/${formattedName}/details`;
                    } else if (edc) {
                        detailsUrl = `${routePrefix}/${formattedEdc}/feeders/${formattedName}/details`;
                    } else {
                        detailsUrl = `${routePrefix}/feeders/${formattedName}/details`;
                    }
                } else if (isCircle()) {
                    if (substationId) {
                        detailsUrl = `${routePrefix}/${formattedEdc}/substations/${formattedSubstationId}/feeders/${formattedName}/details`;
                    } else {
                        detailsUrl = `${routePrefix}/${formattedEdc}/feeders/${formattedName}/details`;
                    }
                } else if (isSubstation()) {
                    detailsUrl = `${routePrefix}/${formattedSubstationId}/feeders/${formattedName}/details`;
                } else {
                    if (substationId && edc) {
                        detailsUrl = `${routePrefix}/${formattedRegion}/${formattedEdc}/substations/${formattedSubstationId}/feeders/${formattedName}/details`;
                    } else if (substationId) {
                        detailsUrl = `${routePrefix}/${formattedRegion}/substations/${formattedSubstationId}/feeders/${formattedName}/details`;
                    } else if (edc) {
                        detailsUrl = `${routePrefix}/${formattedRegion}/${formattedEdc}/feeders/${formattedName}/details`;
                    } else {
                        detailsUrl = `${routePrefix}/${formattedRegion}/feeders/${formattedName}/details`;
                    }
                }
                break;
            default:
                if (isRegion()) {
                    detailsUrl = `${routePrefix}/dashboard`;
                } else {
                    detailsUrl = `${routePrefix}/regions/${formattedRegion}`;
                }
        }

        navigate(detailsUrl);
        if (handleRegionClick) {
            handleRegionClick(region);
        }
    };

    const renderNavigationLinks = () => {
        const formattedRegion =
            typeof region === 'number'
                ? region
                : region.toLowerCase().replace(/\s+/g, '-');
        const formattedName = subID
            ? subID
            : id
            ? id
            : name
            ? name.toLowerCase().replace(/\s+/g, '-')
            : '';
        const formattedEdc = edcId
            ? edcId
            : edc
            ? edc.toLowerCase().replace(/\s+/g, '-')
            : '';

        // Determine route prefix based on user role
        let routePrefix;
        if (isRegion()) {
            routePrefix = '/user/region';
        } else if (isCircle()) {
            routePrefix = '/user/edc';
        } else if (isSubstation()) {
            routePrefix = '/user/substation';
        } else {
            routePrefix = '/admin';
        }

        switch (pageType) {
            case 'edcs':
                if (!edc) return null;

                if (isRegion()) {
                    return (
                        <>
                            <Link
                                to={`${routePrefix}/${formattedEdc}/substations`}
                                className={styles.nav_link}>
                                {substationCount} Substations
                            </Link>
                            {' / '}
                            <Link
                                to={`${routePrefix}/${formattedEdc}/feeders`}
                                className={styles.nav_link}>
                                {feederCount} Feeders
                            </Link>
                        </>
                    );
                } else if (isCircle()) {
                    return (
                        <>
                            <Link
                                to={`${routePrefix}/${formattedEdc}/substations`}
                                className={styles.nav_link}>
                                {substationCount} Substations
                            </Link>
                            {' / '}
                            <Link
                                to={`${routePrefix}/${formattedEdc}/feeders`}
                                className={styles.nav_link}>
                                {feederCount} Feeders
                            </Link>
                        </>
                    );
                } else {
                    return (
                        <>
                            <Link
                                to={`${routePrefix}/${formattedRegion}/${formattedEdc}/substations`}
                                className={styles.nav_link}>
                                {substationCount} Substations
                            </Link>
                            {' / '}
                            <Link
                                to={`${routePrefix}/${formattedRegion}/${formattedEdc}/feeders`}
                                className={styles.nav_link}>
                                {feederCount} Feeders
                            </Link>
                        </>
                    );
                }
            case 'substations':
                if (isRegion()) {
                    if (edc) {
                        return (
                            <Link
                                to={`${routePrefix}/${formattedEdc}/${formattedName}/feeders`}
                                className={styles.nav_link}>
                                {feederCount} Feeders
                            </Link>
                        );
                    } else {
                        return (
                            <Link
                                to={`${routePrefix}/substations/${formattedName}/feeders`}
                                className={styles.nav_link}>
                                {feederCount} Feeders
                            </Link>
                        );
                    }
                } else if (isCircle()) {
                    return (
                        <Link
                            to={`${routePrefix}/${formattedEdc}/substations/${substationId}/feeders`}
                            className={styles.nav_link}>
                            {feederCount} Feeders
                        </Link>
                    );
                } else if (isSubstation()) {
                    return (
                        <Link
                            to={`${routePrefix}/${formattedName}/feeders`}
                            className={styles.nav_link}>
                            {feederCount} Feeders
                        </Link>
                    );
                } else {
                    if (edc) {
                        return (
                            <Link
                                to={`${routePrefix}/${formattedRegion}/${formattedEdc}/${substationId}/feeders`}
                                className={styles.nav_link}>
                                {feederCount} Feeders
                            </Link>
                        );
                    } else {
                        return (
                            <Link
                                to={`${routePrefix}/${formattedRegion}/substations/${formattedName}/feeders`}
                                className={styles.nav_link}>
                                {feederCount} Feeders
                            </Link>
                        );
                    }
                }
            case 'feeders':
                return null;
            default:
                if (isRegion()) {
                    return (
                        <>
                            <Link
                                to={`${routePrefix}/edcs`}
                                className={styles.nav_link}>
                                {edcCount} EDCs
                            </Link>
                            {' / '}
                            <Link
                                to={`${routePrefix}/substations`}
                                className={styles.nav_link}>
                                {substationCount} Substations
                            </Link>
                            {' / '}
                            <Link
                                to={`${routePrefix}/feeders`}
                                className={styles.nav_link}>
                                {feederCount} Feeders
                            </Link>
                        </>
                    );
                } else {
                    return (
                        <>
                            <Link
                                to={`${routePrefix}/${formattedRegion}/edcs`}
                                className={styles.nav_link}>
                                {edcCount} EDCs
                            </Link>
                            {' / '}
                            <Link
                                to={`${routePrefix}/${formattedRegion}/substations`}
                                className={styles.nav_link}>
                                {substationCount} Substations
                            </Link>
                            {' / '}
                            <Link
                                to={`${routePrefix}/${formattedRegion}/feeders`}
                                className={styles.nav_link}>
                                {feederCount} Feeders
                            </Link>
                        </>
                    );
                }
        }
    };

    return (
        <div className={styles.individual_region}>
            <div className={styles.individual_region_header}>
                <div className={styles.individual_region_header_left}>
                    <h3 className={styles.individual_region_header_title}>
                        {name}
                    </h3>
                    <p className={styles.navigation_links}>
                        {renderNavigationLinks()}
                    </p>
                </div>
                <div className={styles.individual_region_header_right}>
                    {showInfoIcon && (
                        <div className={styles.click_individual_region}>
                            <img
                                src="icons/information.svg"
                                alt="Click Here"
                                onClick={handleClick}
                                style={{ cursor: 'pointer' }}
                            />
                            <div className={styles.tooltip}>
                                View Information
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.individual_region_body}>
                <div className={styles.region_content_wrapper}>
                    <div className={styles.region_stats_utilization}>
                        <p className="titles">Demand Usage (MW)</p>
                        <div className={styles.region_stats_values}>
                            <div className={styles.region_current_value}>
                                <RollingNumber
                                    n={parseFloat(currentValue)}
                                    decimals={1}
                                />
                            </div>
                            <div className={styles.region_previous_value}>
                                <RollingNumber
                                    n={parseFloat(previousValue)}
                                    decimals={1}
                                />{' '}
                            </div>
                            <div
                                className={`${
                                    styles.region_percentage_change
                                } ${
                                    isPositiveChange
                                        ? styles.positive
                                        : styles.negative
                                }`}>
                                <img
                                    src={
                                        isPositiveChange
                                            ? 'icons/up-right-arrow.svg'
                                            : 'icons/up-right-arrow.svg'
                                    }
                                    alt={
                                        isPositiveChange
                                            ? 'Increase'
                                            : 'Decrease'
                                    }
                                    className={`${styles.region_trend_arrow} ${
                                        isPositiveChange
                                            ? styles.positive
                                            : styles.negative
                                    }`}
                                />{' '}
                                {''}
                                {Math.abs(parseFloat(percentageChange)).toFixed(
                                    1
                                )}
                                %
                            </div>
                        </div>
                    </div>
                    <div className={styles.region_stats_graph}>
                        <LineChartTNEB
                            title="Energy Usage"
                            data={graphData}
                            seriesColors={['#3f68b2', '#ed8c22', '#dc272c']}
                            yAxisLabel="MW"
                            showLabel={false}
                            toolbox={true}
                            height="100%"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

ShortDetailsWidget.propTypes = {
    region: PropTypes.string.isRequired,
    edc: PropTypes.number,
    name: PropTypes.string,
    id: PropTypes.number,
    substationId: PropTypes.string,
    edcCount: PropTypes.number,
    substationCount: PropTypes.number.isRequired,
    feederCount: PropTypes.number.isRequired,
    currentValue: PropTypes.number.isRequired,
    previousValue: PropTypes.number.isRequired,
    pageType: PropTypes.oneOf(['regions', 'edcs', 'substations', 'feeders']),
    handleRegionClick: PropTypes.func,
    showInfoIcon: PropTypes.bool,
    graphData: PropTypes.shape({
        xAxis: PropTypes.array,
        series: PropTypes.array,
    }),
};

export default ShortDetailsWidget;
