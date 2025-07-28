import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import { useTaskStore } from '../stores/taskStore'
import { useMessageStore } from '../stores/messageStore'
import { useUserStore } from '../stores/userStore'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { EditProjectModal } from '../components/EditProjectModal'
import { TaskSection } from '../components/TaskSection'
import { ChatSection } from '../components/ChatSection'
import { format } from 'date-fns'
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { projects, fetchProjects, deleteProject } = useProjectStore()
  const { fetchTasks } = useTaskStore()
  const { fetchMessages } = useMessageStore()
  const { fetchUsers } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [editingProject, setEditingProject] = useState(false)
  
  const project = projects.find(p => p.id === id)

  useEffect(() => {
    if (!project) {
      // Fetch projects to find the specific project
      fetchProjects('c5fac37b-1e77-47b3-afee-32e78c9b9b2d')
    }
    if (id) {
      fetchTasks(id)
      fetchMessages(id)
      fetchUsers()
    }
  }, [project, fetchProjects, fetchTasks, fetchMessages, fetchUsers, id])

  const handleDelete = async () => {
    if (!project || !window.confirm('Are you sure you want to delete this project?')) {
      return
    }

    setLoading(true)
    try {
      await deleteProject(project.id)
      toast.success('Project deleted successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'Completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'Archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Project not found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {project.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Created {format(new Date(project.created_at), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setEditingProject(true)}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
            <TrashIcon className="h-4 w-4 mr-2" />
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.description ? (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {project.description}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No description provided.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Created
                    </Label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {format(new Date(project.created_at), 'PPP')}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Last Updated
                    </Label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {format(new Date(project.updated_at), 'PPP')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {project.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks">
          <TaskSection projectId={project.id} />
        </TabsContent>
        
        <TabsContent value="chat">
          <ChatSection projectId={project.id} />
        </TabsContent>
      </Tabs>

      {editingProject && (
        <EditProjectModal
          project={project}
          isOpen={editingProject}
          onClose={() => setEditingProject(false)}
        />
      )}
    </div>
  )
}

// Helper component for labels
const Label = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <label className={`block text-sm font-medium ${className}`}>
    {children}
  </label>
)