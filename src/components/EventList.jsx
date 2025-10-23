import React, { useContext, useEffect, useState } from "react";
import { Button, Flex } from "antd";
import { getAge, isEventInPast, MONTH_NAMES, getEventTypeIcon } from "../utils/utils";
import { DeleteIcon, EditIcon } from "../utils/icons";
import { decorateEventsWithWeather } from "../hooks/useWeatherForEvents";
import WeatherIcon from "./WeatherIcons";
import { GlobalStateContext } from "../App";

export default function EventList({ events = [], onEdit, onDelete, hidePast, hideDate = false, userSettings }) {
    const { year } = useContext(GlobalStateContext);
    const [decorated, setDecorated] = useState(events);

    useEffect(() => {
        //console.log("EventList", userSettings)
        const t = setTimeout(() => {
            decorateEventsWithWeather(events, year, 7, userSettings).then(setDecorated);
        }, 300);
        return () => clearTimeout(t);
    }, [events, year, userSettings]);

    return (
        <ul className="event-list">
            {decorated.length === 0 && (
                <li key="no-events" className="muted">
                    No events
                </li>
            )}

            {decorated.map((event) => {
                const age = getAge(event, year);

                return (
                    <li
                        hidden={hidePast && isEventInPast(event, year)}
                        key={event.id || `${event.name}-${event.month}-${event.day}`}
                        className={`event-list__item ${isEventInPast(event, year) ? "past-event" : ""
                            }`}
                    >
                        <Flex
                            className="ellipsis pointer p4"
                            align="center"
                            gap="small"
                            justify="start"
                            flex={1}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(event.id);
                            }}
                        >
                            <span className="event-list__date" hidden={hideDate}>
                                {MONTH_NAMES[event.month - 1]?.slice(0, 3)} {event.day}
                            </span>

                            <span className="event-list__icon">
                                {getEventTypeIcon(event.type)}
                                {age > 0 && (
                                    <sup className="event-list__age">{age}</sup>
                                )}
                            </span>

                            <span
                                className="event-list__name"
                                title={event.name}
                            >
                                {event.name}
                            </span>

                            {event.weatherCode && (
                                <span title={event.weatherTitle} style={{ lineHeight: 0 }}>
                                    <WeatherIcon code={event.weatherCode} size="16"/>
                                </span>
                            )}

                            <Button
                                className="edit-btn"
                                title="Edit Event"
                                icon={<EditIcon />}
                                size="small"
                                type="text"
                            />
                        </Flex>

                        <Button
                            className="delete-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(event.id);
                            }}
                            title="Delete Event"
                            icon={<DeleteIcon />}
                            size="small"
                            type="text"
                        />
                    </li>
                );
            })}
        </ul>
    );
}