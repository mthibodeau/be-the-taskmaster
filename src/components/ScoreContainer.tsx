import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    horizontalListSortingStrategy
} from "@dnd-kit/sortable";

import SortableItem from "./SortableItem";
import styles from "./ContestantGrid.module.css";

const containerStyle = {
    padding: 2,
    margin: 2,
};

interface IProps {
    id: string
    contestants: string[]
}

export default function Container(props: IProps) {
    const { id, contestants } = props;

    const { setNodeRef } = useDroppable({
        id
    });

    return (

        <SortableContext
            id={id}
            items={contestants}
            strategy={horizontalListSortingStrategy}
        >
            <div ref={setNodeRef} style={containerStyle} className={styles.flexContainer}>
                {(contestants.length === 0) ?
                    <div /> :
                    contestants.map((name) => (
                    <SortableItem key={name} id={name} score={parseInt(id)}/>
                ))}
            </div>
        </SortableContext>

    );
}