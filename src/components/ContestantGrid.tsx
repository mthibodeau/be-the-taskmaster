import React, {useState} from 'react';
import {DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable'

import styles from './ContestantGrid.module.css';
import {SortableItem} from "./SortableItem";

interface IProps {
    series: string
}

function ContestantGrid(props: IProps) {

    const [contestants, setContestants] = useState(["ardal", "bridget", "chris", "judi", "sophie"]);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}>

                <SortableContext items={contestants}
                                 strategy={horizontalListSortingStrategy}>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${5}, 1fr)`,
                            gridGap: 10,
                            padding: 10,
                        }}
                    >
                    {contestants.map(id => <SortableItem id={id} key={id} score={contestants.indexOf(id)+1}/>)}
                    </div>
                    </SortableContext>
            </DndContext>
    );


    function handleDragEnd(event: { active: any; over: any; }) {
        const {active, over} = event;

        if (active.id !== over.id) {
            setContestants((contestants) => {
                const oldIndex = contestants.indexOf(active.id);
                const newIndex = contestants.indexOf(over.id);

                return arrayMove(contestants, oldIndex, newIndex);
            });
        }
    }
}

export default ContestantGrid;

