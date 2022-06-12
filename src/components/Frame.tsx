import alex from '../assets/alex.png';
import ardal from '../assets/Frame_ARDAL.png';
import bridget from '../assets/Frame_BRIDGET.png';
import chris from '../assets/Frame_CHRIS.png';
import judi from '../assets/Frame_JUDI.png';
import sophie from '../assets/Frame_SOPHIE.png';
import classes from "./ContestantGrid.module.css";
import Seal from './Seal';
import React from "react";

interface IProps {
    name: string,
    score: number
}

let contestants: any = {"ardal": ardal, "bridget": bridget, "chris": chris, "judi": judi, "sophie": sophie}

export default function Frame(props: IProps) {
    const name = props.name;
    return (
        <div className={classes.Frame} id={props.name}>
            <div>
                <h2>{props.name}</h2>
                <img src={contestants[props.name]} alt={props.name}/>
            </div>
            <Seal score={props.score}/>
        </div>
    )
}