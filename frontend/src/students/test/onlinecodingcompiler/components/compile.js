import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTestContext } from "../../contextsub/context";
import CodeEditorWindow from "./codeeditorwindow";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { defineTheme } from "../lib/definetheme";
import useKeyPress from "../hooks/usekeypress";
import Select from "react-select";
import { customStyles } from "../constants/customstyles";
import ErrorModal from "../../../../components/auth/errormodal";
import { getSkillType_Languages_API } from "../../../../api/endpoints";

const API_URL = "https://d36uf68d9l9joj.cloudfront.net/program-compiler/";


const languageOptions = [
    { id: 71, label: "Select Lang...", value: "" },
    { id: 71, label: "Python", value: "python" },
    { id: 49, label: "C", value: "c" },
    { id: 54, label: "C++", value: "cpp" },
    { id: 62, label: "JAVA", value: "java" },
];


const Compile = () => {


    const {
        testIdCon,
        setCodeWindow,
        setLanguageSelected,
        setCustomInputCom,
        setOutputWindowCom,
        setSkillTypeLanguage,
        testCases,
        setTestCasesResults
    } = useTestContext();


    //   const testCases = [
    //       { input: "7 3 5 ", expected: "15" },
    //       { input: "-8 -12 10", expected: "-10" },
    //       { input: "0 0 0", expected: "0" },
    //   ];

    const [code, setCode] = useState("// Write only the function...");
    const [language, setLanguage] = useState("python");
    const [testResults, setTestResults] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");


    const [theme, setTheme] = useState("cobalt");
    const [showError, setShowError] = useState(false);
    const [skillType, setSkillType] = useState("");


    const enterPress = useKeyPress("Enter");
    const ctrlPress = useKeyPress("Control");
    const [selectLanguage, setSelectLanguage] = useState(languageOptions[0]);

    const handleChangeLanguage = (selectedOption) => {
        setSelectLanguage(selectedOption);
        console.log("Selected language:", selectedOption);
        setLanguageSelected(selectedOption.value);
    };

    useEffect(() => {
        fetchTestName();
    }, [testIdCon]);

    const fetchTestName = async () => {
        try {
            const name = await getSkillType_Languages_API(testIdCon);
            setSkillType(name.skill_type); // Save skill type from the API
            setSkillTypeLanguage(name.skill_type);
            if (name.skill_type !== "All Languages") {
                // Set language automatically if skill_type is not 'All Languages'
                setSelectLanguage(
                    languageOptions.find((option) => option.label === name.skill_type)
                );
                setLanguageSelected(name.skill_type.toLowerCase());
                console.log(
                    "name.skill_type.toLowerCase(): ",
                    name.skill_type.toLowerCase()
                );
            }
        } catch (error) {
            console.error("Error fetching skill type:", error);
        }
    };

    const handleCloseError = () => {
        setShowError(false);
    };

    useEffect(() => {
        if (enterPress && ctrlPress) {
            console.log("enterPress", enterPress);
            console.log("ctrlPress", ctrlPress);
        }
    }, [ctrlPress, enterPress]);

    const onChange = (action, data) => {
        switch (action) {
            case "code": {
                setCode(data);
                setCodeWindow(data);
                // console.log('setCode: ', data);
                break;
            }
            default: {
                console.warn("case not handled!", action, data);
            }
        }
    };

    function handleThemeChange(th) {
        const theme = th;
        console.log("theme...", theme);

        if (["light", "vs-dark"].includes(theme.value)) {
            setTheme(theme);
        } else {
            defineTheme(theme.value).then((_) => setTheme(theme));
        }
    }
    useEffect(() => {
        defineTheme("oceanic-next").then((_) =>
            setTheme({ value: "oceanic-next", label: "Oceanic Next" })
        );
    }, []);


    const runCodeOLD = async () => {
        setTestResults([]);
        setErrorMessage("");
        let results = [];
        for (const testCase of testCases) {
            const dataToSubmit = {
                code: code,
                p_type: selectLanguage.value,
                inputs: testCase.input,
            };

            console.log('dataToSubmit: ', dataToSubmit);

            try {
                const response = await axios.post(API_URL, dataToSubmit);
                console.log('RESPONSE: ', response);
                const output = response.data.result?.trim();
                const isPassed = output === testCase.expected;
                results.push({ input: testCase.input, expected: testCase.expected, output, status: isPassed ? "Pass" : "Fail" });
            } catch (error) {
                setErrorMessage("API Error: " + (error.response?.data || error.message));
                return;
            }
        }
        setTestResults(results);
        setTestCasesResults(results);
    };

    


  const runCode = async () => {
    setTestResults([]); 
    setErrorMessage("");
    console.log('selectLanguage.value: ', selectLanguage.value);

    // Step 1: Check for Syntax Errors
    try {
      const syntaxCheck = await axios.post(API_URL, {
        code: code,
        p_type: selectLanguage.value,
        inputs: "",
      });

      console.log('syntaxCheck: ', syntaxCheck)

      if (syntaxCheck.data.error) {
        const sanitizedError = syntaxCheck.data.error.replace(/\/.*\/[\w-]+\.(cpp|java|c|py):\s*/g, "");
        setErrorMessage(sanitizedError.split("\n").join("\n"));


        return;
      }
    } catch (error) {
      setErrorMessage("Syntax Check Error: \n\n" + (error.response?.data || error.message));
      return;
    }

    console.log('Test Cases: ', testCases);

    // Step 2: Run Test Cases One by One
    for (const testCase of testCases) {
        console.log('test case: ', testCase);
      try {
        const response = await axios.post(API_URL, {
          code: code,
          p_type: selectLanguage.value,
          inputs: testCase.input,
        });

        console.log('Response: ', response);

        const output = (response.data.result || "Error").replace(/\/.*\/[\w-]+\.(cpp|java|c|py):\s*/g, "").trim();

        console.log('OUTPUT: ', output);

        const isPassed = output === testCase.expected;
        console.log('isPassed: ', isPassed);

        if (!isPassed) {
          setTestResults([
            {
              input: testCase.input,
              expected: testCase.expected,
              output: output.split("\n").join("\n"), // Proper spacing between error lines
              status: "Fail",
            },
          ]); // Stop and show only this failed test case
          
          setTestCasesResults([
            {
              input: testCase.input,
              expected: testCase.expected,
              output: output.split("\n").join("\n"), // Proper spacing between error lines
              status: "Fail",
            },
          ]); 
          return;
        }
      } catch (error) {
        setErrorMessage("Test Case Error: \n" + (error.response?.data || error.message));
        return;
      }
    }

    // If no errors, show all test cases passed
    setTestResults(testCases.map((test) => ({ ...test, status: "Pass", output: test.expected })));
    setTestCasesResults(testCases.map((test) => ({ ...test, status: "Pass", output: test.expected })));
 
};




    return (
        <div >

            <div style={{ flex: 1, padding: "20px" }}>
                <div className="flex-row">
                    {skillType === "All Languages" ? (
                        <div className="dropdown-container">
                            <Select
                                options={languageOptions}
                                value={selectLanguage}
                                onChange={handleChangeLanguage}
                                styles={customStyles}
                            />
                        </div>
                    ) : (
                        <div className="dropdown-container">
                            <span>Language: {skillType}</span> {/* Display the skill type */}
                        </div>
                    )}

                    <div className="dropdown-container">

                        <button
                            onClick={runCode}
                            className="compile-button"
                        >
                            Run Code
                        </button>
                    </div>
                </div>
                <p></p>

                {/*}
                <h3>Examples:</h3>
                {testCases.map((test, index) => (
                    <p key={index}>
                        <b>Input:</b> {test.input} | <b>Expected Output:</b> {test.expected}
                    </p>
                ))}
                    */}

                <div className="mn-con">
                    <div className="code-editor-container">
                        <CodeEditorWindow
                            code={code}
                            onChange={onChange}
                            language={selectLanguage}
                            theme={theme.value}
                        />
                    </div>
                </div>
            </div>


            <div style={{ flex: 1, padding: "20px", borderRight: "2px solid #ddd" }}>



                <h3>Test Case Results:</h3>
                {testResults.length > 0 ? (
                    testResults.map((result, index) => (
                        <p key={index} style={{ color: result.status === "Pass" ? "#39ee16" : "#F1A128" }}>
                            <b>Input:</b> {result.input} | <b>Expected:</b> {result.expected} | <b>Output:</b> {result.output} | <b>Status:</b> {result.status}
                        </p>
                    ))
                ) : (
                    <p>No Results Yet</p>
                )}

            </div>
        </div>
    );
};

export default Compile;
