import React, {useState} from 'react';
import {DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy, horizontalListSortingStrategy,
} from '@dnd-kit/sortable'

import {SortableItem} from './SortableItem';
import styles from './ContestantGrid.module.css';

interface IProps {
    series: string
}

function ContestantGrid(props: IProps) {

    const [contestants, setContestants] = useState(["chris", "judi", "sophie", "ardal", "bridget"]);
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

                    <div className={styles.flexContainer}>
                    {contestants.map(id => <SortableItem id={id}
                                                         key={id}
                                                         score={contestants.indexOf(id)+1}/>)}
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

