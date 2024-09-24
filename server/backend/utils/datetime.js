export const currentTime = () => {
    const date = new Date(Date.now());
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

export const formattedDate = (date) => {
    const offset = date.getTimezoneOffset();
    const nDate = new Date(date.getTime() - (offset * 60 * 1000));
    return nDate.toISOString().split('T')[0];
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
