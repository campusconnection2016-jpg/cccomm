// settings.js
import React from 'react';
import Buttons from './button';
import Footer from '../../footer/footer';
const Settings = ({collegeName}) => {
  return(
    <>
    <Buttons collegeName={collegeName}/>
    <div>
    <p style={{height:"50px"}}></p>
       {/*  <Footer></Footer>*/}
        </div>
    </>
  )

  
};



export default Settings;
