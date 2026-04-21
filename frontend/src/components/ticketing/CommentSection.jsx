import React, { useState } from 'react';
import { Send, User, Clock, Trash2, Edit2 } from 'lucide-react';

const CommentSection = ({ ticketId, comments, onAddComment, onDeleteComment, onEditComment, currentUser }) => {
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');

    const startEdit = (comment) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    };

    const handleEditSubmit = (commentId) => {
        if (editContent.trim() && onEditComment) {
            onEditComment(commentId, editContent);
        }
        setEditingId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(newComment);
            setNewComment('');
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center">
                Discussion <span className="ml-2 text-indigo-400">({comments.length})</span>
            </h3>

            {/* Comment List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {comments.length === 0 ? (
                    <div className="text-center py-8 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <p className="text-white/30 text-sm">No comments yet. Start the conversation!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/10">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                        <User className="w-3 h-3 text-indigo-400" />
                                    </div>
                                    <span className="text-xs font-bold text-indigo-300">User #{comment.userId}</span>
                                    <span className="text-[10px] text-white/30 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {(currentUser && (String(currentUser.id) === String(comment.userId) || currentUser.role === 'ADMIN')) && onEditComment && (
                                        <button 
                                            onClick={() => startEdit(comment)}
                                            className="text-white/20 hover:text-indigo-400 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    {(currentUser && (String(currentUser.id) === String(comment.userId) || currentUser.role === 'ADMIN')) && onDeleteComment && (
                                        <button 
                                            onClick={() => onDeleteComment(comment.id)}
                                            className="text-white/20 hover:text-rose-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {editingId === comment.id ? (
                                <div className="mt-2 space-y-2">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl p-3 text-sm text-white resize-none"
                                        rows="2"
                                    />
                                    <div className="flex space-x-2 justify-end">
                                        <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1 font-bold text-white/50 hover:text-white transition-colors">Cancel</button>
                                        <button onClick={() => handleEditSubmit(comment.id)} className="text-xs bg-indigo-600 px-3 py-1 rounded text-white font-bold hover:bg-indigo-500 transition-colors">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
                    rows="3"
                />
                <button
                    type="submit"
                    className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default CommentSection;
