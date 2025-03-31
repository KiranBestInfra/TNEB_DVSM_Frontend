import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import styles from "./Tables.module.css";
import Buttons from "../Buttons/Buttons";
import debounce from "lodash/debounce";

const TableSkeleton = ({
  columns,
  rowCount = 5,
  showSkeletonActionButtons,
}) => (
  <>
    <tbody className={`${styles.units_table_tbody} ${styles["skeleton"]}`}>
      {[...Array(rowCount)].map((_, rowIndex) => (
        <tr key={rowIndex} className={styles.units_table_tr}>
          {columns.map((column, colIndex) => (
            <td key={`${rowIndex}-${colIndex}`} className={styles.td}>
              <div
                className="skeleton-text skeleton-pulse"
                style={{
                  width: column.key === "sNo" ? "40px" : "50%",
                  height: "20px",
                  borderRadius: "8px",
                  animation: `pulse 1.5s ease-in-out ${
                    rowIndex * 0.1 + colIndex * 0.05
                  }s infinite`,
                }}
              />
            </td>
          ))}
          {showSkeletonActionButtons && (
            <td className={styles.td}>
              <div className={styles.actionButtons}>
                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="skeleton-circle skeleton-pulse"
                    style={{
                      width: "32px",
                      height: "32px",
                      animation: `pulse 1.5s ease-in-out ${
                        rowIndex * 0.1 + i * 0.05
                      }s infinite`,
                    }}
                  />
                ))}
              </div>
            </td>
          )}
        </tr>
      ))}
    </tbody>
  </>
);

const Table = ({
  data,
  columns = [
    { key: "sNo", label: "S.No" },
    { key: "unitId", label: "Unit ID" },
    { key: "unitName", label: "Unit Name" },
    { key: "unitType", label: "Type" },
    { key: "sez", label: "SEZ" },
    { key: "status", label: "Status" },
    { key: "meterNumber", label: "Meter Number" },
    { key: "initialReading", label: "Initial Reading" },
    { key: "balance", label: "Balance" },
    { key: "possessionDate", label: "Possession Date" },
    { key: "mobileNumber", label: "Mobile Number" },
    { key: "emailAddress", label: "Email Address" },
  ],
  actions,
  sortable = true,
  searchable = true,
  pagination = true,
  rowsPerPageOptions = [10, 15, 50],
  initialRowsPerPage = 10,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  onPayment,
  customStyles = {},
  loading = false,
  emptyMessage = "No data available",
  serverPagination,
  onPageChange,
  showSkeletonActionButtons = true,
  onSearch,
  text,
  showActions = true,
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // Sorting logic
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Enhanced filtering logic
  const filteredData = sortedData.filter((item) => {
    if (!searchTerm) return true; // If no search term, return all items

    //  Filter by specific columns if 'columns' is provided
    if (columns) {
      return columns.some((column) => {
        const value = item[column.key];
        return (
          value != null &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    //  Filter all columns if 'columns' is not provided
    return Object.values(item).some((value) =>
      value?.toString()?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );
  });

  // Pagination logic - only apply if not using server pagination
  const totalPages = serverPagination
    ? serverPagination.totalPages
    : Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = serverPagination
    ? filteredData
    : filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      );

  const handleSort = (key) => {
    if (!sortable) return;

    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleActionClick = (e, action, row) => {
    e.stopPropagation(); // Prevent row click event from firing
    if (action === onDelete) {
      setSelectedRow(row);
      setShowDeleteModal(true);
    } else {
      action(row);
    }
  };

  const handleConfirmDelete = () => {
    onDelete(selectedRow);
    setShowDeleteModal(false);
    setSelectedRow(null);
  };

  const renderActionButtons = (row) => {
    // If custom actions are provided and showActions is true, use those
    if (actions && showActions) {
      return (
        <div className={styles.actionButtons}>
          {actions.map((action, index) => (
            <span
              key={index}
              className="icons_actions"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(row);
              }}
              title={action.label}
            >
              <img src={action.icon} alt={action.label} />
            </span>
          ))}
        </div>
      );
    }

    // Otherwise, use default actions if any are provided
    if (onView || onPayment || onEdit || onDelete) {
      return (
        <div className={styles.actionButtons}>
          {onView && (
            <span
              className="icons_actions"
              onClick={(e) => handleActionClick(e, onView, row)}
              title="View"
            >
              <img src="icons/eye.svg" alt="View" />
            </span>
          )}
          {onPayment && (
            <span
              className="icons_actions"
              onClick={(e) => handleActionClick(e, onPayment, row)}
              title="Payment"
            >
              <img src="icons/payments.svg" alt="Payment" />
            </span>
          )}
          {onEdit && (
            <span
              className="icons_actions"
              onClick={(e) => handleActionClick(e, onEdit, row)}
              title="Edit"
            >
              <img src="icons/user-pen.svg" alt="Edit" />
            </span>
          )}
          {onDelete && (
            <span
              className="icons_actions"
              onClick={(e) => handleActionClick(e, onDelete, row)}
              title="Delete"
            >
              <img src="icons/delete.svg" alt="Delete" />
            </span>
          )}
        </div>
      );
    }

    return null;
  };

  const handlePageChangeInternal = (
    newPage,
    newRowsPerPage = serverPagination ? serverPagination.limit : rowsPerPage
  ) => {
    if (serverPagination) {
      onPageChange?.(newPage, newRowsPerPage);
    } else {
      setCurrentPage(newPage);
      setRowsPerPage(newRowsPerPage);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        if (serverPagination && onSearch) {
          onSearch(value);
        } else {
          setCurrentPage(1);
        }
      }, 300),
    [serverPagination, onSearch]
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className={styles.container}>
      {searchable && (
        <div className={styles.search_cont}>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchBar}
          />
          <span className="icons icon_placement">
            <img src="icons/search-icon.svg" alt="search" />
          </span>
        </div>
      )}

      <table className={styles.units_table}>
        <thead className={styles.units_table_thead}>
          <tr className={styles.units_table_tr}>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column.key)}
                className={sortable ? styles.thSortable : styles.th}
              >
                {column.label}
                {sortable && sortConfig.key === column.key && (
                  <span className={styles.sort_icons}>
                    {sortConfig.direction === "asc" ? (
                      <span className={styles.icons_asc}>
                        <img src="icons/arrow-up.svg" alt="asc" />
                      </span>
                    ) : (
                      <span className={styles.icons_desc}>
                        <img src="icons/arrow-down.svg" alt="desc" />
                      </span>
                    )}
                  </span>
                )}
              </th>
            ))}
            {(showActions || onEdit || onDelete || onView || onPayment) && (
              <th>Actions</th>
            )}
          </tr>
        </thead>
        {loading ? (
          <TableSkeleton
            columns={columns}
            rowCount={rowsPerPage}
            showSkeletonActionButtons={showSkeletonActionButtons}
          />
        ) : (
          <tbody className={styles.units_table_tbody}>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? styles.clickableRow : ""}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={styles.td}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : !row[column.key] ||
                          row[column.key] === 0 ||
                          row[column.key] === "0"
                        ? "NA"
                        : row[column.key]}
                    </td>
                  ))}
                  {(showActions ||
                    onEdit ||
                    onDelete ||
                    onView ||
                    onPayment) && (
                    <td className={styles.td}>{renderActionButtons(row)}</td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (showActions || onEdit || onDelete || onView || onPayment
                      ? 1
                      : 0)
                  }
                >
                  <div className={styles.emptyMessage_info}>{emptyMessage}</div>
                </td>
              </tr>
            )}
          </tbody>
        )}
      </table>

      {pagination &&
        (loading ? (
          <div className={styles.pagination}>
            <div>
              <div
                className="skeleton-text skeleton-pulse"
                style={{
                  width: "80px",
                  height: "32px",
                  borderRadius: "8px",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </div>
            <div className={styles.pagination_controls}>
              <div
                className="skeleton-circle skeleton-pulse"
                style={{
                  width: "32px",
                  height: "32px",
                  animation: "pulse 1.5s ease-in-out 0.1s infinite",
                }}
              />
              {[1].map((_, i) => (
                <div
                  key={i}
                  className="skeleton-text skeleton-pulse"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    animation: `pulse 1.5s ease-in-out ${
                      0.2 + i * 0.1
                    }s infinite`,
                  }}
                />
              ))}
              <div
                className="skeleton-circle skeleton-pulse"
                style={{
                  width: "32px",
                  height: "32px",
                  animation: "pulse 1.5s ease-in-out 0.5s infinite",
                }}
              />
            </div>
          </div>
        ) : (
          totalPages > 0 && (
            <div className={styles.pagination}>
              <div className={styles.pages_handler}>
                <select
                  value={
                    serverPagination ? serverPagination.limit : rowsPerPage
                  }
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    handlePageChangeInternal(1, newLimit);
                  }}
                  className={styles.select_pagination}
                >
                  {rowsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option} Per Page
                    </option>
                  ))}
                </select>
                <span className={styles.total_pages}>
                  Total:{" "}
                  {serverPagination ? serverPagination.totalCount : data.length}
                </span>
              </div>
              <div className={styles.paginationControls}>
                <button
                  onClick={() =>
                    handlePageChangeInternal(
                      serverPagination
                        ? serverPagination.currentPage - 1
                        : currentPage - 1
                    )
                  }
                  disabled={
                    serverPagination
                      ? !serverPagination.hasPrevPage
                      : currentPage === 1
                  }
                  className={styles.paginationButton}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page{" "}
                  {serverPagination
                    ? serverPagination.currentPage
                    : currentPage}{" "}
                  of {totalPages}
                </span>
                <button
                  onClick={() =>
                    handlePageChangeInternal(
                      serverPagination
                        ? serverPagination.currentPage + 1
                        : currentPage + 1
                    )
                  }
                  disabled={
                    serverPagination
                      ? !serverPagination.hasNextPage
                      : currentPage === totalPages
                  }
                  className={styles.paginationButton}
                >
                  Next
                </button>
              </div>
            </div>
          )
        ))}

      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className="title">Delete Confirmation</div>
              <span className="icons" onClick={() => setShowDeleteModal(false)}>
                <img src="icons/close.svg" alt="close" />
              </span>
            </div>
            <p>
              Are you sure you want to delete the selected {text}? This action
              cannot be undone.
            </p>
            <div className={styles.modalActions}>
            <Buttons
  label="Delete"
  onClick={async () => {
    if (selectedRow && onDelete) {
      await onDelete(selectedRow);
      setShowDeleteModal(false);
      setSelectedRow(null);
    }
  }}
  variant="danger"
  icon="icons/logout-icon.svg"
  alt="Logout"
  iconPosition="right"
/>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Table.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
    })
  ),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      icon: PropTypes.string.isRequired,
    })
  ),
  sortable: PropTypes.bool,
  searchable: PropTypes.bool,
  pagination: PropTypes.bool,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  initialRowsPerPage: PropTypes.number,
  onRowClick: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
  onPayment: PropTypes.func,
  customStyles: PropTypes.object,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  serverPagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    totalCount: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired,
    hasNextPage: PropTypes.bool.isRequired,
    hasPrevPage: PropTypes.bool.isRequired,
  }),
  onPageChange: PropTypes.func,
  showActions: PropTypes.bool,
};

export default Table;
