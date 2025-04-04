import { Link, useLocation } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

const Breadcrumb = ({ items }) => {
    const location = useLocation();

    // Always use admin routes regardless of actual path
    const pathSegments = location.pathname.split('/').filter((x) => x);
    const isRegionUserPath = false;

    // If items are passed directly, use them instead of building from the URL
    if (items && items.length) {
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
                                        <Link
                                            to={item.path}
                                            className={styles.breadcrumb_link}>
                                            {item.label}
                                        </Link>
                                        <span
                                            className={
                                                styles.breadcrumb_separator
                                            }>
                                            /
                                        </span>
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        );
    }

    // Original code for auto-generated breadcrumbs from URL
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Only hide breadcrumb on root path
    if (pathnames.length === 0 || location.pathname === '/') {
        return null;
    }

    // Filter out 'admin', 'user', and 'bi' from pathnames for cleaner breadcrumb
    const filteredPathnames = pathnames.filter(
        (name) => name !== 'admin' && name !== 'user' && name !== 'bi'
    );

    // For region user paths, we want a custom breadcrumb for any non-explicit paths
    if (isRegionUserPath && !items) {
        // Find the region in the path
        const region = pathnames.find(
            (p) =>
                p === 'chennai' ||
                p === 'coimbatore' ||
                p === 'erode' ||
                p === 'kancheepuram' ||
                p === 'karur' ||
                p === 'madurai' ||
                p === 'thanjavur' ||
                p === 'thiruvallur' ||
                p === 'tirunelveli' ||
                p === 'tiruvannamalai' ||
                p === 'trichy' ||
                p === 'vellore' ||
                p === 'villupuram'
        );

        if (region) {
            // Get current page type (edcs, substations, etc)
            const pagePath = pathnames[pathnames.length - 1];
            const formattedRegionName =
                region.charAt(0).toUpperCase() + region.slice(1);

            const routePrefix = '/admin';

            const customItems = [
                { label: 'Dashboard', path: `${routePrefix}/dashboard` },
            ];

            // Add region name
            customItems.push({
                label: `Region : ${formattedRegionName}`,
                path: `${routePrefix}/${region}/dashboard`,
            });

            // If we're on a specific page type (EDCs, substations, etc) add it
            if (
                pagePath === 'edcs' ||
                pagePath === 'substations' ||
                pagePath === 'feeders'
            ) {
                const pageLabel =
                    pagePath.charAt(0).toUpperCase() + pagePath.slice(1);
                customItems.push({
                    label: pageLabel,
                    path: `${routePrefix}/${region}/${pagePath}`,
                });
            }

            console.log(
                'Breadcrumb - Generated special items for region user:',
                customItems
            );

            return (
                <nav className={styles.breadcrumb} aria-label="breadcrumb">
                    <ol className={styles.breadcrumb_list}>
                        {customItems.map((item, index) => {
                            const isLast = index === customItems.length - 1;
                            return (
                                <li
                                    key={index}
                                    className={styles.breadcrumb_item}>
                                    {isLast ? (
                                        <span
                                            className={
                                                styles.breadcrumb_current
                                            }>
                                            {item.label}
                                        </span>
                                    ) : (
                                        <>
                                            <Link
                                                to={item.path}
                                                className={
                                                    styles.breadcrumb_link
                                                }>
                                                {item.label}
                                            </Link>
                                            <span
                                                className={
                                                    styles.breadcrumb_separator
                                                }>
                                                /
                                            </span>
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

    const getBreadcrumbName = (path, index, allPaths) => {
        // Map of route paths to display names
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

        // Handle region names
        if (
            path === 'chennai' ||
            path === 'coimbatore' ||
            path === 'erode' ||
            path === 'kancheepuram' ||
            path === 'karur' ||
            path === 'madurai' ||
            path === 'thanjavur' ||
            path === 'thiruvallur' ||
            path === 'tirunelveli' ||
            path === 'tiruvannamalai' ||
            path === 'trichy' ||
            path === 'vellore' ||
            path === 'villupuram'
        ) {
            return isRegionUserPath
                ? `Region : ${path.charAt(0).toUpperCase() + path.slice(1)}`
                : `Region: ${path.charAt(0).toUpperCase() + path.slice(1)}`;
        }

        // Handle EDC names
        if (
            path.includes('-north') ||
            path.includes('-south') ||
            path.includes('-east') ||
            path.includes('-west') ||
            path.includes('-central') ||
            path.includes('-rural') ||
            path.includes('-urban')
        ) {
            return `EDC: ${path
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}`;
        }

        // Handle Substation names
        if (path.includes('-ss') || path.includes('-substation')) {
            return `Substation: ${path
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}`;
        }

        // Handle Feeder names
        if (path.includes('-feeder')) {
            return `Feeder: ${path
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}`;
        }

        return routeMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
    };

    // Determine if we're in a user route
    const isUserRoute = pathnames.includes('user');
    const routePrefix = isUserRoute ? '/user' : '/admin';

    // Build the complete hierarchy path
    const buildCompleteHierarchy = (paths) => {
        const hierarchy = [];

        // Special case for dashboard - don't show extra levels
        if (paths[0] === 'dashboard') {
            return hierarchy; // Return empty array for dashboard
        }

        // If we're in a bi/user path, we need special handling
        if (isRegionUserPath) {
            // Find the region in the path
            const region = paths.find(
                (p) =>
                    p === 'chennai' ||
                    p === 'coimbatore' ||
                    p === 'erode' ||
                    p === 'kancheepuram' ||
                    p === 'karur' ||
                    p === 'madurai' ||
                    p === 'thanjavur' ||
                    p === 'thiruvallur' ||
                    p === 'tirunelveli' ||
                    p === 'tiruvannamalai' ||
                    p === 'trichy' ||
                    p === 'vellore' ||
                    p === 'villupuram'
            );

            if (region) {
                // For region user, we ONLY add the region directly, without the "Regions" parent
                hierarchy.push({
                    path: region,
                    name: `Region : ${
                        region.charAt(0).toUpperCase() + region.slice(1)
                    }`,
                    route: `${routePrefix}/${region}/dashboard`,
                });
            }

            // Check if we have EDCs or Substations in the path
            const currentPage = paths[paths.length - 1];
            if (
                currentPage === 'edcs' ||
                currentPage === 'substations' ||
                currentPage === 'feeders'
            ) {
                hierarchy.push({
                    path: currentPage,
                    name: getBreadcrumbName(currentPage),
                    route: `${routePrefix}/${region}/${currentPage}`,
                });
            }

            return hierarchy;
        }

        // Check if this is a direct route (edcs, substations, etc.)
        const isDirectRoute = paths.some((p) =>
            ['edcs', 'substations'].includes(p)
        );

        if (isDirectRoute) {
            // For direct routes, just add the current page
            const currentPage = paths[paths.length - 1];
            hierarchy.push({
                path: currentPage,
                name: getBreadcrumbName(currentPage),
                route: `${routePrefix}/${currentPage}`,
            });
            return hierarchy;
        }

        // Find all components in the path
        const region = paths.find(
            (p) =>
                p === 'chennai' ||
                p === 'coimbatore' ||
                p === 'erode' ||
                p === 'kancheepuram' ||
                p === 'karur' ||
                p === 'madurai' ||
                p === 'thanjavur' ||
                p === 'thiruvallur' ||
                p === 'tirunelveli' ||
                p === 'tiruvannamalai' ||
                p === 'trichy' ||
                p === 'vellore' ||
                p === 'villupuram'
        );

        const edc = paths.find(
            (p) =>
                p.includes('-north') ||
                p.includes('-south') ||
                p.includes('-east') ||
                p.includes('-west') ||
                p.includes('-central') ||
                p.includes('-rural') ||
                p.includes('-urban')
        );

        const substation = paths.find(
            (p) => p.includes('-ss') || p.includes('-substation')
        );

        const currentPage = paths[paths.length - 1];

        // Skip adding Regions for region user paths
        if (!isRegionUserPath) {
            hierarchy.push({
                path: 'regions',
                name: 'Regions',
                route: `${routePrefix}/regions`,
            });
        }

        // Add Region if found
        if (region) {
            hierarchy.push({
                path: region,
                name: getBreadcrumbName(region),
                route: `${routePrefix}/${region}`,
            });
        }

        // Add EDCs if we have a region
        if (region) {
            hierarchy.push({
                path: 'edcs',
                name: 'EDCs',
                route: `${routePrefix}/${region}/edcs`,
            });
        }

        // Add EDC if found
        if (edc) {
            hierarchy.push({
                path: edc,
                name: getBreadcrumbName(edc),
                route: `${routePrefix}/${region}/${edc}`,
            });
        }

        // Add Substations if we have an EDC
        if (edc) {
            hierarchy.push({
                path: 'substations',
                name: 'Substations',
                route: `${routePrefix}/${region}/${edc}/substations`,
            });
        }

        // Add Substation if found
        if (substation) {
            hierarchy.push({
                path: substation,
                name: getBreadcrumbName(substation),
                route: `${routePrefix}/${region}/${edc}/${substation}`,
            });
        }

        // Add Feeders if we have a substation
        if (substation) {
            hierarchy.push({
                path: 'feeders',
                name: 'Feeders',
                route: `${routePrefix}/${region}/${edc}/${substation}/feeders`,
            });
        }

        // Add current page if it's not already included
        if (
            ['feeders', 'substations', 'edcs'].includes(currentPage) &&
            !hierarchy.some((item) => item.path === currentPage)
        ) {
            hierarchy.push({
                path: currentPage,
                name: getBreadcrumbName(currentPage),
                route: `${routePrefix}/${region}/${edc}/${substation}/${currentPage}`,
            });
        }

        return hierarchy;
    };

    const completeHierarchyPath = buildCompleteHierarchy(filteredPathnames);

    return (
        <nav className={styles.breadcrumb} aria-label="breadcrumb">
            <ol className={styles.breadcrumb_list}>
                <li className={styles.breadcrumb_item}>
                    <Link
                        to={`${routePrefix}/dashboard`}
                        className={styles.breadcrumb_link}>
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
                                    <Link
                                        to={item.route}
                                        className={styles.breadcrumb_link}>
                                        {item.name}
                                    </Link>
                                    <span
                                        className={styles.breadcrumb_separator}>
                                        /
                                    </span>
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
