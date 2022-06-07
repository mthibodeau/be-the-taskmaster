import seal from '../assets/seal-tm.png';
import styles from './Seal.module.css';

interface IProps {
    score: number
}

export default function Seal(props: IProps) {
    return (
        <div>
            <img className={styles.picture} src={seal} alt="taskmaster seal showing task score" width={75}/>
            <h2 className={styles.text}>{props.score}</h2>
        </div>
    )
}