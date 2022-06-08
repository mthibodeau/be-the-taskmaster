import alex from '../assets/alex.png';
import frame from '../assets/frame.png';
import seal from '../assets/seal-tm.png';
import classes from "./ContestantGrid.module.css";
import styles from './Frame.module.css';
import Seal from './Seal';
import React from "react";

interface IProps {
     name: string
}

export default function Frame(props: IProps) {
    return (
        <div className={classes.Frame}>
            <div>
                <h2>{props.name}</h2>
                <img className={styles.picture} src={alex} alt="contestant"/>
                <img className={styles.frame} src={frame} alt="frame" width={200}/>
            </div>
            <Seal score={5} />
        </div>
    )
}