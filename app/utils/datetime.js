export const formattedDateAndTime = (date) => {
    const formattedDate = date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: '2-digit'});
    const formattedTime = date.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true});
    const formattedDateTime = `${formattedDate} ${formattedTime}`;
    return formattedDateTime;
}

export const areDatesEqual = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}
