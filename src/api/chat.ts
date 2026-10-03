import Axios from './index';
import type { FrameFeedback, ScriptRewrite } from '@/types/video-feedback';

interface Message {
    id?: string;
    _id?: string;
    text: string;
    isUser: boolean;
    createdAt?: string;
    updatedAt?: string;
    /**
     * Ids of stored feedback / rewrites this reply cites, for deep-linking to the
     * referenced moment in the report.
     */
    feedbackRefs?: string[];
    /** Fixes authored inside this reply, rendered as structured cards. */
    fixes?: FrameFeedback[];
    /** Line rewrites authored inside this reply. */
    scriptRewrites?: ScriptRewrite[];
    /** Whether the reply was answerable from this video's analysis. */
    coverage?: 'grounded' | 'partially_grounded' | 'not_covered' | null;
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

