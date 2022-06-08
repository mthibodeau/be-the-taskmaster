import React, {useState} from 'react';
import {Responsive, WidthProvider} from 'react-grid-layout';

import classes from './ContestantGrid.module.css';
import Frame from '../components/Frame'

import alex from '../assets/alex.png';
import frame from '../assets/frame.png';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface IProps {
    series: number
}

const contestants = [

    {
        name: "Alex1",
        image: alex
    },

    {
        name: "Alex2",
        image: alex
    },

    {
        name: "Alex3",
        image: alex
    },

    {
        name: "Alex4",
        image: alex
    },

    {
        name: "Alex5",
        image: alex
    },
]

const layout = [
    {i: contestants[0].name, x: 0, y: 0, w: 1, h: 1},
    {i: contestants[1].name, x: 1, y: 0, w: 1, h: 1},
    {i: contestants[2].name, x: 2, y: 0, w: 1, h: 1},
    {i: contestants[3].name, x: 3, y: 0, w: 1, h: 1},
    {i: contestants[4].name, x: 4, y: 0, w: 1, h: 1}
];

const getLayouts = () => {
    const savedLayouts = localStorage.getItem("grid-layout");
    return savedLayouts ? JSON.parse(savedLayouts) : { lg : layout};
};



function ContestantGrid(props: IProps) {
    const handleLayoutChange = (layout: any, layouts: any) => {
        localStorage.setItem("grid-layout", JSON.stringify(layouts))
        console.log("start of layout")
        console.log(JSON.stringify(layouts))
    };

    return (
        <div style={{marginTop: 20, marginBottom: 50}}>
            <ResponsiveGridLayout
                layouts={getLayouts()}
                breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
                cols={{lg: 5, md: 4, sm: 3, xs: 2, xxs: 1}}
                rowHeight={350}
                width={100}
                onLayoutChange={handleLayoutChange}
            >

                {contestants.map((contestant) => (
                    <div key={contestant.name}>
                        <Frame name={contestant.name} />
                    </div>
                ))}

            </ResponsiveGridLayout>
        </div>
    );
}

export default ContestantGrid;

