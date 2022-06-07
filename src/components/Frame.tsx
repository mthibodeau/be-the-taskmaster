import alex from '../assets/alex.png';
import frame from '../assets/frame.png';
import seal from '../assets/seal-tm.png';
import classes from "./ContestantGrid.module.css";
import Seal from './Seal';

interface IProps {
     name: string
}

export default function Frame(props: IProps) {
    return (
        <div className={classes.Frame}>
            <div>
                <img src={frame} alt="frame" width={200}/>
            </div>
            <Seal score={5} />
        </div>
    )
}