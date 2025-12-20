import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import ErrorModal from "../../../../components/auth/errormodal";

const CodeEditorWindow = ({ onChange, language, code, theme, onRequireLanguage  }) => {
    const [value, setValue] = useState(code || "");
 const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleCloseError = () => {
    setShowError(false);
  };
    const handleEditorChange = (value) => {
       
        if (!language) {
             setErrorMessage(
        "Please select a language before writing code."
      );
      setShowError(true);
     console.log("❌ No language selected. Please select a language before writing code.");
 
      // 🚨 Call parent function to show popup
      if (onRequireLanguage) {
        onRequireLanguage();
      }
      return; // Do not update state/code
    }
    console.log(`✅ Language selected: ${language?.label || language?.value}`);

        setValue(value);
        onChange("code", value);
    };

    const preventCopyPaste = (editor) => {
        editor.onKeyDown((event) => {
            const { code } = event;
            if (code === "KeyC" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault(); // Prevent Ctrl+C (copy)
            }
            if (code === "KeyX" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault(); // Prevent Ctrl+X (cut)
            }
            if (code === "KeyA" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault(); // Prevent Ctrl+X (cut)
            }
           
            if (code === "KeyV" && (event.ctrlKey || event.metaKey)) {
               event.preventDefault(); // Prevent Ctrl+V (paste)
            }
                
        });

        editor.onDidPaste(() => {
            // Disable paste with the mouse right-click
            editor.trigger("keyboard", "undo", null);
        });
    };

    const handleEditorMount = (editor) => {
        preventCopyPaste(editor);

        // Disable right-click context menu
        editor.onContextMenu((e) => {
           e.event.preventDefault(); // Use the event object from Monaco's custom event
       });
    };

    return (
        <div >
            <Editor
                height="50vh"
                width={`100%`}
                language={language || "cpp"}
                value={value}
                theme={theme}
                defaultValue=""
                onChange={handleEditorChange}
               // onMount={handleEditorMount}
            />
            <div>
                 <ErrorModal
                        show={showError}
                        handleClose={handleCloseError}
                        errorMessage={errorMessage}
                      />
            </div>
        </div>
    );
};
export default CodeEditorWindow;