export const socketSendEvent = (type: any, data: any) => {
    return JSON.stringify({
        type,
        data
    });
};

export const socketParseEvent = (data: any) => {
    if (!data?.data) return {};
    return JSON.parse(data?.data);
};
