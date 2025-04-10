import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styles from "../styles/Dashboard.module.css";
import Buttons from "../components/ui/Buttons/Buttons";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import SummarySection from "../components/SummarySection";
import ShortDetailsWidget from "./ShortDetailsWidget";
import { apiClient } from "../api/client";

const Regions = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("Daily");
  const [socket, setSocket] = useState(null);
  const cacheTimeoutRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [regionsPerPage, setRegionsPerPage] = useState(6);
  const [widgetsData, setWidgetsData] = useState(() => {
    const savedDemandData = localStorage.getItem("regionDemandData");
    const savedTimestamp = localStorage.getItem("regionDemandTimestamp");

    if (savedDemandData && savedTimestamp) {
      const timestamp = parseInt(savedTimestamp);
      const now = Date.now();
      if (now - timestamp < 30000) {
        const parsedDemandData = JSON.parse(savedDemandData);
        return {
          totalRegions: 0,
          totalEdcs: 0,
          totalDistricts: 0,
          totalSubstations: 0,
          totalFeeders: 0,
          commMeters: 0,
          nonCommMeters: 0,
          regionNames: Object.keys(parsedDemandData),
          edcCount: {},
          substationCount: {},
          feederCount: {},
          regionDemandData: parsedDemandData,
          regionStats: {},
        };
      }
    }

    return {
      totalRegions: 0,
      totalEdcs: 0,
      totalDistricts: 0,
      totalSubstations: 0,
      totalFeeders: 0,
      commMeters: 0,
      nonCommMeters: 0,
      regionNames: [],
      edcCount: {},
      substationCount: {},
      feederCount: {},
      regionDemandData: {},
      regionStats: {},
    };
  });

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    newSocket.on("regionUpdate", (data) => {
      setWidgetsData((prevData) => {
        const newData = {
          ...prevData,
          regionDemandData: {
            ...prevData.regionDemandData,
            [data.region]: data.graphData,
          },
        };
        localStorage.setItem(
          "regionDemandData",
          JSON.stringify(newData.regionDemandData)
        );
        localStorage.setItem("regionDemandTimestamp", Date.now().toString());
        return newData;
      });

      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
      cacheTimeoutRef.current = setTimeout(() => {
        localStorage.removeItem("regionDemandData");
        localStorage.removeItem("regionDemandTimestamp");
      }, 30000);
    });

    return () => {
      newSocket.close();
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (socket && widgetsData.regionNames.length > 0) {
      socket.emit("subscribe", {
        regions: widgetsData.regionNames,
      });
    }
  }, [widgetsData.regionNames, socket]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await apiClient.get("/regions/widgets");

      const data = response.data;

      setWidgetsData((prev) => ({
        totalRegions: data.totalRegions || prev.totalRegions,
        totalEdcs: data.totalEdcs || prev.totalEdcs,
        totalDistricts: data.totalDistricts || prev.totalDistricts,
        totalSubstations: data.totalSubstations || prev.totalSubstations,
        totalFeeders: data.totalFeeders || prev.totalFeeders,
        commMeters: data.commMeters || prev.commMeters,
        nonCommMeters: data.nonCommMeters || prev.nonCommMeters,
        regionNames: data.regionNames || prev.regionNames,
        edcCount: data.regionEdcCounts || prev.edcCount,
        substationCount: data.regionSubstationCounts || prev.substationCount,
        feederCount: data.regionFeederCounts || prev.feederCount,
        //   regionDemandData: prev.regionDemandData,
        // regionStats: prev.regionStats,
      }));
    };

    fetchData();
  }, []);

  const handleRegionClick = (region) => {
    navigate(
      `/admin/regions/${region.toLowerCase().replace(/\s+/g, "-")}/details`
    );
  };

  // Always use admin routes regardless of actual path
  const isRegionUser = false;
  const currentRegionName = "";

  const handleEdcClick = () => {
    if (isRegionUser && currentRegionName) {
      navigate(`/user/${currentRegionName}/edcs`);
    }
  };

  const handleSubstationClick = () => {
    if (isRegionUser && currentRegionName) {
      navigate(`/user/${currentRegionName}/substations`);
    }
  };

  const handlePageChange = (newPage, newPerPage = regionsPerPage) => {
    if (newPerPage !== regionsPerPage) {
      setCurrentPage(1);
      setRegionsPerPage(newPerPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className={styles.main_content}>
      <div className={styles.section_header}>
        <h2 className="title">Regions</h2>
        <div className={styles.action_container}>
          <div className={styles.action_cont}>
            <div className={styles.time_range_select_dropdown}>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={styles.time_range_select}
              >
                <option value="Daily">Daily</option>
                <option value="Monthly">Monthly</option>
                <option value="PreviousMonth">Previous Month</option>
                <option value="Year">Year</option>
              </select>
              <img
                src="icons/arrow-down.svg"
                alt="Select Time"
                className={styles.time_range_select_dropdown_icon}
              />
            </div>
          </div>
        </div>
      </div>

      <Breadcrumb />

      <SummarySection
        widgetsData={widgetsData}
        isUserRoute={isRegionUser}
        isBiUserRoute={false}
        onEdcClick={isRegionUser ? handleEdcClick : null}
        onSubstationClick={isRegionUser ? handleSubstationClick : null}
        showRegions={false}
        showDistricts={true}
      />

      <div className={styles.section_header}>
        <div className={styles.section_header_left}>
        <h2 className="title">
          Regions:{" "}
          <span className={styles.region_count}>
            [ {widgetsData.totalRegions} ]
          </span>
        </h2>
        <div className={styles.search_cont}>
            <input type="text" placeholder="Search" />
            <span className={styles.search_icon}>
                    <img src="icons/search-icon.svg" alt="Search" />
                </span>
          </div>
          <div className={styles.sorting}>
            <span className={styles.sorting_icons} onClick={() => {}}>
              <img src="icons/apps.svg" alt="cardView" />
            </span>
            <span className={styles.sorting_icons} onClick={() => {}}>
              <img src="icons/bars-staggered.svg" alt="listView" />
            </span>
          </div>
        </div>
        
        <div className={styles.action_container}>
          <div className={styles.pagination_container}>
            <div className={styles.pages_handler}>
              <select
                value={regionsPerPage}
                onChange={(e) =>
                  handlePageChange(currentPage, Number(e.target.value))
                }
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
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.previous_button}
              >
                <span className={styles.previous_button_icon} onClick={() => {}}>
                  <img src="icons/arrow-left.svg" alt="Previous" />
                </span>
              </button>
              <span className={styles.pageInfo}>
                Page {currentPage} of{" "}
                {Math.ceil(widgetsData.regionNames.length / regionsPerPage)}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage ===
                  Math.ceil(widgetsData.regionNames.length / regionsPerPage)
                }
                className={styles.next_button}
              >
                 <span className={styles.next_button_icon} onClick={() => {}}>  
                  <img src="icons/arrow-right.svg" alt="Next" />
                </span>
              </button>
            </div>
          </div>
          
        </div>
      </div>

      <div className={styles.region_stats_container}>
        {widgetsData.regionNames && widgetsData.regionNames.length > 0 ? (
          widgetsData.regionNames
            .slice(
              (currentPage - 1) * regionsPerPage,
              currentPage * regionsPerPage
            )
            .map((region, index) => (
              <div key={index} className={styles.individual_region_stats}>
                <ShortDetailsWidget
                  region={region}
                  name={region}
                  edcCount={widgetsData.edcCount?.[region.trim()] || 0}
                  substationCount={
                    widgetsData.substationCount?.[region.trim()] ?? 0
                  }
                  feederCount={widgetsData.feederCount?.[region.trim()] ?? 0}
                  graphData={
                    widgetsData.regionDemandData?.[region.trim()] ?? {
                      xAxis: [],
                      series: [],
                    }
                  }
                  currentValue={parseFloat(
                    widgetsData.regionDemandData?.[
                      region.trim()
                    ]?.series?.[0]?.data?.slice(-1)[0] || 0
                  ).toFixed(1)}
                  previousValue={parseFloat(
                    widgetsData.regionDemandData?.[
                      region.trim()
                    ]?.series?.[0]?.data?.slice(-2, -1)[0] || 0
                  ).toFixed(1)}
                />
              </div>
            ))
        ) : (
          <p>No regions available</p>
        )}
      </div>
    </div>
  );
};

export default Regions;
