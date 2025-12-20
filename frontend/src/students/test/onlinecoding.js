import React from "react";
import Footer from "./onlinecodingcompiler/components/footer";
import Landing from "./onlinecodingcompiler/components/landingold";
import { useTestContext } from "./contextsub/context";
import Compile from "./onlinecodingcompiler/components/compile";

const OnlineCoding = () => {


    const {
        isTestCase
    } = useTestContext();



    return (
        <div>
            {isTestCase === true ? <Compile /> :
                <Landing />
            }


        </div>
    );
};


export default OnlineCoding;