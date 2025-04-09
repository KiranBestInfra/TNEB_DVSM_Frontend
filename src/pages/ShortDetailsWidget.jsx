import styles from '../styles/ShortDetailsWidget.module.css';
import LineChartTNEB from '../components/graphs/LineChartTNEB/LineChartTNEB';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import RollingNumber from '../components/RollingNumber';

// const graphData = {
//   daily: {
//     xAxis: [
//       "2025-03-16 23:59:59", "2025-03-16 08:30:00", "2025-03-16 08:15:00",
//       "2025-03-16 08:00:00", "2025-03-16 07:45:00", "2025-03-16 07:30:00",
//       "2025-03-16 07:15:00", "2025-03-16 07:00:00", "2025-03-16 06:45:00",
//       "2025-03-16 06:30:00", "2025-03-16 06:15:00", "2025-03-16 06:00:00"
//     ],
//     series: [
//       {
//         name: 'Current Day',
//         data: [13.6, 12.0, 11.2, 11.2, 11.6, 10.4, 12.0, 10.8, 12.4, 12.0, 12.8, 13.6]
//       },
//       {
//         name: 'Previous Day',
//         data: [13.2, 10.8, 10.0, 11.2, 10.8, 10.8, 11.6, 10.8, 12.0, 11.6, 13.2, 12.8]
//       }
//     ]
//   }
// };

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
    graphData = {
        xAxis: [],
        series: [],
    },
}) => {
    const navigate = useNavigate();

    const isUserRoute = false;

    const percentageChange = (
        ((currentValue - previousValue) / previousValue) *
        100
    ).toFixed(1);
    const isPositiveChange = currentValue >= previousValue;

    const handleClick = () => {
        let detailsUrl = '';
        const routePrefix = isUserRoute ? '/user' : '/admin';
        const formattedRegion = region.toLowerCase().replace(/\s+/g, '-');
        const formattedName = id
            ? id
            : name
            ? name.toLowerCase().replace(/\s+/g, '-')
            : '';
        const formattedEdc = edcId
            ? edcId
            : edc
            ? edc.toLowerCase().replace(/\s+/g, '-')
            : '';
        const formattedSubstationId = substationId
            ? substationId.toLowerCase().replace(/\s+/g, '-')
            : '';

        switch (pageType) {
            case 'regions':
                detailsUrl = `${routePrefix}/regions/${formattedRegion}/details`;
                break;
            case 'edcs':
                if (edc) {
                    detailsUrl = `${routePrefix}/${formattedRegion}/edcs/${formattedEdc}/details`;
                } else {
                    detailsUrl = `${routePrefix}/${formattedRegion}/edcs`;
                }
                break;
            case 'substations':
                if (substationId && edc) {
                    detailsUrl = `${routePrefix}/${formattedRegion}/${formattedEdc}/substations/${formattedSubstationId}/details`;
                } else if (substationId) {
                    detailsUrl = `${routePrefix}/${formattedRegion}/substations/${formattedSubstationId}/details`;
                } else if (edc) {
                    detailsUrl = `${routePrefix}/${formattedRegion}/${formattedEdc}/substations/${formattedName}/details`;
                } else {
                    detailsUrl = `${routePrefix}/${formattedRegion}/substations/${formattedName}/details`;
                }
                break;
            case 'feeders':
                if (substationId && edc) {
                    detailsUrl = `${routePrefix}/${formattedRegion}/${formattedEdc}/substations/${formattedSubstationId}/feeders/${formattedName}/details`;
                } else if (substationId) {
                    detailsUrl = `${routePrefix}/${formattedRegion}/substations/${formattedSubstationId}/feeders/${formattedName}/details`;
                } else if (edc) {
                    detailsUrl = `${routePrefix}/${formattedRegion}/${formattedEdc}/feeders/${formattedName}/details`;
                } else {
                    detailsUrl = `${routePrefix}/${formattedRegion}/feeders/${formattedName}/details`;
                }
                break;
            default:
                detailsUrl = `${routePrefix}/regions/${formattedRegion}`;
        }

        navigate(detailsUrl);
        if (handleRegionClick) {
            handleRegionClick(region);
        }
    };

    const renderNavigationLinks = () => {
        const routePrefix = isUserRoute ? '/user' : '/admin';
        const formattedRegion = region.toLowerCase().replace(/\s+/g, '-');
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

        switch (pageType) {
            case 'edcs':
                if (!edc) return null;

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
            case 'substations':
                if (edc) {
                    return (
                        <Link
                            to={`${routePrefix}/${formattedRegion}/${formattedEdc}/substations/${formattedName}/feeders`}
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
            case 'feeders':
                return null;
            default:
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
                    <div className={styles.click_individual_region}>
                        <img
                            src="icons/information.svg"
                            alt="Click Here"
                            onClick={handleClick}
                            style={{ cursor: 'pointer' }}
                        />
                        <div className={styles.tooltip}>View Information</div>
                    </div>
                </div>
            </div>
            <div className={styles.individual_region_body}>
                <div className={styles.region_content_wrapper}>
                    <div className={styles.region_stats_utilization}>
                        <p className="titles">Demand Usage</p>
                        <div className={styles.region_stats_values}>
                            <div className={styles.region_current_value}>
                                {currentValue}
                            </div>
                            <div className={styles.region_previous_value}>
                                {previousValue} MW
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
                                />
                                <RollingNumber
                                    n={Math.abs(parseFloat(percentageChange))}
                                    decimals={1}
                                />
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
    edc: PropTypes.string,
    name: PropTypes.string,
    id: PropTypes.string,
    substationId: PropTypes.string,
    edcCount: PropTypes.number.isRequired,
    substationCount: PropTypes.number.isRequired,
    feederCount: PropTypes.number.isRequired,
    currentValue: PropTypes.number.isRequired,
    previousValue: PropTypes.number.isRequired,
    pageType: PropTypes.oneOf(['regions', 'edcs', 'substations', 'feeders']),
    handleRegionClick: PropTypes.func,
    graphData: PropTypes.shape({
        xAxis: PropTypes.array,
        series: PropTypes.array,
    }),
};

export default ShortDetailsWidget;
