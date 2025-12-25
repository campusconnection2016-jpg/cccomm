import React, { useEffect, useRef, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col } from "react-bootstrap";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "./dashboard.css";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import DatePicker from "react-datepicker";
import Footer from "../../footer/footer";
import {
  getClgTopper_all_CC_API,
  getAvgListening_cc_API,getAvgSpeaking_cc_API,getAvgReading_cc_API,getAvgWriting_cc_API,
  getcollegeApi,
  getcompanyTotalCount_API,
  getcommunTotalCount_API,
  get_department_info_API,
  getdepartmentApi,
getjoboffer_announcement_cc_API,
  getAptitudeTotalCount_API,
  getTechnicalTotalCount_API,
  getRequestCount_CC_API,
  getAvgAptitude_cc_API,
  getAvgCoding_cc_API,
 
  getNewUpdates_cc_API,
  getOfferChart_cc_API,
  getUpcomingInterview_cc_API,
  getOfferStatus_cc_API,
  getUniqueCmpy_cc_API,
  getUniqueCmpy_Count_cc_API,
  getClgRegistered_API,
  getJobOffer_Count_CC_API,
  getClgTotal_IT_Count_API,
  getClgTotal_Core_Count_API,

   getCollegeList_Concat_API,
      get_user_colleges_API,
      getlisteningCount_API,getReadingCount_API,getSpeakingCount_API,getWritingCount_API
} from "../../api/endpoints";
import { Link } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import Paper from "@mui/material/Paper";
Chart.register(...registerables);
const noDataStyle = {
  color: "#fff",
  backgroundColor: "#3e4954",
  textAlign: "center",
};
const Dashboard = ({ userRole, username }) => {
  // console.log("userrole", userRole,username)
  const [totalComapnyCount, setTotalCompanyCount] = useState(null);
  const [collegeId, setCollegeID] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [avgAptitudeScore, setAvgAptitudeScore] = useState([]);
  const [avgCodingScore, setAvgCodingScore] = useState([]);
  const [avgListeningScore, setAvgListeningScore] = useState([]);
const [avgSpeakingScore, setAvgSpeakingScore] = useState([]);
const [avgReadingScore, setAvgReadingScore] = useState([]);
const [avgWritingScore, setAvgWritingScore] = useState([]);

  const [clgTopper, setClgTopper] = useState([]);
  const [selectedOptionClgTop, setSelectedOptionClgTop] = useState("MCQ Test");
  const [clgTopperCode, setClgTopperCode] = useState([]);
  const [upcomming, setUpcomming] = useState([]);
  const [offerStatus, setOfferStatus] = useState([]);
  const [college, setCollege] = useState([]);
  const [assessmentData1, setAssessmentData1] = useState([]);
  const [totalRequest, setTotalRequest] = useState(null);
  const [department, setDepartment] = useState([]);
  const [deptID, setDeptID] = useState("");
  const [companies, setCompanies] = useState([]);
  const [cmpyID, setCmpyID] = useState("");
  const [totalPresent, setTotalPresent] = useState("");

  const [totalAptitudeCount, setTotalAptitudeCount] = useState(null);
  const [totalTechnicalCount, setTotalTechicalCount] = useState(null);
  const [trainerDetails, setTrainerDetails] = useState([]);
  const [testDetails, setTestDetails] = useState([]);
  const [announcements, setAnnouncements] = useState([]); // Define announcements state
  const [role, setRole] = useState("Training admin");
  const [Registered, setRegistered] = useState(0);
  const [totOffers, setTotOffers] = useState(0);
  const [announcementsPlace, setAnnouncementsPlace] = useState([]);
  const [totalcmpyCount, setTotalcmpyCount] = useState(null);
  const [totalcommunCount, setTotalcommunCount] = useState(null);

  const [it, setIT] = useState(0);
  const [core, setCore] = useState(0);
  const [chartType, setChartType] = useState("Pie");
  const [chartTypePlace, setChartTypePlace] = useState("Pie");
  const [triggerFetch, setTriggerFetch] = useState(true);
  const [selectedTestType] = useState("Audio"); 
 // const [selectedTestType, setSelectedTestType] = useState("Audio");
  const [selectedTestCategory, setSelectedTestCategory] = useState("All"); // default to All categories
 
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole === 'Placement admin') {
      setRole(userRole);
    }
  }, [userRole])

 useEffect(() => {
  console.log("🟡 useEffect called - triggerFetch:", triggerFetch, "collegeId:", collegeId);

  if (triggerFetch) {
    console.log("🟢 Running fetches...");
    fetchCollege();
   // fetchDepartment();
   // fetchCompanies();
    setTriggerFetch(false); // Reset the trigger after fetching
  }
}, [triggerFetch, collegeId]);

  useEffect(() => {
    // console.log("userrole", userRole)
    if (role === "Training admin") {
      fetchAptitudeCount();
      fetchTechnicalCount();
      fetchTotalRequestCount();
      aptitudeAvgScore();
      getCodingAvgCore();
      getwritingAvgCore();
      getSpeakingAvgCore();
    
      fetchAnnouncements();
      fetchcmpyCount();
      fetchcommunCount();
      fetchDepartment();
    fetchCompanies();
    } else if (role === "Placement admin") {
      fetchCompanyuniqueCount();
      fetchcollegeRegisteredCount();
      fetchcollegeOffer();
      fetchTotalRequestCount();
      fetchTotalITCount();
      fetchTotalCoreCount();
      fetchOfferChart();
      getUpcomming();
      fetchAnnouncementsPlace();
      getOfferStatus();
       fetchAnnouncementsPlace();
       fetchDepartment();
    fetchCompanies();
    }
  }, [role, collegeId, selectedDate, deptID, cmpyID, userRole, username, selectedOptionClgTop]);

  // Add this state
const [userColleges, setUserColleges] = useState([]);

// Replace fetchCollege with this logic
useEffect(() => {
  if (!username) return;

  if (userRole === "Training admin") {
    // Case 1: Training admin → fetch only assigned colleges
    get_user_colleges_API(username)
      .then((userData) => {
        const collegeIds = userData.college_ids;

        return getCollegeList_Concat_API().then((collegeList) => {
          const matchedColleges = collegeList
            .filter((college) => collegeIds.includes(String(college.id)))
            .map((college) => ({
              value: college.id,
              label: college.college_group_concat,
            }));

          setUserColleges(matchedColleges);
        });
      })
      .catch((error) => {
        console.error("❌ Error fetching user colleges:", error);
      });
  } else {
    // Case 2: Other roles → show all colleges
    getCollegeList_Concat_API()
      .then((collegeList) => {
        const allColleges = collegeList.map((college) => ({
          value: college.id,
          label: college.college_group_concat,
        }));
        setUserColleges(allColleges);
      })
      .catch((error) => {
        console.error("❌ Error fetching all colleges:", error);
      });
  }
}, [username, userRole]);

  const fetchCollege = async () => {
    try {
      const response = await getcollegeApi(); // Await the promise
      //console.log("College: ", response);
      setCollege(response); // Access data directly
    } catch (err) {
      console.log(err.message);
    }
  };
const fetchDepartment = async () => {
  try {
    if (!collegeId) {
      console.log("No collegeId found, fetching all departments");
      const response = await getdepartmentApi();
      console.log("✅ All Departments:", response);
      // Map to uniform keys for the dropdown
      const mappedDepartments = response.map((dept) => ({
        department_id_value: dept.id,
        department_name_value: dept.department,
      }));
      setDepartment(mappedDepartments);
    } else {
      console.log("🔍 Fetching departments for collegeId:", collegeId);
      const response = await get_department_info_API([collegeId]);
      console.log("✅ Departments for college:", response);
      setDepartment(response);
    }
  } catch (err) {
    console.log("❌ Error fetching departments:", err.message);
  }
};



const fetchCompanies = async () => {
  try {
    console.log("🔍 Fetching companies for collegeId:", collegeId);
    const response = await getUniqueCmpy_cc_API(collegeId);
    console.log("✅ Companies:", response);
    setCompanies(response);
  } catch (err) {
    console.error("❌ Error fetching companies:", err.message);
  }
};

 const fetchAnnouncements = () => {
    getNewUpdates_cc_API(role, collegeId)
      .then((data) => {
        setAnnouncements(data);
      })
      .catch((error) => console.error("Error fetching announcements:", error));
  };



  //-----------------Total Aptitude, Technical Count------------------------//

  const fetchAptitudeCount = async () => {
    try {
     // const response = await getAptitudeTotalCount_API(collegeId);
      const response = await getSpeakingCount_API(collegeId);
      //console.log("total Aptitude count: ", response);
      //console.log("userrole", userRole)
      setTotalAptitudeCount(response.count);
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchTechnicalCount = async () => {
    try {
     // const response = await getTechnicalTotalCount_API(collegeId);
     const response = await getReadingCount_API(collegeId);
      // Await the promise
      //console.log("response of total technical count: ", response);
      setTotalTechicalCount(response.count); // Access data directly
    } catch (err) {
      console.log(err.message);
    }
  };

   const fetchcmpyCount = async () => {
    try {
      const response = await getcompanyTotalCount_API(collegeId);
      //console.log("total Aptitude count: ", response);
      //console.log("userrole", userRole)
      setTotalcmpyCount(response.count);
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchcommunCount = async () => {
    try {
     // const response = await getcommunTotalCount_API(collegeId); 
      const response = await getlisteningCount_API(collegeId); // Await the promise
    
      // Await the promise
      //console.log("response of total technical count: ", response);
      setTotalcommunCount(response.count); // Access data directly
    } catch (err) {
      console.log(err.message);
    }
  };

const fetchTotalRequestCount = async () => {
  try {
   // const response = await getRequestCount_CC_API(collegeId);
   const response = await getWritingCount_API(collegeId);
    console.log("📡 Request count API response:", response);
    setTotalRequest(response.count || 0); 
    //setTotalRequest(response.request_count); // must match backend key
  } catch (err) {
    console.log("❌ Error fetching request count:", err.message);
  }
};


  const aptitudeAvgScore = async () => {
    try {
      
      const response = await getAvgListening_cc_API(collegeId, selectedDate);
      setAvgAptitudeScore(Array.isArray(response) ? response : []);
      //const response = await getAvgAptitude_cc_API(collegeId, selectedDate);
      //console.log("Avg score of Department: ", response);
     // setAvgAptitudeScore(response);
    } catch (err) {
      console.log(err.message);
    }
  };

  const getCodingAvgCore = async () => {
    try {
      console.log("coding avg entering........");
      
      const response = await getAvgReading_cc_API(collegeId, selectedDate);
      setAvgCodingScore(Array.isArray(response) ? response : []);
     // const response = await getAvgCoding_cc_API(collegeId, selectedDate);
      // console.log("Coding Avg score of Department: ", response);
     // setAvgCodingScore(response);
    } catch (err) {
      console.log(err.message);
    }
  };

  const getSpeakingAvgCore = async () => {
    try {
      console.log("coding avg entering........");
      
      const response = await getAvgSpeaking_cc_API(collegeId, selectedDate);
      setAvgSpeakingScore(Array.isArray(response) ? response : []);
     // const response = await getAvgCoding_cc_API(collegeId, selectedDate);
      // console.log("Coding Avg score of Department: ", response);
     // setAvgSpeakingScore(response);
    } catch (err) {
      console.log(err.message);
    }
  };
  const getwritingAvgCore = async () => {
    try {
      console.log("coding avg entering........");
      
      const response = await getAvgWriting_cc_API(collegeId, selectedDate);
      setAvgWritingScore(Array.isArray(response) ? response : []);
     // const response = await getAvgCoding_cc_API(collegeId, selectedDate);
      // console.log("Coding Avg score of Department: ", response);
     // setAvgWritingScore(response);
    } catch (err) {
      console.log(err.message);
    }
  };
  useEffect(() => {
    if (!collegeId) return;
  
    console.log("🔁 useEffect triggered");
    console.log("test_type:", selectedTestType);
    console.log("test_type_category:", selectedTestCategory);
  
    getCollegeTopper();
  }, [collegeId, selectedTestType, selectedTestCategory]);
  
  const getCollegeTopper = () => {
    const params = {
      collegeId,
      test_type: selectedTestType,
    };
  
    // 🔹 Only send category for Audio
    if (
      selectedTestType === "Audio" &&
      selectedTestCategory &&
      selectedTestCategory !== "All"
    ) {
      params.test_type_categories = selectedTestCategory;
    }
  
  
    console.log("📤 API Params:", params);
  
    getClgTopper_all_CC_API(
      params.collegeId,
      params.test_type,
      params.test_type_categories
    )
      .then((data) => {
        console.log("✅ API Response:", data);
        setClgTopper(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("❌ Error fetching College Topper:", error);
        setClgTopper([]);
      });
  };
  
    
 const fetchAnnouncementsPlace = () => {
    getjoboffer_announcement_cc_API(collegeId)
      .then((data) => {
        setAnnouncementsPlace(data);
        console.log("Placement announcement: ", collegeId,data);
      })
      .catch((error) => console.error("Error fetching announcements:", error));
  };

  const fetchOfferChart = () => {
    getOfferChart_cc_API(collegeId)
      .then((data) => {
        // console.log("response", data);

        const totalOffers = data.reduce(
          (acc, item) => acc + item.number_of_offers,
          0
        );
        const itOffers = data.reduce((acc, item) => acc + item.it_of_offers, 0);
        const coreOffers = data.reduce(
          (acc, item) => acc + item.core_of_offers,
          0
        );
        const otherCount = data.filter(
          (item) => item.number_of_offers === 0
        ).length;

        console.log("total", totalOffers);
        console.log("it", itOffers);
        console.log("core", coreOffers);
        console.log("others count", otherCount);

        const assessmentData = [
          {
            type: "IT Offers",
            percentage: Number(((itOffers / totalOffers) * 100).toFixed(2)),
            color: "blue",
          },
          {
            type: "Core Offers",
            percentage: Number(((coreOffers / totalOffers) * 100).toFixed(2)),
            color: "green",
          },
        ];

        if (otherCount > 0) {
          assessmentData.push({
            type: "Others",
            percentage: Number(
              ((otherCount / (totalOffers + otherCount)) * 100).toFixed(2)
            ),
            color: "grey",
          });
        }

        setAssessmentData1(assessmentData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  const getUpcomming = () => {
    getUpcomingInterview_cc_API(collegeId, deptID)
      .then((data) => {
        setUpcomming(data);
        // console.log("upcomming interview: ", data);
      })
      .catch((error) =>
        console.error("Error fetching getting upcomming interview:", error)
      );
  };

  const getOfferStatus = () => {
    getOfferStatus_cc_API(collegeId, cmpyID)
      .then((data) => {
        setOfferStatus(data);
       // console.log("offer Status: ", data);
      })
      .catch((error) =>
        console.error("Error fetching getting upcomming interview:", error)
      );
  };

  const fetchCompanyuniqueCount = async () => {
    try {
      const response = await getUniqueCmpy_Count_cc_API(collegeId); // Await the promise
      //console.log("response of total test count: ", response);
      setTotalCompanyCount(response.unique_company_count);
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchcollegeRegisteredCount = async () => {
    try {
      const response = await getClgRegistered_API(collegeId); // Await the promise
      //console.log("response of college registered count: ", response);
      setRegistered(response.college_accepted_count);
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchcollegeOffer = async () => {
    try {
      const response = await getJobOffer_Count_CC_API(collegeId); // Await the promise
      //console.log("response of total test count: ", response);
      setTotOffers(response.job_offer_count); // Access data directly
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchTotalITCount = async () => {
    try {
      const response = await getClgTotal_IT_Count_API(collegeId); // Await the promise
     // console.log("response of college registered count: ", response);
      setIT(response.job_count);
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchTotalCoreCount = async () => {
    try {
      const response = await getClgTotal_Core_Count_API(collegeId); // Await the promise
     // console.log("response of college registered count: ", response);
      setCore(response.job_count);
    } catch (err) {
      console.log(err.message);
    }
  };

  //-------------------------------------------------------------------//

  const pieChartRef = useRef(null);

  useEffect(() => {
    if (pieChartRef.current) {
      const pieChart = new Chart(pieChartRef.current, {
        type: "doughnut",
        data: {
          labels: assessmentData1.map((data) => data.type),
          datasets: [
            {
              data: assessmentData1.map((data) => data.percentage),
              backgroundColor: assessmentData1.map((data) => data.color),
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
              labels: {
                color: "rgb(157, 190, 210", // Set legend text color to rgb(157, 190, 210
              },
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) =>
                  `${tooltipItem.label}: ${tooltipItem.raw}%`,
              },
            },
          },
          cutout: "50%",
        },
      });
      return () => {
        pieChart.destroy();
      };
    }
  }, [assessmentData1]);


  // dropdown
  const roleOptions = [
    { label: "Training", value: "Training admin" },
    { label: "Placement", value: "Placement admin" },
  ];

  const collegeOptions = college.map((item) => ({
    label: item.college,
    value: item.id,
  }));

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        titleColor: "#ACBFD2",
        bodyColor: "#ACBFD2",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#ACBFD2",
        },
        title: {
          display: true,
          color: "#ACBFD2",
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: "#ACBFD2",
          stepSize: 10,
        },
        title: {
          display: true,
          color: "#ACBFD2",
        },
      },
    },
  };

  const chartDataAvgAptitude = {
    labels: avgAptitudeScore.map((data) => data.department_name),
    datasets: [
      {
        data: avgAptitudeScore.map((data) => data.avg_score || 0),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.4)",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const renderChartAvgAptitudeScore = () => {
    if (chartType === "Pie") {
      return (
        <div
          style={{
            width: "220px", // Set fixed width
            height: "220px", // Set fixed height
            margin: "0 auto", // Center the chart horizontally
          }}
        >
          <Pie
            data={{
              labels: avgAptitudeScore.map((data) => data.department_name),
              datasets: [
                {
                  data: avgAptitudeScore.map((data) => data.avg_score || 0),
                  backgroundColor: [
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(153, 102, 255, 0.6)",
                    "rgba(255, 159, 64, 0.6)",
                  ],
                  borderColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                  ],
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
             plugins: {
  legend: {
    display: false, // 🔹 hide the legend entirely
  },
  tooltip: {
    enabled: true, // 🔹 show department name & score only on hover
    callbacks: {
      label: (context) => {
        const department = context.label;
        const score = context.formattedValue;
        return `${department}: ${score}`;
      },
    },
  },
},

              layout: {
                padding: {
                  left: 10, // Add some padding to avoid crowding
                  right: 10,
                },
              },
              scales: {
                x: {
                  display: false, // Disable the x-axis
                },
                y: {
                  display: false, // Disable the y-axis
                },
              },
            }}
          />
        </div>
      );
    } else if (chartType === "Bar") {
      return <Bar data={chartDataAvgAptitude} options={chartOptions} />;
    } else {
      return <Line data={chartDataAvgAptitude} options={chartOptions} />;
    }
  };

  const chartDataAvgCoding = {
    labels: avgCodingScore.map((data) => data.department_name),
    datasets: [
      {
        data: avgCodingScore.map((data) => data.avg_score || 0),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.4)",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const renderChartAvgCodingScore = () => {
    if (chartType === "Pie") {
      return (
        <div
          style={{
            width: "220px", // Set fixed width
            height: "220px", // Set fixed height
            margin: "0 auto", // Center the chart horizontally
          }}
        >
          <Pie
            data={{
              labels: avgCodingScore.map((data) => data.department_name),
              datasets: [
                {
                  data: avgCodingScore.map((data) => data.avg_score || 0),
                  backgroundColor: [
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(153, 102, 255, 0.6)",
                    "rgba(255, 159, 64, 0.6)",
                  ],
                  borderColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                  ],
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
  legend: {
    display: false, // 🔹 hide the legend entirely
  },
  tooltip: {
    enabled: true, // 🔹 show department name & score only on hover
    callbacks: {
      label: (context) => {
        const department = context.label;
        const score = context.formattedValue;
        return `${department}: ${score}`;
      },
    },
  },
},

              layout: {
                padding: {
                  left: 10, // Add some padding to avoid crowding
                  right: 10,
                },
              },
              scales: {
                x: {
                  display: false, // Disable the x-axis
                },
                y: {
                  display: false, // Disable the y-axis
                },
              },
            }}
          />
        </div>
      );
    } else if (chartType === "Bar") {
      return <Bar data={chartDataAvgCoding} options={chartOptions} />;
    } else {
      return <Line data={chartDataAvgCoding} options={chartOptions} />;
    }
  };

  
  const chartDataAvgwriting = {
    labels: avgWritingScore.map((data) => data.department_name),
    datasets: [
      {
        data: avgWritingScore.map((data) => data.avg_score || 0),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.4)",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const renderChartAvgWritingScore = () => {
    if (chartType === "Pie") {
      return (
        <div
          style={{
            width: "220px", // Set fixed width
            height: "220px", // Set fixed height
            margin: "0 auto", // Center the chart horizontally
          }}
        >
          <Pie
            data={{
              labels: avgWritingScore.map((data) => data.department_name),
              datasets: [
                {
                  data: avgWritingScore.map((data) => data.avg_score || 0),
                  backgroundColor: [
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(153, 102, 255, 0.6)",
                    "rgba(255, 159, 64, 0.6)",
                  ],
                  borderColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                  ],
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
             plugins: {
  legend: {
    display: false, // 🔹 hide the legend entirely
  },
  tooltip: {
    enabled: true, // 🔹 show department name & score only on hover
    callbacks: {
      label: (context) => {
        const department = context.label;
        const score = context.formattedValue;
        return `${department}: ${score}`;
      },
    },
  },
},

              layout: {
                padding: {
                  left: 10, // Add some padding to avoid crowding
                  right: 10,
                },
              },
              scales: {
                x: {
                  display: false, // Disable the x-axis
                },
                y: {
                  display: false, // Disable the y-axis
                },
              },
            }}
          />
        </div>
      );
    } else if (chartType === "Bar") {
      return <Bar data={chartDataAvgwriting} options={chartOptions} />;
    } else {
      return <Line data={chartDataAvgwriting} options={chartOptions} />;
    }
  };

  const chartDataAvgspeaking = {
    labels: avgSpeakingScore.map((data) => data.department_name),
    datasets: [
      {
        data: avgSpeakingScore.map((data) => data.avg_score || 0),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.4)",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const renderChartAvgspeakingScore = () => {
    if (chartType === "Pie") {
      return (
        <div
          style={{
            width: "220px", // Set fixed width
            height: "220px", // Set fixed height
            margin: "0 auto", // Center the chart horizontally
          }}
        >
          <Pie
            data={{
              labels: avgSpeakingScore.map((data) => data.department_name),
              datasets: [
                {
                  data: avgSpeakingScore.map((data) => data.avg_score || 0),
                  backgroundColor: [
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(153, 102, 255, 0.6)",
                    "rgba(255, 159, 64, 0.6)",
                  ],
                  borderColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                  ],
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
  legend: {
    display: false, // 🔹 hide the legend entirely
  },
  tooltip: {
    enabled: true, // 🔹 show department name & score only on hover
    callbacks: {
      label: (context) => {
        const department = context.label;
        const score = context.formattedValue;
        return `${department}: ${score}`;
      },
    },
  },
},

              layout: {
                padding: {
                  left: 10, // Add some padding to avoid crowding
                  right: 10,
                },
              },
              scales: {
                x: {
                  display: false, // Disable the x-axis
                },
                y: {
                  display: false, // Disable the y-axis
                },
              },
            }}
          />
        </div>
      );
    } else if (chartType === "Bar") {
      return <Bar data={chartDataAvgspeaking} options={chartOptions} />;
    } else {
      return <Line data={chartDataAvgspeaking} options={chartOptions} />;
    }
  };
  const chartDataOfferStatus = {
    labels: assessmentData1.map((data) => data.type),
    datasets: [
      {
        data: assessmentData1.map((data) => data.percentage || 0),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.4)",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const renderChartOfferStatus = () => {
    if (chartTypePlace === "Pie") {
      return (
        <div
          style={{
            width: "220px", // Set fixed width
            height: "220px", // Set fixed height
            margin: "0 auto", // Center the chart horizontally
          }}
        >
          <Pie
            data={{
              labels: assessmentData1.map((data) => data.type),
              datasets: [
                {
                  data: assessmentData1.map((data) => data.percentage || 0),
                  backgroundColor: [
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(153, 102, 255, 0.6)",
                    "rgba(255, 159, 64, 0.6)",
                  ],
                  borderColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                  ],
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top", // Position legend on the right
                  labels: {
                    usePointStyle: true, // Use a bullet point instead of a box
                    pointStyle: "circle", // Style the bullet as a circle
                    boxWidth: 5, // Decrease the size of the point/bullet
                    font: {
                      size: 8, // Decrease the font size of the labels
                    },
                    color: "white",
                    padding: 10, // Add padding between the labels
                  },
                },
                tooltip: {
                  enabled: true, // Enable tooltips for interactivity
                },
              },
              layout: {
                padding: {
                  left: 10, // Add some padding to avoid crowding
                  right: 10,
                },
              },
              scales: {
                x: {
                  display: false, // Disable the x-axis
                },
                y: {
                  display: false, // Disable the y-axis
                },
              },
            }}
          />
        </div>
      );
    } else if (chartTypePlace === "Bar") {
      return <Bar data={chartDataOfferStatus} options={chartOptions} />;
    } else {
      return <Line data={chartDataOfferStatus} options={chartOptions} />;
    }
  };

  const handleCardClickTotalAptitudeTest = (collegeId) => {
    if (!collegeId) {
      console.warn("No valid collegeId selected, defaulting to 'all'");
      collegeId = "all"; // Fallback to 'all'
    }

    console.log("Navigating with collegeId:", collegeId);
    navigate(`/total-aptitude-test-report/${String(collegeId)}`);
  };

 const handleCardClickTotalCommunTest = (collegeId) => {
    if (!collegeId) {
      console.warn("No valid collegeId selected, defaulting to 'all'");
      collegeId = "all"; // Fallback to 'all'
    }

    console.log("Navigating with collegeId:", collegeId);
    navigate(`/total-commun-test-report/${String(collegeId)}`);
  };
 const handleCardClickTotalCompanyTest = (collegeId) => {
    if (!collegeId) {
      console.warn("No valid collegeId selected, defaulting to 'all'");
      collegeId = "all"; // Fallback to 'all'
    }

    console.log("Navigating with collegeId:", collegeId);
    navigate(`/total-company-test-report/${String(collegeId)}`);
  };

  const handleCardClickTotalTechnicalTest = (collegeId) => {
    if (!collegeId) {
      console.warn("No valid collegeId selected, defaulting to 'all'");
      collegeId = "all"; // Fallback to 'all'
    }

    console.log("Navigating with collegeId:", collegeId);
    navigate(`/total-technical-test-report/${String(collegeId)}`);

  };


  const handleCardClickTotalRequest = (collegeId) => {
    if (!collegeId) {
      console.warn("No valid collegeId selected, defaulting to 'all'");
      collegeId = "all"; // Fallback to 'all'
    }

    console.log("Navigating with collegeId:", collegeId);
    navigate(`/total-request/${String(collegeId)}`);

  };


  return (
    <div>
      <div
        className="App-training"
        style={{ backgroundColor: "#323B44", color: "#fff" }}
      >
        <div className="select" style={{ display: "flex", marginBottom: "20px" }}>
          <p style={{ height: "20px" }}></p>
          {/* Role Dropdown */}
          {userRole === "Super admin" && (
            <Autocomplete
              disableClearable
              value={roleOptions.find((option) => option.value === role) || null}
              onChange={(event, newValue) =>
                setRole(newValue ? newValue.value : "")
              }
              options={roleOptions}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              PaperComponent={({ children }) => (
                <div
                  style={{
                    backgroundColor: "#3e4954",
                    // color: "#fff",
                    borderRadius: "20px",
                    color: "rgb(157, 190, 210)",
                    border: "black",
                  }}
                >
                  {children}
                </div>
              )}
              sx={{
                width: "35%",
                marginLeft: "12%",
                marginTop: "20px",
                "& .MuiOutlinedInput-root": {
                  color: "rgb(157, 190, 210)",
                  fontWeight: "bold",
                  backgroundColor: "#3e4954",
                  borderRadius: "40px",
                  padding: "10px",
                  "& fieldset": {
                    border: "10px solid #18c4bb", // Initial border color
                  },
                  "&:hover fieldset": {
                    border: "10px solid #18c4bb", // Keep the border color unchanged on hover
                  },
                  "& .MuiSvgIcon-root": {
                    color: "white", // Change the dropdown arrow color to white
                  },
                },
                "& .MuiAutocomplete-option:hover": {
                  backgroundColor: "#4a545f !important",
                  color: "rgb(157, 190, 210)",
                },
                "& .MuiAutocomplete-paper": {
                  color: "rgb(157, 190, 210)",
                  backgroundColor: "#3e4954", // Set dropdown options background
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  inputProps={{
                    ...params.inputProps,
                    readOnly: true,
                  }}
                />
              )}
            />)}
          {(userRole === "Super admin" || userRole === "Placement admin" || userRole === "Training admin") && (
            <Autocomplete
              disableClearable
              value={
                collegeId === ""
                  ? { label: "All", value: "" }
                  : userColleges.find((option) => option.value === collegeId) || null
              }
              onChange={(event, newValue) => {
                console.log("Selected college:", newValue);
                setCollegeID(newValue ? newValue.value : "");
              }}
              options={[{ label: "All", value: "" }, ...userColleges]}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              PaperComponent={(props) => (
                <Paper
                  {...props}
                  style={{
                    backgroundColor: "#323B44",
                    color: "rgb(157, 190, 210)",
                    borderRadius: "20px",
                    maxHeight: "250px", // Ensure scrollability
                    overflowY: "auto", // Allow vertical scrolling
                  }}
                />
              )}
              sx={{
                width: "35%",
                marginLeft: "13%",
                marginTop: "20px",
                "& .MuiOutlinedInput-root": {
                  color: "rgb(157, 190, 210)",
                  fontWeight: "bold",
                  backgroundColor: "#3e4954",
                  borderRadius: "40px",
                  padding: "10px",
                  "& fieldset": {
                    border: "2px solid #d86e18",
                  },
                  "&:hover fieldset": {
                    border: "2px solid #d86e18",
                  },
                },
                "& .MuiAutocomplete-option": {
                  backgroundColor: "#3e4954",
                  color: "rgb(157, 190, 210)",
                },
                "& .MuiAutocomplete-option:hover": {
                  backgroundColor: "#4a545f !important",
                },
                "& .MuiSvgIcon-root": {
                  color: "white",
                },
                "& .MuiAutocomplete-paper": {
                  backgroundColor: "#4a545f",
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  inputProps={{
                    ...params.inputProps,
                    // Removing readOnly to prevent interaction issues
                  }}
                />
              )}
            />)}
        </div>

        <p ></p>

        {/* Conditional rendering based on the role */}
        {(userRole === "Super admin" || userRole === "Training admin") && (
          <div style={{ marginTop: "50px" }}>
            {role === "Training admin" && (
              <div>
                <section className="card-list-train">
                  <div className="component-super"  
                 // onClick={() => handleCardClickTotalCompanyTest(collegeId)}
                   >
                    <div className="card-container-super">
                      <div className="square-container-super"><div
                        className={`card-lms card-test-count`}
                      >
                        <div className="card-content-wrapper">
                          <p className="card-content-super">
                            {totalcmpyCount ? totalcmpyCount : 0}
                          </p>
                        </div>
                      </div>
                      </div>
                    </div>
                    <h6 className="card-title-super">Company Specific Test </h6>
                  </div>
                  <p></p>
 <div
                    className="component-super"
                  // style={{ cursor: 'pointer' }} onClick={() => handleCardClickTotalCommunTest(collegeId)} 
                   >
                    <div className="card-container-super">
                      <div className="square-container-super">
                        <div className="card-lms card-companies">
                          <div className="card-content-wrapper">
                            <p className="card-content-super">
                              {totalcommunCount ? totalcommunCount : 0}
                            </p>
                          </div>{" "}
                        </div>
                      </div>
                    </div>
                    <h2 className="card-title-super">Listening </h2>
                  </div>
                  <p></p>
                  <div
                    className="component-super"
                  //  style={{ cursor: 'pointer' }} onClick={() => handleCardClickTotalAptitudeTest(collegeId)} 
                 
                  >
                    <div className="card-container-super">
                      <div className="square-container-super">
                        <div className="card-lms card-companies">
                          <div className="card-content-wrapper">
                            <p className="card-content-super">
                              {totalAptitudeCount ? totalAptitudeCount : 0}
                            </p>
                          </div>{" "}
                        </div>
                      </div>
                    </div>
                    <h2 className="card-title-super">Speaking</h2>
                  </div>
                  <p></p>


                  <div className="component-super" 
                  //onClick={() => handleCardClickTotalTechnicalTest(collegeId)}  style={{ cursor: 'pointer' }}
          >
                    <div className="card-container-super">
                      <div className="square-container-super">
                        <div className="card-lms card-offers">
                          <div className="card-content-wrapper">
                            <p className="card-content-super-apt">
                              {" "}
                              {totalTechnicalCount ? totalTechnicalCount : 0}
                            </p>
                          </div>{" "}
                        </div>
                      </div>
                    </div>
                    <h2 className="card-title-super">Reading </h2>
                  </div>
                  <p></p>

                  <div className="component-super" 
                 // onClick={() => handleCardClickTotalRequest(collegeId)}
                  >
                    <div className="card-container-super">
                      <div className="square-container-super">
                        <div className="card-lms card-requests">
                          <div className="card-content-wrapper">
                            <p className="card-content-super-apt">
                             {totalRequest !== null ? totalRequest : 0}
                            </p>
                          </div>{" "}
                        </div>
                      </div>
                    </div>
                    <h2 className="card-title-super-requests">Writing</h2>
                  </div>
                  <p></p>
                  <Container
                    // style={{ maxWidth: "700px !important", display: "flex" }}
                    className="container-dash-superadmin"
                  >
                 

                    <Row className="my-row" style={{background:"#3e4954",borderRadius:"5px"}}>
                      <Col className="border p-3 department-attendance col-department-attendance">
                        <div className="test test-report">
                          <h6 className="h6-bold-report" style={{ color: "white" }}>
                            TEST REPORT
                          </h6>
                          <div className="date-picker-wrapper" style={{marginRight:"10px"}}>
                            <DatePicker
                              selected={selectedDate}
                              onChange={(date) => setSelectedDate(date)}
                              dateFormat="dd-MMM-yyyy"
                              className="input-date-train"
                            />
                          </div>
                           <div>
                      <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="college-topper-select"
                         style={{ color: "white" }}
                      >
                        <option value="Line">Line Chart</option>
                        <option value="Bar">Bar Chart</option>
                        <option value="Pie">Pie Chart</option>
                      </select>
                    </div> 
                        </div>

                        <div className="score-charts">
                          <div className="chart-wrapper">
                            <p className="chart-title" style={{ color: "white" }}>
                              Avg Score-Listening
                            </p>
                            <div className="chart-container">
                              {renderChartAvgAptitudeScore()}
                            </div>
                          </div>

                          <div className="chart-wrapper">
                            <p className="chart-title" style={{ color: "white" }}>
                              Avg Score-Reading
                            </p>
                            <div className="chart-container">
                              {renderChartAvgCodingScore()}
                            </div>
                          </div>
                        </div>
                        <div className="score-charts">
                          <div className="chart-wrapper">
                            <p className="chart-title" style={{ color: "white" }}>
                              Avg Score-Speaking
                            </p>
                            <div className="chart-container">
                              {renderChartAvgspeakingScore()}
                            </div>
                          </div>

                          <div className="chart-wrapper">
                            <p className="chart-title" style={{ color: "white" }}>
                              Avg Score-writing
                            </p>
                            <div className="chart-container">
                              {renderChartAvgWritingScore()}
                            </div>
                          </div>
                        </div>
                      </Col>

                      <Col className="border p-3 department-attendance col-department-attendance">
  <div className="test test-college-topper">
    <h6 className="h6-bold-topper" style={{ color: "white" }}>
      COLLEGE TOPPER
    </h6>

  {/*}  <select
  value={selectedTestType}
  onChange={(e) => {
    setSelectedTestType(e.target.value);
    setSelectedTestCategory("");
  }}
  className="college-topper-select"
>
  <option value="MCQTest">MCQ</option>
  <option value="Coding Test">Coding</option>
  <option value="Audio">Audio</option>
  <option value="All">All</option>
</select>

*/}
<select
  value={selectedTestCategory}
  onChange={(e) => setSelectedTestCategory(e.target.value)}
  className="college-topper-select"
  disabled={selectedTestType !== "Audio"}
>
  <option value="">All</option>
  <option value="AudioMCQ">Reading</option>
  <option value="AudioTyping">Listening</option>
  <option value="Pronunciation">Speaking</option>
 <option value="TypingBlank">Writing</option>
</select>

  </div>

  {/* College Topper Table */}
  <table className="table college-topper-table">
    <thead>
      <tr>
        <th className="table-header" style={{ fontWeight: "bold", backgroundColor: "#3e4954", color: "white" }}>
          Name
        </th>
        <th className="table-header" style={{ fontWeight: "bold", backgroundColor: "#3e4954", color: "white" }}>
          Department
        </th>
        <th className="table-header" style={{ fontWeight: "bold", backgroundColor: "#3e4954", color: "white" }}>
          Score
        </th>
      </tr>
    </thead>
    <tbody>
    {clgTopper.length === 0 ? (
  <tr>
    <td colSpan={3} style={{ color: "#fff", backgroundColor: "#3e4954", textAlign: "center" }}>
      College Topper not found
    </td>
  </tr>
) : (
  clgTopper.map((item, index) => (
    <tr key={index}>
      <td style={{ color: "#fff", backgroundColor: "#3e4954" }}>{item.student_name}</td>
      <td style={{ color: "#fff", backgroundColor: "#3e4954" }}>{item.department}</td>
      <td style={{ color: "#fff", backgroundColor: "#3e4954" }}>{item.avg_mark}</td>
    </tr>
  ))
)}

    </tbody>
  </table>
</Col>

                    </Row>
                  </Container>

                  <div className="container-supertraining">
                    <div className="row-table-training">
                      <div className="col-dashboard">
                        <div className="test2">
                          <h6 className="h6-bold" style={{ color: "white" }}>
                            TRAINER DETAILS
                          </h6>
                        </div>
                        <div className="table-responsive-dash-traidet">
                          <table
                            className={`table-trainer ${trainerDetails.length > 5 ? "table-scrollable" : ""
                              }`}
                          >
                            <thead>
                              <tr>
                                {/*} <th
                                  style={{
                                    fontWeight: "bold",
                                    backgroundColor: "#3e4954",
                                    color: "white",
                                  }}
                                  className="table-header"
                                >
                                  Name
                                </th>
                                <th
                                  style={{
                                    fontWeight: "bold",
                                    backgroundColor: "#3e4954",
                                    color: "white",
                                  }}
                                  className="table-header"
                                >
                                  Skills
                                </th>*/}
                                <th
                                  style={{
                                    fontWeight: "bold",
                                    backgroundColor: "#3e4954",
                                    color: "white",
                                  }}
                                  className="table-header"
                                >
                                  Topic
                                </th>
                                <th
                                  style={{
                                    fontWeight: "bold",
                                    backgroundColor: "#3e4954",
                                    color: "white",
                                  }}
                                  className="table-header"
                                >
                                  Start Date
                                </th>
                                <th
                                  style={{
                                    fontWeight: "bold",
                                    backgroundColor: "#3e4954",
                                    color: "white",
                                  }}
                                  className="table-header"
                                >
                                  End Date
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {trainerDetails.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={4} // Span all columns
                                    style={{
                                      color: "#ffff",
                                      backgroundColor: "#3e4954",
                                      textAlign: "center", // Center align text
                                    }}
                                    className="table-cell"
                                  >
                                    Data not found
                                  </td>
                                </tr>
                              ) : (
                                trainerDetails.map((item) => (
                                  <tr key={item.id}>
                                    {/*} <td
                                      style={{
                                        color: "white",
                                        backgroundColor: "#3e4954",
                                      }}
                                      className="table-cell"
                                    >
                                      {item.trainer_name}
                                    </td>
                                    <td
                                      style={{
                                        color: "white",
                                        backgroundColor: "#3e4954",
                                      }}
                                      className="table-cell"
                                    >
                                      {item.trainer_skills}
                                    </td>*/}
                                    <td
                                      style={{
                                        color: "white",
                                        backgroundColor: "#3e4954",
                                      }}
                                      className="table-cell"
                                    >
                                      {item.topic}
                                    </td>
                                    <td
                                      style={{
                                        color: "white",
                                        backgroundColor: "#3e4954",
                                      }}
                                      className="table-cell"
                                    >
                                      {item.dtm_start_trainer}
                                    </td>
                                    <td
                                      style={{
                                        color: "white",
                                        backgroundColor: "#3e4954",
                                      }}
                                      className="table-cell"
                                    >
                                      {item.dtm_end_trainer}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="col-dashboard">
                        <div className="test2">
                          <h6 className="h6-bold" style={{ color: "white" }}>
                            TEST DETAILS
                          </h6>
                        </div>
                        <div className="table-responsive-dash">
                          <table
                            className={`table-test ${trainerDetails.length > 5 ? "table-scrollable" : ""
                              }`}
                          >
                            <thead>
                              <tr>
                                {/*} <th
                                  style={{
                                    fontWeight: "bold",
                                    backgroundColor: "#3e4954",
                                    color: "white",
                                  }}
                                  className="table-header"
                                >
                                  College
                                </th>
                                <th
                                  style={{
                                    fontWeight: "bold",
                                    backgroundColor: "#3e4954",
                                    color: "white",
                                  }}
                                  className="table-header"
                                >
                                  Department
                                </th>*/}
                                <th
                                  style={{
                                    fontWeight: "bold",
                                    backgroundColor: "#3e4954",
                                    color: "white",
                                    width: "auto",
                                  }}
                                  className="table-header"
                                >
                                  TestName
                                </th>
                                <th
                                  style={{
                                    fontWeight: "bold",
                                    backgroundColor: "#3e4954",
                                    color: "white",
                                    whiteSpace: "nowrap",
                                  }}
                                  className="table-header"
                                >
                                  Test Date
                                </th>
                                <th
                                  style={{
                                    fontWeight: "bold",
                                    backgroundColor: "#3e4954",
                                    color: "white",
                                    width: "100px"
                                  }}
                                  className="table-header"
                                >
                                  Assigned
                                </th>
                                <th
                                  style={{
                                    fontWeight: "bold",
                                    backgroundColor: "#3e4954",
                                    color: "#fff",
                                    width: "100px"
                                  }}
                                  className="table-header"
                                >
                                  Attended
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {testDetails.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={4} // Span all columns
                                    style={{
                                      color: "#ffff",
                                      backgroundColor: "#3e4954",
                                      textAlign: "center", // Center align text
                                    }}
                                    className="table-cell"
                                  >
                                    Data not found
                                  </td>
                                </tr>
                              ) : (
                                testDetails.map((item) => (
                                  <tr key={item.id}>
                                    {/*} <td
                                      style={{
                                        color: "#fff",
                                        backgroundColor: "#3e4954",
                                      }}
                                      className="table-cell"
                                    >
                                      {item.college}
                                    </td>
                                    <td
                                      style={{
                                        color: "#fff",
                                        backgroundColor: "#3e4954",
                                      }}
                                      className="table-cell"
                                    >
                                      {item.department}
                                    </td>*/}
                                    <td
                                      style={{
                                        color: "#fff",
                                        backgroundColor: "#3e4954",
                                        width: "auto"
                                      }}
                                      className="table-cell"
                                    >
                                      {item.test_name}
                                    </td>
                                    <td
                                      style={{
                                        color: "#fff",
                                        backgroundColor: "#3e4954",
                                      }}
                                      className="table-cell"
                                    >
                                      {item.dtm_start}
                                    </td>
                                    <td
                                      style={{
                                        color: "#fff",
                                        backgroundColor: "#3e4954",
                                        width: "100px"
                                      }}
                                      className="table-cell"
                                    >
                                      {item.student_count}
                                    </td>
                                    <td
                                      style={{
                                        color: "#fff",
                                        backgroundColor: "#3e4954",
                                        width: "100px"
                                      }}
                                      className="table-cell"
                                    >
                                      {item.active_student_count}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <div className="news-updates-training">
                  <div className="news-updates-header">
                    <h6 className="h6-bold-news-place">NEWS UPDATES</h6>
                  </div>

                  <div className="table-responsive-dash">
                    {announcements.length > 0 ? (
                      <div
                        className={`table-test ${announcements.length > 1 ? "table-scrollable" : ""
                          }`}
                      >
                        {announcements.map((announcement, index) => (
                          <div key={index} className="announcement-item">
                            <p className="news-head-com">
                              {announcement.announcement}
                            </p>
                            {announcement.announcement_image && (
                              <img
                                className="news-img-com"
                                src={`data:image/png;base64,${announcement.announcement_image}`}
                                alt="Announcement"
                                width={80}
                                height={80}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No announcements available.</p>
                    )}
                  </div>
                </div>
              </div>
            )} </div>)}
        {(userRole === "Super admin" || userRole === "Placement admin") && (
          <div className="dummy-css">
            {role === "Placement admin" && (
              <div>
                <section className="card-list-train">

                  <div className="component-super">
                    <div className="card-container-super">
                      <div className="square-container-super">
                        <div className="card-trainer card-test-count-trainer">
                          <div className="card-content-wrapper-trainer">
                            <p className="card-content-trainer">
                              {" "}
                              {totalComapnyCount ? totalComapnyCount : 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <h6 className="card-title-trainer-presuper">Total Companies</h6>
                  </div><p></p>

                  <div className="component-super">
                    <div className="card-container-super">
                      <div className="square-container-super">
                        <div className="card-trainer card-test-trainer">
                          <div className="card-content-wrapper-trainer">
                            <p className="card-content-trainer">
                              {" "}
                              {totOffers ? totOffers : 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <h2 className="card-title-trainer-presuper">Total Offers</h2>
                  </div><p></p>

                  <div className="component-super">
                    <div className="card-container-super">
                      <div className="square-container-super">
                        <div className="card-trainer card-companies-trainer">
                          <div className="card-content-wrapper-trainer">
                            <p className="card-content-trainerTech">
                              {it ? it : 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <h2 className="card-title-trainer-super">IT Offers</h2>
                  </div><p></p>

                  <div className="component-super">
                    <div className="card-container-super">
                      <div className="square-container-super">
                        <div className="card-trainer card-offers-trainer">
                          <div className="card-content-wrapper-trainer">
                            <p className="card-content-trainerTech">
                              {core ? core : 0}
                            </p>
                          </div>{" "}
                        </div>
                      </div>
                    </div>
                  </div><p></p>
                  <h2 className="card-title-trainer-techtestcore">Core Offers</h2>

                  <div className="container-superplace">
                    <div className="row">
                      <div className="col-dashboard">
                        <h6 className="h6-bold" style={{ color: "white" }}>
                          OFFER CHART
                        </h6>

                        {/* <div>
                    <select
                      value={chartTypePlace}
                      onChange={(e) => setChartTypePlace(e.target.value)}
                      className="college-topper-select"
                    >
                      <option value="Line">Line Chart</option>
                      <option value="Bar">Bar Chart</option>
                      <option value="Pie">Pie Chart</option>
                    </select>
                  </div> */}

                        <div className="pie-chart-container">
                          {renderChartOfferStatus()}
                        </div>
                      </div>
                      <div className="col-dashboard">
                        <div className="test2" >
                          <h6
                            style={{
                              fontWeight: "bold",

                              color: "white",
                            }}
                            className="h6-bold-interview-component"
                          >
                            UPCOMING INTERVIEW
                          </h6>

                          <select
                            className="dropdown-custom-dash testing"
                            onChange={(e) => setDeptID(e.target.value)}
                            value={deptID}
                            style={{ color: "white" }}
                          >
                            <option value="">All</option>
                            {department.map((item) => (
                              <option key={item.department_id_value} value={item.department_id_value}>
    {item.department_name_value}
  </option>
                            ))}
                          </select>
                        </div><p></p>
                        <div 
     className="custom-scrollbar"
  style={{
    maxHeight: "300px",
    overflow: "auto",

    }}>
                        <table className="table-cmpy">
                          <thead>
                            <tr>
                              <th
                                style={{
                                  fontWeight: "bold",
                                  backgroundColor: "#3e4954",
                                  color: "#fff",
                                }}
                                className="table-header"
                              >
                                Company
                              </th>
                               <th
                                style={{
                                  fontWeight: "bold",
                                  backgroundColor: "#3e4954",
                                  color: "#fff",
                                }}
                                className="table-header"
                              >
                                Date
                              </th>
                              <th
                                style={{
                                  fontWeight: "bold",
                                  backgroundColor: "#3e4954",
                                  color: "#fff",
                                }}
                                className="table-header"
                              >
                                Reg
                              </th>
                             
                            </tr>
                          </thead>
                          <tbody>
                            {upcomming.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={4} // Span all columns
                                  style={{
                                    color: "#ffff",
                                    backgroundColor: "#3e4954",
                                    textAlign: "center", // Center align text
                                  }}
                                  className="table-cell"
                                >
                                  Data not found
                                </td>
                              </tr>
                            ) : (
                              upcomming.map((item) => (
                                <tr key={item.id}>
                                  <td
                                    style={{
                                      color: "#fff",
                                      backgroundColor: "#3e4954",
                                    }}
                                    className="table-cell"
                                  >
                                    {item.job_id__company_name}
                                  </td>
                                   <td
                                    style={{
                                      color: "#fff",
                                      backgroundColor: "#3e4954",
                                    }}
                                    className="table-cell"
                                  >
                                    {item.job_id__interview_date}
                                  </td>
                                  <td
                                    style={{
                                      color: "#fff",
                                      backgroundColor: "#3e4954",
                                    }}
                                    className="table-cell"
                                  >
                                    {item.registered_count}
                                  </td>
                                 
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table></div>
                      </div>
                      <div className="col-dashboard"  >
                        <div className="test2">
                          <h6
                            className="h6-bold-sts"
                            style={{ color: "white", marginLeft: "8%" }}
                          >
                            OFFER STATUS
                          </h6>

                          <select
                            className="dropdown-custom-dash testing"
                            onChange={(e) => setCmpyID(e.target.value)}
                            value={cmpyID}

                          >
                            <option value="">All</option>
                            {companies.map((item, index) => (
                              <option key={index} value={item.company_name}>
                                {item.company_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <p></p>
                        <div  className="custom-scrollbar"
  style={{
    maxHeight: "300px",
    overflow: "auto",

}}>
                        <table className="table">
                          <thead>
                            <tr>
                              <th
                                style={{
                                  fontWeight: "bold",
                                  backgroundColor: "#3e4954",
                                  color: "#fff",
                                }}
                                className="table-header"
                              >
                                Status
                              </th>
                              <th
                                style={{
                                  fontWeight: "bold",
                                  backgroundColor: "#3e4954",
                                  color: "#fff",
                                }}
                                className="table-header"
                              >
                                Count
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {offerStatus.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={4} // Span all columns
                                  style={{
                                    color: "#ffff",
                                    backgroundColor: "#3e4954",
                                    textAlign: "center", // Center align text
                                  }}
                                  className="table-cell"
                                >
                                  Data not found
                                </td>
                              </tr>
                            ) : (
                              offerStatus.map((item) => (
                                <tr key={item.id}>
                                  <td
                                    style={{
                                      color: "#fff",
                                      backgroundColor: "#3e4954",
                                    }}
                                    className="table-cell"
                                  >
                                    {item.round_of_interview}
                                  </td>
                                  <td
                                    style={{
                                      color: "#fff",
                                      backgroundColor: "#3e4954",
                                    }}
                                    className="table-cell"
                                  >
                                    {item.student_count}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table></div>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="news-updates-training">
                  <div className="news-updates-header">
                    <h6 className="h6-bold-news-place">NEWS UPDATES</h6>
                  </div>

                  <div className="table-responsive-dash">
                    {announcementsPlace.length > 0 ? (
                      <div
                        className={`table-test ${announcementsPlace.length > 5 ? "table-scrollable" : ""
                          }`}
                      >
                        {announcementsPlace.map((announcement, index) => (
                          <div key={index} className="announcement-item">
                            {/* Display the current announcement */}
                            <p className="news-head-com">
                              {announcement.announcement}
                            </p>
                            {announcement.announcement_image && (
                              <img
                                className="news-img-com"
                                src={`data:image/png;base64,${announcement.announcement_image}`}
                                alt="Announcement"
                                width={80}
                                height={80}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No announcements available.</p>
                    )}
                  </div>
                </div>
                <p>

                </p>

              </div>
            )}
            <p style={{ height: "50px" }}></p>
          </div>)}

      </div>

    </div>
  );
};

export default Dashboard;
