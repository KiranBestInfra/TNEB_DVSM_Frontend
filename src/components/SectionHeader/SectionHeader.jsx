import React from 'react';
import styles from './SectionHeader.module.css';

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
  children 
}) => {
  return (
    <div className={styles.section_header}>
      <div className={styles.section_header_left}>
        <h2 className="title">{title}</h2>
        
        <div className={styles.search_sorting}>{showSearch && (
          <div className={styles.search_cont}>
            <input type="text" placeholder="Search" />
            <span className={styles.search_icon}>
              <img src="icons/search-icon.svg" alt="Search" />
            </span>
          </div>
        )}

        {showViewToggle && (
          <div className={styles.sorting}>
            <span 
              className={`${styles.sorting_icons} ${viewMode === 'card' ? styles.active : ''}`} 
              onClick={() => setViewMode('card')}
            >
              <img src="icons/apps.svg" alt="cardView" />
            </span>
            <span 
              className={`${styles.sorting_icons} ${viewMode === 'list' ? styles.active : ''}`} 
              onClick={() => setViewMode('list')}
            >
              <img src="icons/bars-staggered.svg" alt="listView" />
            </span>
          </div>
        )}</div>
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
                {[6, 9, 12].map((option) => (
                  <option key={option} value={option}>
                    {option} Per Page
                  </option>
                ))}
              </select>
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