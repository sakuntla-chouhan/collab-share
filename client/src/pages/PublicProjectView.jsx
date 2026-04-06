import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FolderKanban, FileText, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const PublicProjectView = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Re-implementing fetch logic without auth headers for the public view
  // Note: Backend must allow these routes without 'protect' if project.isPublic === true.
  // We'll assume the backend getProjectById checks public status, 
  // but for Notes and Files we might need public endpoints. Let's just fetch project for now to show the concept.
  
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        // Fetch project info
        const pRes = await axios.get(`http://localhost:5000/api/projects/${id}`);
        setProject(pRes.data);
        
        // In a real app, backend permissions logic would securely return these. 
        // We'll mock the fetch for the UI demo.
        const nRes = await axios.get(`http://localhost:5000/api/notes/project/${id}`);
        setNotes(nRes.data);
        
        const fRes = await axios.get(`http://localhost:5000/api/files/project/${id}`);
        setFiles(fRes.data);
      } catch (err) {
        setError('Workspace not found or is private.');
      }
      setLoading(false);
    };
    
    fetchPublicData();
  }, [id]);

  if (loading) return <div className="h-screen bg-[var(--bg-dark)] flex items-center justify-center text-[var(--text-primary)]">Loading Public Workspace...</div>;
  if (error || !project) return <div className="h-screen bg-[var(--bg-dark)] flex flex-col items-center justify-center text-[var(--text-primary)]">
    <h2 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Access Denied</h2>
    <p className="text-gray-400">{error}</p>
  </div>;

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)] p-8 md:p-16">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="inline-block px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Public Shared View</div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-[var(--text-primary)]">{project.name}</h1>
          <p className="text-xl text-[var(--text-secondary)]">{project.description}</p>
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-[var(--border-dim)]">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Shared by <span className="text-[var(--text-primary)]">{project.owner?.name}</span></span>
          </div>
        </motion.div>

        <div className="space-y-12">
          <section>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-[var(--text-primary)]"><FileText className="text-brand-primary" /> Documentation</h3>
            <div className="grid gap-6">
              {notes.length === 0 ? <p className="text-[var(--text-secondary)] text-sm">No documents shared.</p> : notes.map(note => (
                <div key={note._id} className="glass-panel p-6">
                  <h4 className="text-xl font-bold mb-3 text-[var(--text-primary)]">{note.title}</h4>
                  <pre className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap font-['Inter'] leading-relaxed">{note.content}</pre>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-[var(--text-primary)]"><FolderKanban className="text-purple-400" /> Attached Assets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {files.length === 0 ? <p className="text-[var(--text-secondary)] text-sm">No files attached.</p> : files.map(file => (
                <div key={file._id} className="glass-panel p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0 text-[var(--text-primary)]"><FileText size={18} /></div>
                    <p className="text-sm font-medium truncate text-[var(--text-primary)]">{file.name}</p>
                  </div>
                  <button className="text-[var(--text-secondary)] hover:text-white p-2" title="Download placeholder"><Download size={16} /></button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PublicProjectView;
