import React, { useEffect, useState } from "react";
import CodeEditorWindow from "./codeeditorwindow";
import axios from "axios";
import { classnames } from "../utils/general";
import { languageOptions } from "../constants/languageoptions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { defineTheme } from "../lib/definetheme";
import useKeyPress from "../hooks/usekeypress";
import OutputWindow from "./outputwindow";
import CustomInput from "./custominput";
import OutputDetails from "./outputdetails";
import ThemeDropdown from "./themedropdown";
import LanguagesDropdown from "./languagesdropdown";
import './styles.css';

const javascriptDefault = 
`// Write your C++ code here 
#include <iostream>

int main() {
    std::cout << "Hello World!";
    return 0;
}`;

const Landing = () => {
    const [code, setCode] = useState(javascriptDefault);
    const [customInput, setCustomInput] = useState("");
    const [outputDetails, setOutputDetails] = useState(null);
    const [processing, setProcessing] = useState(null);
    const [theme, setTheme] = useState("cobalt");
    const [language, setLanguage] = useState(languageOptions[5]);

    const enterPress = useKeyPress("Enter");
    const ctrlPress = useKeyPress("Control");

    const onSelectChange = (sl) => {
        console.log("selected Option...", sl);
        setLanguage(sl);
    };

    useEffect(() => {
        if (enterPress && ctrlPress) {
            console.log("enterPress", enterPress);
            console.log("ctrlPress", ctrlPress);
            handleCompile();
        }
    }, [ctrlPress, enterPress]);

    const onChange = (action, data) => {
        switch (action) {
            case "code": {
                setCode(data);
                break;
            }
            default: {
                console.warn("case not handled!", action, data);
            }
        }
    };

    const handleCompile = () => {
        setProcessing(true);
        const formData = {
            language: language.id,
            code,
            stdin: customInput,
        };

        axios
            .post("https://repl.it/api/v0/repls", formData)
            .then(function (response) {
                console.log("res.data", response.data);
                // Assuming response structure similar to Repl.it API response
                const token = response.data.id;
                checkStatus(token);
            })
            .catch((err) => {
                console.error("Error compiling:", err);
                setProcessing(false);
                showErrorToast("Error compiling code.");
            });
    };

    const checkStatus = async (token) => {
        try {
            let response = await axios.get(`https://repl.it/api/v0/repls/${token}`);
            let statusId = response.data.status?.id;

            if (statusId === 1 || statusId === 2) {
                setTimeout(() => {
                    checkStatus(token);
                }, 2000);
                return;
            } else {
                setProcessing(false);
                setOutputDetails(response.data);
                showSuccessToast(`Compiled Successfully!`);
                console.log("response.data", response.data);
                return;
            }
        } catch (err) {
            console.log("err", err);
            setProcessing(false);
            showErrorToast();
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

    const showSuccessToast = (msg) => {
        toast.success(msg || `Compiled Successfully!`, {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    const showErrorToast = (msg, timer) => {
        toast.error(msg || `Something went wrong! Please try again.`, {
            position: "top-right",
            autoClose: timer ? timer : 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    return (
        <>
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
  
        <div className="gradient-bar"></div>
        <div className="flex-row">
          <div className="dropdown-container">
            <LanguagesDropdown onSelectChange={onSelectChange} />
          </div>
          <div className="dropdown-container">
            <ThemeDropdown
              handleThemeChange={handleThemeChange}
              theme={theme}
            />
          </div>
        </div>
        <div className='main-container'>
          <div className="code-editor-container small-width">
            <CodeEditorWindow
              code={code}
              onChange={onChange}
              language={language?.value}
              theme={theme.value}
            />
          </div>
  
          <div className="output-details">
            <OutputWindow outputDetails={outputDetails} />
            <div className="custom-input-container">
              <CustomInput
                customInput={customInput}
                setCustomInput={setCustomInput}
                
              />
              <p></p>
              <button
                onClick={handleCompile}
                disabled={!code}
                className="compile-button"
              >
                {processing ? "Processing..." : "Compile and Execute Here"}
              </button>
            </div>
            {outputDetails && <OutputDetails outputDetails={outputDetails} />}
          </div>
        </div>
      </>
    );
};
export default Landing;
