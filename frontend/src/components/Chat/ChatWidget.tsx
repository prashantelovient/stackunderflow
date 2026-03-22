import React, { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { MessageCircle, Send, X, User, Shield, GraduationCap, Laptop } from 'lucide-react'
import { useAuthStore } from '../../auth/store/authStore'
import { chatService, Message } from './chatService'
import './ChatWidget.css'

const SOCKET_URL = 'http://localhost:5000'

const ChatWidget: React.FC = () => {
    const { user, token, isAuthenticated } = useAuthStore()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isSocketConnected, setIsSocketConnected] = useState(false)
    const [typingUser, setTypingUser] = useState<{name: string, role: string} | null>(null)
    const socketRef = useRef<Socket | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (isOpen) {
            scrollToBottom()
        }
    }, [messages, isOpen])

    useEffect(() => {
        if (!isAuthenticated || !token || !user) return

        // Initialize Socket
        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket']
        })

        socketRef.current = socket

        socket.on('connect', () => {
            console.log('Socket connected')
            setIsSocketConnected(true)
            socket.emit('join-chat')
        })

        socket.on('disconnect', () => {
            console.log('Socket disconnected')
            setIsSocketConnected(false)
        })

        socket.on('new-message', (message: Message) => {
            setMessages(prev => [...prev, message])
        })

        socket.on('user-typing', (data: {userId: string, userName: string, role: string, isTyping: boolean}) => {
            if (data.userId !== user.id) {
                if (data.isTyping) {
                    setTypingUser({ name: data.userName, role: data.role })
                } else {
                    setTypingUser(null)
                }
            }
        })

        // Fetch initial messages
        const fetchHistory = async () => {
            try {
                const history = await chatService.getMessages(token)
                setMessages(history)
            } catch (err) {
                console.error('Failed to fetch chat history', err)
            }
        }

        fetchHistory()

        return () => {
            socket.disconnect()
        }
    }, [isAuthenticated, token, user])

    const handleSendMessage = () => {
        if (!inputValue.trim() || !socketRef.current || !user) return

        const messageData = {
            message: inputValue,
            senderName: user.name,
            senderRole: user.role,
            senderId: user.id,
            senderModel: user.role.charAt(0).toUpperCase() + user.role.slice(1)
        }

        socketRef.current.emit('send-message', messageData)
        setInputValue('')
        
        // Notify not typing anymore
        socketRef.current.emit('typing', { isTyping: false })
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)

        if (!socketRef.current) return

        // Handle typing indicator
        socketRef.current.emit('typing', { isTyping: true })

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit('typing', { isTyping: false })
        }, 3000)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSendMessage()
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield size={12} />
            case 'instructor': return <GraduationCap size={12} />
            case 'student': return <Laptop size={12} />
            default: return <User size={12} />
        }
    }

    if (!isAuthenticated) return null

    return (
        <div className="chat-widget-container">
            {isOpen ? (
                <div className="chat-window shadow-xl">
                    <div className="chat-header">
                        <div className="flex items-center gap-3">
                            <MessageCircle size={20} />
                            <div>
                                <h3>Global Team Chat</h3>
                                <div className="chat-status">
                                    <div className={`status-dot ${isSocketConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                                    <span>{isSocketConnected ? 'Connected' : 'Disconnected'}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                            <X size={20} strokeWidth={2.5} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full opacity-40 text-center px-6">
                                <MessageCircle size={48} className="mb-4" />
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={msg.id || idx} className={`message-item ${msg.senderId === user?.id ? 'own' : 'others'}`}>
                                <div className="message-header">
                                    <span className="sender-name">{msg.senderName}</span>
                                    <span className={`role-badge role-${msg.senderRole} flex items-center gap-1`}>
                                        {getRoleIcon(msg.senderRole)}
                                        {msg.senderRole}
                                    </span>
                                </div>
                                <div className="message-bubble shadow-sm">
                                    {msg.message}
                                </div>
                                <div className="message-time">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <div className="typing-indicator">
                            {typingUser && `${typingUser.name} is typing...`}
                        </div>
                        <div className="chat-input-wrapper">
                            <input
                                type="text"
                                className="chat-input"
                                placeholder="Write a message..."
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyPress}
                            />
                            <button 
                                className="send-button"
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button className="chat-button" onClick={() => setIsOpen(true)}>
                    <MessageCircle size={24} />
                    {/* Optional: Add badge for new messages here */}
                </button>
            )}
        </div>
    )
}

export default ChatWidget
