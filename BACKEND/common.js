// Helper function to calculate time ranges
const getTimeRange = (filterType, customStart, customEnd) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const oneDay = 24 * 60 * 60;
    const ranges = {
        'Yesterday': {
            time_from: currentTime - oneDay,
            time_till: currentTime,
            limit: 24
        },
        'Last 2 Days': {
            time_from: currentTime - (2 * oneDay),
            time_till: currentTime,
            limit: 24
        },
        'Last 7 Days': {
            time_from: currentTime - (7 * oneDay),
            time_till: currentTime,
            limit: 35
        },
        'This Month': {
            time_from: Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000),
            time_till: currentTime,
            limit: Math.min(30, Math.ceil((currentTime - Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000)) / (oneDay)) * 24)
        },
        'Last 3 Months': {
            time_from: Math.floor(new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1).getTime() / 1000),
            time_till: currentTime,
            limit: 30
        },
        'Last 6 Months': {
            time_from: Math.floor(new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1).getTime() / 1000),
            time_till: currentTime,
            limit: 30
        },
        'This Year': {
            time_from: Math.floor(new Date(new Date().getFullYear(), 0, 1).getTime() / 1000),
            time_till: currentTime,
            limit: 30
        },
        'Custom': {
            time_from: Math.floor(new Date(customStart).getTime() / 1000),
            time_till: Math.floor(new Date(customEnd).getTime() / 1000),
            limit: Math.min(30, Math.ceil((Math.floor(new Date(customEnd).getTime() / 1000) - Math.floor(new Date(customStart).getTime() / 1000)) / oneDay) * 24)
        }
    };
    return ranges[filterType] || { time_from: currentTime - 600, time_till: currentTime, limit: 10 };
};

module.exports = {
    getTimeRange,
};
