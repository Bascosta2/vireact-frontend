import Axios from './index';

interface Message {
    id?: string;
    _id?: string;
    text: string;
    isUser: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface GetChatMessagesResponse {
    messages: Message[];
}

interface SendChatMessageResponse {
    userMessage: Message;
    aiMessage: Message;
}

export const getChatMessages = async (videoId: string): Promise<Message[]> => {
    const response = await Axios.get<{ data: GetChatMessagesResponse }>(`/chat/${videoId}`);
    return response.data.data.messages;
};

export const sendChatMessage = async (videoId: string, text: string): Promise<SendChatMessageResponse> => {
    const response = await Axios.post<{ data: SendChatMessageResponse }>(
        `/chat/${videoId}`,
        { text }
    );
    return response.data.data;
};

export type { Message };

