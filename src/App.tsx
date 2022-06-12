import React, {useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import ContestantGrid from "./components/ContestantGrid";
import Frame from './components/Frame'
import {contestants} from "./constants";

function App() {

    const [series, setSeries] = useState<string>("5");
    const [episode, setEpisode] = useState<string>("5");
    const [task, setTask] = useState<string>("5");

    useEffect(() => {
        const fetchScores = async () => {
            const res = await fetch(`http://localhost:3001/${series}/${episode}/${task}`)
            const data = await res.json();
            console.log('fetch scores: ', data);
        }

        fetchScores();
    });
    //     fetch("/abc")
    //         .then((res) => res.json())
    //         .then((data) => setSeries(data.message));
    // }, []);

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
