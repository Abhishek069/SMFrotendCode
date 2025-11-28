// src/components/MainBombay36Bazar.jsx
import React from 'react';
import SpinningWheelCanvas from './RotatingWheel';
import ResultTable from './ResultTable';

const MainBombay36Bazar = () => {
  const tableData = [
    { leftTime: "11:00 AM", leftResult: "137-1", rightTime: "11:15 AM", rightResult: "256-3" },
    { leftTime: "11:30 AM", leftResult: "116-8", rightTime: "11:45 AM", rightResult: "369-8" },
    { leftTime: "12:00 PM", leftResult: "556-6", rightTime: "12:15 PM", rightResult: "189-8" },
    { leftTime: "12:30 PM", leftResult: "780-5", rightTime: "12:45 PM", rightResult: "590-4" },
    { leftTime: "01:00 PM", leftResult: "234-9", rightTime: "01:15 PM", rightResult: "668-0" },
    { leftTime: "01:30 PM", leftResult: "489-1", rightTime: "01:45 PM", rightResult: "580-3" },
    { leftTime: "02:00 PM", leftResult: "139-4", rightTime: "02:15 PM", rightResult: "250-7" },
    { leftTime: "02:30 PM", leftResult: "449-1", rightTime: "02:45 PM", rightResult: "366-5" },
    { leftTime: "03:00 PM", leftResult: "348-5", rightTime: "03:15 PM", rightResult: "129-1" },
    { leftTime: "03:30 PM", leftResult: "669-1", rightTime: "03:45 PM", rightResult: "746-2" },
    { leftTime: "04:00 PM", leftResult: "267-5", rightTime: "04:15 PM", rightResult: "468-8" },
    { leftTime: "04:30 PM", leftResult: "346-3", rightTime: "04:45 PM", rightResult: "270-9" },
    { leftTime: "05:00 PM", leftResult: "244-0", rightTime: "05:15 PM", rightResult: "" },
    { leftTime: "05:30 PM", leftResult: "--", rightTime: "05:45 PM", rightResult: "--" },
    { leftTime: "06:00 PM", leftResult: "--", rightTime: "06:15 PM", rightResult: "--" },
    { leftTime: "06:30 PM", leftResult: "--", rightTime: "06:45 PM", rightResult: "--" },
    { leftTime: "07:00 PM", leftResult: "--", rightTime: "07:15 PM", rightResult: "--" },
    { leftTime: "07:30 PM", leftResult: "--", rightTime: "07:45 PM", rightResult: "--" },
  ];

  return (
    <div className="container text-center my-4">
      <div className="bg-warning  rounded-pill fw-bold d-flex justify-content-between align-items-center px-3">
        <span>MAIN BOMBAY 36 BAZAR</span>
        <button className="btn btn-dark btn-sm">Chart</button>
      </div>

      {/* <RotatingWheel centerText="270-9" /> */}
      <div className='d-flex justify-content-center align-items-center'>

      <SpinningWheelCanvas centerText="270-9"/>
      </div>

      <ResultTable rows={tableData} />
    </div>
  );
};

export default MainBombay36Bazar;
