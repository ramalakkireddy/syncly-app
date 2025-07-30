import { useEffect, useState, useRef } from 'react'
import { useMessageStore } from '../stores/messageStore'
import { useUserStore } from '../stores/userStore'
import { useAuthStore } from '../stores/authStore'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Avatar, AvatarFallback } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { supabase } from '../integrations/supabase/client'

interface ChatSectionProps {
  projectId?: string
  isGlobal?: boolean
}

export const ChatSection = ({ projectId, isGlobal = false }: ChatSectionProps) => {
  const { messages, loading, sendMessage, fetchMessages } = useMessageStore()
  const { users, fetchUsers } = useUserStore()
  const { user } = useAuthStore()
  const [newMessage, setNewMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch initial data
    if (isGlobal) {
      fetchMessages() // Fetch all messages for global chat
    } else {
      fetchMessages(projectId)
    }
    fetchUsers()
  }, [projectId, isGlobal, fetchMessages, fetchUsers])

  useEffect(() => {
    // Set up real-time subscription for messages
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          ...(isGlobal ? {} : { filter: `project_id=eq.${projectId}` })
        },
        (payload) => {
          // Refresh messages when new message is inserted
          if (isGlobal) {
            fetchMessages() // Refresh all messages for global chat
          } else {
            fetchMessages(projectId)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, isGlobal, fetchMessages])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    try {
      await sendMessage({
        sender_id: user.id,
        receiver_id: null, // null for project-wide messages
        project_id: isGlobal ? null : projectId, // null for global chat
        message: newMessage.trim()
      })
      
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.full_name || user?.name || 'Unknown User'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isGlobal ? 'Global Chat' : 'Project Chat'}
            </h2>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <ScrollArea className="h-full px-4 py-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No messages yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Start the conversation!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.sender_id === user?.id
                const senderName = getUserName(message.sender_id)
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className={`text-xs ${isCurrentUser ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                        {getInitials(senderName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Message Content */}
                    <div className={`flex-1 max-w-[70%] ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                      {/* Sender Name */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {senderName}
                      </div>
                      
                      {/* Message Bubble */}
                      <div
                        className={`inline-block px-4 py-2 rounded-2xl text-sm ${
                          isCurrentUser
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-md'
                        }`}
                      >
                        {message.message}
                      </div>
                      
                      {/* Timestamp */}
                      <div className="text-xs text-gray-400 mt-1">
                        {format(new Date(message.created_at), 'h:mm a')}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="pr-12 rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button 
            type="submit" 
            size="sm" 
            disabled={!newMessage.trim()}
            className="rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}