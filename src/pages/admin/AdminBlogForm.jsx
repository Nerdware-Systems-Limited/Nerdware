import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Bold, Italic, Underline as UnderlineIcon,
  Strikethrough, Code, Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Minus, Image as ImageIcon, Table as TableIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon,
  Undo, Redo, RemoveFormatting } from 'lucide-react';

/* ── TipTap core ── */
import { useEditor, EditorContent } from '@tiptap/react';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import FloatingMenu from '@tiptap/extension-floating-menu';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExt from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import LinkExt from '@tiptap/extension-link';
import ImageExt from '@tiptap/extension-image';
import YoutubeExt from '@tiptap/extension-youtube';
import { Table as TableExt } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';

import PageHeader from '../../components/admin/PageHeader';
import {
  fetchBlogBySlug, createBlog, updateBlog,
  clearCurrentPost, clearMutationState,
  selectCurrentPost, selectDetailStatus,
  selectMutationStatus, selectMutationError,
} from '../../redux/slices/Blogslice';

/* ─── lowlight setup ──────────────────────────────────────────────────────── */
const lowlight = createLowlight();
lowlight.register('javascript', js);
lowlight.register('typescript', ts);
lowlight.register('css', css);
lowlight.register('html', xml);

/* ─── constants ──────────────────────────────────────────────────────────── */
const EMPTY = {
  title: '', excerpt: '', content: '',
  category: '', status: 'DRAFT', readTime: '',
  tags: '', coverImage: '',
};

/* ─── helper: toolbar button ─────────────────────────────────────────────── */
const TBtn = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 30, height: 30, borderRadius: 6, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      background: active ? 'rgba(238,79,39,0.18)' : 'transparent',
      color: active ? 'var(--primary-color, #EE4F27)' : 'var(--text-secondary, #aaa)',
      transition: 'all 0.15s',
      opacity: disabled ? 0.4 : 1,
    }}
    onMouseEnter={(e) => { if (!disabled && !active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
  >
    {children}
  </button>
);

const Divider = () => (
  <span style={{ width: 1, height: 20, background: 'var(--nw-border, rgba(255,255,255,0.1))', margin: '0 4px', display: 'inline-block' }} />
);

/* ─── Toolbar ─────────────────────────────────────────────────────────────── */
const Toolbar = ({ editor }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showYtInput, setShowYtInput] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [showTableMenu, setShowTableMenu] = useState(false);

  if (!editor) return null;

  const applyLink = () => {
    if (linkUrl) editor.chain().focus().setLink({ href: linkUrl }).run();
    else editor.chain().focus().unsetLink().run();
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const insertImage = () => {
    if (imageUrl) editor.chain().focus().setImage({ src: imageUrl }).run();
    setShowImageInput(false);
    setImageUrl('');
  };

  const insertYoutube = () => {
    if (ytUrl) editor.commands.setYoutubeVideo({ src: ytUrl, width: 720, height: 405 });
    setShowYtInput(false);
    setYtUrl('');
  };

  const popupStyle = {
    position: 'absolute', top: '110%', left: 0, zIndex: 100,
    background: 'var(--nw-surface, #1a1a2e)',
    border: '1px solid var(--nw-border, rgba(255,255,255,0.12))',
    borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 8,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    minWidth: 280,
  };

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2,
      padding: '8px 10px',
      borderBottom: '1px solid var(--nw-border, rgba(255,255,255,0.1))',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '10px 10px 0 0',
    }}>
      {/* History */}
      <TBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo size={14} /></TBtn>
      <TBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo size={14} /></TBtn>
      <Divider />

      {/* Headings */}
      <TBtn title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 size={14} /></TBtn>
      <TBtn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={14} /></TBtn>
      <TBtn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={14} /></TBtn>
      <Divider />

      {/* Inline */}
      <TBtn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={14} /></TBtn>
      <TBtn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={14} /></TBtn>
      <TBtn title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={14} /></TBtn>
      <TBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={14} /></TBtn>
      <TBtn title="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}><Code size={14} /></TBtn>
      <Divider />

      {/* Alignment */}
      <TBtn title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft size={14} /></TBtn>
      <TBtn title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter size={14} /></TBtn>
      <TBtn title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight size={14} /></TBtn>
      <TBtn title="Justify" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}><AlignJustify size={14} /></TBtn>
      <Divider />

      {/* Lists */}
      <TBtn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={14} /></TBtn>
      <TBtn title="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={14} /></TBtn>
      <TBtn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={14} /></TBtn>
      <TBtn title="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code size={14} style={{ strokeWidth: 2.5 }} /></TBtn>
      <TBtn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={14} /></TBtn>
      <Divider />

      {/* Link */}
      <div style={{ position: 'relative' }}>
        <TBtn title="Link" active={editor.isActive('link')} onClick={() => setShowLinkInput((v) => !v)}><LinkIcon size={14} /></TBtn>
        {showLinkInput && (
          <div style={popupStyle}>
            <input
              autoFocus
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyLink()}
              placeholder="https://example.com"
              style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '5px 10px', color: 'inherit', fontSize: '0.85rem' }}
            />
            <button type="button" onClick={applyLink} style={{ background: 'var(--primary-color, #EE4F27)', border: 'none', borderRadius: 6, padding: '5px 12px', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>Set</button>
            {editor.isActive('link') && (
              <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkInput(false); }} style={{ background: 'rgba(255,60,60,0.3)', border: 'none', borderRadius: 6, padding: '5px 10px', color: '#fca5a5', cursor: 'pointer', fontSize: '0.85rem' }}>Remove</button>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <div style={{ position: 'relative' }}>
        <TBtn title="Insert image" onClick={() => setShowImageInput((v) => !v)}><ImageIcon size={14} /></TBtn>
        {showImageInput && (
          <div style={popupStyle}>
            <input
              autoFocus
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && insertImage()}
              placeholder="https://… image URL"
              style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '5px 10px', color: 'inherit', fontSize: '0.85rem' }}
            />
            <button type="button" onClick={insertImage} style={{ background: 'var(--primary-color, #EE4F27)', border: 'none', borderRadius: 6, padding: '5px 12px', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>Insert</button>
          </div>
        )}
      </div>

      {/* YouTube */}
      <div style={{ position: 'relative' }}>
        <TBtn title="Embed YouTube" onClick={() => setShowYtInput((v) => !v)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        </TBtn>
        {showYtInput && (
          <div style={popupStyle}>
            <input
              autoFocus
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && insertYoutube()}
              placeholder="YouTube URL or video ID"
              style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '5px 10px', color: 'inherit', fontSize: '0.85rem' }}
            />
            <button type="button" onClick={insertYoutube} style={{ background: '#FF0000', border: 'none', borderRadius: 6, padding: '5px 12px', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>Embed</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ position: 'relative' }}>
        <TBtn title="Table" onClick={() => setShowTableMenu((v) => !v)}><TableIcon size={14} /></TBtn>
        {showTableMenu && (
          <div style={{ ...popupStyle, flexDirection: 'column', gap: 4, minWidth: 180 }}>
            {[
              ['Insert table (3×3)', () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()],
              ['Add row after',      () => editor.chain().focus().addRowAfter().run()],
              ['Add row before',     () => editor.chain().focus().addRowBefore().run()],
              ['Delete row',         () => editor.chain().focus().deleteRow().run()],
              ['Add col after',      () => editor.chain().focus().addColumnAfter().run()],
              ['Add col before',     () => editor.chain().focus().addColumnBefore().run()],
              ['Delete col',         () => editor.chain().focus().deleteColumn().run()],
              ['Delete table',       () => editor.chain().focus().deleteTable().run()],
            ].map(([label, action]) => (
              <button
                key={label} type="button"
                onClick={() => { action(); setShowTableMenu(false); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary, #aaa)', textAlign: 'left', padding: '5px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >{label}</button>
            ))}
          </div>
        )}
      </div>

      <Divider />
      <TBtn title="Clear formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}><RemoveFormatting size={14} /></TBtn>
    </div>
  );
};

/* ─── Field wrapper ───────────────────────────────────────────────────────── */
const Field = ({ label, required, hint, error, children }) => (
  <div className="nw-field">
    <label className="nw-field__lbl">
      {label} {required && <span className="req">*</span>}
    </label>
    {children}
    {hint && !error && <p className="nw-field__hint">{hint}</p>}
    {error && <span className="nw-field__err">{error}</span>}
  </div>
);

/* ─── Word / char count ───────────────────────────────────────────────────── */
const WordCount = ({ editor }) => {
  if (!editor) return null;
  const text = editor.getText();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  return (
    <div style={{ padding: '5px 12px', fontSize: '0.75rem', color: 'var(--text-muted, #666)', borderTop: '1px solid var(--nw-border, rgba(255,255,255,0.08))', textAlign: 'right' }}>
      {words} words · {chars} characters
    </div>
  );
};

/* ─── Main component ──────────────────────────────────────────────────────── */
const AdminBlogForm = () => {
  const { id }      = useParams();
  const isEdit      = Boolean(id);
  const navigate    = useNavigate();
  const dispatch    = useDispatch();
  const post        = useSelector(selectCurrentPost);
  const detailStat  = useSelector(selectDetailStatus);
  const mutStat     = useSelector(selectMutationStatus);
  const mutErr      = useSelector(selectMutationError);

  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});

  /* ── TipTap editor ───────────────────────────────────────────────────── */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      UnderlineExt,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      LinkExt.configure({ openOnClick: false, autolink: true }),
      ImageExt.configure({ inline: false, allowBase64: true }),
      YoutubeExt.configure({ controls: true, nocookie: true }),
      TableExt.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: 'Write your article… Use the toolbar above to format text, insert images, embed YouTube videos, add tables and more.' }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'nw-rich-editor',
        spellcheck: 'true',
      },
    },
  });

  /* ── Redux lifecycle ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (isEdit) dispatch(fetchBlogBySlug(id));
    return () => { dispatch(clearCurrentPost()); dispatch(clearMutationState()); };
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && post) {
      setForm({
        title:      post.title      || '',
        excerpt:    post.excerpt    || '',
        category:   post.category   || '',
        status:     post.status     || 'DRAFT',
        readTime:   post.readTime   || '',
        tags:       Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
        coverImage: post.coverImage || '',
        content:    post.content    || '',
      });
      if (editor && post.content) {
        editor.commands.setContent(post.content);
      }
    }
  }, [isEdit, post, editor]);

  useEffect(() => {
    if (mutStat === 'succeeded') {
      dispatch(clearMutationState());
      navigate('/admin/blog');
    }
  }, [mutStat, navigate, dispatch]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title   = 'Title is required';
    if (!form.excerpt.trim()) e.excerpt = 'Excerpt is required';
    const html = editor?.getHTML() ?? '';
    if (!html || html === '<p></p>') e.content = 'Content is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate(); setErrors(v);
    if (Object.keys(v).length) return;
    const payload = {
      ...form,
      content: editor?.getHTML() ?? '',
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    if (isEdit) dispatch(updateBlog({ id: post.id, ...payload }));
    else        dispatch(createBlog(payload));
  };

  const isSaving = mutStat === 'loading';

  if (isEdit && detailStat === 'loading') {
    return (
      <div className="nw-empty">
        <span className="nw-spinner" /> <span style={{ marginLeft: 10 }}>Loading post…</span>
      </div>
    );
  }

  return (
    <>
      {/* ── Editor styles injected once ─────────────────────────────────── */}
      <style>{`
        .nw-rich-editor {
          min-height: 420px;
          padding: 20px 24px;
          outline: none;
          color: var(--text-secondary, #ccc);
          font-size: 1rem;
          line-height: 1.8;
          caret-color: var(--primary-color, #EE4F27);
        }
        .nw-rich-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left; height: 0;
          color: var(--text-muted, #666);
          pointer-events: none;
        }
        /* Typography */
        .nw-rich-editor h1 { font-size: 2rem;   font-weight: 800; letter-spacing: -0.03em; margin: 1.5rem 0 0.5rem; color: var(--text-primary, #fff); }
        .nw-rich-editor h2 { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; margin: 1.25rem 0 0.4rem; color: var(--text-primary, #fff); }
        .nw-rich-editor h3 { font-size: 1.2rem; font-weight: 600; margin: 1rem 0 0.3rem; color: var(--text-primary, #fff); }
        .nw-rich-editor strong { color: var(--text-primary, #fff); }
        .nw-rich-editor a { color: var(--primary-color, #EE4F27); text-decoration: underline; text-underline-offset: 3px; }
        .nw-rich-editor a:hover { opacity: 0.8; }
        /* Blockquote */
        .nw-rich-editor blockquote {
          border-left: 3px solid var(--primary-color, #EE4F27);
          margin: 1.25rem 0; padding: 0.75rem 1.25rem;
          background: rgba(238,79,39,0.06); border-radius: 0 8px 8px 0;
          font-style: italic; color: var(--text-muted, #999);
        }
        /* Code */
        .nw-rich-editor code {
          background: rgba(255,255,255,0.08); padding: 2px 6px;
          border-radius: 4px; font-size: 0.875em; font-family: 'Fira Code', monospace;
          color: #f59e0b;
        }
        .nw-rich-editor pre {
          background: #0d0d0d; border-radius: 10px;
          padding: 16px 20px; margin: 1rem 0;
          overflow-x: auto; border: 1px solid rgba(255,255,255,0.08);
        }
        .nw-rich-editor pre code { background: none; padding: 0; color: inherit; font-size: 0.9rem; }
        /* Lists */
        .nw-rich-editor ul, .nw-rich-editor ol { padding-left: 1.5rem; margin: 0.75rem 0; }
        .nw-rich-editor li { margin-bottom: 4px; }
        .nw-rich-editor ul li::marker { color: var(--primary-color, #EE4F27); }
        /* HR */
        .nw-rich-editor hr { border: none; border-top: 1px solid var(--nw-border, rgba(255,255,255,0.1)); margin: 2rem 0; }
        /* Images */
        .nw-rich-editor img {
          max-width: 100%; border-radius: 10px;
          margin: 1rem 0; display: block;
          border: 1px solid var(--nw-border, rgba(255,255,255,0.1));
        }
        .nw-rich-editor img.ProseMirror-selectednode { outline: 2px solid var(--primary-color, #EE4F27); }
        /* YouTube embed */
        .nw-rich-editor div[data-youtube-video] { margin: 1.25rem 0; border-radius: 10px; overflow: hidden; }
        .nw-rich-editor iframe { border-radius: 10px; width: 100%; aspect-ratio: 16/9; }
        /* Tables */
        .nw-rich-editor table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.9rem; }
        .nw-rich-editor th {
          background: rgba(238,79,39,0.1); color: var(--text-primary, #fff);
          font-weight: 600; padding: 10px 14px;
          border: 1px solid rgba(255,255,255,0.1);
          text-align: left;
        }
        .nw-rich-editor td {
          padding: 9px 14px;
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--text-secondary, #ccc);
          vertical-align: top;
        }
        .nw-rich-editor tr:nth-child(even) td { background: rgba(255,255,255,0.025); }
        .nw-rich-editor .selectedCell::after { background: rgba(238,79,39,0.15); }
        /* Bubble menu */
        .nw-bubble-menu {
          display: flex; gap: 2px; align-items: center;
          background: var(--nw-surface, #1a1a2e);
          border: 1px solid var(--nw-border, rgba(255,255,255,0.12));
          border-radius: 8px; padding: 4px 6px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        /* Editor wrapper */
        .nw-editor-wrap {
          border: 1px solid var(--nw-border, rgba(255,255,255,0.1));
          border-radius: 10px;
          overflow: visible;
          background: var(--nw-surface, rgba(255,255,255,0.03));
          transition: border-color 0.2s;
        }
        .nw-editor-wrap:focus-within {
          border-color: rgba(238,79,39,0.45);
          box-shadow: 0 0 0 3px rgba(238,79,39,0.08);
        }
        .nw-editor-wrap--error { border-color: rgba(239,68,68,0.6) !important; }
      `}</style>

      <form onSubmit={handleSubmit}>
        <PageHeader
          title={isEdit ? 'Edit post' : 'New post'}
          subtitle={isEdit ? `Editing "${post?.title || ''}"` : 'Craft a new article for the Nerdware blog.'}
          actions={
            <>
              <Link to="/admin/blog" className="nw-btn nw-btn--ghost">
                <ArrowLeft size={16} /> Back
              </Link>
              {isEdit && post?.status === 'PUBLISHED' && (
                <Link to={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="nw-btn nw-btn--ghost">
                  <Eye size={16} /> Preview
                </Link>
              )}
              <button type="submit" className="nw-btn nw-btn--primary" disabled={isSaving}>
                {isSaving ? <span className="nw-spinner" /> : <Save size={16} />}
                {isEdit ? 'Save changes' : 'Create post'}
              </button>
            </>
          }
        />

        {mutErr && (
          <div className="nw-card" style={{ borderColor: 'rgba(239,68,68,0.4)', marginBottom: 16 }}>
            <div className="nw-card__bd" style={{ color: '#fca5a5' }}>{mutErr}</div>
          </div>
        )}

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
          {/* ── Main column ─────────────────────────────────────────────── */}
          <div className="nw-card">
            <div className="nw-card__hd"><h3>Content</h3></div>
            <div className="nw-card__bd">
              <Field label="Title" required error={errors.title}>
                <input className="nw-input" value={form.title} onChange={set('title')} placeholder="A great headline…" />
              </Field>

              <Field label="Excerpt" required hint="Short summary shown in listings & previews." error={errors.excerpt}>
                <textarea className="nw-textarea" rows={3} value={form.excerpt} onChange={set('excerpt')} placeholder="One or two sentences…" />
              </Field>

              {/* Rich text editor */}
              <Field label="Content" required hint="Use the toolbar to format text, insert images, embed YouTube videos, add tables, code blocks and more." error={errors.content}>
                <div className={`nw-editor-wrap${errors.content ? ' nw-editor-wrap--error' : ''}`}>
                  <Toolbar editor={editor} />

                  {/* Bubble menu (appears on text selection) */}
                  {/* {editor && (
                    <BubbleMenu editor={editor} tippyOptions={{ duration: 120 }}>
                      <div className="nw-bubble-menu">
                        <TBtn title="Bold"   active={editor.isActive('bold')}      onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={13} /></TBtn>
                        <TBtn title="Italic" active={editor.isActive('italic')}    onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={13} /></TBtn>
                        <TBtn title="Strike" active={editor.isActive('strike')}    onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={13} /></TBtn>
                        <TBtn title="Code"   active={editor.isActive('code')}      onClick={() => editor.chain().focus().toggleCode().run()}><Code size={13} /></TBtn>
                        <TBtn title="Link"   active={editor.isActive('link')}      onClick={() => { const url = window.prompt('URL'); if (url) editor.chain().focus().setLink({ href: url }).run(); }}><LinkIcon size={13} /></TBtn>
                      </div>
                    </BubbleMenu>
                  )} */}

                  <EditorContent editor={editor} />
                  <WordCount editor={editor} />
                </div>
              </Field>
            </div>
          </div>

          {/* ── Side column ─────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="nw-card">
              <div className="nw-card__hd"><h3>Publishing</h3></div>
              <div className="nw-card__bd">
                <Field label="Status">
                  <select className="nw-select" value={form.status} onChange={set('status')}>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </Field>
                <Field label="Category">
                  <input className="nw-input" value={form.category} onChange={set('category')} placeholder="e.g. Engineering" />
                </Field>
                <Field label="Tags" hint="Comma separated">
                  <input className="nw-input" value={form.tags} onChange={set('tags')} placeholder="react, ai, devops" />
                </Field>
                <Field label="Read time" hint="e.g. 5">
                  <input className="nw-input" value={form.readTime} onChange={set('readTime')} placeholder="5" />
                </Field>
              </div>
            </div>

            <div className="nw-card">
              <div className="nw-card__hd"><h3>Cover image</h3></div>
              <div className="nw-card__bd">
                <Field label="Image URL">
                  <input className="nw-input" value={form.coverImage} onChange={set('coverImage')} placeholder="https://…" />
                </Field>
                {form.coverImage && (
                  <div style={{
                    marginTop: 10, borderRadius: 12, overflow: 'hidden',
                    border: '1px solid var(--nw-border)', aspectRatio: '16/9',
                    background: 'rgba(255,255,255,0.04)',
                  }}>
                    <img
                      src={form.coverImage}
                      alt="Cover preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Formatting cheatsheet */}
            <div className="nw-card">
              <div className="nw-card__hd"><h3>Editor tips</h3></div>
              <div className="nw-card__bd" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                <p style={{ marginBottom: 6 }}><strong style={{ color: 'var(--text-secondary)' }}>Select text</strong> → inline bubble menu appears</p>
                <p style={{ marginBottom: 6 }}><strong style={{ color: 'var(--text-secondary)' }}>Images</strong> → toolbar → Image icon → paste URL</p>
                <p style={{ marginBottom: 6 }}><strong style={{ color: 'var(--text-secondary)' }}>YouTube</strong> → toolbar → YT icon → paste video URL</p>
                <p style={{ marginBottom: 6 }}><strong style={{ color: 'var(--text-secondary)' }}>Tables</strong> → toolbar → Table icon → Insert table</p>
                <p style={{ marginBottom: 0 }}><strong style={{ color: 'var(--text-secondary)' }}>Code blocks</strong> → toolbar → <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3 }}>{'</>'}</code> button</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default AdminBlogForm;