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
  projectId: string
}

export const ChatSection = ({ projectId }: ChatSectionProps) => {
  const { messages, loading, sendMessage, fetchMessages } = useMessageStore()
  const { users, fetchUsers } = useUserStore()
  const { user } = useAuthStore()
  const [newMessage, setNewMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch initial data
    fetchMessages(projectId)
    fetchUsers()
  }, [projectId, fetchMessages, fetchUsers])

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
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          // Refresh messages when new message is inserted
          fetchMessages(projectId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, fetchMessages])

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
        project_id: projectId,
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
    return user?.name || 'Unknown User'
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Project Chat</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Chat with your team members about this project.
        </p>
      </div>

      <Card className="h-96 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Team Discussion</CardTitle>
          <CardDescription>
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {messages.map((message) => {
                  const isCurrentUser = message.sender_id === user?.id
                  const senderName = getUserName(message.sender_id)
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(senderName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`flex-1 ${isCurrentUser ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {senderName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(message.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        
                        <div
                          className={`inline-block max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                            isCurrentUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.message}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
          
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                <PaperAirplaneIcon className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}