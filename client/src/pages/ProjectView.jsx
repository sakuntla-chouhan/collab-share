import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import projectService from '../services/projectService';
import noteService from '../services/noteService';
import fileService from '../services/fileService';
import aiService from '../services/aiService';
import { FileText, Upload, Sparkles, Plus, Trash2, ArrowLeft, Users, Settings, Sun, Moon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const ProjectView = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const { isLightMode, toggleTheme } = useTheme();
  const [notes, setNotes] = useState([]);
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('notes'); // notes, files, ai

  const [currentNote, setCurrentNote] = useState({ title: '', content: '' });
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [aiAction, setAiAction] = useState('explain_code');
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [previewFile, setPreviewFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [previewAiResponse, setPreviewAiResponse] = useState('');
  const [previewAiLoading, setPreviewAiLoading] = useState(false);

  // Settings & Members State
  const { user } = useAuth();
  const navigate = useNavigate();
  const [memberEmail, setMemberEmail] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);

  const isOwner = project && project.owner && user && project.owner._id === user._id;

  const handleAiSubmit = async () => {
    if (!aiInput) return;
    setAiLoading(true);
    try {
      const data = await aiService.processText(aiAction, aiInput);
      setAiResponse(data.result);
    } catch (err) {
      console.error(err);
      setAiResponse('Failed to fetch response. Please ensure API key is valid.');
    }
    setAiLoading(false);
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const pData = await projectService.getProjectById(id);
      setProject(pData);

      const nData = await noteService.getProjectNotes(id);
      setNotes(nData);

      const fData = await fileService.getProjectFiles(id);
      setFiles(fData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async () => {
    try {
      if (selectedNoteId) {
        await noteService.updateNote(selectedNoteId, currentNote);
      } else {
        await noteService.createNote({ ...currentNote, project: id });
      }
      setSelectedNoteId(null);
      setCurrentNote({ title: '', content: '' });
      const nData = await noteService.getProjectNotes(id);
      setNotes(nData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await noteService.deleteNote(noteId);
      setNotes(notes.filter(n => n._id !== noteId));
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
        setCurrentNote({ title: '', content: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectNote = (note) => {
    setSelectedNoteId(note._id);
    setCurrentNote({ title: note.title, content: note.content });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await fileService.uploadFile(id, file);
      const fData = await fileService.getProjectFiles(id);
      setFiles(fData);
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await fileService.deleteFile(fileId);
      setFiles(files.filter(f => f._id !== fileId));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePreviewFile = async (file) => {
    setPreviewFile(file);
    setFileContent('');
    setPreviewAiResponse('');
    if (!file.type || file.type.startsWith('text/') || file.type.includes('javascript') || file.type.includes('json')) {
      try {
        const relativePath = file.path.includes('\\') || file.path.includes('/')
          ? `uploads/${file.path.split(/[\\/]/).pop()}`
          : file.path;
        const response = await fetch(`http://localhost:5000/${relativePath}`);
        if (response.ok) {
          const text = await response.text();
          setFileContent(text);
        }
      } catch (err) {
        console.error('Failed to preview file text:', err);
      }
    }
  };

  const handleExplainPreview = async () => {
    if (!fileContent) return;
    setPreviewAiLoading(true);
    try {
      const data = await aiService.processText('explain_code', fileContent);
      setPreviewAiResponse(data.result);
    } catch (err) {
      console.error(err);
      setPreviewAiResponse('Failed to fetch AI explanation.');
    }
    setPreviewAiLoading(false);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail) return;
    setMemberLoading(true);
    try {
      const response = await projectService.addMember(id, memberEmail);
      if (response.message) {
        alert(response.message);
      }
      if (response.members) {
        setProject(response);
      }
      setMemberEmail('');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setMemberLoading(false);
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const updatedData = await projectService.removeMember(id, memberId);
      setProject(updatedData);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        await projectService.deleteProject(id);
        navigate('/dashboard');
      } catch (err) {
        alert("Failed to delete project");
      }
    }
  };
  
  const resolveAssetLinks = (content) => {
    if (!content || !files.length) return content;
    let resolvedContent = content;
    files.forEach(file => {
      // Create actual server URL
      const fileName = file.name;
      const serverPath = file.path.includes('\\') || file.path.includes('/')
        ? `http://localhost:5000/uploads/${file.path.split(/[\\/]/).pop()}`
        : `http://localhost:5000/${file.path}`;
      
      // Replace href="fileName" and src="fileName"
      const hrefRegex = new RegExp(`href=["']${fileName}["']`, 'g');
      const srcRegex = new RegExp(`src=["']${fileName}["']`, 'g');
      
      resolvedContent = resolvedContent.replace(hrefRegex, `href="${serverPath}"`);
      resolvedContent = resolvedContent.replace(srcRegex, `src="${serverPath}"`);
    });
    return resolvedContent;
  };

  if (!project) return <div className="p-8 text-[var(--text-primary)] bg-[var(--bg-dark)] h-screen flex items-center justify-center">Loading project workspace...</div>;

  return (
    <div className="flex h-screen bg-[var(--bg-dark)] text-[var(--text-primary)]">
      {/* Left Sidebar Menu inside Project View */}
      <div className="w-64 border-r border-[var(--border-dim)] bg-[#0A0C10] p-6 flex flex-col h-full shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h2 className="text-xl font-bold mb-6 truncate">{project.name}</h2>

        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('notes')}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'notes' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <FileText size={18} /> Notes & Docs
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'files' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <Upload size={18} /> Assets & Files
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'ai' ? 'bg-purple-500/10 text-purple-400' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <Sparkles size={18} /> AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <Settings size={18} /> Settings
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        {/* Top Header */}
        <header className="h-16 border-b border-[var(--border-dim)] flex items-center px-8 shrink-0 bg-[var(--bg-card)] backdrop-blur-md justify-between">
          <h1 className="text-lg font-medium tracking-wide">
            {activeTab === 'notes' && 'Markdown Editor'}
            {activeTab === 'files' && 'File Explorer'}
            {activeTab === 'ai' && 'CollabSphere AI Buddy'}
            {activeTab === 'settings' && 'Project Settings'}
          </h1>
          <div className="flex gap-4 items-center">
            <button onClick={toggleTheme} className="p-2 text-[var(--text-secondary)] hover:text-brand-primary transition-colors hover:bg-white/5 rounded-full" title="Toggle Theme">
              {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {project.isPublic && (
              <a href={`/shared/${project._id}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-primary hover:text-indigo-400 border border-brand-primary/20 px-4 py-1.5 rounded-full bg-brand-primary/5 transition-colors">
                Public Link
              </a>
            )}
          </div>
        </header>

        {/* Dynamic Workspace */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'notes' && (
            <div className="flex h-full">
              {/* Notes List */}
              <div className="w-72 border-r border-[var(--border-dim)] bg-[var(--bg-dark)] p-4 overflow-y-auto hidden md:block">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-sm font-semibold text-gray-400 uppercase">Documents</span>
                  <button
                    onClick={() => { setSelectedNoteId(null); setCurrentNote({ title: '', content: '' }); }}
                    className="p-1 rounded bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/40 transition-colors"
                    title="New Note"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {notes.map(note => (
                    <div
                      key={note._id}
                      className={`p-3 rounded-lg cursor-pointer group flex justify-between items-start transition-all ${selectedNoteId === note._id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                      onClick={() => handleSelectNote(note)}
                    >
                      <div className="overflow-hidden pr-2">
                        <p className={`text-sm font-medium truncate ${selectedNoteId === note._id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{note.title || 'Untitled Space'}</p>
                        <p className="text-xs text-[var(--text-secondary)]/50 mt-1 uppercase">Today</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteNote(note._id); }}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {notes.length === 0 && <p className="text-xs text-center text-gray-500 py-4">No documents yet.</p>}
                </div>
              </div>

              {/* Notion Style Editor + Markdown Preview */}
              <div className="flex-1 overflow-y-auto p-8 lg:p-12 flex relative">
                <div className="w-1/2 pr-6 border-r border-[var(--border-dim)] flex flex-col">
                  <input
                    type="text"
                    className="w-full bg-transparent text-3xl font-black text-[var(--text-primary)] focus:outline-none mb-6 placeholder:text-[var(--text-secondary)]/30"
                    placeholder="Page Title"
                    value={currentNote.title}
                    onChange={e => setCurrentNote({ ...currentNote, title: e.target.value })}
                  />
                  <textarea
                    className="w-full flex-1 bg-transparent text-sm text-[var(--text-primary)] focus:outline-none resize-none placeholder:text-[var(--text-secondary)]/30 leading-relaxed font-mono"
                    placeholder="Use Markdown formatting..."
                    value={currentNote.content}
                    onChange={e => setCurrentNote({ ...currentNote, content: e.target.value })}
                  />
                </div>

                {/* Markdown Preview Render */}
                <div className="w-1/2 pl-6 overflow-y-auto prose max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-[var(--border-dim)]">
                  {currentNote.content ? (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} 
                      rehypePlugins={[rehypeRaw]}
                    >
                      {currentNote.title ? `# ${currentNote.title}\n\n${resolveAssetLinks(currentNote.content)}` : resolveAssetLinks(currentNote.content)}
                    </ReactMarkdown>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
                      <FileText size={48} className="mb-4 opacity-30" />
                      <p>Markdown preview will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Floating Save Action */}
              <div className="absolute bottom-8 right-8">
                <button
                  onClick={handleSaveNote}
                  className="btn-primary shadow-2xl py-3 px-6"
                  disabled={!currentNote.title && !currentNote.content}
                >
                  {selectedNoteId ? 'Update Document' : 'Save Document'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="p-8 h-full overflow-y-auto">
              <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Project Assets</h2>
                    <p className="text-[var(--text-secondary)] text-sm">Upload and share files with your team.</p>
                  </div>
                  <label className="btn-primary cursor-pointer flex items-center gap-2">
                    <Upload size={18} />
                    {uploading ? 'Processing...' : 'Upload File'}
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {files.map(file => (
                    <div key={file._id} onClick={() => handlePreviewFile(file)} className="glass-panel p-4 flex items-center gap-4 group cursor-pointer hover:border-brand-primary/50 transition-colors">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm border-b border-transparent truncate font-medium text-[var(--text-primary)]">{file.name}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteFile(file._id); }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Preview Modal */}
              {previewFile && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPreviewFile(null)}>
                  <div className="glass-panel border-brand-primary/30 w-full max-w-4xl max-h-[90vh] flex flex-col p-6 relative" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--border-dim)] shrink-0">
                      <h3 className="text-xl font-bold text-[var(--text-primary)]">{previewFile.name}</h3>
                      <button onClick={() => setPreviewFile(null)} className="text-[var(--text-secondary)] hover:text-brand-primary">Close X</button>
                    </div>

                    <div className="flex-1 overflow-y-auto mb-4 flex gap-4">
                      <div className="flex-1 bg-black/40 rounded-xl overflow-hidden flex items-center justify-center">
                        {previewFile.type && previewFile.type.startsWith('image/') ? (
                          <img src={`http://localhost:5000/${previewFile.path.includes('\\') || previewFile.path.includes('/') ? `uploads/${previewFile.path.split(/[\\/]/).pop()}` : previewFile.path}`} alt="Preview" className="max-w-full max-h-full object-contain" />
                        ) : fileContent ? (
                          <pre className="p-4 text-xs font-mono text-gray-300 w-full h-full overflow-y-auto whitespace-pre-wrap text-left">{fileContent}</pre>
                        ) : (
                          <p className="text-gray-500 text-sm">Cannot preview this file format.</p>
                        )}
                      </div>

                      {(fileContent || previewAiResponse) && (
                        <div className="w-80 bg-black/30 rounded-xl p-4 flex flex-col shrink-0 border border-purple-500/20 text-left">
                          <button
                            onClick={handleExplainPreview}
                            disabled={previewAiLoading || !fileContent}
                            className="w-full btn-primary bg-purple-600 hover:bg-purple-500 mb-4 flex items-center justify-center gap-2"
                          >
                            <Sparkles size={16} />
                            {previewAiLoading ? 'Explaining...' : 'Explain with Gemini'}
                          </button>

                          {previewAiResponse && (
                            <div className="flex-1 overflow-y-auto text-sm text-gray-300 font-['Inter'] prose prose-invert prose-brand max-w-none prose-sm">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{previewAiResponse}</ReactMarkdown>
                            </div>
                          )}
                          {!previewAiResponse && !previewAiLoading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                              <Sparkles size={24} className="mb-2 opacity-50" />
                              <p className="text-xs">Click explain to demystify this code snippet.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end pt-4 border-t border-[var(--border-dim)] shrink-0 text-left">
                      <a href={`http://localhost:5000/${previewFile.path.includes('\\') || previewFile.path.includes('/') ? `uploads/${previewFile.path.split(/[\\/]/).pop()}` : previewFile.path}`} target="_blank" rel="noreferrer" className="btn-secondary text-sm">Open in New Tab</a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="p-8 h-full flex flex-col items-center justify-center">
              <div className="glass-panel p-10 max-w-2xl w-full flex flex-col h-full max-h-[700px]">
                <div className="text-center mb-6 shrink-0">
                  <Sparkles size={40} className="text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">CollabSphere AI Buddy</h3>
                  <p className="text-[var(--text-secondary)] text-sm">Select an action and paste your content below to let Gemini assist you.</p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-6 shrink-0">
                  <button onClick={() => setAiAction('explain_code')} className={`px-4 py-2 ${aiAction === 'explain_code' ? 'bg-purple-500/30' : 'bg-purple-500/10'} border border-purple-500/20 text-purple-300 rounded-full text-xs font-semibold hover:bg-purple-500/20 transition-colors`}>Explain Code</button>
                  <button onClick={() => setAiAction('improve_writing')} className={`px-4 py-2 ${aiAction === 'improve_writing' ? 'bg-purple-500/30' : 'bg-purple-500/10'} border border-purple-500/20 text-purple-300 rounded-full text-xs font-semibold hover:bg-purple-500/20 transition-colors`}>Improve Writing</button>
                  <button onClick={() => setAiAction('generate_readme')} className={`px-4 py-2 ${aiAction === 'generate_readme' ? 'bg-purple-500/30' : 'bg-purple-500/10'} border border-purple-500/20 text-purple-300 rounded-full text-xs font-semibold hover:bg-purple-500/20 transition-colors`}>Generate README</button>
                  <button onClick={() => setAiAction('generate_docs')} className={`px-4 py-2 ${aiAction === 'generate_docs' ? 'bg-purple-500/30' : 'bg-purple-500/10'} border border-purple-500/20 text-purple-300 rounded-full text-xs font-semibold hover:bg-purple-500/20 transition-colors`}>Generate Docs</button>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <textarea
                    className="w-full bg-black/40 border border-purple-500/20 rounded-xl p-4 text-[var(--text-primary)] focus:outline-none focus:border-purple-500 resize-none mb-4 flex-1"
                    placeholder={`Paste ${aiAction === 'explain_code' ? 'code snippet' : aiAction === 'improve_writing' ? 'draft text' : aiAction === 'generate_docs' ? 'code for docs' : 'project info'} here...`}
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                  />
                  <button
                    onClick={handleAiSubmit}
                    disabled={aiLoading || !aiInput}
                    className="w-full btn-primary bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {aiLoading ? 'Thinking...' : 'Process with Gemini'}
                  </button>
                </div>

                {aiResponse && (
                  <div className="mt-6 p-4 bg-black/50 border border-purple-500/30 rounded-xl overflow-y-auto flex-1 items-start prose prose-brand max-w-none prose-sm text-[var(--text-primary)] font-['Inter'] leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResponse}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-8 h-full overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Team Members Section */}
                <div className="glass-panel p-8">
                  <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-dim)] pb-4">
                    <Users size={24} className="text-brand-primary" />
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Team Members</h2>
                  </div>

                  <div className="space-y-4 mb-8">
                    {project.owner && (
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-[var(--border-dim)]">
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{project.owner.name} <span className="ml-2 px-2 py-0.5 bg-brand-primary/20 text-brand-primary text-xs rounded-full">Owner</span></p>
                          <p className="text-sm text-[var(--text-secondary)]">{project.owner.email}</p>
                        </div>
                      </div>
                    )}
                    {project.members && project.members.map(member => (
                      <div key={member._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-transparent hover:border-[var(--border-dim)] transition-colors">
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{member.name}</p>
                          <p className="text-sm text-[var(--text-secondary)]">{member.email}</p>
                        </div>
                        {isOwner && (
                          <button
                            onClick={() => handleRemoveMember(member._id)}
                            className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {isOwner && (
                    <form onSubmit={handleAddMember} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Invite New Member</label>
                        <input
                          type="email"
                          placeholder="Email address"
                          className="input-field"
                          value={memberEmail}
                          onChange={e => setMemberEmail(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" disabled={memberLoading} className="btn-primary h-12 px-6">
                        {memberLoading ? 'Adding...' : 'Add Member'}
                      </button>
                    </form>
                  )}
                  {!isOwner && (
                    <p className="text-sm text-gray-500 italic mt-4">Only the project owner can add or remove members.</p>
                  )}
                </div>

                {/* Danger Zone */}
                {isOwner && (
                  <div className="glass-panel p-8 border-red-500/30">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
                    <p className="text-sm text-[var(--text-secondary)] mb-6">Deleting a project is permanent and cannot be undone.</p>
                    <button
                      onClick={handleDeleteProject}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 hover:border-red-500 font-medium py-2.5 px-6 rounded-lg transition-colors"
                    >
                      Delete Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProjectView;
