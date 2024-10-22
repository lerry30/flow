export const currentTime = () => {
    const formatter = new Intl.DateTimeFormat('en-AU', {
        timeZone: process.env.TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const dateParts = formatter.formatToParts(new Date());
    const nDateParts = {};
    for(const part of dateParts)
        nDateParts[part.type] = part.value;
    const formattedDate = `${nDateParts.hour}:${nDateParts.minute}:${nDateParts.second}`;

    return formattedDate;
};

export const formattedDate = (date) => {
    const nDate = new Date(date).toLocaleString('en-US', {timeZone: process.env.TIMEZONE});
    const [month, day, year] = nDate.split(',')[0].split('/');
    return `${year}-${month}-${day}`;
};

export const isValidDate = (dateString) => {
    // Check if the date string matches the format YYYY-MM-DD
    const regex = /^\d{4}-\d{1,2}-\d{1,2}$/;
    if (!regex.test(dateString)) {
        return false;
    }

    // Parse the date string to a Date object
    const date = new Date(dateString);

    // Check if the Date object is valid
    if (isNaN(date.getTime())) {
        return false;
    }

    // Additional check: ensure the day, month, and year are correct
    const [year, month, day] = dateString.split('-').map(Number);
    if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
        return false;
    }

    return true;
};
