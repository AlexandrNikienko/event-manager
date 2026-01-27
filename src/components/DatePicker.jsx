import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTH_NAMES, WEEKDAYS } from '../utils/utils';

export default function DatePicker({ date, onChange, label }) {
    //console.log('DatePicker value:', date);
    const currentYear = new Date().getFullYear();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(date?.day);
    const [selectedMonth, setSelectedMonth] = useState(date?.month);
    const [selectedYear, setSelectedYear] = useState(date?.year);
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'month' | 'year'

    useEffect(() => {
        //console.log('DatePicker value changed:', date);
        setSelectedDay(date?.day);
        setSelectedMonth(date?.month);
        setSelectedYear(date?.year);
    }, [date]);

    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const getDaysInMonth = (month, year) => {
        if (year === 'unknown') {
            if (month === 1) return 29;
            const daysPerMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return daysPerMonth[month];
        }
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        if (year === 'unknown') return 0;
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const calendarDays = (() => {
        const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
        const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    })();

    const handleDayClick = (day) => {
        setSelectedDay(day);
        onChange?.({ day, month: selectedMonth, year: selectedYear });
        setIsOpen(false);
    };

    const displayValue = () => {
        if (!selectedDay || selectedMonth === undefined || !selectedYear) {
            return 'Select date';
        }
        const monthName = MONTH_NAMES[selectedMonth];
        const yearDisplay = selectedYear === 'unknown' ? 'Unknown' : selectedYear;
        return `${selectedDay} ${monthName} ${yearDisplay}`;
    };

    return (
        <div className="date-picker">
            {label && <label className="dp-label">{label}</label>}

            <div className="dp-input-wrapper">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="dp-input"
                >
                    <div className="dp-input-left">
                        <Calendar size={18} className="dp-icon" />
                        <span>{displayValue()}</span>
                    </div>
                    <svg className={`dp-chevron ${isOpen ? 'open' : ''}`} viewBox="64 64 896 896" focusable="false" width="12px" height="12px" fill="rgba(0, 0, 0, 0.25)" aria-hidden="true">
                        <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"></path>
                    </svg>
                </button>

                {isOpen && (
                    <>
                        <div className="dp-overlay" onClick={() => setIsOpen(false)} />
                        <div className="dp-popup">
                            {viewMode === 'calendar' && (
                                <div className="dp-calendar">
                                    <div className="dp-header">
                                        <button className="dp-nav" onClick={(e) => {
                                            e.preventDefault();
                                            let newMonth = selectedMonth;
                                            let newYear = selectedYear;

                                            if (selectedMonth === 0) {
                                                newMonth = 11;
                                                if (selectedYear !== 'unknown') newYear = selectedYear - 1;
                                            } else newMonth = selectedMonth - 1;

                                            setSelectedMonth(newMonth);
                                            setSelectedYear(newYear);
                                            onChange?.({ day: selectedDay, month: newMonth, year: newYear });
                                        }}>
                                            <ChevronLeft size={18} />
                                        </button>

                                        <div className="dp-header-center">
                                            <button onClick={() => setViewMode('month')} className="dp-month-btn">
                                                {MONTH_NAMES[selectedMonth]}
                                            </button>
                                            <button onClick={() => setViewMode('year')} className="dp-year-btn">
                                                {selectedYear === 'unknown' ? 'Unknown' : selectedYear}
                                            </button>
                                        </div>

                                        <button className="dp-nav" onClick={(e) => {
                                            e.preventDefault();
                                            let newMonth = selectedMonth;
                                            let newYear = selectedYear;

                                            if (selectedMonth === 11) {
                                                newMonth = 0;
                                                if (selectedYear !== 'unknown') newYear = selectedYear + 1;
                                            } else newMonth = selectedMonth + 1;

                                            setSelectedMonth(newMonth);
                                            setSelectedYear(newYear);
                                            onChange?.({ day: selectedDay, month: newMonth, year: newYear });
                                        }}>
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>

                                    <div className="dp-weekdays">
                                        {WEEKDAYS.map(day => (
                                            <div key={day} className="dp-weekday">{day}</div>
                                        ))}
                                    </div>

                                    <div className="dp-days">
                                        {calendarDays.map((day, i) => (
                                            <div key={i} className="dp-day-cell">
                                                {day && (
                                                    <button
                                                        onClick={() => handleDayClick(day)}
                                                        className={`dp-day-btn ${selectedDay === day ? 'selected' : ''}`}
                                                    >
                                                        {day}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {viewMode === 'month' && (
                                <div className="dp-months">
                                    <div className="dp-subheader">
                                        <h3>Select Month</h3>
                                        <button onClick={() => setViewMode('calendar')} className="dp-back">Back</button>
                                    </div>
                                    <div className="dp-grid">
                                        {MONTH_NAMES.map((m, i) => (
                                            <button
                                                key={m}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setSelectedMonth(i);
                                                    setViewMode('calendar');
                                                    onChange?.({ day: selectedDay, month: i, year: selectedYear });
                                                }}
                                                className={`dp-grid-btn ${selectedMonth === i ? 'selected' : ''}`}
                                            >
                                                {m.slice(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {viewMode === 'year' && (
                                <div className="dp-years">
                                    <div className="dp-subheader">
                                        <h3>Select Year</h3>
                                        <button onClick={() => setViewMode('calendar')} className="dp-back">Back</button>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedYear('unknown');
                                            setViewMode('calendar');
                                            onChange?.({ day: selectedDay, month: selectedMonth, year: 'unknown' });
                                        }}
                                        className={`dp-unknown ${selectedYear === 'unknown' ? 'selected' : ''}`}
                                    >
                                        Unknown
                                    </button>

                                    <div className="dp-grid scroll">
                                        {years.map(y => (
                                            <button
                                                key={y}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setSelectedYear(y);
                                                    setViewMode('calendar');
                                                    onChange?.({ day: selectedDay, month: selectedMonth, year: y });
                                                }}
                                                className={`dp-grid-btn ${selectedYear === y ? 'selected' : ''}`}
                                            >
                                                {y}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
