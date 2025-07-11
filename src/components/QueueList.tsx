import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Trans } from '@lingui/react/macro';
import { useCallback, useId, useState } from 'react';

import Button from '../elements/Button';
import type { Track } from '../generated/typings';
import useDndSensors from '../hooks/useDnDSensors';
import { useTrackListStatus } from '../hooks/useGlobalTrackListStatus';
import { usePlayerAPI } from '../stores/usePlayerStore';
import styles from './QueueList.module.css';
import QueueListItem from './QueueListItem';
import TrackListStatus from './TrackListStatus';

const INITIAL_QUEUE_SIZE = 20;
const DND_MODIFIERS = [restrictToVerticalAxis];

type Props = {
  queue: Track[];
  queueCursor: number;
};

export default function QueueList(props: Props) {
  const { queue, queueCursor } = props;
  const [queueSize, setQueueSize] = useState(INITIAL_QUEUE_SIZE);

  const playerAPI = usePlayerAPI();

  // Get the 20 next tracks displayed
  const shownQueue = queue.slice(queueCursor + 1, queueCursor + 1 + queueSize);
  const hiddenQueue = queue.slice(queueCursor + 1 + queueSize);
  const incomingQueue = queue.slice(queueCursor + 1);

  const status = useTrackListStatus(incomingQueue);

  // Drag-and-Drop support for reordering the queue
  const sensors = useDndSensors();
  const dndId = useId();

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const {
        active, // dragged item
        over, // on which item it was dropped
      } = event;

      // The item was dropped either nowhere, or on the same item
      if (over == null || active.id === over.id) {
        return;
      }

      const activeIndex = queue.findIndex((track) => track.id === active.id);
      const overIndex = queue.findIndex((track) => track.id === over.id);

      const newQueue = [...queue];

      const movedTrack = newQueue.splice(activeIndex, 1)[0]; // Remove active track
      newQueue.splice(overIndex, 0, movedTrack); // Move it to where the user dropped it

      playerAPI.setQueue(newQueue);
    },
    [queue, playerAPI],
  );

  return (
    <DndContext
      onDragEnd={onDragEnd}
      id={dndId}
      modifiers={DND_MODIFIERS}
      sensors={sensors}
    >
      <div className={styles.queueHeader}>
        <div className={styles.queueHeaderInfos}>
          <TrackListStatus {...status} />
        </div>
        <Button bSize="small" onClick={playerAPI.clearQueue}>
          <Trans>clear queue</Trans>
        </Button>
      </div>
      <div className={styles.queueContent}>
        <SortableContext
          items={shownQueue}
          strategy={verticalListSortingStrategy}
        >
          {shownQueue.map((track, index) => (
            <QueueListItem
              key={`track-${track.id}-${index}`}
              index={index}
              track={track}
              queueCursor={props.queueCursor}
            />
          ))}
        </SortableContext>
        {hiddenQueue.length > 0 && (
          <Button
            block
            onClick={() =>
              setQueueSize(
                Math.min(queueSize + INITIAL_QUEUE_SIZE, incomingQueue.length),
              )
            }
          >
            <Trans>see more</Trans>
          </Button>
        )}
      </div>
    </DndContext>
  );
}
