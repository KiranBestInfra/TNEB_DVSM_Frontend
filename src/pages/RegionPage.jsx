import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/TNEBDashboard.module.css';
import LineBarChart from '../components/graphs/LineBarChart/LineBarChart';

const RegionPage = () => {
    const navigate = useNavigate();
    const [timeframe, setTimeframe] = useState('Last 7 Days');
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [visibleItems, setVisibleItems] = useState(5);
    const [isPaused, setIsPaused] = useState(false);
    const autoScrollIntervalRef = useRef(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [regions, setRegions] = useState([
        { 
            id: 1, 
            name: 'Chennai', 
            communicated: 120, 
            nonCommunication: 15, 
            edc: 45, 
            district: 'Chennai District', 
            substation: 18 
        },
        { 
            id: 2, 
            name: 'Coimbatore', 
            communicated: 95, 
            nonCommunication: 10, 
            edc: 38, 
            district: 'Coimbatore District', 
            substation: 15 
        },
        { 
            id: 3, 
            name: 'Madurai', 
            communicated: 85, 
            nonCommunication: 12, 
            edc: 32, 
            district: 'Madurai District', 
            substation: 14 
        },
        { 
            id: 4, 
            name: 'Trichy', 
            communicated: 78, 
            nonCommunication: 8, 
            edc: 30, 
            district: 'Trichy District', 
            substation: 12 
        },
        { 
            id: 5, 
            name: 'Salem', 
            communicated: 72, 
            nonCommunication: 9, 
            edc: 28, 
            district: 'Salem District', 
            substation: 11 
        },
        { 
            id: 6, 
            name: 'Tirunelveli', 
            communicated: 68, 
            nonCommunication: 7, 
            edc: 26, 
            district: 'Tirunelveli District', 
            substation: 10 
        },
        { 
            id: 7, 
            name: 'Erode', 
            communicated: 65, 
            nonCommunication: 6, 
            edc: 25, 
            district: 'Erode District', 
            substation: 9 
        },
        { 
            id: 8, 
            name: 'Vellore', 
            communicated: 62, 
            nonCommunication: 5, 
            edc: 24, 
            district: 'Vellore District', 
            substation: 9 
        },
        { 
            id: 9, 
            name: 'Thanjavur', 
            communicated: 58, 
            nonCommunication: 6, 
            edc: 22, 
            district: 'Thanjavur District', 
            substation: 8 
        },
        { 
            id: 10, 
            name: 'Thoothukudi', 
            communicated: 55, 
            nonCommunication: 5, 
            edc: 21, 
            district: 'Thoothukudi District', 
            substation: 8 
        },
        { 
            id: 11, 
            name: 'Dindigul', 
            communicated: 52, 
            nonCommunication: 4, 
            edc: 20, 
            district: 'Dindigul District', 
            substation: 7 
        },
        { 
            id: 12, 
            name: 'Kanchipuram', 
            communicated: 48, 
            nonCommunication: 5, 
            edc: 18, 
            district: 'Kanchipuram District', 
            substation: 7 
        },
        { 
            id: 13, 
            name: 'Cuddalore', 
            communicated: 45, 
            nonCommunication: 4, 
            edc: 17, 
            district: 'Cuddalore District', 
            substation: 6 
        }
    ]);

    const totalMeters = 1243;
    const totalCommunicated = regions.reduce((sum, region) => sum + region.communicated, 0);
    const totalNonCommunicated = regions.reduce((sum, region) => sum + region.nonCommunication, 0);
    const communicationPercentage = Math.round((totalCommunicated / (totalCommunicated + totalNonCommunicated)) * 100);
    const nonCommunicationPercentage = 100 - communicationPercentage;

    const getDisplayItems = useCallback(() => {
        const itemsToClone = Math.min(visibleItems, regions.length);
        const firstItems = regions.slice(0, itemsToClone);
        const lastItems = regions.slice(-itemsToClone);
        
        return [...lastItems, ...regions, ...firstItems];
    }, [regions, visibleItems]);
    
    const displayItems = getDisplayItems();
    
    const adjustedCurrentIndex = currentIndex + Math.min(visibleItems, regions.length);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 480) {
                setVisibleItems(1);
            } else if (width < 768) {
                setVisibleItems(2);
            } else if (width < 1100) {
                setVisibleItems(3);
            } else if (width < 1400) {
                setVisibleItems(4);
            } else {
                setVisibleItems(5);
            }
            
            if (currentIndex > regions.length - 1) {
                setCurrentIndex(regions.length - 1);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [regions.length, currentIndex]);

    const handleTimeframeChange = (e) => {
        setTimeframe(e.target.value);
    };

    const handleTransitionEnd = useCallback(() => {
        if (isTransitioning) {
            setIsTransitioning(false);
            
            if (currentIndex >= regions.length) {
                carouselRef.current.style.transition = 'none';
                setCurrentIndex(0);
                carouselRef.current.offsetHeight;
                setTimeout(() => {
                    if (carouselRef.current) {
                        carouselRef.current.style.transition = 'transform 0.5s ease';
                    }
                }, 50);
            } else if (currentIndex < 0) {
                carouselRef.current.style.transition = 'none';
                setCurrentIndex(regions.length - 1);
                carouselRef.current.offsetHeight;
                setTimeout(() => {
                    if (carouselRef.current) {
                        carouselRef.current.style.transition = 'transform 0.5s ease';
                    }
                }, 50);
            }
        }
    }, [isTransitioning, currentIndex, regions.length]);

    useEffect(() => {
        const carousel = carouselRef.current;
        if (carousel) {
            carousel.addEventListener('transitionend', handleTransitionEnd);
            return () => {
                carousel.removeEventListener('transitionend', handleTransitionEnd);
            };
        }
    }, [handleTransitionEnd]);

    const handleNext = useCallback(() => {
        if (isTransitioning) return;
        
        setIsTransitioning(true);
        setCurrentIndex(prevIndex => {
            const nextIndex = prevIndex + 1;
            return nextIndex;
        });
    }, [isTransitioning]);

    const handlePrevious = useCallback(() => {
        if (isTransitioning) return;
        
        setIsTransitioning(true);
        setCurrentIndex(prevIndex => {
            const nextIndex = prevIndex - 1;
            return nextIndex;
        });
    }, [isTransitioning]);

    useEffect(() => {
        const startAutoScroll = () => {
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current);
            }
            
            autoScrollIntervalRef.current = setInterval(() => {
                if (!isPaused && !isTransitioning) {
                    handleNext();
                }
            }, 5000);
        };
        
        startAutoScroll();
        
        return () => {
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current);
            }
        };
    }, [handleNext, isPaused, isTransitioning]);

    const handleMouseEnter = () => {
        setIsPaused(true);
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
    };

    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
        setIsPaused(true);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) {
            setIsPaused(false);
            return;
        }
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            handleNext();
        }

        if (isRightSwipe) {
            handlePrevious();
        }

        setTouchStart(null);
        setTouchEnd(null);
        
        setTimeout(() => {
            setIsPaused(false);
        }, 1000);
    };

    const handleRegionClick = (region) => {
        // Navigate to the region detail page
        navigate(`/admin/region/${region.id}`);
    };

    const renderRegionCard = (region) => {
        return (
            <>
                <div 
                    className={styles.stat_card}
                    onClick={() => handleRegionClick(region)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className={styles.stat_card_left}>
                        <div className={styles.region}>
                        <div className="title">{region.name}</div>
                        <div className={styles.stat_card_right}>
                        <span className="icons">
                            <img src="icons/units.svg" alt={`${region.name} Icon`} />
                        </span>
                    </div>
                        </div>
                        

                        <div className={styles.commincation_status}>
                        <p className={styles.stat_number}>{region.communicated + region.nonCommunication}</p>
                        <div className={styles.communication_status_container}>
                    <div className={styles.communicating_status}>
                    <div className={styles.meter_status}>
                                <span className={`${styles.status_indicator} ${styles.communicating}`} />
                            </div>
                        <span><span className={styles.status_indicator}></span> <strong>{region.communicated}</strong></span>
                    </div>
                    <div className={styles.communicating_status}>
                    <div className={styles.meter_status}>
                                <span className={`${styles.status_indicator} ${styles.non_communicating}`} />
                            </div>
                        
                        <span> <strong>{region.nonCommunication}</strong></span>
                    </div>
                        </div>
                       
                </div>
                    </div>
                   
                    
                </div>
               
                 <div 
                    className={styles.active_units_container}
                    onClick={() => handleRegionClick(region)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="sub_title">
                        <span>EDC: <strong>{region.edc}</strong></span>
                    </div>
                </div>
            </>
        );
    };

    // Generate sample data for the region graphs
    const generateMockDataForRegion = (region) => {
        // Sample data for the selected region's graph
        return {
            daily: {
                xAxis: ['2023-10-01', '2023-10-02', '2023-10-03', '2023-10-04', '2023-10-05', '2023-10-06', '2023-10-07'],
                series: [
                    {
                        name: 'Communicating Meters',
                        data: Array.from({ length: 7 }, () => Math.floor(region.communicated * (0.85 + Math.random() * 0.3)))
                    },
                    {
                        name: 'Non-Communicating Meters',
                        data: Array.from({ length: 7 }, () => Math.floor(region.nonCommunication * (0.7 + Math.random() * 0.5)))
                    }
                ]
            },
            monthly: {
                xAxis: ['2023-05-01', '2023-06-01', '2023-07-01', '2023-08-01', '2023-09-01', '2023-10-01'],
                series: [
                    {
                        name: 'Communicating Meters',
                        data: Array.from({ length: 6 }, () => Math.floor(region.communicated * (0.75 + Math.random() * 0.5)))
                    },
                    {
                        name: 'Non-Communicating Meters',
                        data: Array.from({ length: 6 }, () => Math.floor(region.nonCommunication * (0.6 + Math.random() * 0.8)))
                    }
                ]
            }
        };
    };

    // Get the currently selected region based on the adjusted index
    const selectedRegion = regions[currentIndex >= 0 && currentIndex < regions.length ? currentIndex : 0];
    
    // Generate graph data for the selected region
    const selectedRegionData = generateMockDataForRegion(selectedRegion);

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className='title'>Dashboard</h2>
               
                    
                    <div className={styles.action_cont}>
                        <div className={styles.time_range_select_dropdown}>
                            <select
                                value={timeframe}
                                onChange={handleTimeframeChange}
                                className={styles.time_range_select}>
                                <option value="Last 7 Days">Last 7 Days</option>
                                <option value="Last 30 Days">Last 30 Days</option>
                            </select>
                            <img
                                src="icons/arrow-down.svg"
                                alt="Select Time"
                                className={styles.time_range_select_dropdown_icon}
                            />
                        </div>
                    </div>
                
            </div>

            <div className={styles.summary_section}>
                <div className={styles.summary_card}>
                    <div className={styles.total_meters_container}>
                        
                        <img src="icons/meter.svg" alt="Total Meters" />
                       <div  className={styles.total_meters}>
                       <div className='titles'>Total Meters</div>
                       <div className={styles.summary_value}>{totalMeters}</div>
                       </div>
                       
                    </div>



                    <div className={styles.meter_communication}> 
                    <div className={styles.summary_item}>
                        <div className='title'>Total Communicating <br/> Meters</div>
                        <div className={styles.summary_progress}>
                        <div className={styles.summary_value}>
                            <div>900</div>
                            <div className={styles.meter_percentage}>{communicationPercentage}%</div>
                        </div>
                            <div className={styles.progress_bar}>

                                <div 
                                    className={`${styles.progress_fill} ${styles.progress_fill_positive}`} 
                                    style={{ width: `${communicationPercentage}%` }}
                                ></div>
                            </div>
                           
                        </div>
                    </div>
                    </div>
                    
                    <div className={styles.meter_communication}>
                    <div className={styles.summary_item}>
                        <div className='title'>Total Non-Communicating Meters</div>
                        <div className={styles.summary_progress}>
                        <div className={`${styles.summary_value} ${styles.negative_value}`}>
                            <div>96</div>
                            <div className={styles.meter_percentage}>{nonCommunicationPercentage}%</div>
                        </div>
                            <div className={styles.progress_bar}>
                                <div 
                                    className={`${styles.progress_fill} ${styles.progress_fill_negative}`} 
                                    style={{ width: `${nonCommunicationPercentage}%` }}
                                ></div>
                            </div>
                            
                        </div>
                    </div>
                    </div>
                    
                </div>
            </div>

            <div className={styles.section_header}>
                <h2 className='title'>Regions</h2>
                <div className={styles.action_cont}>
                    <button 
                        className={`${styles.carousel_nav_button}`} 
                        onClick={handlePrevious}
                        aria-label="Previous"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <img src="icons/arrow-left.svg" alt="Previous" />
                    </button>
                    
                    <button 
                        className={`${styles.carousel_nav_button}`} 
                        onClick={handleNext}
                        aria-label="Next"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <img src="icons/arrow-right.svg" alt="Next" />
                    </button>
                </div>
            </div>

            <div className={styles.region_stats_carousel_container}>
                
                <div 
                    className={styles.region_stats_carousel}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div 
                        className={styles.region_stats_grid} 
                        ref={carouselRef}
                        style={{ 
                            transform: `translateX(calc(-${adjustedCurrentIndex * (100 / displayItems.length)}%))`,
                            width: `calc(460% + 22rem)`,
                            transition: 'transform 0.5s'
                        }}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {displayItems.map((region, index) => (
                            <div 
                                key={`${region.id}-${index}`} 
                                className={`${styles.total_units_container} ${index === adjustedCurrentIndex ? styles.active_card : ''}`}
                                style={{ width: `calc(${100 / displayItems.length}% - ${(displayItems.length - 1) / displayItems.length}rem)` }}
                            >
                                {renderRegionCard(region)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={styles.region_graph_container}>
                <div className={styles.section_header}>
                    <h2 className="title">{selectedRegion.name} Region Metrics</h2>
                    <div className={styles.region_metrics_container}>
                        <div className={styles.district_name}>{selectedRegion.district}</div>
                        <div className={styles.substation_name}>
                            <div className={styles.substation_icon}> {selectedRegion.substation}</div>
                              Substations</div>
                    </div>
                </div>
                <div className={styles.graph_card}>
                    <LineBarChart 
                        title={`${selectedRegion.name} Communication Status`}
                        data={selectedRegionData}
                        seriesColors={['#029447', '#dc272c']}
                        yAxisLabel="Units"
                        height="400px"
                    />
                </div>
            </div>
        </div>
    );
};

export default RegionPage;