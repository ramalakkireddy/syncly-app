import { useEffect, useState } from 'react'
import { UsersIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { useUserStore } from '../stores/userStore'
import { useProjectStore } from '../stores/projectStore'
import { useTaskStore } from '../stores/taskStore'
import { useAuthStore } from '../stores/authStore'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { supabase } from '../integrations/supabase/client'

export const TeamPage = () => {
  const { users, loading: usersLoading, fetchUsers } = useUserStore()
  const { projects, loading: projectsLoading, fetchProjects } = useProjectStore()
  const { tasks, fetchAllTasks } = useTaskStore()
  const { user: currentUser } = useAuthStore()
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<{ [key: string]: { username: string; phone: string } }>({})

  useEffect(() => {
    fetchUsers()
    fetchProjects('c5fac37b-1e77-47b3-afee-32e78c9b9b2d') // Demo team ID
    fetchAllTasks()
  }, [fetchUsers, fetchProjects, fetchAllTasks])

  const getUserTaskStats = (userId: string) => {
    const userTasks = tasks.filter(task => task.assigned_to === userId)
    const activeTasks = userTasks.filter(task => !['Completed'].includes(task.status))
    const completedTasks = userTasks.filter(task => task.status === 'Completed')
    return { activeTasks: activeTasks.length, completedTasks: completedTasks.length }
  }

  const getUserProjectStats = (userId: string) => {
    // Count projects where user has tasks assigned
    const userProjectIds = [...new Set(tasks.filter(task => task.assigned_to === userId).map(task => task.project_id))]
    const activeProjects = userProjectIds.filter(projectId => 
      projects.find(p => p.id === projectId)?.status === 'Active'
    ).length
    const completedProjects = userProjectIds.filter(projectId => 
      projects.find(p => p.id === projectId)?.status === 'Completed'
    ).length
    return { activeProjects, completedProjects }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleEditProfile = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setProfileData({
        ...profileData,
        [userId]: {
          username: user.username || user.name,
          phone: user.phone || ''
        }
      })
      setEditingUser(userId)
    }
  }

  const handleSaveProfile = async (userId: string) => {
    try {
      const data = profileData[userId]
      if (!data) return

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username: data.username,
          phone: data.phone || null,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Profile updated successfully!')
      setEditingUser(null)
      fetchUsers() // Refresh user data
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  if (usersLoading || projectsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Team Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View all team members, their profiles, and task assignments.
        </p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'Active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'Completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Authenticated users and their profiles with assigned tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {users.map((user) => {
              const projectStats = getUserProjectStats(user.id)
              const taskStats = getUserTaskStats(user.id)
              const userTasks = tasks.filter(task => task.assigned_to === user.id)
              const isEditing = editingUser === user.id
              
              return (
                <div key={user.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="space-y-2">
                            <div>
                              <Label htmlFor={`username-${user.id}`}>Username</Label>
                              <Input
                                id={`username-${user.id}`}
                                value={profileData[user.id]?.username || ''}
                                onChange={(e) => setProfileData({
                                  ...profileData,
                                  [user.id]: {
                                    ...profileData[user.id],
                                    username: e.target.value
                                  }
                                })}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`phone-${user.id}`}>Phone (Optional)</Label>
                              <Input
                                id={`phone-${user.id}`}
                                value={profileData[user.id]?.phone || ''}
                                onChange={(e) => setProfileData({
                                  ...profileData,
                                  [user.id]: {
                                    ...profileData[user.id],
                                    phone: e.target.value
                                  }
                                })}
                                placeholder="Enter phone number"
                                className="w-full"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {user.username || user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Phone: {user.phone}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              Joined {format(new Date(user.joined_at), 'MMM d, yyyy')}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {currentUser?.id === user.id && (
                        <>
                          {isEditing ? (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleSaveProfile(user.id)}
                              >
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setEditingUser(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditProfile(user.id)}
                            >
                              Edit Profile
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Project and Task Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="font-medium text-green-600 dark:text-green-400">
                        {projectStats.activeProjects}
                      </div>
                      <div className="text-xs text-gray-500">Active Projects</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="font-medium text-blue-600 dark:text-blue-400">
                        {projectStats.completedProjects}
                      </div>
                      <div className="text-xs text-gray-500">Completed Projects</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <div className="font-medium text-orange-600 dark:text-orange-400">
                        {taskStats.activeTasks}
                      </div>
                      <div className="text-xs text-gray-500">Active Tasks</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <div className="font-medium text-purple-600 dark:text-purple-400">
                        {taskStats.completedTasks}
                      </div>
                      <div className="text-xs text-gray-500">Completed Tasks</div>
                    </div>
                  </div>

                  {/* Assigned Tasks */}
                  {userTasks.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Assigned Tasks ({userTasks.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {userTasks.slice(0, 5).map((task) => (
                          <Badge key={task.id} variant="outline" className="text-xs">
                            {task.title} - {task.status}
                          </Badge>
                        ))}
                        {userTasks.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{userTasks.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}