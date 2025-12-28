// src/components/CommentSection.jsx
'use client';
import { useState, useEffect } from 'react';

export default function CommentSection({ slug }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ authorName: '', content: '' });
  const [loading, setLoading] = useState(false);

  // 获取评论
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?slug=${slug}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  };

  // 提交评论
  const submitComment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newComment, slug })
      });

      if (response.ok) {
        setNewComment({ authorName: '', content: '' });
        fetchComments(); // 刷新评论列表
      }
    } catch (error) {
      console.error('提交评论失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [slug]);

  return (
    <div className="comment-section mt-12 border-t pt-8">
      <h3 className="text-xl font-semibold mb-6">评论</h3>
      
      {/* 评论表单 */}
      <form onSubmit={submitComment} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="您的姓名"
          value={newComment.authorName}
          onChange={(e) => setNewComment({...newComment, authorName: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="写下您的评论..."
          value={newComment.content}
          onChange={(e) => setNewComment({...newComment, content: e.target.value})}
          className="w-full p-2 border rounded h-24"
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '提交中...' : '发布评论'}
        </button>
      </form>

      {/* 评论列表 */}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="p-4 border rounded">
            <div className="font-semibold">{comment.authorName}</div>
            <div className="text-gray-600">{comment.content}</div>
            <div className="text-sm text-gray-400 mt-2">
              {new Date(comment.created_at).toLocaleDateString('zh-CN')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
