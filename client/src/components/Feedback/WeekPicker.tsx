import React, { useState } from 'react';
import DatePicker from 'rsuite/DatePicker';
import moment from 'moment';
import 'rsuite/dist/rsuite.min.css';
import './WeekPicker.css';

interface WeekInfo {
  dateFrom: Date;
  dateTo: Date;
  weekNumber: number;
}

const WeekPicker: React.FC = () => {
  const [hoveredWeek, setHoveredWeek] = useState<Date | null>(null);
  const [selectedWeeks, setSelectedWeeks] = useState<WeekInfo[]>([]);

  const toggleWeekSelection = (weekInfo: WeekInfo) => {
    const exists = selectedWeeks.some(
      (week) => moment(week.dateFrom).isSame(weekInfo.dateFrom, 'day')
    );

    if (exists) {
      setSelectedWeeks((prev) =>
        prev.filter((week) => !moment(week.dateFrom).isSame(weekInfo.dateFrom, 'day'))
      );
    } else {
      setSelectedWeeks((prev) => [...prev, weekInfo]);
    }
  };

  const renderCell = (date: Date): JSX.Element => {
    const currentWeek = moment().isoWeek();
    const currentYear = moment().year();
    const weekNumber = moment(date).isoWeek();
    const year = moment(date).year();
  
    const startOfWeek = moment(date).startOf('isoWeek').toDate();
    const endOfWeek = moment(date).endOf('isoWeek').toDate();
    const isHoveredWeek =
      hoveredWeek &&
      moment(hoveredWeek).startOf('isoWeek').isSame(startOfWeek, 'day');
    const isSelectedWeek = selectedWeeks.some((week) =>
      moment(week.dateFrom).isSame(startOfWeek, 'day')
    );
  
    const isDisabled = year < currentYear || (year === currentYear && weekNumber < currentWeek);
  
    return (
      <div
        className={`week-cell ${isSelectedWeek ? 'selected' : ''} ${
          isHoveredWeek ? 'hovered' : ''
        } ${isDisabled ? 'disabled' : ''}`}
        onMouseEnter={() => !isDisabled && setHoveredWeek(startOfWeek)}
        onMouseLeave={() => !isDisabled && setHoveredWeek(null)}
        onClick={() =>
          !isDisabled &&
          toggleWeekSelection({
            dateFrom: startOfWeek,
            dateTo: endOfWeek,
            weekNumber,
          })
        }
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          pointerEvents: isDisabled ? 'none' : 'auto',
        }}
      >
        <small>{moment(date).format('D')}</small>
      </div>
    );
  };
  

  return (
    <div className="WeekPicker">
      <DatePicker
        placeholder="Vælg uger"
        isoWeek
        showWeekNumbers
        renderCell={renderCell}
      />
    </div>
  );
};

export default WeekPicker;
