import React from "react";
import styles from "./SectionHeader.module.css";

const SectionHeader = ({
  title,
  showSearch = false,
  showViewToggle = false,
  viewMode,
  setViewMode,
  showPagination = false,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  searchQuery,
  onSearchChange,
  dataLength,
  children 
}) => {
  // Generate pagination options based on data length
  const getPaginationOptions = () => {
    if (!dataLength) return [2, 4, 6, 8];
    
    const options = [];
    const maxItems = Math.min(8, Math.ceil(dataLength / 2) * 2); // Ensure even numbers and max 8
    for (let i = 2; i <= maxItems; i += 2) {
      options.push(i);
    }
    return options.length > 0 ? options : [2, 4, 6, 8];
  };

  return (
    <div className={styles.section_header}>
      <div className={styles.section_header_left}>
        <h2 className={styles.title}>{title}</h2>
        
        {/* <div className={styles.search_sorting}>
          {showSearch && (
            <div className={styles.search_cont}>
              <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={onSearchChange}
                className={styles.search_input}
              />
              <span className={styles.search_icon}>
                <img src="icons/search-icon.svg" alt="Search" />
              </span>
            </div>
          )}

          {showViewToggle && (
            <div className={styles.sorting}>
              <span
                className={`${styles.sorting_icons} ${
                  viewMode === "card" ? styles.active : ""
                }`}
                onClick={() => setViewMode("card")}
              >
                <img src="icons/apps.svg" alt="cardView" />
              </span>
              <span
                className={`${styles.sorting_icons} ${
                  viewMode === "list" ? styles.active : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <img src="icons/bars-staggered.svg" alt="listView" />
              </span>
            </div>
          )}
        </div> */}
      </div>

      {showPagination && (
        <div className={styles.action_container}>
          <div className={styles.pagination_container}>
            <div className={styles.pages_handler}>
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className={styles.select_pagination}
              >
                {getPaginationOptions().map((option) => (
                  <option key={option} value={option}>
                    {option} Per Page
                  </option>
                ))}
              </select>
              <img
                src="icons/arrow-down.svg"
                alt="Select Time"
                className={styles.select_pagination_icon}
              />
            </div>
            <div className={styles.paginationControls}>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.previous_button}
              >
                <span className={styles.previous_button_icon}>
                  <img src="icons/arrow-left.svg" alt="Previous" />
                </span>
              </button>
              <span className={styles.pageInfo}>
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.next_button}
              >
                <span className={styles.next_button_icon}>
                  <img src="icons/arrow-right.svg" alt="Next" />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default SectionHeader;
