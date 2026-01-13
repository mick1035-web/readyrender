'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, deleteDoc, updateDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Video, Clock, FolderOpen } from 'lucide-react'
import Header from '@/components/common/Header'
import Button from '@/components/ui/Button'
import Card, { CardBody } from '@/components/ui/Card'
import UpgradeDialog from '@/components/ui/UpgradeDialog'
import TutorialOverlay from '@/components/tutorial/TutorialOverlay'
import { useStore } from '@/store/useStore'
import { PLANS } from '@/constants/plans'

interface Project {
    id: string
    name: string
    updatedAt: any
    thumbnail?: string
}

export default function Dashboard() {
    const { user } = useAuth()
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState('')

    // 訂閱狀態
    const subscription = useStore(state => state.subscription)
    const currentPlan = PLANS[subscription.userTier]

    // 教學狀態
    const { completed, skipped } = useStore(s => s.tutorial)
    const startTutorial = useStore(s => s.startTutorial)

    useEffect(() => {
        if (!user) {
            router.push('/')
            return
        }

        const fetchProjects = async () => {
            try {
                const q = query(
                    collection(db, "projects"),
                    where("userId", "==", user.uid),
                    orderBy("updatedAt", "desc")
                )
                const querySnapshot = await getDocs(q)
                const projectList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Project[]

                console.log('📊 Dashboard projects:', projectList.map(p => ({ id: p.id, name: p.name, thumbnail: p.thumbnail })))

                setProjects(projectList)
            } catch (error) {
                console.error("Error fetching projects:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [user, router])

    // 自動啟動教學（首次訪問）
    useEffect(() => {
        if (!user || loading) return

        // 檢查是否首次訪問
        if (!completed && !skipped) {
            // 延遲 1 秒後啟動教學
            const timer = setTimeout(() => {
                startTutorial()
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [user, loading, completed, skipped, startTutorial])

    const createNewProject = async () => {
        if (!user) return

        // 檢查專案數量限制
        if (projects.length >= currentPlan.features.maxProjects) {
            setShowUpgradeDialog(true)
            return
        }

        setIsCreating(true)
        try {
            const newProject = {
                name: `Project ${projects.length + 1}`,
                userId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }

            const docRef = await addDoc(collection(db, "projects"), newProject)
            router.push(`/editor/${docRef.id}`)
        } catch (error) {
            console.error("Error creating project:", error)
            setIsCreating(false)
        }
    }

    const deleteProject = async (projectId: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return

        try {
            await deleteDoc(doc(db, "projects", projectId))
            setProjects(projects.filter(p => p.id !== projectId))
        } catch (error) {
            console.error("Error deleting project:", error)
        }
    }

    const renameProject = async (projectId: string, newName: string) => {
        if (!newName.trim()) {
            alert('Project name cannot be empty')
            return false
        }

        try {
            await updateDoc(doc(db, "projects", projectId), {
                name: newName.trim(),
                updatedAt: serverTimestamp()
            })

            // Update local state
            setProjects(projects.map(p =>
                p.id === projectId ? { ...p, name: newName.trim() } : p
            ))

            return true
        } catch (error) {
            console.error("Error renaming project:", error)
            alert('Failed to rename project. Please try again.')
            return false
        }
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Just now'
        const date = timestamp.toDate()
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
                <Header />
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <div className="text-white text-lg">Loading...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
            <TutorialOverlay />
            <Header />

            <main className="container mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">My Projects</h1>
                        <p className="text-zinc-400">
                            Create and manage your 3D video projects
                            <span className="ml-2 text-zinc-500">
                                ({projects.length}/{currentPlan.features.maxProjects} projects)
                            </span>
                        </p>
                    </div>

                    <Button
                        onClick={createNewProject}
                        isLoading={isCreating}
                        size="lg"
                        data-tutorial="new-project"
                    >
                        <Plus size={20} />
                        New Project
                    </Button>
                </div>

                {/* Upgrade Dialog */}
                <UpgradeDialog
                    isOpen={showUpgradeDialog}
                    onClose={() => setShowUpgradeDialog(false)}
                    currentTier={subscription.userTier}
                    feature="more projects"
                    requiredTier={subscription.userTier === 'FREE' ? 'PRO' : 'ULTRA'}
                />

                {/* Projects Grid */}
                <div data-tutorial="projects-grid">
                    {projects.length === 0 ? (
                        <Card className="p-12">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FolderOpen size={40} className="text-zinc-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
                                <p className="text-zinc-400">Get started by creating your first 3D video project</p>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <Card key={project.id} hover>
                                    <CardBody className="p-0">
                                        {/* Thumbnail */}
                                        <div
                                            className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center cursor-pointer relative overflow-hidden"
                                            onClick={() => router.push(`/editor/${project.id}`)}
                                        >
                                            {project.thumbnail ? (
                                                <img
                                                    src={project.thumbnail}
                                                    alt={project.name}
                                                    className="w-full h-full object-cover"
                                                    onLoad={() => console.log('✅ Image loaded:', project.name)}
                                                    onError={(e) => console.error('❌ Image error:', project.name, project.thumbnail)}
                                                />
                                            ) : (
                                                <Video size={48} className="text-white/50" />
                                            )}
                                        </div>

                                        {/* Project Info */}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                {editingProjectId === project.id ? (
                                                    <input
                                                        type="text"
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        onKeyDown={async (e) => {
                                                            if (e.key === 'Enter') {
                                                                const success = await renameProject(project.id, editingName)
                                                                if (success) {
                                                                    setEditingProjectId(null)
                                                                    setEditingName('')
                                                                }
                                                            } else if (e.key === 'Escape') {
                                                                setEditingProjectId(null)
                                                                setEditingName('')
                                                            }
                                                        }}
                                                        onBlur={async () => {
                                                            if (editingName !== project.name) {
                                                                await renameProject(project.id, editingName)
                                                            }
                                                            setEditingProjectId(null)
                                                            setEditingName('')
                                                        }}
                                                        autoFocus
                                                        className="flex-1 px-2 py-1 text-lg font-semibold text-white bg-zinc-800 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <h3
                                                        className="text-lg font-semibold text-white cursor-pointer hover:text-blue-400 transition-colors flex-1 group"
                                                        onDoubleClick={() => {
                                                            setEditingProjectId(project.id)
                                                            setEditingName(project.name)
                                                        }}
                                                        onClick={() => router.push(`/editor/${project.id}`)}
                                                        title="Double-click to rename, single-click to open"
                                                    >
                                                        {project.name}
                                                        <span className="ml-2 text-xs text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            (double-click to rename)
                                                        </span>
                                                    </h3>
                                                )}

                                                <button
                                                    onClick={() => deleteProject(project.id)}
                                                    className="text-zinc-400 hover:text-red-400 transition-colors p-1"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                <Clock size={14} />
                                                <span>{formatDate(project.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}