import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, FolderIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useProjectStore } from '../stores/projectStore'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { EditProjectModal } from '../components/EditProjectModal'
import { format } from 'date-fns'

export const ProjectsPage = () => {
  const { projects, loading, fetchProjects } = useProjectStore()
  const [editingProject, setEditingProject] = useState<any>(null)

  useEffect(() => {
    fetchProjects('c5fac37b-1e77-47b3-afee-32e78c9b9b2d') // Demo team ID
  }, [fetchProjects])

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            All Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and view all your projects.
          </p>
        </div>
        <Link to="/projects/new">
          <Button className="flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No projects yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating your first project.
          </p>
          <div className="mt-6">
            <Link to="/projects/new">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Link to={`/project/${project.id}`} className="flex-1">
                    <CardTitle className="text-lg truncate hover:text-primary">
                      {project.title}
                    </CardTitle>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        setEditingProject(project)
                      }}
                    >
                      <PencilIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Link to={`/project/${project.id}`}>
                  <CardDescription className="line-clamp-2 min-h-[2.5rem] hover:text-foreground">
                    {project.description || 'No description provided.'}
                  </CardDescription>
                </Link>
              </CardHeader>
              <CardContent>
                <Link to={`/project/${project.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(project.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </div>
  )
}