import { useEffect, useState } from "react";
//import BinaryToImages from "../../students/Test/tests/BinaryToImages";
import {
  Trainer_Test_Schedule_API,
  Trainer_Training_Schedule_API,
  Trainer_Topic_Status_API,
  Trainer_Aptitude_Count_API,
  Trainer_Technical_Count_API,
  Trainer_Test_Reports_API,
  getdepartmentApi,
  Trainer_Feedback_Report_API,
  Trainer_News_Updates_API,
} from "../../api/endpoints";
import { Bar } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./dashboard.css";
const TrainerDashboard = ({ username }) => {
  const [totalAptitudeCount, setTotalAptitudeCount] = useState(null);
  const [totalTechnicalCount, setTotalTechicalCount] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [chartData, setChartData] = useState({});
  const [dept, setDept] = useState("");
  const [departmets, setDepartments] = useState([]);

  const [testSch, setTestSch] = useState([]);
  const [trainingSch, setTrainingSch] = useState([]);
  const [topicStatus, setTopicStatus] = useState([]);
  const [selectedDateFeedback, setSelectedDateFeedback] = useState(new Date());
  const [chartDataFeedback, setChartDataFeedback] = useState({});
  const [deptFeedback, setDeptFeedback] = useState("");
  const [events, setEvents] = useState([]);
  const [totalPresent, setTotalPresent] = useState("");
  const [totalAbsent, setTotalAbsent] = useState("");

  const fetchEventsData = async () => {
    try {
      const response = await Trainer_News_Updates_API(username);
      console.log("Events Fetching...: ", response);
      setEvents(response);
      console.log("Events: ", response);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    fetchEventsData();
    fetchAptitudeCount();
    fetchTechnicalCount();
    fetchTestSchedules();
    fetchTrainingSchedules();
    fetchTopicStatus();
    fetchTestsReports();
    fetchDepartments();
    fetchFeedbackReports();
  }, [username, dept, selectedDate, deptFeedback, selectedDateFeedback]);
 

  const fetchAptitudeCount = async () => {
    try {
      const response = await Trainer_Aptitude_Count_API(username);
      console.log("total Aptitude count: ", response);
      setTotalAptitudeCount(response.count);
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchTechnicalCount = async () => {
    try {
      const response = await Trainer_Technical_Count_API(username); // Await the promise
      console.log("response of total technical count: ", response);
      setTotalTechicalCount(response.count); // Access data directly
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getdepartmentApi(); // Await the promise
      console.log("Categories: ", response);
      setDepartments(response); // Access data directly
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchTestsReports = async () => {
    try {
      const data = await Trainer_Test_Reports_API(username, dept, selectedDate); // Await the promise
      setChartData({
        labels: ["Pass", "Fail"],
        datasets: [
          {
            label: "Test Report",
            data: [data.pass, data.fail], // Use the response data
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

  const fetchFeedbackReports = async () => {
    try {
      const data = await Trainer_Feedback_Report_API(
        username,
        deptFeedback,
        selectedDateFeedback
      ); // Await the promise
      setChartDataFeedback({
        labels: ["Good", "Poor", "Excellent", "Average"],
        datasets: [
          {
            label: "Feedback",
            data: [data.Good, data.Poor, data.Excellent, data.Average], // Use the response data
            backgroundColor: ["#FF6384", "#FFCE56", "#4BC0C0", "#800080"],
            borderColor: ["#FF6384", "#FFCE56", "#4BC0C0", "#800080"],
            borderWidth: 1,
            maxBarThickness: 25,
          },
        ],
      });
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchTestSchedules = () => {
    Trainer_Test_Schedule_API(username)
      .then((response) => {
        setTestSch(response.data);
        console.log("test schedules: ", response.data);
      })
      .catch((error) =>
        console.error("Error fetching getting upcomming interview:", error)
      );
  };

  const fetchTrainingSchedules = () => {
    Trainer_Training_Schedule_API(username)
      .then((data) => {
        setTrainingSch(data);
        console.log("training schedules: ", data);
      })
      .catch((error) =>
        console.error("Error fetching getting training interview:", error)
      );
  };

  const fetchTopicStatus = () => {
    Trainer_Topic_Status_API(username)
      .then((data) => {
        setTopicStatus(data);
        console.log("training schedules: ", data);
      })
      .catch((error) =>
        console.error("Error fetching getting training interview:", error)
      );
  };

  return (
    <div className="form-ques-trainer">
      <section className="card-list">
        <div className="cards-trainerrole">
          {/* SQUARE */}
          <div className="trainer-role">
            <div className="card-container-trainer">
              <div className="square-container-trainer">
                <div className="card-trainer card-test-count-trainer">
                  <div className="card-content-wrapper-trainer">
                    <p className="card-content-trainer">
                      {totalPresent ? totalPresent : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <h6 className="card-title-trainer-prerole">Total Present</h6>
          </div>

          <div className="trainer-role">
            <div className="card-container-trainer">
              <div className="square-container-trainer">
                <div className="card-trainer card-test-trainer">
                  <div className="card-content-wrapper-trainer">
                    <p className="card-content-trainer">
                      {totalAbsent ? totalAbsent : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <h6 className="card-title-trainer-prerole">Total Absent</h6>
          </div>
          <div className="trainer-role">
            <div className="card-container-trainer">
              <div className="square-container-trainer">
                <div className="card-trainer card-companies-trainer">
                  <div className="card-content-wrapper-trainer">
                    <p className="card-content-trainerTech">
                      {totalAptitudeCount ? totalAptitudeCount : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <h2 className="card-title-trainer">Total Aptitude Test</h2>
          </div>

          <div className="trainer-role">
            <div className="card-container-trainer">
              <div className="square-container-trainer">
                <div className="card-trainer card-offers-trainer">
                  <div className="card-content-wrapper-trainer">
                    <p className="card-content-trainerTech">
                      {totalTechnicalCount ? totalTechnicalCount : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h2 className="card-title-trainer-techtest">Total Technical Test</h2>
        </div>
        <p style={{ height: "40px" }}></p>

        <div
          className="container-trainer"
          style={{ marginTop: "19px", marginLeft: "6%" }}
        >
          <div className="row">
            <div className="col-dashboard" style={{ minWidth: "300px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "bold" }}>
                Training Report
              </h4>
              <div className="date-select-wrapper">
                <div className="date-picker-wrapper">
                  <DatePicker
                    selected={selectedDateFeedback}
                    onChange={(date) => setSelectedDateFeedback(date)}
                    dateFormat="dd-MMM-yyyy"
                    className="input-date-train"
                  />
                </div>

                <select
                  className="select-dropdown"
                  style={{
                    color: "white",
                    fontSize: "12px",
                    marginBottom: "10px",
                  }}
                  onChange={(e) => setDeptFeedback(e.target.value)}
                  value={deptFeedback}
                >
                  <option value="">All</option>
                  {departmets.map((item, index) => (
                    <option key={index} value={item.department}>
                      {item.department}
                    </option>
                  ))}
                </select>
              </div>

              {chartDataFeedback && chartDataFeedback.datasets && (
                <Bar
                  data={chartDataFeedback}
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
                />
              )}
            </div>

            <div className="col-dashboard" style={{ minWidth: "300px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "bold" }}>
                Test Report
              </h4>
              <div className="date-select-wrapper">
                <div className="date-picker-wrapper">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="dd-MMM-yyyy"
                    className="input-date-train"
                  />
                </div>

                <select
                  className="select-dropdown"
                  style={{
                    color: "white",
                    fontSize: "12px",
                    marginBottom: "10px",
                  }}
                  onChange={(e) => setDept(e.target.value)}
                  value={dept}
                >
                  <option value="">All</option>
                  {departmets.map((item, index) => (
                    <option key={index} value={item.department}>
                      {item.department}
                    </option>
                  ))}
                </select>
              </div>

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
                />
              )}
            </div>

            <div className="col-dashboard">
              <h4 style={{ fontSize: "16px", fontWeight: "bold" }}>
                Test Schedules
              </h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "white",
                        }}
                        className="table-header"
                      >
                        Date
                      </th>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "white",
                        }}
                        className="table-header"
                      >
                        Aptitude
                      </th>
                      <th
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3e4954",
                          color: "white",
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
                          color: "white",
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
                          color: "white",
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
                          colSpan={5} // Span all columns
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
                              color: "white",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.date}
                          </td>
                          <td
                            style={{
                              color: "white",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.aptitude}
                          </td>
                          <td
                            style={{
                              color: "white",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.technical_mcq}
                          </td>
                          <td
                            style={{
                              color: "white",
                              backgroundColor: "#3e4954",
                            }}
                            className="table-cell"
                          >
                            {item.technical_coding}
                          </td>
                          <td
                            style={{
                              color: "white",
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
          </div>

          <div className="row">
            <div className="col-dashboard">
              <h4 style={{ fontSize: "16px", fontWeight: "bold" }}>
                Training Schedules
              </h4>
              <table className="table">
                <thead>
                  <tr>
                    <th
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#3e4954",
                        color: "white",
                      }}
                      className="table-header"
                    >
                      Date
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
                    </th>
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
                            color: "white",
                            backgroundColor: "#3e4954",
                          }}
                          className="table-cell"
                        >
                          {item.Start_Date}
                        </td>
                        <td
                          style={{
                            color: "white",
                            backgroundColor: "#3e4954",
                          }}
                          className="table-cell"
                        >
                          {item.skill}
                        </td>
                        <td
                          style={{
                            color: "white",
                            backgroundColor: "#3e4954",
                          }}
                          className="table-cell"
                        >
                          {item.topic}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="col-dashboard">
              <h4 style={{ fontSize: "16px", fontWeight: "bold" }}>
                Topic Status
              </h4>
              <table className="table">
                <thead>
                  <tr>
                    <th
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#3e4954",
                        color: "white",
                      }}
                      className="table-header"
                    >
                      Skills
                    </th>
                    <th
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#3e4954",
                        color: "white",
                      }}
                      className="table-header"
                    >
                      Topics
                    </th>
                    <th
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#3e4954",
                        color: "white",
                      }}
                      className="table-header"
                    >
                      Sub Topics
                    </th>
                    <th
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#3e4954",
                        color: "white",
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
                          color: "white",
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
                            color: "white",
                            backgroundColor: "#3e4954",
                          }}
                          className="table-cell"
                        >
                          {item.skill}
                        </td>
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
                          {item.sub_topic}
                        </td>
                        <td
                          style={{
                            color: "white",
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
          <div className="row">
            <div className="col-dashboard">
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "16px",
                  color: "#ffff",
                  fontWeight: "bold",
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

export default TrainerDashboard;
