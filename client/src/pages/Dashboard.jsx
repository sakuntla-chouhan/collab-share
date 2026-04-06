import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import projectService from '../services/projectService';
import analyticsService from '../services/analyticsService';
import Sidebar from '../components/Sidebar';
import { FolderKanban, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

// Component for listing projects on the main dashboard home
// Inside ProjectList
import { useNavigate } from 'react-router-dom';

const ProjectList = ({ projects, fetchProjects, analytics }) => {
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await projectService.createProject(newProject);
      fetchProjects();
      setShowModal(false);
      setNewProject({ name: '', description: '' });
    } catch (err) {
      console.error(err);
    }
    setCreating(false);
  };

  return (
    <div className="p-8">
      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 border-brand-primary/20 bg-brand-primary/5">
          <h3 className="text-brand-secondary text-sm font-bold uppercase tracking-wider mb-2">Total Projects</h3>
          <p className="text-4xl font-black text-[var(--text-primary)]">{analytics?.projects || 0}</p>
        </div>
        <div className="glass-panel p-6 border-purple-500/20 bg-purple-500/5">
          <h3 className="text-purple-400 text-sm font-bold uppercase tracking-wider mb-2">Notes Created</h3>
          <p className="text-4xl font-black text-[var(--text-primary)]">{analytics?.notes || 0}</p>
        </div>
        <div className="glass-panel p-6 border-indigo-500/20 bg-indigo-500/5">
          <h3 className="text-indigo-400 text-sm font-bold uppercase tracking-wider mb-2">Files Uploaded</h3>
          <p className="text-4xl font-black text-[var(--text-primary)]">{analytics?.files || 0}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">My Projects</h2>
          <p className="text-[var(--text-secondary)]">Manage your active workspaces and collaborations.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="input-field max-w-xs bg-black/40 border-brand-primary/20"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] min-w-max"
          >
            <Plus size={20} /> Create Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full border-2 border-dashed border-[var(--border-dim)] rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <FolderKanban size={48} className="text-[var(--text-secondary)]/30 mb-4" />
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No projects found</h3>
            <p className="text-[var(--text-secondary)] max-w-md">Try searching for something else or create a new project.</p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              key={project._id}
              onClick={() => navigate(`/project/${project._id}`)}
              className="glass-panel p-6 cursor-pointer group flex flex-col hover:border-brand-primary"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center mb-4 text-brand-primary group-hover:scale-110 transition-transform">
                <FolderKanban size={24} />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 truncate group-hover:text-brand-primary transition-colors">{project.name}</h3>
              <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mt-auto">{project.description || 'No description provided.'}</p>
            </motion.div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel w-full max-w-md p-6 border-brand-primary/30"
          >
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Create New Project</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Project Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
                <textarea 
                  className="input-field resize-none h-24" 
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary">
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [projectsData, analyticsData] = await Promise.all([
        projectService.getProjects(),
        analyticsService.getAnalytics()
      ]);
      setProjects(projectsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-dark)]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 transform -translate-y-1/2"></div>
        
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<ProjectList projects={projects} fetchProjects={fetchData} analytics={analytics} />} />
            {/* Future routes for Project View (Notes/Files) will go here */}
          </Routes>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
