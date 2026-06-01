import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectUser, selectIsAuthenticated } from '../../redux/slices/authslice';
import {
  fetchComments,
  fetchReplies,
  addComment,
  editComment,
  deleteComment,
  toggleCommentLike,
  clearAddState,
  clearEditState,
  selectCommentsByBlog,
  selectCommentsPagination,
  selectCommentsStatus,
  selectRepliesByComment,
  selectRepliesPagination,
  selectRepliesStatus,
  selectAddStatus,
  selectAddError,
  selectEditStatus,
  selectLikeStatus,
} from '../../redux/slices/commentSlice';

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const Styles = () => (
  <style>{`
    .cs-section { margin-top: 3.5rem; padding-top: 3rem; border-top: 1px solid var(--border-subtle); }

    /* Textarea */
    .cs-textarea {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      color: var(--text-primary);
      font-size: 0.9375rem;
      line-height: 1.6;
      padding: 12px 14px;
      resize: vertical;
      min-height: 80px;
      transition: border-color 0.2s, background 0.2s;
      outline: none;
      font-family: inherit;
    }
    .cs-textarea:focus {
      border-color: var(--primary-color);
      background: rgba(238,79,39,0.05);
    }
    .cs-textarea::placeholder { color: var(--text-muted); }

    /* Buttons */
    .cs-btn-primary {
      background: var(--primary-gradient, linear-gradient(135deg, #ee4f27, #ff7043));
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 8px 18px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
      line-height: 1.5;
    }
    .cs-btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
    .cs-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

    .cs-btn-ghost {
      background: none;
      border: none;
      padding: 5px 10px;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      border-radius: 6px;
      transition: background 0.15s, color 0.15s;
      line-height: 1.5;
    }
    .cs-btn-ghost:hover { background: rgba(255,255,255,0.07); }

    /* Comment card */
    .cs-comment {
      display: flex;
      gap: 12px;
      padding: 18px 0;
      border-bottom: 1px solid rgba(255,255,255,0.055);
    }
    .cs-comment:last-child { border-bottom: none; }

    .cs-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary-gradient, linear-gradient(135deg, #ee4f27, #ff7043));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8125rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
    }
    .cs-avatar-sm {
      width: 28px;
      height: 28px;
      font-size: 0.75rem;
    }

    .cs-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .cs-author {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .cs-meta {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-left: 8px;
    }
    .cs-body {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      line-height: 1.65;
      margin-top: 4px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Action row */
    .cs-actions { display: flex; align-items: center; gap: 4px; margin-top: 8px; flex-wrap: wrap; }

    .cs-like-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: none;
      border: none;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      line-height: 1;
    }
    .cs-like-btn:hover { background: rgba(238,79,39,0.1); }
    .cs-like-btn.liked { color: var(--primary-color); }
    .cs-like-btn:not(.liked) { color: var(--text-muted); }
    .cs-like-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Reply / edit form */
    .cs-inline-form {
      margin-top: 12px;
      padding: 14px;
      background: rgba(255,255,255,0.03);
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.07);
    }

    /* Replies section */
    .cs-replies {
      margin-top: 8px;
      padding-left: 20px;
      border-left: 2px solid rgba(255,255,255,0.08);
    }
    .cs-reply-item {
      display: flex;
      gap: 10px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .cs-reply-item:last-child { border-bottom: none; }

    /* Load more */
    .cs-load-more {
      background: none;
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s, background 0.2s;
      width: 100%;
      margin-top: 8px;
    }
    .cs-load-more:hover { border-color: var(--primary-color); color: var(--primary-color); background: rgba(238,79,39,0.05); }
    .cs-load-more:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Error */
    .cs-error {
      font-size: 0.8125rem;
      color: #f87171;
      margin-top: 6px;
    }

    /* Login prompt */
    .cs-login-prompt {
      text-align: center;
      padding: 28px 20px;
      background: rgba(255,255,255,0.03);
      border: 1px dashed rgba(255,255,255,0.12);
      border-radius: 12px;
    }

    /* Edited badge */
    .cs-edited {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-style: italic;
      margin-left: 6px;
    }

    /* Skeleton */
    .cs-skeleton {
      background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.05) 75%);
      background-size: 200% 100%;
      animation: cs-shimmer 1.4s infinite;
      border-radius: 6px;
    }
    @keyframes cs-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .cs-dot-sep { color: var(--text-muted); opacity: 0.4; margin: 0 2px; }

    @media (max-width: 576px) {
      .cs-replies { padding-left: 12px; }
    }
  `}</style>
);

/* ─── Utilities ──────────────────────────────────────────────────────────── */
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const Avatar = ({ user, small = false }) => {
  const cls = `cs-avatar${small ? ' cs-avatar-sm' : ''}`;
  if (user?.avatar) return <div className={cls}><img src={user.avatar} alt={user.name} /></div>;
  return <div className={cls}>{(user?.name?.[0] || '?').toUpperCase()}</div>;
};

/* ─── CommentInput ───────────────────────────────────────────────────────── */
const CommentInput = ({
  placeholder = 'Write a comment…',
  initialValue = '',
  onSubmit,
  onCancel,
  submitLabel = 'Post',
  loading = false,
  error = null,
  autoFocus = false,
  compact = false,
}) => {
  const [value, setValue] = useState(initialValue);
  const ref = useRef(null);

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = value.trim();
    if (!trimmed) return;

    const success = await onSubmit(trimmed);

    if (success !== false) {
        setValue('');
    }
    };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        ref={ref}
        className="cs-textarea"
        style={{ minHeight: compact ? 64 : 80 }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={2000}
        disabled={loading}
      />
      {error && <p className="cs-error">{error}</p>}
      <div className="d-flex align-items-center justify-content-between mt-2">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {value.length}/2000
        </span>
        <div className="d-flex gap-2">
          {onCancel && (
            <button type="button" className="cs-btn-ghost" style={{ color: 'var(--text-muted)' }} onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="cs-btn-primary"
            disabled={loading || !value.trim()}
          >
            {loading ? 'Posting…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
};

/* ─── ReplyActions (shared like/edit/delete row) ─────────────────────────── */
const ReplyActions = ({ comment, blogId, currentUser, isAuthenticated, onEdit, onDelete, showReply = true, onReplyClick }) => {
  const dispatch    = useDispatch();
  const likeLoading = useSelector(selectLikeStatus(comment.id)) === 'loading';
  const isOwner     = currentUser?.id === comment.author?.id;
  const isAdmin     = currentUser?.role === 'ADMIN';

  const handleLike = () => {
    if (!isAuthenticated) return;
    dispatch(toggleCommentLike({ blogId, commentId: comment.id }));
  };

  return (
    <div className="cs-actions">
      <button
        className={`cs-like-btn${comment.likedByMe ? ' liked' : ''}`}
        onClick={handleLike}
        disabled={likeLoading || !isAuthenticated}
        title={isAuthenticated ? (comment.likedByMe ? 'Unlike' : 'Like') : 'Login to like'}
      >
        {comment.likedByMe ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        )}
        <span>{comment.likeCount > 0 ? comment.likeCount : ''}</span>
      </button>

      {showReply && isAuthenticated && (
        <>
          <span className="cs-dot-sep">·</span>
          <button className="cs-btn-ghost" style={{ color: 'var(--text-muted)' }} onClick={onReplyClick}>
            Reply
          </button>
        </>
      )}

      {(isOwner || isAdmin) && (
        <>
          <span className="cs-dot-sep">·</span>
          <button className="cs-btn-ghost" style={{ color: 'var(--text-muted)' }} onClick={onEdit}>
            Edit
          </button>
          <span className="cs-dot-sep">·</span>
          <button className="cs-btn-ghost" style={{ color: '#f87171' }} onClick={onDelete}>
            Delete
          </button>
        </>
      )}
    </div>
  );
};

/* ─── ReplySection ───────────────────────────────────────────────────────── */
const ReplySection = ({ blogId, commentId, currentUser, isAuthenticated }) => {
  const dispatch   = useDispatch();
  const replies    = useSelector(selectRepliesByComment(commentId));
  const pagination = useSelector(selectRepliesPagination(commentId));
  const status     = useSelector(selectRepliesStatus(commentId));
  const addStatus  = useSelector(selectAddStatus);
  const addError   = useSelector(selectAddError);

  const [replyOpen, setReplyOpen]   = useState(false);
  const [editingId, setEditingId]   = useState(null);

  const hasMore = pagination ? pagination.page < pagination.pages : false;
  const nextPage = pagination ? pagination.page + 1 : 1;

  const loadMore = () => dispatch(fetchReplies({ blogId, commentId, page: nextPage }));

  const handleAddReply = useCallback(
    (body) => {
      dispatch(addComment({ blogId, body, parentId: commentId })).then((res) => {
        if (!res.error) { setReplyOpen(false); dispatch(clearAddState()); }
      });
    },
    [dispatch, blogId, commentId]
  );

  const handleEdit = useCallback(
    (replyId, body) => {
      dispatch(editComment({ blogId, commentId: replyId, body })).then((res) => {
        if (!res.error) { setEditingId(null); dispatch(clearEditState()); }
      });
    },
    [dispatch, blogId]
  );

  const handleDelete = useCallback(
    (replyId) => {
      if (!window.confirm('Delete this reply?')) return;
      dispatch(deleteComment({ blogId, commentId: replyId, parentId: commentId }));
    },
    [dispatch, blogId, commentId]
  );

  return (
    <div className="cs-replies">
      {/* Reply list */}
      {replies.map((reply) => (
        <div key={reply.id} className="cs-reply-item">
          <Avatar user={reply.author} small />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
              <span className="cs-author" style={{ fontSize: '0.8125rem' }}>{reply.author?.name || 'Anonymous'}</span>
              <span className="cs-meta">{timeAgo(reply.createdAt)}</span>
              {reply.updatedAt !== reply.createdAt && <span className="cs-edited">(edited)</span>}
            </div>

            {editingId === reply.id ? (
              <div className="cs-inline-form mt-2">
                <CommentInput
                  initialValue={reply.body}
                  onSubmit={(body) => handleEdit(reply.id, body)}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Save"
                  autoFocus
                  compact
                />
              </div>
            ) : (
              <p className="cs-body" style={{ fontSize: '0.875rem', marginTop: 3 }}>{reply.body}</p>
            )}

            {/* Like + actions for reply */}
            {editingId !== reply.id && (
              <ReplyActions
                comment={reply}
                blogId={blogId}
                currentUser={currentUser}
                isAuthenticated={isAuthenticated}
                onEdit={() => setEditingId(reply.id)}
                onDelete={() => handleDelete(reply.id)}
                showReply={false}
              />
            )}
          </div>
        </div>
      ))}

      {status === 'loading' && (
        <div style={{ padding: '10px 0' }}>
          <div className="cs-skeleton" style={{ height: 14, width: '60%', marginBottom: 6 }} />
          <div className="cs-skeleton" style={{ height: 12, width: '80%' }} />
        </div>
      )}

      {hasMore && status !== 'loading' && (
        <button className="cs-load-more" onClick={loadMore}>
          Load more replies ({pagination.total - replies.length} remaining)
        </button>
      )}

      {/* Reply form */}
      {isAuthenticated && (
        <>
          {replyOpen ? (
            <div className="cs-inline-form mt-2">
              <CommentInput
                placeholder="Write a reply…"
                onSubmit={handleAddReply}
                onCancel={() => setReplyOpen(false)}
                submitLabel="Reply"
                loading={addStatus === 'loading'}
                error={addStatus === 'failed' ? addError : null}
                autoFocus
                compact
              />
            </div>
          ) : (
            <button
              className="cs-btn-ghost mt-2"
              style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
              onClick={() => setReplyOpen(true)}
            >
              + Reply
            </button>
          )}
        </>
      )}
    </div>
  );
};

/* ─── CommentCard ────────────────────────────────────────────────────────── */
const CommentCard = ({ comment, blogId, currentUser, isAuthenticated }) => {
  const dispatch   = useDispatch();
  const repliesStatus = useSelector(selectRepliesStatus(comment.id));

  const [editing, setEditing]               = useState(false);
  const [repliesOpen, setRepliesOpen]       = useState(false);
  const [replyInputOpen, setReplyInputOpen] = useState(false);
  const editStatus = useSelector(selectEditStatus);
  const addStatus  = useSelector(selectAddStatus);
  const addError   = useSelector(selectAddError);

  const isOwner = currentUser?.id === comment.author?.id;
  const isAdmin = currentUser?.role === 'ADMIN';

  const handleEdit = (body) => {
    dispatch(editComment({ blogId, commentId: comment.id, body })).then((res) => {
      if (!res.error) { setEditing(false); dispatch(clearEditState()); }
    });
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this comment? All replies will also be removed.')) return;
    dispatch(deleteComment({ blogId, commentId: comment.id, parentId: null }));
  };

  const handleToggleReplies = () => {
    if (!repliesOpen && repliesStatus === 'idle' && comment.replyCount > 0) {
      dispatch(fetchReplies({ blogId, commentId: comment.id }));
    }
    setRepliesOpen((v) => !v);
  };

  const handleReplyClick = () => {
    if (!repliesOpen) {
      if (repliesStatus === 'idle' && comment.replyCount > 0) {
        dispatch(fetchReplies({ blogId, commentId: comment.id }));
      }
      setRepliesOpen(true);
    }
    setReplyInputOpen(true);
  };

  const handleAddReply = (body) => {
    dispatch(addComment({ blogId, body, parentId: comment.id })).then((res) => {
      if (!res.error) { setReplyInputOpen(false); dispatch(clearAddState()); }
    });
  };

  return (
    <div className="cs-comment">
      <Avatar user={comment.author} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
          <span className="cs-author">{comment.author?.name || 'Anonymous'}</span>
          <span className="cs-meta">{timeAgo(comment.createdAt)}</span>
          {comment.updatedAt !== comment.createdAt && <span className="cs-edited">(edited)</span>}
        </div>

        {/* Body or edit form */}
        {editing ? (
          <div className="cs-inline-form mt-2">
            <CommentInput
              initialValue={comment.body}
              onSubmit={handleEdit}
              onCancel={() => setEditing(false)}
              submitLabel="Save"
              loading={editStatus === 'loading'}
              autoFocus
            />
          </div>
        ) : (
          <p className="cs-body">{comment.body}</p>
        )}

        {/* Actions */}
        {!editing && (
          <ReplyActions
            comment={comment}
            blogId={blogId}
            currentUser={currentUser}
            isAuthenticated={isAuthenticated}
            onEdit={() => setEditing(true)}
            onDelete={handleDelete}
            showReply={isAuthenticated}
            onReplyClick={handleReplyClick}
          />
        )}

        {/* View replies toggle */}
        {comment.replyCount > 0 && !editing && (
          <button
            className="cs-btn-ghost mt-1"
            style={{ color: 'var(--primary-color)', fontSize: '0.8rem', padding: '3px 0' }}
            onClick={handleToggleReplies}
          >
            {repliesOpen
              ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 15l-6-6-6 6"/>
                  </svg>
                  Hide replies
                </span>
              )
              : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                  View {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                </span>
              )}
          </button>
        )}

        {/* Replies drawer */}
        {repliesOpen && (
          <ReplySection
            blogId={blogId}
            commentId={comment.id}
            currentUser={currentUser}
            isAuthenticated={isAuthenticated}
          />
        )}

        {/* Inline reply input (when no existing replies shown yet) */}
        {replyInputOpen && !repliesOpen && isAuthenticated && (
          <div className="cs-inline-form mt-2">
            <CommentInput
              placeholder="Write a reply…"
              onSubmit={handleAddReply}
              onCancel={() => setReplyInputOpen(false)}
              submitLabel="Reply"
              loading={addStatus === 'loading'}
              error={addStatus === 'failed' ? addError : null}
              autoFocus
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Skeleton list ──────────────────────────────────────────────────────── */
const CommentSkeleton = () => (
  <div>
    {[...Array(3)].map((_, i) => (
      <div key={i} className="cs-comment">
        <div className="cs-avatar cs-skeleton" style={{ background: 'none' }} />
        <div style={{ flex: 1 }}>
          <div className="cs-skeleton" style={{ height: 13, width: 120, marginBottom: 8 }} />
          <div className="cs-skeleton" style={{ height: 14, width: '90%', marginBottom: 5 }} />
          <div className="cs-skeleton" style={{ height: 14, width: i % 2 === 0 ? '75%' : '60%' }} />
        </div>
      </div>
    ))}
  </div>
);

/* ─── Main export: Comments ──────────────────────────────────────────────── */
/**
 * Usage — drop inside BlogDetail right after the Tags section:
 *
 *   <Comments blogId={post.id} />
 *
 * Requires:
 *   • commentReducer mounted at state.comments  (add to store)
 *   • authReducer at state.auth                 (already there)
 */
const Comments = ({ blogId }) => {
  const dispatch       = useDispatch();
  const currentUser    = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const comments   = useSelector(selectCommentsByBlog(blogId));
  const pagination = useSelector(selectCommentsPagination(blogId));
  const status     = useSelector(selectCommentsStatus(blogId));
  const addStatus  = useSelector(selectAddStatus);
  const addError   = useSelector(selectAddError);

  const isLoading = status === 'idle' || status === 'loading';
  const hasMore   = pagination ? pagination.page < pagination.pages : false;

  useEffect(() => {
    if (blogId) dispatch(fetchComments({ blogId }));
  }, [dispatch, blogId]);

  const handleAddComment = useCallback(
    (body) => {
      dispatch(addComment({ blogId, body })).then((res) => {
        if (!res.error) dispatch(clearAddState());
      });
    },
    [dispatch, blogId]
  );

  const handleLoadMore = () => {
    if (pagination) dispatch(fetchComments({ blogId, page: pagination.page + 1 }));
  };

  const totalComments = pagination?.total ?? comments.length;

  return (
    <>
      <Styles />
      <div className="cs-section fade-in-up">
        {/* Header */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          Comments
          {totalComments > 0 && (
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                background: 'rgba(238,79,39,0.15)',
                color: 'var(--primary-color)',
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {totalComments}
            </span>
          )}
        </h3>

        {/* Compose box */}
        {isAuthenticated ? (
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: '2rem',
              alignItems: 'flex-start',
            }}
          >
            <Avatar user={currentUser} />
            <div style={{ flex: 1 }}>
              <CommentInput
                placeholder="Share your thoughts…"
                onSubmit={handleAddComment}
                loading={addStatus === 'loading'}
                error={addStatus === 'failed' ? addError : null}
              />
            </div>
          </div>
        ) : (
          <div className="cs-login-prompt mb-4">
            <p style={{ color: 'var(--text-muted)', marginBottom: 10 }}>
              Join the conversation
            </p>
            <Link to="/login" className="cs-btn-primary" style={{ display: 'inline-block', textDecoration: 'none', borderRadius: 8, padding: '8px 20px', fontSize: '0.875rem', fontWeight: 600 }}>
              Log in to comment
            </Link>
          </div>
        )}

        {/* Comment list */}
        {isLoading && <CommentSkeleton />}

        {status === 'succeeded' && comments.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
            No comments yet. Be the first!
          </p>
        )}

        {status !== 'idle' && comments.length > 0 && (
          <div>
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                blogId={blogId}
                currentUser={currentUser}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <button
            className="cs-load-more"
            onClick={handleLoadMore}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Loading…' : `Load more comments (${pagination.total - comments.length} remaining)`}
          </button>
        )}
      </div>
    </>
  );
};

export default Comments;