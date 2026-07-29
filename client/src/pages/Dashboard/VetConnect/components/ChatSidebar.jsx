import React, { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, Search, Trash2, Pencil, Check, X, PawPrint, Clock, ChevronLeft } from 'lucide-react';
import api from '../../../../utils/axios';
import { formatDistanceToNow } from 'date-fns';

const groupByDate = (conversations) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today - 86400000);
  const lastWeek = new Date(today - 7 * 86400000);

  const groups = { Today: [], Yesterday: [], 'Last 7 Days': [], Older: [] };

  conversations.forEach(c => {
    const d = new Date(c.updatedAt);
    if (d >= today) groups.Today.push(c);
    else if (d >= yesterday) groups.Yesterday.push(c);
    else if (d >= lastWeek) groups['Last 7 Days'].push(c);
    else groups.Older.push(c);
  });

  return groups;
};

const ChatSidebar = forwardRef(({ activeConversationId, onSelectConversation, onNewChat, isCollapsed, onToggleCollapse }, ref) => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/ai/conversations');
      setConversations(res.data.data || []);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useImperativeHandle(ref, () => ({ refresh: fetchConversations }));

  useEffect(() => {
    fetchConversations();
    // Refresh list when a conversation changes
    const interval = setInterval(fetchConversations, 15000);
    return () => clearInterval(interval);
  }, [fetchConversations]);



  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;
    await api.delete(`/ai/conversations/${id}`);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) onNewChat();
  };

  const startRename = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = async (e, id) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    await api.patch(`/ai/conversations/${id}`, { title: editTitle.trim() });
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editTitle.trim() } : c));
    setEditingId(null);
  };

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.preview || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups = groupByDate(filtered);

  return (
    <AnimatePresence mode="wait">
      {isCollapsed ? (
        <motion.button
          key="collapsed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onToggleCollapse}
          className="w-10 flex flex-col items-center gap-4 pt-4 bg-white border-r border-gray-100 shrink-0"
        >
          <PawPrint size={20} className="text-primary" />
        </motion.button>
      ) : (
        <motion.div
          key="expanded"
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-72 shrink-0 bg-white border-r border-gray-100 flex flex-col h-full"
        >
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2">
              <PawPrint size={18} className="text-primary" />
              <span className="font-poppins font-bold text-gray-800 text-sm">VetConnect AI</span>
            </div>
            <button onClick={onToggleCollapse} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors shadow-sm"
            >
              <MessageSquarePlus size={16} />
              New Chat
            </button>
          </div>

          {/* Search */}
          <div className="px-3 pb-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 px-4">
                <PawPrint size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-400">No conversations yet</p>
                <p className="text-xs text-gray-300 mt-1">Start your first chat with VetConnect AI</p>
              </div>
            ) : (
              Object.entries(groups).map(([label, items]) => {
                if (!items.length) return null;
                return (
                  <div key={label} className="mb-3">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">{label}</p>
                    {items.map(conv => (
                      <ConversationItem
                        key={conv.id}
                        conv={conv}
                        isActive={conv.id === activeConversationId}
                        isEditing={editingId === conv.id}
                        editTitle={editTitle}
                        onSelect={() => onSelectConversation(conv.id)}
                        onDelete={(e) => handleDelete(e, conv.id)}
                        onStartRename={(e) => startRename(e, conv)}
                        onSaveRename={(e) => saveRename(e, conv.id)}
                        onEditTitleChange={setEditTitle}
                        onCancelRename={() => setEditingId(null)}
                      />
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

const ConversationItem = ({
  conv, isActive, isEditing, editTitle,
  onSelect, onDelete, onStartRename, onSaveRename, onEditTitleChange, onCancelRename
}) => {
  return (
    <motion.div
      layout
      onClick={onSelect}
      className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-0.5 ${
        isActive
          ? 'bg-primary/10 border border-primary/20 text-primary'
          : 'hover:bg-gray-50 text-gray-700'
      }`}
    >
      <PawPrint size={14} className={isActive ? 'text-primary shrink-0' : 'text-gray-300 shrink-0'} />

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            autoFocus
            value={editTitle}
            onChange={e => onEditTitleChange(e.target.value)}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => { if (e.key === 'Enter') onSaveRename(e); if (e.key === 'Escape') onCancelRename(); }}
            className="w-full text-sm bg-white border border-primary rounded px-1.5 py-0.5 outline-none"
          />
        ) : (
          <>
            <p className={`text-sm font-medium truncate leading-tight ${isActive ? 'text-primary' : 'text-gray-700'}`}>
              {conv.title}
            </p>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">
              {conv.preview || formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
            </p>
          </>
        )}
      </div>

      {/* Action buttons (show on hover or when editing) */}
      {isEditing ? (
        <div className="flex gap-1 shrink-0">
          <button onClick={onSaveRename} className="p-1 rounded hover:bg-green-100 text-green-600">
            <Check size={13} />
          </button>
          <button onClick={e => { e.stopPropagation(); onCancelRename(); }} className="p-1 rounded hover:bg-red-100 text-red-500">
            <X size={13} />
          </button>
        </div>
      ) : (
        <div className="hidden group-hover:flex gap-0.5 shrink-0">
          <button onClick={onStartRename} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600">
            <Pencil size={12} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </motion.div>
  );
};


export default ChatSidebar;
