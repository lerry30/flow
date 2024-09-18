export const toNumber = (value) => {
    try {
        const cNumber = Number(value);
        return isNaN(cNumber) ? Number(value.replace(/[^0-9.]/g, '')) : cNumber;
    } catch(error) {
        return 0;
    }
}

export const formattedNumber = (number) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0, // No decimal places
        maximumFractionDigits: 0,
    }).format(number);
}

export const shrinkLargeNumber = (number) => {
    const num = toNumber(number);
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    return formattedNumber(num);
}
