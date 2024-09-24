export const formattedDateAndTime = (date) => {
    const formattedDate = date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: '2-digit'});
    const formattedTime = date.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true});
    const formattedDateTime = `${formattedDate} ${formattedTime}`;
    return formattedDateTime;
}

export const formattedDate = (date) => {
    const offset = date.getTimezoneOffset();
    const nDate = new Date(date.getTime() - (offset * 60 * 1000));
    return nDate.toISOString().split('T')[0];
};

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
