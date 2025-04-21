import styles from '../styles/LongDetailsWidget.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Buttons from '../components/ui/Buttons/Buttons';
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import { Link } from 'react-router-dom';
import SummarySection from '../components/SummarySection';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import { useAuth } from '../components/AuthProvider';


const EdcDetails = () => {
    const { edc: edcParam } = useParams();
    const { user, isCircle } = useAuth();
    const edcName = isCircle() && user?.name ? user.name : edcParam;
    const { region, edcId: paramEdcId } = useParams();
    const edcId = isCircle() ? user?.hierarchy_id : paramEdcId;
    const { isRegion, isAdmin } = useAuth();
    const regionUser = isRegion();
    const adminUser = isAdmin();
    const [timeRange, setTimeRange] = useState('Daily');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [graphData, setGraphData] = useState({
        xAxis: [],
        series: [],
    });
    const [widgetsData, setWidgetsData] = useState(() => {
        const savedDemandData = localStorage.getItem('edcDemandData');
        const savedTimestamp = localStorage.getItem('edcDemandTimestamp');

        if (savedDemandData && savedTimestamp) {
            const timestamp = parseInt(savedTimestamp);
            const now = Date.now();
            if (now - timestamp < 30000) {
                const parsedDemandData = JSON.parse(savedDemandData);
                return {
                    totalRegions: 0,
                    totalEdcs: 0,
                    totalSubstations: 0,
                    totalFeeders: 0,
                    commMeters: 0,
                    nonCommMeters: 0,
                    edcSubstationCount: 0,
                    edcFeederCount: parsedData.feederCount || 0,
                    edcNames: Object.keys(parsedDemandData),
                    regionEdcCount: 0,
                    substationCount: {},
                    feederCount: {},
                    edcDemandData: parsedDemandData,
                    districtcounts: 0,
                };
            }
        }

        return {
            totalRegions: 0,
            districtcounts: 0,
            totalEdcs: 0,
            totalSubstations: 0,
            totalFeeders: 0,
            edcSubstationCount: 0,
            commMeters: 0,
            nonCommMeters: 0,
            edcFeederCount: 0,
            edcNames: [],
            substationCount: {},
            feederCount: {},
            regionEdcCount: 0,
            edcDemandData: {},
        };
    });

    //const entityId =  user?.id;
    const entityId = isCircle() ? user?.id : (regionUser ? edcId : edcId);
    const entityName = adminUser || regionUser ? entityId : edcName?.replace('_EDC', '').toLowerCase();
    //console.log('entityName', entityName);
    const navigate = useNavigate();

  


    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const formatDate = (date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day} 00:00:00`;
                };

                const formattedDate = selectedDate ? formatDate(selectedDate) : formatDate(new Date());
                const response = await apiClient.get(
                    `/edcs/graph/${entityId}/demand/${formattedDate}`
                );
                const data = response.data;
                setGraphData(data);
            } catch (error) {
                console.error('Error fetching edc graph data:', error);
                try {
                    await apiClient.post('/log/error', {
                        message: error.message,
                        stack: error.stack || 'No stack trace',
                        time: new Date().toISOString(),
                    });
                } catch (logError) {
                    console.error('Error logging to backend:', logError);
                }
            }
        };

        fetchGraphData();
    }, [entityId, timeRange, selectedDate]);

    // const entityName = entityId
    //     ? entityId
    //           .split('-')
    //           .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    //           .join(' ')
    //     : 'Unknown';

    useEffect(() => {
       
        const fetchEdcWidgets = async () => {
            try {
                const response = await apiClient.get(`/edcs/${edcId}/widgets`);
                const feederCount =
                    response?.data?.regionFeederNames?.length || 0;
                setWidgetsData((prev) => ({
                    ...prev,
                    commMeters: response?.data?.commMeters || 0,
                    nonCommMeters: response?.data?.nonCommMeters || 0,
                    edcSubstationCount: response?.data?.substationCounts || 0,
                    edcFeederCount: feederCount,
                    districtcounts: response.data?.districtCounts || 0,
                }));
            } catch (error) {
                console.error('Error fetching EDC widgets:', error);
                try {
                    await apiClient.post('/log/error', {
                        message: error.message,
                        stack: error.stack || 'No stack trace',
                        time: new Date().toISOString(),
                    });
                } catch (logError) {
                    console.error('Error logging to backend:', logError);
                }
            }
        };

        fetchEdcWidgets();
    }, [edcId]);

    const stats = {
        substationCount: widgetsData.edcSubstationCount,
        feederCount: widgetsData.edcFeederCount,
        currentValue: 10.2,
        previousValue: 9.8,
        districtcounts: widgetsData.districtcounts,
        commMeters: widgetsData.commMeters || 0,
        nonCommMeters: widgetsData.nonCommMeters || 0,
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    return (
        <div className={styles.main_content}>
            <SectionHeader title={`${entityName} EDC`} />
            <Breadcrumb />
                      <SummarySection
        widgetsData={{
        totalDistricts:stats.districtcounts,
        totalSubstations:stats.substationCount,
          totalFeeders: stats.feederCount,
          commMeters: stats.commMeters,
          nonCommMeters: stats.nonCommMeters,
        }}
        isUserRoute={isCircle()}
        isRegion={isRegion()}
        showDistricts={true}
        showFeeders={true}
        showEdcs={false}
        showSubstations={true}
        showRegions={false}

        onSubstationClick={() => {
            if (isCircle()) {
                navigate(`/user/edc/${edcId}/substations`);
            } else if (isRegion()) {
                navigate(`/user/region/${edcId}/substations`);
            } else {
                navigate(`/admin/${region}/edcs/${edcId}/substations`);
            }
        }}
        onFeederClick={() => {
            if (isCircle()) {
                navigate(`/user/edc/${edcId}/feeders`);
            } else if (isRegion()) {
                navigate(`/user/region/${edcId}/feeders`);
            } else {
                navigate(`/admin/${region}/edcs/${edcId}/feeders`);
            }
        }}
      />           
        

            <div className={styles.chart_container}>
                <DynamicGraph 
                    data={graphData} 
                    timeRange={timeRange} 
                    onDateChange={handleDateChange}
                    selectedDate={selectedDate}
                />
            </div>
        </div>
    );
};

export default EdcDetails;
