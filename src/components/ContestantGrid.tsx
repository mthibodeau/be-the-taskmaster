import React, {useEffect, useState} from 'react';
import {DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy, horizontalListSortingStrategy,
} from '@dnd-kit/sortable'

import SortableItem from './SortableItem';
import Frame from './Frame';
import styles from './ContestantGrid.module.css';

import ScoreContainer from './ScoreContainer';

interface IProps {
    series: string,
    episode: string,
    task: string
}

interface IScores {
    0: string[],
    1: string[],
    2: string[],
    3: string[],
    4: string[],
    5: string[]
}

function ContestantGrid(props: IProps) {

    const fetchScores= () => {
       // const fetchScores = async () => {
        // const res = await fetch(`http://localhost:3001/scores/${props.series}/${props.episode}/${props.task}`)
        // const data = await res.json();
        // console.log(data);
        let scores: IScores = {
            0: [],
            1: ["ardal"],
            2: ["judi"],
            3: [],
            4: ["bridget", "chris"],
            5: ["sophie"]
        }
        return scores;
    }

    // const [items, setItems] = useState(fetchScores());

    const [contestants, setContestants] = useState(["chris", "judi", "sophie", "ardal", "bridget"]);
    const [scores, setScores] = useState(fetchScores());
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    //useEffect(() => {


        //fetchScores();
    //});

    const [activeId, setActiveId] = useState();

    return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}>

                <div className={styles.flexContainer}>
                    <ScoreContainer id={"0"} contestants={scores["0"]}/>
                    <ScoreContainer id={"1"} contestants={scores["1"]}/>
                    <ScoreContainer id={"2"} contestants={scores["2"]}/>
                    <ScoreContainer id={"3"} contestants={scores["3"]}/>
                    <ScoreContainer id={"4"} contestants={scores["4"]}/>
                    <ScoreContainer id={"5"} contestants={scores["5"]}/>
                </div>
                <DragOverlay>{activeId ? <Frame id={activeId} score={parseInt(findContainer(activeId))}/> : null}</DragOverlay>
            </DndContext>
    );

    function findContainer(id: string): string {
        if (id in contestants) {
            console.log("id: ", id);
            return id;
        }
        //return "";
        const res = Object.keys(scores).find((key) => scores[key as unknown as keyof IScores].includes(id));

        if (typeof res === 'string' ) {
            console.log("res: ", res);
            return res;
        } else {
            // no idea why this fixed bug where you couldn't add frame to fifth point column
            return "5"
        }
    }

    function handleDragStart(event: { active: any; over: any; }) {
        const { active } = event;
        const { id } = active;

        setActiveId(id);
    }

    function handleDragOver(event: { active: any; over: any; draggingRect?: any}) {
        const { active, over, draggingRect } = event;
        const { id } = active;
        const { id: overId } = over;

        // Find the containers
        const activeContainer: string = findContainer(id);
        const overContainer: string = findContainer(overId);

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer === overContainer
        ) {
            return;
        }

        setScores((prev: IScores) => {
            const activeItems: string[] = prev[activeContainer as unknown as keyof IScores];
            const overItems: string[] = prev[overContainer as unknown as keyof IScores];

            // Find the indexes for the items
            const activeIndex: number = activeItems.indexOf(id);
            const overIndex: number = overItems.indexOf(overId);

            let newIndex: number;
            if (overId in prev) {
                // We're at the root droppable of a container
                newIndex = overItems.length + 1;
            } else if (over === null) {
                newIndex = -1;
            } else {
                const isBelowLastItem =
                    over &&
                    overIndex === overItems.length - 1; //
                // &&
                    //draggingRect.offsetTop > over.rect.offsetTop + over.rect.height;

                const modifier: number = isBelowLastItem ? 1 : 0;

                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer as unknown as keyof IScores].filter((item) => item !== active.id)
                ],
                [overContainer]: [
                    ...prev[overContainer as unknown as keyof IScores].slice(0, newIndex),
                    scores[activeContainer as unknown as keyof IScores][activeIndex],
                    ...prev[overContainer as unknown as keyof IScores].slice(newIndex, prev[overContainer as unknown as keyof IScores].length)
                ]
            };
        });
    }

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

