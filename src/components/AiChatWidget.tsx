/**
 * AiChatWidget — floating AI chat assistant for the Altai Parts website.
 *
 * Provides a chat-style interface where customers can ask product questions,
 * confirm compatibility, and get guided to WhatsApp/WeChat for quotes.
 * Uses Workers AI (via /api/ai/chat) for responses.
 *
 * Features:
 * - Floating button (purple/dark theme, distinct from orange inquiry button)
 * - Expandable chat window with message history
 * - Typing indicator while AI is thinking
 * - Quick action bar: "Quick Inquiry" and "WhatsApp Contact"
 * - Full i18n support (5 languages) and RTL layout
 * - Responsive: full-width minus padding on mobile, fixed 420px on desktop
 */

import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Fab,
  TextField,
  IconButton,
  Box,
  Typography,
  keyframes,
  useMediaQuery,
  useTheme,
  Divider,
  Button,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import { useLanguage } from '../i18n/LanguageContext';
import { buildWhatsAppLinkForLang } from '../utils/whatsapp';

/** Pulse animation for the floating chat button. */
const pulseChat = keyframes`
  0%, 100% { box-shadow: 0 4px 20px rgba(103,58,183,0.35); }
  50% { box-shadow: 0 4px 30px rgba(103,58,183,0.6); }
`;

/** Slide-up entrance for the chat panel. */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/** Bounce animation for the typing indicator dots. */
const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

/** Chat message structure. */
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/** Generate a unique ID for each message. */
function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Typing indicator — three bouncing dots shown while AI is processing.
 */
function TypingIndicator(): JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 2,
        py: 1.5,
        backgroundColor: '#f5f5f5',
        borderRadius: 2,
        maxWidth: '80%',
        alignSelf: 'flex-start',
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 8,
            backgroundColor: '#999',
            borderRadius: '50%',
            animation: `${bounce} 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </Box>
  );
}

/**
 * Floating AI Chat Widget — fixed at the bottom corner of the page.
 * Opens a chat-style floating window with message history and quick actions.
 * Hidden on /contact and /admin routes (same as FloatingInquiry).
 */
function AiChatWidget(): JSX.Element | null {
  const { t, lang, isRTL } = useLanguage();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State
  const [open, setOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [lastFailedInput, setLastFailedInput] = useState<string>('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef<boolean>(false);

  // Hide on /contact and /admin routes
  const shouldHide = location.pathname === '/contact' || location.pathname.startsWith('/admin');
  if (shouldHide) return null;

  // Add welcome message on first open
  useEffect(() => {
    if (open && !initializedRef.current) {
      initializedRef.current = true;
      setMessages([
        {
          id: generateMessageId(),
          role: 'assistant',
          content: t('aiChat.welcome'),
          timestamp: Date.now(),
        },
      ]);
    }
  }, [open, t]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      // Small delay to allow animation to complete
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  /** Send a message to the AI chat API. */
  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setError(false);

    // Build the conversation history for the API (only include user/assistant messages)
    const apiMessages = [...messages, userMessage]
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, lang }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.reply || t('aiChat.error'),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setError(true);
      setLastFailedInput(text.trim());
    } finally {
      setLoading(false);
    }
  }, [messages, lang, loading, t]);

  /** Retry the last failed message. */
  const handleRetry = useCallback((): void => {
    if (lastFailedInput) {
      // Remove the failed user message from history
      setMessages((prev) => prev.filter((m) => m.content !== lastFailedInput || m.role !== 'user'));
      setError(false);
      sendMessage(lastFailedInput);
    }
  }, [lastFailedInput, sendMessage]);

  /** Handle form submission. */
  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();
    sendMessage(inputText);
  };

  /** Handle "Quick Inquiry" — transfer chat content to the inquiry form. */
  const handleQuickInquiry = useCallback((): void => {
    // Build a summary of the chat for the inquiry message field
    const chatSummary = messages
      .map((m) => `${m.role === 'user' ? 'Customer' : 'AI'}: ${m.content}`)
      .join('\n');

    // Store the chat summary in sessionStorage so FloatingInquiry can pick it up
    sessionStorage.setItem('aiChatInquiryMessage', chatSummary);

    // Close the chat window and open the inquiry form
    setOpen(false);

    // Dispatch a custom event to trigger the inquiry form to open
    window.dispatchEvent(new CustomEvent('openInquiryFromChat'));
  }, [messages]);

  /** Open/close handlers. */
  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  /** WhatsApp link for the current language. */
  const whatsappLink = buildWhatsAppLinkForLang(lang);

  return (
    <>
      {/* Floating AI chat button — extended Fab with label, hidden when chat is open */}
      {!open && (
        <Fab
          variant="extended"
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: 80,
            [isRTL ? 'left' : 'right']: 24,
            zIndex: 1350,
            backgroundColor: '#673ab7',
            color: '#fff',
            animation: `${pulseChat} 2s ease-in-out infinite`,
            '&:hover': {
              backgroundColor: '#5e35b1',
              animation: 'none',
              transform: 'scale(1.05)',
            },
            transition: 'transform 0.2s ease',
            boxShadow: '0 4px 16px rgba(103,58,183,0.4)',
            px: 2,
            py: 0.5,
            gap: 1,
            fontSize: '0.8rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          <SmartToyIcon sx={{ fontSize: 20 }} />
          {t('aiChat.fabLabel')}
        </Fab>
      )}

      {/* Chat panel — floating window */}
      <Box
        sx={{
          position: 'fixed',
          [isRTL ? 'left' : 'right']: 20,
          bottom: 80,
          zIndex: 1400,
          display: open ? 'block' : 'none',
        }}
      >
        <Box
          sx={{
            width: { xs: 'calc(100vw - 40px)', sm: '420px' },
            maxHeight: '60vh',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            animation: `${slideUp} 0.25s ease-out`,
            fontFamily: (theme) => theme.typography.fontFamily,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header bar */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #673ab7 0%, #5e35b1 100%)',
              color: '#fff',
              px: 2.5,
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToyIcon sx={{ fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {t('aiChat.title')}
              </Typography>
            </Box>
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#fff' } }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Messages area */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              minHeight: 200,
              maxHeight: 'calc(60vh - 140px)',
              backgroundColor: '#fafafa',
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  maxWidth: '80%',
                  alignSelf: msg.role === 'user' ? (isRTL ? 'flex-start' : 'flex-end') : (isRTL ? 'flex-end' : 'flex-start'),
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  backgroundColor: msg.role === 'user' ? '#1a237e' : '#f5f5f5',
                  color: msg.role === 'user' ? '#fff' : '#333',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                  boxShadow: msg.role === 'user'
                    ? '0 2px 8px rgba(26,35,126,0.2)'
                    : '0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
                {msg.content}
              </Box>
            ))}

            {/* Typing indicator */}
            {loading && <TypingIndicator />}

            {/* Error message with retry button */}
            {error && (
              <Box
                sx={{
                  alignSelf: 'center',
                  textAlign: 'center',
                  py: 1,
                }}
              >
                <Typography variant="body2" color="error" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                  {t('aiChat.error')}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={handleRetry}
                  sx={{ fontSize: '0.75rem' }}
                >
                  {t('aiChat.errorRetry')}
                </Button>
              </Box>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick action bar */}
          <Box
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              gap: 1,
              justifyContent: 'center',
            }}
          >
            <Button
              size="small"
              variant="outlined"
              startIcon={<EmailIcon sx={{ fontSize: 16 }} />}
              onClick={handleQuickInquiry}
              sx={{
                fontSize: '0.75rem',
                borderColor: '#1a237e',
                color: '#1a237e',
                '&:hover': {
                  borderColor: '#0d1642',
                  backgroundColor: 'rgba(26,35,126,0.04)',
                },
              }}
            >
              {t('aiChat.quickInquiry')}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<WhatsAppIcon sx={{ fontSize: 16 }} />}
              component="a"
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: '0.75rem',
                borderColor: '#25d366',
                color: '#25d366',
                '&:hover': {
                  borderColor: '#1da851',
                  backgroundColor: 'rgba(37,211,102,0.04)',
                },
              }}
            >
              {t('aiChat.whatsapp')}
            </Button>
          </Box>

          <Divider />

          {/* Input area */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              backgroundColor: '#fff',
            }}
          >
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder={t('aiChat.placeholder')}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              inputRef={inputRef}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.85rem',
                },
              }}
            />
            <IconButton
              type="submit"
              disabled={!inputText.trim() || loading}
              sx={{
                backgroundColor: inputText.trim() && !loading ? '#673ab7' : 'transparent',
                color: inputText.trim() && !loading ? '#fff' : '#999',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: inputText.trim() && !loading ? '#5e35b1' : 'transparent',
                },
                transition: 'background-color 0.2s ease',
              }}
            >
              <SendIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default AiChatWidget;
