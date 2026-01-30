import React, { useContext, useEffect, useState } from "react";
import { Button, Flex } from "antd";
import { getAge, isEventInPast, MONTH_NAMES, getEventTypeIcon } from "../utils/utils";
import { DeleteIcon, EditIcon } from "../utils/icons";
import { decorateEventsWithWeather } from "../hooks/useWeatherForEvents";
import WeatherIcon from "./WeatherIcons";
import { GlobalStateContext } from "../App";

export default function EventList({ events = [], onEdit, onDelete, hidePast, hideDate = false, userSettings, onEventHover }) {
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
                const dateDisplay = event.isMultiDay 
                  ? `${MONTH_NAMES[event.startDate?.month - 1]?.slice(0, 3)} ${event.startDate?.day} - ${MONTH_NAMES[event.endDate?.month - 1]?.slice(0, 3)} ${event.endDate?.day}`
                  : `${MONTH_NAMES[event.startDate?.month - 1]?.slice(0, 3)} ${event.startDate?.day}`;

                return (
                    <li
                        hidden={hidePast && isEventInPast(event, year)}
                        key={event.id || `${event.name}-${event.startDate?.month}-${event.startDate.day}`}
                        className={`event-list__item ${isEventInPast(event, year) ? "past-event" : ""}`}
                        onMouseEnter={() => onEventHover?.({ month: event.startDate?.month, day: event.startDate?.day, year: event.startDate?.year })}
                        onMouseLeave={() => onEventHover?.(null)}
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
                                {dateDisplay}
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

                                {event.weatherCode && (
                                    <span className="event-list__wheather-icon" title={event.weatherTitle} style={{ lineHeight: 0 }}>
                                        <WeatherIcon code={event.weatherCode} size="12"/>
                                    </span>
                                )}
                            </span>

                            <Button
                                className="edit-btn"
                                title="Edit Event"
                                icon={<EditIcon />}
                                size="small"
                                type="text"
                            />

                            {event.reminderTime ? (
                                <span className="event-list__recurring" title="Recurring Event">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"></path><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path></svg>
                                </span>
                            ) : ""}

                            {event.isRecurring ? (
                                <span className="event-list__recurring">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path><path d="m7 22-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path></svg>
                                </span>
                            ) : ""}
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