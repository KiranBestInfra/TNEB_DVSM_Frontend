import { Link, useLocation } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

const Breadcrumb = ({ items }) => {
    const location = useLocation();

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

    // Basic breadcrumb generation
    return (
        <nav className={styles.breadcrumb} aria-label="breadcrumb">
            <ol className={styles.breadcrumb_list}>
                <li className={styles.breadcrumb_item}>
                    <Link
                        to="/dashboard"
                        className={styles.breadcrumb_link}>
                        Dashboard
                    </Link>
                    {filteredPathnames.length > 0 && (
                        <span className={styles.breadcrumb_separator}>/</span>
                    )}
                </li>
                {filteredPathnames.map((name, index) => {
                    // Build path for this breadcrumb item
                    const routeTo = `/${pathnames.slice(0, pathnames.indexOf(name) + 1).join('/')}`;
                    const isLast = index === filteredPathnames.length - 1;

                    // Format the display name
                    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

                    return (
                        <li key={name} className={styles.breadcrumb_item}>
                            {isLast ? (
                                <span className={styles.breadcrumb_current}>
                                    {displayName}
                                </span>
                            ) : (
                                <>
                                    <Link
                                        to={routeTo}
                                        className={styles.breadcrumb_link}>
                                        {displayName}
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
