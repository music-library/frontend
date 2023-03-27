import store from "store";

/*
 * Sends an event message to the server
 */
export const socketSend = (type: string, data: any = null) => {
    const state = store.getState();
    const socket = state.socket.connection;
    socket?.send(socketEventStringify(type, data));
};

export const socketEventStringify = (type: string, data: any) => {
    return JSON.stringify({
        type,
        data
    });
};

export const socketEventParse = (data: any) => {
    if (!data?.data) return {};
    return JSON.parse(data?.data);
};
