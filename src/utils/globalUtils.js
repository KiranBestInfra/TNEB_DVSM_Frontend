export function formatDateDayMonthYear(date) {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date provided formatDateDayMonthYear');
    }

    return `${dateObj.getDate()} ${dateObj.toLocaleDateString('en-US', {
        month: 'short',
    })}, ${dateObj.getFullYear()}`;
}

export function formatDateMonth(date) {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date provided formatDateMonth');
    }

    return `${dateObj.getDate()} ${dateObj.toLocaleDateString('en-US', {
        month: 'short',
    })}`;
}

export function formatMonthYear(date) {
    let dateObj;

    if (date instanceof Date) {
        dateObj = date;
    } else if (typeof date === 'string') {
        const monthYearRegex =
            /^(\d{4})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i;
        const match = date.match(monthYearRegex);

        if (match) {
            const [_, year, month] = match;
            return `${month} ${year}`;
        }

        dateObj = new Date(date);

        if (isNaN(dateObj.getTime())) {
            const parts = date.split('-');
            if (parts.length === 3) {
                dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
            }
        }
    } else {
        throw new Error('Invalid date format provided to formatMonthYear');
    }

    if (isNaN(dateObj.getTime())) {
        console.error('Invalid date:', date);
        return date;
    }

    return `${dateObj.toLocaleDateString('en-US', {
        month: 'short',
    })} ${dateObj.getFullYear()}`;
}

export function formatDateSlash(date) {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date provided formatDateSlash');
    }

    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1; // Adding 1 since months are 0-based
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
}

export const parseNumber = (value, defaultValue = 0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
};

export const parseInteger = (value, defaultValue = 0) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
};

export const parseFloatFixed = (value, decimals = 2, defaultValue = '0.00') => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed.toFixed(decimals);
};

export function convertToIST(dateString) {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}
export const Name = (user, plural = false) => {
    return user?.locationHierarchy === 8
        ? `DTR${plural ? 's' : ''}`
        : `Consumer${plural ? 's' : ''}`;
};
