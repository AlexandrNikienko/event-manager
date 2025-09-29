import React from "react";
import { Button, Flex } from "antd";
import { getAge, isEventInPast, MONTH_NAMES, getEventTypeIcon } from "../utils/utils";
import { DeleteIcon, EditIcon } from "../utils/icons";

export default function EventList({ events = [], onEdit, onDelete, year, hidePast }) {
    return <ul className="sidebar-list">
        {events.length === 0 && <li key="no-events" className="muted">No events</li>}

        {events.map(event => {
            const age = getAge(event, year);

            return (
                <li
                    hidden={hidePast && isEventInPast(event, year)}
                    key={event.id || `${event.name}-${event.month}-${event.day}`}
                    className={`sidebar-event ${isEventInPast(event, year) ? "past-event" : ""}`}
                >
                    <Flex className="ellipsis pointer"
                        align="center" gap="small" justify="start" flex={1}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(event.id);
                        }}
                    >
                        <span className="sidebar-date">{MONTH_NAMES[event.month - 1].slice(0, 3)} {event.day}</span>

                        <span className="sidebar-icon">
                            {getEventTypeIcon(event.type)}

                            {age && (
                                <sup className="sidebar-age">{age}</sup>
                            )}
                        </span>

                        <span className="sidebar-name" title={event.name}>{event.name}</span>

                        <Button className="edit-btn" title="Edit Event" icon={<EditIcon />} size="small" type="text" />
                    </Flex>

                    <Button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(event.id) }} title="Delete Event" icon={<DeleteIcon />} size="small" type="text" />
                </li>
            );
        })}
    </ul>
}