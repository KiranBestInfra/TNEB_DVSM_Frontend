import { Link, useLocation } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

// Constants for region names and route mapping
const REGIONS = [
    'chennai', 'coimbatore', 'erode', 'kancheepuram', 'karur',
    'madurai', 'thanjavur', 'thiruvallur', 'tirunelveli',
    'tiruvannamalai', 'trichy', 'vellore', 'villupuram'
];

const ROUTE_MAP = {
    dashboard: 'Dashboard',
    regions: 'Regions',
    edcs: 'EDCs',
    substations: 'Substations',
    feeders: 'Feeders',
    tickets: 'Tickets',
    profile: 'Profile',
    'create-ticket': 'Create Ticket',
    'ticket-details': 'Ticket Details',
    'unit-selection': 'Unit Selection',
    'unit-detail': 'Unit Detail',
    verification: 'Verification',
    'forgot-password': 'Forgot Password',
    privacy: 'Privacy',
    terms: 'Terms',
};

const Breadcrumb = ({ items }) => {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const isRegionUserPath = false;

    // If custom items are provided, render them directly
    if (items?.length) {
        return (
            <nav className={styles.breadcrumb} aria-label="breadcrumb">
                <ol className={styles.breadcrumb_list}>
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;
                        return (
                            <li key={index} className={styles.breadcrumb_item}>
                                {isLast ? (
                                    <span className={styles.breadcrumb_current}>
                                        {item.label}
                                    </span>
                                ) : (
                                    <>
                                        <Link to={item.path} className={styles.breadcrumb_link}>
                                            {item.label}
                                        </Link>
                                        <span className={styles.breadcrumb_separator}>/</span>
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        );
    }

    // Handle root path
    if (pathSegments.length === 0 || location.pathname === '/') {
        return null;
    }

    // Filter out system paths
    const filteredPathnames = pathSegments.filter(
        name => !['admin', 'user', 'bi'].includes(name)
    );

    // Handle region user paths
    if (isRegionUserPath && !items) {
        const region = pathSegments.find(p => REGIONS.includes(p));
        if (region) {
            const pagePath = pathSegments[pathSegments.length - 1];
            const formattedRegionName = region.charAt(0).toUpperCase() + region.slice(1);
            const routePrefix = '/admin';

            const customItems = [
                { label: 'Dashboard', path: `${routePrefix}/dashboard` },
                { 
                    label: `Region : ${formattedRegionName}`,
                    path: `${routePrefix}/${region}/dashboard`
                }
            ];

            if (['edcs', 'substations', 'feeders'].includes(pagePath)) {
                const pageLabel = pagePath.charAt(0).toUpperCase() + pagePath.slice(1);
                customItems.push({
                    label: pageLabel,
                    path: `${routePrefix}/${region}/${pagePath}`
                });
            }

            return (
                <nav className={styles.breadcrumb} aria-label="breadcrumb">
                    <ol className={styles.breadcrumb_list}>
                        {customItems.map((item, index) => {
                            const isLast = index === customItems.length - 1;
                            return (
                                <li key={index} className={styles.breadcrumb_item}>
                                    {isLast ? (
                                        <span className={styles.breadcrumb_current}>
                                            {item.label}
                                        </span>
                                    ) : (
                                        <>
                                            <Link to={item.path} className={styles.breadcrumb_link}>
                                                {item.label}
                                            </Link>
                                            <span className={styles.breadcrumb_separator}>/</span>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </nav>
            );
        }
    }

    // Helper function to get breadcrumb name
    const getBreadcrumbName = (path) => {
        const routeMap = {
            dashboard: 'Dashboard',
            regions: 'Regions',
            edcs: 'EDCs',
            substations: 'Substations',
            feeders: 'Feeders',
            tickets: 'Tickets',
            profile: 'Profile',
            'create-ticket': 'Create Ticket',
            'ticket-details': 'Ticket Details',
            'unit-selection': 'Unit Selection',
            'unit-detail': 'Unit Detail',
            verification: 'Verification',
            'forgot-password': 'Forgot Password',
            privacy: 'Privacy',
            terms: 'Terms',
        };

        return routeMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
    };

    // Build complete hierarchy path
    const buildCompleteHierarchy = (paths) => {
        const hierarchy = [];
        const isUserRoute = paths.includes('user');
        const routePrefix = isUserRoute ? '/user' : '/admin';

        if (paths[0] === 'dashboard') {
            return hierarchy;
        }

        const currentPage = paths[paths.length - 1];
        hierarchy.push({
            path: currentPage,
            name: getBreadcrumbName(currentPage),
            route: `${routePrefix}/${currentPage}`
        });

        return hierarchy;
    };

    const completeHierarchyPath = buildCompleteHierarchy(filteredPathnames);
    const routePrefix = pathSegments.includes('user') ? '/user' : '/admin';

    return (
        <nav className={styles.breadcrumb} aria-label="breadcrumb">
            <ol className={styles.breadcrumb_list}>
                <li className={styles.breadcrumb_item}>
                    <Link to={`${routePrefix}/dashboard`} className={styles.breadcrumb_link}>
                        Dashboard
                    </Link>
                    {completeHierarchyPath.length > 0 && (
                        <span className={styles.breadcrumb_separator}>/</span>
                    )}
                </li>
                {completeHierarchyPath.map((item, index) => {
                    const isLast = index === completeHierarchyPath.length - 1;
                    return (
                        <li key={item.path} className={styles.breadcrumb_item}>
                            {isLast ? (
                                <span className={styles.breadcrumb_current}>
                                    {item.name}
                                </span>
                            ) : (
                                <>
                                    <Link to={item.route} className={styles.breadcrumb_link}>
                                        {item.name}
                                    </Link>
                                    <span className={styles.breadcrumb_separator}>/</span>
                                </>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
