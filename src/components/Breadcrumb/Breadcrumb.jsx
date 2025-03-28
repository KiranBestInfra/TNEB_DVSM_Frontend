import { Link, useLocation } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Only hide breadcrumb on root path
  if (pathnames.length === 0 || location.pathname === '/') {
    return null;
  }

  const getBreadcrumbName = (path, index, allPaths) => {
    // Map of route paths to display names
    const routeMap = {
      'dashboard': 'Dashboard',
      'regions': 'Regions',
      'edcs': 'EDCs',
      'substations': 'Substations',
      'feeders': 'Feeders',
      'tickets': 'Tickets',
      'profile': 'Profile',
      'create-ticket': 'Create Ticket',
      'ticket-details': 'Ticket Details',
      'unit-selection': 'Unit Selection',
      'unit-detail': 'Unit Detail',
      'verification': 'Verification',
      'forgot-password': 'Forgot Password',
      'privacy': 'Privacy',
      'terms': 'Terms'
    };

    // Handle region names
    if (path === 'chennai' || path === 'coimbatore' || path === 'erode' || 
        path === 'kancheepuram' || path === 'karur' || path === 'madurai' || 
        path === 'thanjavur' || path === 'thiruvallur' || path === 'tirunelveli' || 
        path === 'tiruvannamalai' || path === 'trichy' || path === 'vellore' || 
        path === 'villupuram') {
      return `Region: ${path.charAt(0).toUpperCase() + path.slice(1)}`;
    }

    // Handle EDC names
    if (path.includes('-north') || path.includes('-south') || path.includes('-east') || path.includes('-west') ||
        path.includes('-central') || path.includes('-rural') || path.includes('-urban')) {
      return `EDC: ${path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
    }

    // Handle Substation names
    if (path.includes('-ss') || path.includes('-substation')) {
      return `Substation: ${path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
    }

    // Handle Feeder names
    if (path.includes('-feeder')) {
      return `Feeder: ${path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
    }

    return routeMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  // Filter out 'admin' from pathnames
  const filteredPathnames = pathnames.filter(name => name !== 'admin');

  // Build the complete hierarchy path
  const buildCompleteHierarchy = (paths) => {
    const hierarchy = [];
    
    // Special case for dashboard - show all levels
    if (paths[0] === 'dashboard') {
      hierarchy.push({ path: 'regions', name: 'Regions', route: '/admin/regions' });
      hierarchy.push({ path: 'edcs', name: 'EDCs', route: '/admin/regions/edcs' });
      hierarchy.push({ path: 'substations', name: 'Substations', route: '/admin/regions/edcs/substations' });
      hierarchy.push({ path: 'feeders', name: 'Feeders', route: '/admin/regions/edcs/substations/feeders' });
      return hierarchy;
    }
    
    // Find all components in the path
    const region = paths.find(p => p === 'chennai' || p === 'coimbatore' || p === 'erode' || 
                                 p === 'kancheepuram' || p === 'karur' || p === 'madurai' || 
                                 p === 'thanjavur' || p === 'thiruvallur' || p === 'tirunelveli' || 
                                 p === 'tiruvannamalai' || p === 'trichy' || p === 'vellore' || 
                                 p === 'villupuram');
    
    const edc = paths.find(p => p.includes('-north') || p.includes('-south') || p.includes('-east') || 
                              p.includes('-west') || p.includes('-central') || p.includes('-rural') || 
                              p.includes('-urban'));
    
    const substation = paths.find(p => p.includes('-ss') || p.includes('-substation'));
    
    const currentPage = paths[paths.length - 1];

    // Always add Regions first
    hierarchy.push({ path: 'regions', name: 'Regions', route: '/admin/regions' });
    
    // Add Region if found
    if (region) {
      hierarchy.push({ path: region, name: getBreadcrumbName(region), route: `/admin/${region}` });
    }
    
    // Add EDCs if we have a region
    if (region) {
      hierarchy.push({ path: 'edcs', name: 'EDCs', route: `/admin/${region}/edcs` });
    }
    
    // Add EDC if found
    if (edc) {
      hierarchy.push({ path: edc, name: getBreadcrumbName(edc), route: `/admin/${region}/${edc}` });
    }
    
    // Add Substations if we have an EDC
    if (edc) {
      hierarchy.push({ path: 'substations', name: 'Substations', route: `/admin/${region}/${edc}/substations` });
    }
    
    // Add Substation if found
    if (substation) {
      hierarchy.push({ path: substation, name: getBreadcrumbName(substation), route: `/admin/${region}/${edc}/${substation}` });
    }
    
    // Add Feeders if we have a substation
    if (substation) {
      hierarchy.push({ path: 'feeders', name: 'Feeders', route: `/admin/${region}/${edc}/${substation}/feeders` });
    }

    // Add current page if it's not already included
    if (['feeders', 'substations', 'edcs'].includes(currentPage) && 
        !hierarchy.some(item => item.path === currentPage)) {
      hierarchy.push({ 
        path: currentPage, 
        name: getBreadcrumbName(currentPage),
        route: `/admin/${region}/${edc}/${substation}/${currentPage}`
      });
    }

    return hierarchy;
  };

  const completeHierarchyPath = buildCompleteHierarchy(filteredPathnames);

  return (
    <nav className={styles.breadcrumb} aria-label="breadcrumb">
      <ol className={styles.breadcrumb_list}>
        <li className={styles.breadcrumb_item}>
          <Link to="/dashboard" className={styles.breadcrumb_link}>
            Dashboard
          </Link>
          {completeHierarchyPath.length > 0 && <span className={styles.breadcrumb_separator}>/</span>}
        </li>
        {completeHierarchyPath.map((item, index) => {
          const isLast = index === completeHierarchyPath.length - 1;

          return (
            <li key={item.path} className={styles.breadcrumb_item}>
              {isLast ? (
                <span className={styles.breadcrumb_current}>{item.name}</span>
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