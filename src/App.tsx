import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import ContestantGrid from "./components/ContestantGrid";
import Frame from './components/Frame'

function App() {

  const [series, setSeries] = useState<string>("13")

  return (
    <div className="App">
      <ContestantGrid series={series} />
    </div>
  );
}

export default App;
