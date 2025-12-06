import React, { useState } from 'react';
import {
  Database,
  FolderOpen,
  FileText,
  Link2,
  MessageSquare,
  Plus,
  Search,
  Grid,
  List,
  Trash2,
  ExternalLink,
  Copy,
  Edit2,
  Filter,
  ChevronDown,
  Download,
  Upload
} from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import { useToast } from '../context/ToastContext';
import { Widget, Modal, Input, TextArea, Select, Tag, EmptyState } from '../components/UI';

// ============================================
// VAULT CATEGORIES
// ============================================
const CATEGORIES = {
  projects: {
    id: 'projects',
    label: 'Projects',
    icon: FolderOpen,
    color: 'blue',
    description: 'Portfolio work, client projects, experiments'
  },
  assets: {
    id: 'assets',
    label: 'Assets',
    icon: FileText,
    color: 'green',
    description: 'Templates, graphics, reusable files'
  },
  prompts: {
    id: 'prompts',
    label: 'Prompts',
    icon: MessageSquare,
    color: 'purple',
    description: 'System prompts, context blocks, instructions'
  },
  links: {
    id: 'links',
    label: 'Links',
    icon: Link2,
    color: 'yellow',
    description: 'References, inspiration, bookmarks'
  }
};

// ============================================
// MAIN VAULT VIEW
// ============================================
// ============================================
// MAIN VAULT VIEW
// ============================================
export default function VaultView({ uid, initialState }) {
  const [activeCategory, setActiveCategory] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const searchInputRef = React.useRef(null);

  // Handle initial state from navigation... (same as before)
  React.useEffect(() => {
    if (initialState) {
      if (initialState.category) {
        setActiveCategory(initialState.category);
      }
      if (initialState.action === 'add') {
        setShowAddModal(true);
      }
    }
  }, [initialState]);

  // Keyboard shortcuts... (same as before)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { items, loading, add, update, remove } = useCollection(uid, activeCategory);
  const { addToast } = useToast();

  // Filter items by search... (same as before)
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.tags?.some(t => t.toLowerCase().includes(query))
    );
  });

  const handleAdd = async (data) => {
    const id = await add(data);
    if (id) {
      addToast(`${category.label.slice(0, -1)} added successfully`, 'success');
      setShowAddModal(false);
    } else {
      addToast('Failed to add item', 'error');
    }
  };

  const handleUpdate = async (data) => {
    if (editingItem) {
      const success = await update(editingItem.id, data);
      if (success) {
        addToast('Item updated successfully', 'success');
        setEditingItem(null);
      } else {
        addToast('Failed to update item', 'error');
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) {
      const success = await remove(id);
      if (success) {
        addToast('Item deleted', 'info');
      } else {
        addToast('Failed to delete item', 'error');
      }
    }
  };

  const handleExportPrompts = () => {
    const prompts = items.filter(item => activeCategory === 'prompts'); // Ensure only if prompts active, but button should control
    const dataStr = JSON.stringify(prompts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'prompts_backup.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    addToast('Prompts exported', 'success');
  };

  const handleImportPrompts = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = async (e) => {
      try {
        const importedItems = JSON.parse(e.target.result);
        if (Array.isArray(importedItems)) {
          let count = 0;
          for (const item of importedItems) {
            // Removing ID to create new entries
            const { id, ...data } = item;
            // Ensure type is correct if missing
            if (activeCategory === 'prompts' && !data.type) data.type = 'System Prompt';

            await add(data); // Using hook add which handles user ID
            count++;
          }
          addToast(`Imported ${count} prompts`, 'success');
        }
      } catch (err) {
        console.error(err);
        addToast('Invalid JSON file', 'error');
      }
    };
  };

  const category = CATEGORIES[activeCategory];

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative p-8 lg:p-10 space-y-6">
      {/* Header - Floating Glass Panel */}
      <div className="flex-none p-6 glass-panel rounded-3xl flex items-center justify-between z-20">
        <div className="flex items-center gap-6">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <Database size={24} strokeWidth={1.5} className="text-white/80" />
          </div>
          <div>
            <h1 className="text-3xl font-medium text-white mb-1 tracking-tight text-glow">
              Asset Vault
            </h1>
            <p className="text-xs text-white/50 font-medium uppercase tracking-widest">
              Centralized Data Layer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {activeCategory === 'prompts' && (
            <div className="flex items-center gap-2 mr-2">
              <button
                onClick={handleExportPrompts}
                className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                title="Export Prompts"
              >
                <Download size={16} />
              </button>
              <label className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer" title="Import Prompts">
                <Upload size={16} />
                <input type="file" onChange={handleImportPrompts} accept=".json" className="hidden" />
              </label>
            </div>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white text-black px-5 py-2.5 font-semibold text-xs rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:scale-105 duration-200"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="uppercase tracking-wide">Add {category.label.slice(0, -1)}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area - Glass Container */}
      <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col backdrop-blur-2xl">
        {/* Toolbar */}
        <div className="flex-none p-4 border-b border-white/10 flex items-center gap-4 bg-white/[0.02]">
          {/* Tabs */}
          <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            {Object.values(CATEGORIES).map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-xs font-semibold uppercase tracking-wide ${activeCategory === cat.id
                  ? 'bg-white/10 text-white shadow-sm border border-white/10'
                  : 'text-white/40 hover:text-white/70'
                  }`}
              >
                <cat.icon size={14} />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative group max-w-md ml-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${category.label.toLowerCase()}... (Cmd+K)`}
              className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-black/30 transition-all text-sm"
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-black/5">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white/30 font-medium animate-pulse text-sm">Loading vault...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState
              icon={category.icon}
              title={`No ${category.label} Yet`}
              description={category.description}
              action={`Add your first ${category.label.slice(0, -1).toLowerCase()}`}
              onAction={() => setShowAddModal(true)}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map(item => (
                <VaultCard
                  key={item.id}
                  item={item}
                  category={activeCategory}
                  onEdit={() => setEditingItem(item)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map(item => (
                <VaultListItem
                  key={item.id}
                  item={item}
                  category={activeCategory}
                  onEdit={() => setEditingItem(item)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <VaultModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAdd}
        category={activeCategory}
        title={`Add ${category.label.slice(0, -1)}`}
      />

      {/* Edit Modal */}
      <VaultModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleUpdate}
        category={activeCategory}
        title={`Edit ${category.label.slice(0, -1)}`}
        initialData={editingItem}
      />
    </div>
  );
}

// ============================================
// VAULT CARD (Grid View)
// ============================================
function VaultCard({ item, category, onEdit, onDelete }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="glass-item p-6 rounded-3xl hover:bg-white/10 transition-all duration-300 group relative flex flex-col h-[280px] border border-white/5 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <h3 className="text-lg text-white font-medium tracking-tight line-clamp-1">{item.title}</h3>

        {/* Actions - Always visible on hover, but cleaner */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-0 right-0 bg-[#2c2c2e]/80 backdrop-blur-md border border-white/10 rounded-xl p-1.5 shadow-xl translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
          {category === 'prompts' && (
            <button
              onClick={() => copyToClipboard(item.content)}
              className="p-1.5 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              title="Copy to clipboard"
            >
              <Copy size={14} />
            </button>
          )}
          {category === 'links' && item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
              <ExternalLink size={14} />
            </a>
          )}
          <button
            onClick={onEdit}
            className="p-1.5 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-white/60 hover:text-red-400 transition-colors rounded-lg hover:bg-white/10"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-xs text-white/50 mb-4 line-clamp-2 leading-relaxed font-normal">{item.description}</p>
      )}

      {/* Content preview for prompts - Takes valid space */}
      {category === 'prompts' && item.content && (
        <div className="flex-1 bg-black/30 p-4 mb-4 font-mono text-[11px] text-white/70 overflow-hidden leading-relaxed rounded-2xl border border-white/5 shadow-inner">
          <div className="line-clamp-[6]">{item.content}</div>
        </div>
      )}

      {/* Spacer if no content */}
      {(category !== 'prompts' || !item.content) && <div className="flex-1"></div>}


      {/* URL for links */}
      {category === 'links' && item.url && (
        <div className="text-[11px] text-blue-400/90 font-mono truncate mb-4 hover:underline cursor-pointer flex items-center gap-1">
          <Link2 size={10} /> {item.url}
        </div>
      )}

      {/* Footer Area with Tags & Meta */}
      <div className="pt-4 border-t border-white/5 flex flex-col gap-3 mt-auto">
        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {item.tags.slice(0, 3).map((tag, i) => (
              <Tag key={i} color={CATEGORIES[category].color}>{tag}</Tag>
            ))}
            {item.tags.length > 3 && (
              <span className="text-[9px] text-white/30 ml-1 font-medium bg-white/5 px-1.5 py-0.5 rounded-md">+{item.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          {item.type && (
            <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{item.type}</span>
          )}
          {item.status && (
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${item.status === 'Active' ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/10' :
              item.status === 'Archived' ? 'text-white/30 bg-white/5 border border-white/5' :
                'text-yellow-300 bg-yellow-500/10 border border-yellow-500/10'
              }`}>
              {item.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// VAULT LIST ITEM (List View)
// ============================================
function VaultListItem({ item, category, onEdit, onDelete }) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 hover:border-white/30 transition-all group flex items-center gap-4">
      {/* Icon */}
      <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
        {React.createElement(CATEGORIES[category].icon, { size: 18, className: 'text-white/40' })}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-light truncate">{item.title}</h3>
        {item.description && (
          <p className="text-sm text-white/40 truncate">{item.description}</p>
        )}
      </div>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="hidden md:flex gap-1">
          {item.tags.slice(0, 3).map((tag, i) => (
            <Tag key={i} color={CATEGORIES[category].color}>{tag}</Tag>
          ))}
          {item.tags.length > 3 && (
            <span className="text-xs text-white/30">+{item.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 text-white/40 hover:text-white transition-colors"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-white/40 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ============================================
// VAULT MODAL (Add/Edit)
// ============================================
function VaultModal({ isOpen, onClose, onSave, category, title, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    url: '',
    type: '',
    status: 'Active',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          content: initialData.content || '',
          url: initialData.url || '',
          type: initialData.type || '',
          status: initialData.status || 'Active',
          tags: initialData.tags || []
        });
      } else {
        setFormData({
          title: '',
          description: '',
          content: '',
          url: '',
          type: '',
          status: 'Active',
          tags: []
        });
      }
      setTagInput('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const typeOptions = {
    projects: [
      { value: '', label: 'Select type...' },
      { value: 'Client Work', label: 'Client Work' },
      { value: 'Personal', label: 'Personal' },
      { value: 'Experiment', label: 'Experiment' },
      { value: 'Case Study', label: 'Case Study' }
    ],
    assets: [
      { value: '', label: 'Select type...' },
      { value: 'Template', label: 'Template' },
      { value: 'Graphic', label: 'Graphic' },
      { value: 'Video', label: 'Video' },
      { value: 'Audio', label: 'Audio' },
      { value: 'Document', label: 'Document' },
      { value: 'Font', label: 'Font' },
      { value: 'LUT', label: 'LUT' },
      { value: 'Preset', label: 'Preset' }
    ],
    prompts: [
      { value: '', label: 'Select type...' },
      { value: 'System Prompt', label: 'System Prompt' },
      { value: 'Context Block', label: 'Context Block' },
      { value: 'Persona', label: 'Persona' },
      { value: 'Workflow', label: 'Workflow' },
      { value: 'Template', label: 'Template' }
    ],
    links: [
      { value: '', label: 'Select type...' },
      { value: 'Inspiration', label: 'Inspiration' },
      { value: 'Reference', label: 'Reference' },
      { value: 'Tool', label: 'Tool' },
      { value: 'Article', label: 'Article' },
      { value: 'Tutorial', label: 'Tutorial' },
      { value: 'Resource', label: 'Resource' }
    ]
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter title..."
          required
        />

        <TextArea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description..."
          rows={3}
        />

        {/* Category-specific fields */}
        {category === 'prompts' && (
          <TextArea
            label="Prompt Content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Your prompt or context block..."
            rows={8}
          />
        )}

        {category === 'links' && (
          <Input
            label="URL"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://..."
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            options={typeOptions[category]}
          />

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Archived', label: 'Archived' }
            ]}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-xs text-white/40 font-mono uppercase tracking-wider">
            Tags
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add tag..."
              className="flex-1 bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors font-mono text-sm"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, i) => (
                <Tag key={i} onRemove={() => removeTag(tag)}>{tag}</Tag>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-white/60 hover:text-white transition-colors font-mono text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-white text-black px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-white/90 transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
