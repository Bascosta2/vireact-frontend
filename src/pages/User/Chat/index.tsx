import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserVideos, markAnalysisViewed, type Video } from '@/api/video';
import { getChatMessages, sendChatMessage, type Message } from '@/api/chat';
import { useUser } from '@/redux/hooks/use-user';
import { CHAT_WELCOME_MESSAGES, ANALYSIS_STATUS } from '@/constants';
import { ErrorNotification } from '@/utils/toast';
import { FaChevronLeft, FaVideo, FaPaperPlane, FaSpinner } from 'react-icons/fa';

function Chat() {
    const { videoId } = useParams<{ videoId: string }>();
    const navigate = useNavigate();
    const { name } = useUser();
    const [video, setVideo] = useState<Video | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Reset state when videoId changes
    useEffect(() => {
        setMessages([]);
        setInputText('');
    }, [videoId]);

    // Fetch video data
    useEffect(() => {
        const fetchVideo = async () => {
            if (!videoId) {
                navigate('/videos');
                return;
            }

            setIsLoading(true);
            try {
                const videos = await getUserVideos();
                const foundVideo = videos.find((v) => v._id === videoId);
                
                if (!foundVideo) {
                    navigate('/videos');
                    return;
                }

                // Check if analysis is pending
                if (foundVideo.analysisStatus === ANALYSIS_STATUS.PENDING) {
                    ErrorNotification('Video analysis is still pending. Please wait for analysis to complete.');
                    navigate('/videos');
                    return;
                }

                setVideo(foundVideo);

                // Mark analysis as viewed if it's completed and not yet marked
                if (foundVideo.analysisStatus === ANALYSIS_STATUS.COMPLETED && !foundVideo.isAnalysisReady) {
                    try {
                        await markAnalysisViewed(videoId);
                    } catch (error) {
                        // Log error but don't prevent chat from opening
                        console.error('Failed to mark analysis as viewed:', error);
                    }
                }

                // Fetch existing chat messages
                setIsLoadingMessages(true);
                try {
                    const existingMessages = await getChatMessages(videoId);
                    if (existingMessages && existingMessages.length > 0) {
                        // Convert backend messages to frontend format
                        const formattedMessages: Message[] = existingMessages.map((msg, idx) => ({
                            id: msg._id || `msg-${idx}`,
                            text: msg.text,
                            isUser: msg.isUser
                        }));
                        setMessages(formattedMessages);
                    } else {
                        // Set welcome message if no existing messages
                        const randomWelcome = CHAT_WELCOME_MESSAGES[
                            Math.floor(Math.random() * CHAT_WELCOME_MESSAGES.length)
                        ](name || 'there');
                        setMessages([{
                            id: 'welcome',
                            text: randomWelcome,
                            isUser: false
                        }]);
                    }
                } catch (error) {
                    console.error('Failed to fetch chat messages:', error);
                    // Set welcome message on error
                    const randomWelcome = CHAT_WELCOME_MESSAGES[
                        Math.floor(Math.random() * CHAT_WELCOME_MESSAGES.length)
                    ](name || 'there');
                    setMessages([{
                        id: 'welcome',
                        text: randomWelcome,
                        isUser: false
                    }]);
                } finally {
                    setIsLoadingMessages(false);
                }
            } catch (error) {
                console.error('Failed to fetch video:', error);
                navigate('/videos');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideo();
    }, [videoId, navigate, name]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputText]);

    const handleSendMessage = useCallback(async () => {
        if (!inputText.trim() || isSending || !videoId) return;

        const messageText = inputText.trim();
        setInputText('');
        setIsSending(true);

        // Optimistically add user message
        const tempUserMessage: Message = {
            id: `temp-${Date.now()}`,
            text: messageText,
            isUser: true
        };

        setMessages((prev) => [...prev, tempUserMessage]);

        try {
            // Send message to backend
            const response = await sendChatMessage(videoId, messageText);

            // Replace temp message with actual user message and add AI response
            setMessages((prev) => {
                const updated = prev.filter(msg => msg.id !== tempUserMessage.id);
                updated.push({
                    id: response.userMessage._id || `user-${Date.now()}`,
                    text: response.userMessage.text,
                    isUser: response.userMessage.isUser
                });
                updated.push({
                    id: response.aiMessage._id || `ai-${Date.now()}`,
                    text: response.aiMessage.text,
                    isUser: response.aiMessage.isUser
                });
                return updated;
            });
        } catch (error: any) {
            console.error('Failed to send message:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to send message. Please try again.';
            
            // Check if it's a subscription limit error
            if (error?.response?.status === 403 && errorMessage.includes('limit')) {
                ErrorNotification(errorMessage + ' Visit Settings > Subscription to upgrade.');
            } else {
                ErrorNotification(errorMessage);
            }
            
            // Remove temp message on error
            setMessages((prev) => prev.filter(msg => msg.id !== tempUserMessage.id));
        } finally {
            setIsSending(false);
        }
    }, [inputText, isSending, videoId]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    // Control AI avatar appearance
    const getAIAvatar = useCallback(() => {
        return {
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            size: 'w-8 h-8 sm:w-10 sm:h-10'
        };
    }, []);

    // Format chatbot messages: remove double asterisks and replace em dashes
    const formatChatbotMessage = useCallback((text: string): string => {
        return text
            .replace(/\*\*/g, '')
            .replace(/—/g, ', ');
    }, []);

    if (isLoading || !video || isLoadingMessages) {
        return (
                <div className="flex items-center justify-center min-h-screen">
                    <FaSpinner className="w-8 h-8 text-white animate-spin" />
                </div>
        );
    }

    return (
            <div className="flex flex-col h-screen">
                {/* Video Thumbnail Section - Sticky at Top */}
                <div className="sticky top-0 z-10 bg-black border-b border-gray-800 flex-shrink-0">
                    <div className="px-4 py-3 sm:px-6 sm:py-4">
                        <div className="flex items-center gap-4">
                            {/* Back Button */}
                            <button
                                onClick={() => navigate('/videos')}
                                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-800 transition-colors"
                                aria-label="Back to videos"
                            >
                                <FaChevronLeft className="w-5 h-5 text-white" />
                            </button>

                            {/* Video Thumbnail */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FaVideo className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-white font-semibold text-sm sm:text-base truncate" title={video.filename}>
                                        {video.filename}
                                    </h2>
                                    <p className="text-gray-400 text-xs truncate">
                                        {video.duration ? `${Math.round(video.duration)}s` : 'Video'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-6 sm:pb-28 min-h-0">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {messages.map((message) => {
                            const avatarConfig = getAIAvatar();
                            const messageId = message.id || (message as any)._id || `msg-${Date.now()}`;
                            return (
                                <div
                                    key={messageId}
                                    className={`flex items-start gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!message.isUser && (
                                        <div
                                            className={`${avatarConfig.size} rounded-full flex-shrink-0`}
                                            style={{ background: avatarConfig.gradient }}
                                            aria-label="AI Assistant"
                                        />
                                    )}
                                    <div
                                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                                            message.isUser
                                                ? 'bg-gradient-primary text-white'
                                                : 'bg-gray-800 text-white'
                                        }`}
                                    >
                                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">

                                            {/* {message?.text} */}
                                            {message.isUser ? message.text : formatChatbotMessage(message.text)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Loading indicator when AI is responding */}
                        {isSending && (() => {
                            const avatarConfig = getAIAvatar();
                            return (
                                <div className="flex items-start gap-3 justify-start">
                                    <div
                                        className={`${avatarConfig.size} rounded-full flex-shrink-0`}
                                        style={{ background: avatarConfig.gradient }}
                                        aria-label="AI Assistant"
                                    />
                                    <div className="bg-gray-800 rounded-2xl px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area - Fixed at Bottom */}
                <div className="w-full sm:fixed sm:bottom-0 sm:z-10 flex-shrink-0 px-4 py-4 sm:px-[20vw] sm:py-4">
                    <div className="w-full sm:w-auto sm:mx-auto bg-black sm:bg-gray-900 sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 sm:shadow-lg">
                        <div className="flex gap-3 items-center">

                            <div className="flex-1 relative">
                                <textarea
                                    ref={textareaRef}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask anything to improve your video"
                                    rows={1}
                                    className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 resize-none focus:outline-none focus:border-primary transition-colors text-sm sm:text-base"
                                    style={{ maxHeight: '200px', minHeight: '48px' }}
                                />
                            </div>

                            <button
                                onClick={handleSendMessage}
                                disabled={!inputText.trim() || isSending}
                                className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex-shrink-0"
                                aria-label="Send message"
                            >
                                {isSending ? (
                                    <FaSpinner className="w-5 h-5 animate-spin" />
                                ) : (
                                    <FaPaperPlane className="w-5 h-5" />
                                )}
                            </button>

                        </div>
                    </div>
                </div>
            </div>
    );
}

export default Chat;

