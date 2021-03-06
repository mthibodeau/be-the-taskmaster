import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities'
import Frame from "./Frame";

interface IProps {
    id: string,
    score?: number
}

export default function SortableItem(props: IProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: props.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {/* ... */}
             <Frame id={props.id} score={props.score ? props.score : 0} />
        </div>
    )
}