'use client';
/**
 * MESSAGING SYSTEM
 * School-wide internal messaging: teacher↔teacher, teacher↔headmaster, etc.
 * Split-pane layout: Contacts list (left) + Conversation (right)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Send, Search, User, ChevronRight,
  Clock, CheckCheck, Bell, PlusCircle, X, Loader,
} from 'lucide-react';
import { roleTranslationKey, useLanguage } from '@/lib/i18n';

const timeAgo = (dateStr, locale) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (mins < 1) return rtf.format(0, 'minute');
  if (mins < 60) return rtf.format(-mins, 'minute');
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return rtf.format(-hrs, 'hour');
  return new Date(dateStr).toLocaleDateString(locale);
};

const fmtTime = (dateStr, locale) => dateStr ? new Date(dateStr).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : '';
const fmtDate = (dateStr, locale) => dateStr ? new Date(dateStr).toLocaleDateString(locale) : '';

export default function MessagesPage() {
  const { language, t } = useLanguage();
  const locale = { en: 'en-RW', rw: 'rw-RW', fr: 'fr-FR' }[language] || 'en-RW';
  const [user, setUser]               = useState(null);
  const [colleagues, setColleagues]   = useState([]);
  const [selected, setSelected]       = useState(null);  // colleague object
  const [messages, setMessages]       = useState([]);
  const [body, setBody]               = useState('');
  const [subject, setSubject]         = useState('');
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [sending, setSending]         = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNew, setShowNew]         = useState(false);
  const [newTo, setNewTo]             = useState('');
  const [error, setError]             = useState(null);
  const bottomRef                     = useRef(null);
  const pollRef                       = useRef(null);
  const selectedRef                   = useRef(null);

  // ─── Load contacts ──────────────────────────────────────
  const loadContacts = async () => {
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load colleagues.');
      }
      const d = await res.json();
      setColleagues(d.colleagues || []);
      setUnreadCount(d.unreadCount || 0);
      setError(null);
    } catch (e) {
      setError(e.message || 'Failed to load colleagues.');
    }
    finally { setLoading(false); }
  };

  // ─── Load messages in conversation ──────────────────────
  const loadMessages = async (colleague) => {
    try {
      const res = await fetch(`/api/messages?with=${colleague.id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load this conversation.');
      }
      const d = await res.json();
      setMessages(d.messages || []);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      // Update unread in sidebar
      setColleagues(prev => prev.map(c => c.id === colleague.id ? { ...c, unread_count: 0 } : c));
    } catch (e) {
      setError(e.message || 'Failed to load this conversation.');
    }
  };

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void loadContacts(); }, 0);
    fetch('/api/auth/me')
      .then(async res => {
        if (!res.ok) throw new Error('Your session has expired. Please sign in again.');
        return res.json();
      })
      .then(data => setUser(data.user))
      .catch(e => setError(e.message));
    // Poll for new messages every 15s
    pollRef.current = setInterval(() => {
      if (selectedRef.current) loadMessages(selectedRef.current);
      loadContacts();
    }, 15000);
    return () => {
      window.clearTimeout(initialLoad);
      clearInterval(pollRef.current);
    };
  }, []);

  const selectColleague = (c) => {
    setSelected(c);
    selectedRef.current = c;
    setShowNew(false);
    setError(null);
    loadMessages(c);
  };

  // ─── Send message ────────────────────────────────────────
  const handleSend = async (e, recipient = selected) => {
    e.preventDefault();
    if (!body.trim() || !recipient) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: recipient.id, subject, body }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to send');
      setBody('');
      setSelected(recipient);
      selectedRef.current = recipient;
      setShowNew(false);
      setSubject('');
      await loadMessages(recipient);
      await loadContacts();
    } catch (e) { setError(e.message); }
    finally { setSending(false); }
  };

  const filteredColleagues = colleagues.filter(c =>
    `${c.full_name} ${c.role}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleLabel = (role) => {
    if (!role) return '';
    const translated = t(roleTranslationKey(role, 'title'));
    return translated.startsWith('role.')
      ? role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : translated;
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '12px', color: 'var(--text-secondary)' }}>
      <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> {t('messages.loading')}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="messages-workspace" style={{ display: 'flex', height: 'min(760px, calc(100dvh - 154px))', minHeight: '420px', overflow: 'hidden', background: 'var(--bg-primary)' }}>

      {/* ═══ SIDEBAR: Contacts ═══ */}
      <div className="messages-contacts" style={{ width: '320px', flexShrink: 0, borderRight: '1px solid var(--border-color)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
                  <h2 style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={18} color="var(--color-forest)" /> {t('messages.title')}
              </h2>
                  {unreadCount > 0 && <div style={{ fontSize: '0.78rem', color: '#B47214', fontWeight: 700 }}>{unreadCount} {t('messages.unread')}</div>}
            </div>
                <button type="button" aria-label={t('messages.new')} title={t('messages.new')} onClick={() => { setShowNew(true); setSelected(null); selectedRef.current = null; setSubject(''); setBody(''); setError(null); }}
              style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--color-forest)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <PlusCircle size={17} color="#FFFFFF" />
            </button>
          </div>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#5E6D62' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('messages.search')}
              style={{ width: '100%', padding: '8px 10px 8px 30px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontSize: '0.85rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' }} />
          </div>
        </div>

        {/* Contact list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredColleagues.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {t('messages.noColleagues')}
            </div>
          )}
          {filteredColleagues.map(c => (
            <button key={c.id} onClick={() => selectColleague(c)}
              style={{
                width: '100%', padding: '14px 16px', background: selected?.id === c.id ? 'rgba(22,135,209,0.07)' : 'transparent',
                border: 'none', borderBottom: '1px solid var(--border-color)', cursor: 'pointer',
                display: 'flex', gap: '12px', alignItems: 'center', textAlign: 'left',
                borderLeft: selected?.id === c.id ? '3px solid var(--color-forest)' : '3px solid transparent',
                transition: 'all 0.15s',
              }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: `hsl(${(c.full_name?.charCodeAt(0) || 65) * 5},50%,65%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                  {c.full_name?.charAt(0)}
                </div>
                {c.unread_count > 0 && (
                  <div style={{ position: 'absolute', top: '-3px', right: '-3px', width: '18px', height: '18px', borderRadius: '50%', background: '#C0392B', color: '#fff', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {c.unread_count}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontWeight: c.unread_count > 0 ? 800 : 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{c.full_name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{timeAgo(c.last_message_at, locale)}</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-forest)', fontWeight: 700, marginBottom: '2px' }}>{roleLabel(c.role)}</div>
                {c.last_message && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last_message}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ MAIN: Conversation ═══ */}
      {!selected && !showNew ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          <MessageSquare size={56} style={{ opacity: 0.15, marginBottom: '16px' }} />
          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>{t('messages.selectConversation')}</div>
          <div style={{ fontSize: '0.88rem' }}>{t('messages.selectHelp')}</div>
        </div>
      ) : showNew ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px', maxWidth: '600px' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '20px' }}>{t('messages.newMessage')}</h2>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const toColleague = colleagues.find(c => c.id === newTo);
            if (!toColleague) return;
            setSelected(toColleague);
            selectedRef.current = toColleague;
            await handleSend(e, toColleague);
          }}>
            <label style={lblStyle}>{t('messages.to')} *</label>
            <select value={newTo} onChange={e => setNewTo(e.target.value)} required style={{ ...inpStyle, marginBottom: '14px' }}>
              <option value="">{t('messages.selectColleague')}</option>
              {colleagues.map(c => <option key={c.id} value={c.id}>{c.full_name} ({roleLabel(c.role)})</option>)}
            </select>

            <label style={lblStyle}>{t('messages.subject')}</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder={t('messages.subjectPlaceholder')} style={{ ...inpStyle, marginBottom: '14px' }} />

            <label style={lblStyle}>{t('messages.message')} *</label>
            <textarea required value={body} onChange={e => setBody(e.target.value)} placeholder={t('messages.writeMessage')} rows={6} style={{ ...inpStyle, resize: 'vertical', marginBottom: '20px' }} />

            {error && <div role="alert" style={{ color: '#A51D24', fontSize: '0.85rem', marginBottom: '14px' }}>{error}</div>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={sending} style={{ flex: 1, padding: '11px', borderRadius: '10px', background: 'var(--color-forest)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Send size={16} /> {sending ? t('messages.sending') : t('messages.send')}
              </button>
              <button type="button" onClick={() => setShowNew(false)} style={{ padding: '11px 20px', borderRadius: '10px', border: '1.5px solid var(--border-color)', background: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('messages.cancel')}</button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Chat header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `hsl(${(selected?.full_name?.charCodeAt(0) || 65) * 5},50%,65%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {selected?.full_name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{selected?.full_name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-forest)', fontWeight: 700 }}>{roleLabel(selected?.role)}</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '40px' }}>
                {t('messages.noMessages')}
              </div>
            )}

            {/* Group messages by date */}
            {messages.map((msg, i) => {
              const isMine = msg.sender_id === user?.id;
              const prevMsg = messages[i - 1];
              const showDate = !prevMsg || fmtDate(msg.created_at, locale) !== fmtDate(prevMsg.created_at, locale);
              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div style={{ textAlign: 'center', margin: '8px 0' }}>
                      <span style={{ background: 'var(--border-color)', color: 'var(--text-secondary)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 600 }}>
                        {fmtDate(msg.created_at, locale)}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    {!isMine && (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `hsl(${(msg.sender_name?.charCodeAt(0) || 65) * 5},50%,65%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#fff', flexShrink: 0, marginRight: '8px', alignSelf: 'flex-end' }}>
                        {msg.sender_name?.charAt(0)}
                      </div>
                    )}
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{
                        padding: '11px 15px', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isMine ? 'linear-gradient(135deg, var(--color-deep-forest), var(--color-forest))' : 'var(--bg-surface)',
                        color: isMine ? '#fff' : 'var(--text-primary)',
                        border: isMine ? 'none' : '1px solid var(--border-color)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        fontSize: '0.9rem', lineHeight: 1.5,
                      }}>
                        {msg.subject && msg.subject !== 'No subject' && (
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, opacity: 0.7, marginBottom: '4px' }}>{msg.subject}</div>
                        )}
                        {msg.body}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', textAlign: isMine ? 'right' : 'left', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                        {fmtTime(msg.created_at, locale)}
                        {isMine && <CheckCheck size={12} color={msg.is_read ? '#1E7E4A' : '#9BAEA2'} />}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Error */}
          {error && <div style={{ padding: '10px 24px', color: '#C0392B', fontSize: '0.85rem', background: '#FDE8E8' }}>{error}</div>}

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
              placeholder={t('messages.sendPlaceholder').replace('{name}', selected?.full_name || '')}
              rows={Math.min(5, (body.match(/\n/g)?.length || 0) + 1)}
              style={{ flex: 1, padding: '11px 14px', borderRadius: '12px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'none', outline: 'none', maxHeight: '120px' }}
            />
            <button type="submit" disabled={sending || !body.trim()}
              style={{ width: '44px', height: '44px', borderRadius: '12px', background: body.trim() ? 'var(--color-forest)' : 'var(--border-color)', border: 'none', cursor: body.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {sending ? <Loader size={18} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} color="#fff" />}
            </button>
          </form>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const lblStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px', letterSpacing: '0.3px' };
const inpStyle = { width: '100%', padding: '10px 13px', borderRadius: '10px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' };
