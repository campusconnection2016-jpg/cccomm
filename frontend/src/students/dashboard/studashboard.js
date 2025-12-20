import { useEffect, useState, useCallback } from "react";
import {
  Stu_Aptitute_test_API,
  Stu_Technical_test_API,
  Stu_cmpy_test_API,
  Stu_commun_test_API,
  Stu_Offer_Counts_API,
  Stu_Aptitude_Reports_API,
  Stu_TestType_Categories_API,
  Stu_Technical_Reports_API,
  Stu_Test_Schedules_API,
  Stu_Training_Schedules_API,
  Stu_Topic_Status_API,
   Stu_News_Updates_API,
  downloadAptituteStu_API,
  downloadTechnicalStu_API,
} from "../../api/endpoints";
import "./dashboard.css";
import { Bar } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";



const StuDashboard = ({ username }) => {
  const [totalAptitudeCount, setTotalAptitudeCount] = useState(null);
  const [totalTechnicalCount, setTotalTechicalCount] = useState(null);
  const [OfferCounts, setOfferCounts] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [catogories, setCategories] = useState([]);
  const [cat, setCat] = useState("");
  const [catTech, setCatTech] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateTech, setSelectedDateTech] = useState(new Date());
  const [chartDataTech, setChartDataTech] = useState({});
  const [testSch, setTestSch] = useState([]);
  const [trainingSch, setTrainingSch] = useState([]);
  const [events, setEvents] = useState([]);
  const [offerAccept, setOfferAccept] = useState("");
  const [testTaken, setTestTaken] = useState("");
  const [topicStatus, setTopicStatus] = useState([]);
  const [totalcmpy, settotalcmpy] = useState("");
  const [totalcommun, settotalcommun] = useState("");

  const [triggerFetch, setTriggerFetch] = useState(true);

  const fetchInitialData = useCallback(async () => {
    try {
      await Promise.all([
        fetchAptitudeCount(),
        fetchTechnicalCount(),
        fetchcmpyCount(),
        fetchcommunCount(),
        fetchOfferCounts(),
        fetchCategories(),
        fetchEventsData(),
        fetchTestSchedules(),
        fetchTrainingSchedules(),
        fetchTopicStatus(),
      ]);
    } catch (err) {
      console.error("Error fetching initial data:", err.message);
    }
  }, [username]);

  useEffect(() => {
    if (triggerFetch) {
      fetchInitialData().then(() => setTriggerFetch(false));
    }
  }, [triggerFetch, fetchInitialData]);


  useEffect(() => {
    if (selectedDate) {
      fetchAptitudeReports();
      fetchTechnicalReports();

    }
  }, [selectedDate, selectedDateTech]);

  const fetchAptitudeCount = async () => {
    try {
      const response = await Stu_Aptitute_test_API(username, testTaken);
      setTotalAptitudeCount(response.count);
    } catch (err) {
      console.error("Error fetching aptitude count:", err.message);
    }
  };

  const fetchTechnicalCount = async () => {
    try {
      const response = await Stu_Technical_test_API(username, testTaken);
      setTotalTechicalCount(response.count);
    } catch (err) {
      console.error("Error fetching technical count:", err.message);
    }
  };
const fetchcmpyCount = async () => {
  try {
    const response = await Stu_cmpy_test_API(username);

    // Optional: log individual fields
    if (response && typeof response === 'object') {
      } else {
      console.warn("⚠️ Unexpected response format:", response);
    }

    settotalcmpy(response.count);
    console.log("✅ Step 4 - settotalcmpy called with:", response.count);
  } catch (err) {
    console.error("❌ Error fetching company test count:", err.message);
  }
};


  const fetchcommunCount = async () => {
    try {
      const response = await Stu_commun_test_API(username);
      settotalcommun(response.count);
    } catch (err) {
      console.error("Error fetching technical count:", err.message);
    }
  };

  const fetchOfferCounts = async () => {
    try {
      const response = await Stu_Offer_Counts_API(username, offerAccept);
      setOfferCounts(response.number_of_offers);
    } catch (err) {
      console.error("Error fetching offer counts:", err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await Stu_TestType_Categories_API();
      const filteredCategories = response.filter(
        (item) =>
          !["Company Specific", "Mock/Interview", "Pre/Post Assessment"].includes(
            item.categories
          )
      );
      setCategories(filteredCategories);
    } catch (err) {
      console.error("Error fetching categories:", err.message);
    }
  };

  const fetchTestSchedules = async () => {
    try {
      const data = await Stu_Test_Schedules_API(username);
      setTestSch(data);
    } catch (err) {
      console.error("Error fetching test schedules:", err.message);
    }
  };

  const fetchTrainingSchedules = async () => {
    try {
      const data = await Stu_Training_Schedules_API(username);
      setTrainingSch(data);
    } catch (err) {
      console.error("Error fetching training schedules:", err.message);
    }
  };

  const fetchTopicStatus = async () => {
    try {
      const data = await Stu_Topic_Status_API(username);
      setTopicStatus(data);
    } catch (err) {
      console.error("Error fetching topic status:", err.message);
    }
  };




  //======================================

  //Cards


  const fetchAptitudeReports = async () => {
    try {
      const data = await Stu_Aptitude_Reports_API(username, cat, selectedDate); // Await the promise
      setChartData({
        labels: ["Quants", "Logical", "Verbal"],
        datasets: [
          {
            label: "Aptitude Test Report",
            data: [data.quants, data.logical, data.verbal], // Use the response data
            backgroundColor: ["#FF6384", "#FFCE56", "#4BC0C0"],
            borderColor: ["#FF6384", "#FFCE56", "#4BC0C0"],
            borderWidth: 1,
            maxBarThickness: 25,
          },
        ],
      });
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchTechnicalReports = async () => {
    try {
      const data = await Stu_Technical_Reports_API(
        username,
        catTech,
        selectedDateTech
      ); // Await the promise
      setChartDataTech({
        labels: ["MCQ", "Coding"],
        datasets: [
          {
            label: "Technial Test Report",
            data: [data.mcq, data.coding], // Use the response data
            backgroundColor: ["#FF6384", "#FFCE56"],
            borderColor: ["#FF6384", "#FFCE56"],
            borderWidth: 1,
            maxBarThickness: 25,
          },
        ],
      });
    } catch (err) {
      console.log(err.message);
    }
  };


  // Function to download chart data as an Excel sheet
  const downloadChartData = () => {
    downloadAptituteStu_API(username, cat, selectedDate);
  };

  // Function to download chart data as an Excel sheet
  const downloadChartDataTech = () => {
    downloadTechnicalStu_API(username, cat, selectedDate);
  };

  const fetchEventsData = async () => {
    try {
      const response = await Stu_News_Updates_API(username);
      console.log("Events Fetching...: ", response);
      setEvents(response);
      console.log("Events: ", response);
    } catch (err) {
      console.log(err.message);
    }
  };
  return (
    <div className="form-ques-studash">
      <section className="card-list">
        <div className="cards-studentrole">
          <div className="student-role">
            <div className="card-container-student">
              <div className="square-container-student">
                <div className="card-stu card-test-count-stu">
                  <div className="card-content-wrapper-stu">
                    <p className="card-content-stu">
                      {totalcmpy ? totalcmpy : 0}
                    </p>
                  </div>
                </div>
              </div>
              <h6 className="card-title-stu">Company Specific Test</h6>
            </div>
          </div>

          <div className="student-role">
            <div className="card-container-student">
              <div className="square-container-student">
                <div className="card-stu card-test-stu">
                  <div className="card-content-wrapper-stu">
                    <p className="card-content-stu">
                      {totalcommun ? totalcommun : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <h6 className="card-title-stu">Softskill Test</h6>
          </div>

          <div className="student-role">
            <div className="card-container-student">
              <div className="square-container-student">
                <div className="card-stu card-companies-stu">
                  <div className="card-content-wrapper-stu">
                    <p className="card-content-stu">
                      {totalAptitudeCount ? totalAptitudeCount : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <h2 className="card-title-stu">
              Aptitude Test
              {/* style={{ marginRight: "-16px" }} */}
            </h2>
          </div>

          <div className="student-role">
            <div className="card-container-student">
              <div className="square-container-student">
                <div className="card-stu card-offers-stu">
                  <div className="card-content-wrapper-stu">
                    <p className="card-content-stu">
                      {totalTechnicalCount ? totalTechnicalCount : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <h2 className="card-title-stu">
              Technical Test
              {/* style={{ marginRight: "-30px" }} */}
            </h2>
          </div>

          <div className="student-role">
            <div className="card-container-student">
              <div className="square-container-student">
                <div className="card-stu card-requests-stu">
                  <div className="card-content-wrapper-stu">
                    <p className="card-content-stu">
                      {OfferCounts ? OfferCounts : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h2 className="card-title-stu-off">Total Offers</h2>
        </div>
        <p style={{ height: "40px" }}></p>

        <div className="container-student" style={{ marginTop: "55px" }}>
          <div className="row">
            <div className="row">
              <div className="parents">
                <div className="col-dashboard-stu">
                  <h4
                    style={{
                      fontSize: "16px",
                      color: "#ffff",
                      fontWeight: "bold",
                    }}
                  >
                    Offer Accepted
                  </h4>
                  <p></p>
                  <select
                    className="select-dropdown-stu"
                    onChange={(e) => setOfferAccept(e.target.value)}
                    value={offerAccept}
                  >
                    <option value="">All</option>
                    <option value="IT">IT</option>
                    <option value="Core">Core</option>
                  </select>
                </div>
                <div className="col-dashboard-stu">
                  <h4
                    style={{
                      fontSize: "16px",
                      color: "#ffff",
                      fontWeight: "bold",
                    }}
                  >
                    Test Taken
                  </h4>
                  <p></p>
                  <select
                    className="select-dropdown-stu"
                    onChange={(e) => setTestTaken(e.target.value)}
                    value={testTaken}
                  >
                    <option value="">All</option>
                    {catogories.map((item, index) => (
                      <option key={index} value={item.categories}>
                        {item.categories}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-dash" style={{ marginRight: "25px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    color: "#ffff",
                    fontWeight: "bold",
                  }}
                >
                  Aptitude Test Report
                </h3>
                <p></p>
                <div className="date-select-wrapper">
                  <div className="date-picker-wrapper">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      dateFormat="dd-MMM-yyyy"
                      className="input-date-train"
                    />
                  </div>
                  <p></p>


                </div>
                <p></p>

                {chartData && chartData.datasets && (
                  <Bar
                    data={chartData}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                          min: 0,
                          max: 100,
                          ticks: {
                            stepSize: 10,
                            color: "#FFFFFF", // Y-axis label color
                          },
                        },
                        x: {
                          ticks: {
                            color: "#FFFFFF", // X-axis label color
                          },
                        },
                      },
                      plugins: {
                        legend: {
                          labels: {
                            color: "#FFFFFF", // Dataset label color
                          },
                        },
                      },
                      elements: {
                        bar: {
                          borderColor: "#FFFFFF", // Bar border color
                          borderWidth: 2, // Optional: Border width
                          barThickness: 20, // Decrease the bar width (You can adjust this value)
                          maxBarThickness: 25, // Optional: Set a maximum thickness
                        },
                      },
                    }}
                    onClick={downloadChartData} // Attach click handler to chart
                  />
                )}
              </div>

              <div className="col-dash">
                <h3
                  style={{
                    fontSize: "16px",
                    color: "#ffff",
                    fontWeight: "bold",
                  }}
                >
                  Technical Test Report
                </h3>
                <p></p>
                <div className="date-select-wrapper">
                  <div className="date-picker-wrapper">
                    <DatePicker
                      selected={selectedDateTech}
                      onChange={(date) => setSelectedDateTech(date)}
                      dateFormat="dd-MMM-yyyy"
                      className="input-date-train"
                    />
                  </div>
                  <p></p>


                </div>
                <p></p>

                {chartDataTech && chartDataTech.datasets && (
                  <Bar
                    data={chartDataTech}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                          min: 0,
                          max: 100,
                          ticks: {
                            stepSize: 10,
                            color: "#FFFFFF", // Y-axis label color
                          },
                        },
                        x: {
                          ticks: {
                            color: "#FFFFFF", // X-axis label color
                          },
                        },
                      },
                      plugins: {
                        legend: {
                          labels: {
                            color: "#FFFFFF", // Dataset label color
                          },
                        },
                      },
                      elements: {
                        bar: {
                          borderColor: "#FFFFFF", // Bar border color
                          borderWidth: 2, // Optional: Border width
                          barThickness: 20, // Decrease the bar width (You can adjust this value)
                          maxBarThickness: 25, // Optional: Set a maximum thickness
                        },
                      },
                    }}

                    onClick={downloadChartDataTech}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-dashboard">
              <h3
                style={{ fontSize: "16px", color: "#ffff", fontWeight: "bold" }}
              >
                Test Schedules
              </h3>
              <div className="table-responsive-stu">
                <table className="table">
                  <thead>
                    <tr>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "#ffff",
                        }}
                        className="table-header"
                      >
                        Date
                      </th>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "#ffff",
                        }}
                        className="table-header"
                      >
                        Aptitude
                      </th>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "#ffff",
                        }}
                        className="table-header"
                      >
                        Technical
                        <br />
                        MCQ
                      </th>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "#ffff",
                        }}
                        className="table-header"
                      >
                        Technical
                        <br />
                        Coding
                      </th>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "#ffff",
                        }}
                        className="table-header"
                      >
                        Softskills
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {testSch.length === 0 ? (
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
                      testSch.map((item) => (
                        <tr key={item.id}>
                          <td
                            style={{
                              color: "#ffff",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.date}
                          </td>
                          <td
                            style={{
                              color: "#ffff",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.aptitude}
                          </td>
                          <td
                            style={{
                              color: "#ffff",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.technical_mcq}
                          </td>
                          <td
                            style={{
                              color: "#ffff",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.technical_coding}
                          </td>
                          <td
                            style={{
                              color: "#ffff",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.softskills}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-dashboard">
              <h2
                style={{ fontSize: "16px", color: "#ffff", fontWeight: "bold" }}
              >
                Training Schedules
              </h2>
              <div className="table-responsive-stu">
                <table
                  className={`table-training-stu ${fetchTrainingSchedules.length > 5 ? "table-scrollable" : ""
                    }`}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "#ffff",
                        }}
                        className="table-header"
                      >
                        Date
                      </th>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "#ffff",
                        }}
                        className="table-header"
                      >
                        Trainer
                      </th>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "#ffff",
                        }}
                        className="table-header"
                      >
                        Skills
                      </th>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "#ffff",
                        }}
                        className="table-header"
                      >
                        Topic
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingSch.length === 0 ? (
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
                      trainingSch.map((item) => (
                        <tr key={item.id}>
                          <td
                            style={{
                              color: "#ffff",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.dtm_start_student}
                          </td>
                          <td
                            style={{
                              color: "#ffff",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.trainer_name}
                          </td>
                          <td
                            style={{
                              color: "#ffff",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.topic}
                          </td>
                          <td
                            style={{
                              color: "#ffff",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.skill_type}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>{" "}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-dashboard">
              <h2
                style={{ fontSize: "16px", color: "#ffff", fontWeight: "bold" }}
              >
                Topic Status
              </h2>
              <div className="table-responsive-stu">
                <table
                  className={`table-topic-stu ${topicStatus.length > 5 ? "table-scrollable" : ""
                    }`}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "#ffff",
                        }}
                        className="table-header"
                      >
                        Skills
                      </th>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "#ffff",
                        }}
                        className="table-header"
                      >
                        Topics
                      </th>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "#ffff",
                        }}
                        className="table-header"
                      >
                        Sub Topics
                      </th>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "#ffff",
                        }}
                        className="table-header"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topicStatus.length === 0 ? (
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
                          Topic status not found
                        </td>
                      </tr>
                    ) : (
                      topicStatus.map((item) => (
                        <tr key={item.id}>
                          <td
                            style={{
                              color: "#ffff",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.skill_type}
                          </td>
                          <td
                            style={{
                              color: "#ffff",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.topic}
                          </td>
                          <td
                            style={{
                              color: "#ffff",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.sub_topic}
                          </td>
                          <td
                            style={{
                              color: "#ffff",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.status}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-dashboard">
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "16px",
                  color: "#ffff",
                }}
              >
                News Updates
              </h2>

              <div className="table-responsive-dash">
                {events.length > 0 ? (
                  <div
                    className={`table-test ${
                      events.length > 1 ? "table-scrollable" : ""
                    }`}
                  >
                    {events.map((announcement, index) => (
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
        </div>
      </section>
    </div>
  );
};

export default StuDashboard;
