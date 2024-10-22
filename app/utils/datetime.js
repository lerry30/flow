export const formattedDateAndTime = (date) => {
    const formattedDate = date.toLocaleDateString('en-AU', {year: 'numeric', month: 'short', day: '2-digit'});
    const formattedTime = date.toLocaleTimeString('en-AU', {hour: 'numeric', minute: '2-digit', hour12: true});
    const formattedDateTime = `${formattedDate} ${formattedTime}`;
    return formattedDateTime;
}

export const formattedDate = (date) => {
    const dateParts = new Intl.DateTimeFormat('en-AU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);

    return `${dateParts.find(part => part.type === 'year').value}-${
        dateParts.find(part => part.type === 'month').value}-${
        dateParts.find(part => part.type === 'day').value}`;
}

export const formattedDateAus = (date) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-GB', options).replace(',', '.');
}

export const areDatesEqual = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

export const formatTimeFromString = (timeString) => {
    const [hoursStr, minutes] = timeString.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // Convert to 12-hour format

    return `${hours}:${minutes} ${ampm}`;
}

export const toTimeZoneDate = (date) => {
    const formatter = new Intl.DateTimeFormat('en-AU', {
        timeZone: 'Australia/Brisbane',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // Use 24-hour format
    });

    const dateParts = formatter.formatToParts(date);
    const nDateParts = {};
    for (const part of dateParts) {
        nDateParts[part.type] = part.value;
    }

    // Manually construct the date in ISO format with timezone information
    //const formattedDate = `${nDateParts.year}-${nDateParts.month}-${nDateParts.day}T${nDateParts.hour}:${nDateParts.minute}:${nDateParts.second}+10:00`;

    const unixEpochYear = 1970;
    const daysInLeafYear = 366;
    const daysInRegYear = 365;
    const currentYear = Number(nDateParts?.year);
    const aDay = 1000*60*60*24;
    const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // number of days on every month
    const lfy = (currentYear%4===0&&currentYear%100!==0||currentYear%400===0) ? 1 : 0;

    const noOfYears = currentYear-unixEpochYear;
    const noOfLeafYears = Math.floor(noOfYears/4);
    const noOfRegYears = noOfYears-noOfLeafYears;

    const noOfDaysInLeafYears = noOfLeafYears*daysInLeafYear;
    const noOfDaysInRegYears = noOfRegYears*daysInRegYear;

    const totalDays = noOfDaysInLeafYears+noOfDaysInRegYears;
    // -----------------------------------------------
    const overallYearsInMilli = aDay*totalDays;

    let thisMonthInMilli = 0;
    for(let i = 0; i < Number(nDateParts?.month)-1; i++)
        thisMonthInMilli = thisMonthInMilli + daysInMonths[i];
    
    thisMonthInMilli = thisMonthInMilli*aDay;
    const thisDayInMilli = Number(nDateParts?.day)*aDay;
    const thisHourInMilli = Number(nDateParts?.hour)*(1000*60*60);
    const thisMinuteInMilli = Number(nDateParts?.minute)*(1000*60);
    const thisSecondInMilli = Number(nDateParts?.second)*1000;
    
    const overall = overallYearsInMilli+thisMonthInMilli+thisDayInMilli+thisHourInMilli+thisMinuteInMilli+thisSecondInMilli;

    return new Date(overall);
}
