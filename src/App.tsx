import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import ContestantGrid from "./components/ContestantGrid";
import Frame from './components/Frame'
import {contestants} from "./constants";

function App() {

    const [series, setSeries] = useState<string>("13");

    React.useEffect(() => {
        fetch("/abc")
            .then((res) => res.json())
            .then((data) => setSeries(data.message));
    }, []);

    return (
        <div className="App">
            <ContestantGrid series={series}/>
            <button className='btn' onClick={scoreTaskHandler}>
                My Judgement is Final
            </button>
        </div>
    );

    function scoreTaskHandler() {
        console.log({series})
    }
}

export default App;
