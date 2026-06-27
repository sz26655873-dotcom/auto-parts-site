/**
 * Inquiry Manager — admin page to view and manage visitor inquiries.
 *
 * Fetches all inquiries from /api/inquiries (requires admin auth).
 * Displays a table with: status, name, phone, email, message, country (flag), timestamp.
 * Supports: mark as read/unread, delete, refresh.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import { getAuthToken } from './adminStorage';
import { formatCountry } from '../utils/countryCodes';

/** Inquiry data structure (matches server-side StoredInquiry). */
interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  country: string;
  countryCode: string;
  ip: string;
  timestamp: string;
  status: 'new' | 'read';
}

/** Format ISO timestamp to readable date-time. */
function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/** Build WhatsApp link from a phone number. */
function whatsappLink(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleaned}`;
}

function InquiryManager(): JSX.Element {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Inquiry | null>(null);

  /** Fetch all inquiries from the API. */
  const fetchInquiries = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/inquiries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (err) {
      setError('获取询盘失败，请稍后重试');
      console.error('Fetch inquiries error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  /** Mark an inquiry as read or new. */
  const handleToggleStatus = async (inquiry: Inquiry): Promise<void> => {
    const newStatus = inquiry.status === 'new' ? 'read' : 'new';
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Update local state
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiry.id ? { ...i, status: newStatus } : i)),
      );
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  /** Delete an inquiry. */
  const handleDelete = async (inquiry: Inquiry): Promise<void> => {
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setInquiries((prev) => prev.filter((i) => i.id !== inquiry.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete inquiry error:', err);
    }
  };

  /** Open detail dialog and mark inquiry as read. */
  const handleOpenDetail = (inquiry: Inquiry): void => {
    setSelectedInquiry(inquiry);
    setDetailOpen(true);
    if (inquiry.status === 'new') {
      handleToggleStatus(inquiry);
    }
  };

  /** Stats. */
  const newCount = inquiries.filter((i) => i.status === 'new').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with stats and refresh */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            询盘管理
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            共 {inquiries.length} 条询盘
            {newCount > 0 && (
              <Chip
                label={`${newCount} 条新询盘`}
                color="error"
                size="small"
                sx={{ ml: 1.5 }}
              />
            )}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchInquiries}
          size="small"
        >
          刷新
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {inquiries.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            暂无询盘记录
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            当访客在网站上提交询价表单后，询盘会显示在这里
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell width={50}>状态</TableCell>
                <TableCell>姓名</TableCell>
                <TableCell>电话</TableCell>
                <TableCell>邮箱</TableCell>
                <TableCell>国家</TableCell>
                <TableCell>需求摘要</TableCell>
                <TableCell>时间</TableCell>
                <TableCell width={120}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inquiries.map((inquiry) => (
                <TableRow
                  key={inquiry.id}
                  hover
                  onClick={() => handleOpenDetail(inquiry)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    {inquiry.status === 'new' ? (
                      <Chip label="新" color="error" size="small" />
                    ) : (
                      <Chip label="已读" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: inquiry.status === 'new' ? 700 : 400 }}>
                    {inquiry.name}
                  </TableCell>
                  <TableCell>{inquiry.phone}</TableCell>
                  <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inquiry.email}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={`IP: ${inquiry.ip}`}>
                      <span>{formatCountry(inquiry.countryCode)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inquiry.message}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'text.secondary' }}>
                    {formatTime(inquiry.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title={inquiry.status === 'new' ? '标记已读' : '标记未读'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(inquiry)}
                        >
                          {inquiry.status === 'new' ? (
                            <MarkEmailReadIcon fontSize="small" />
                          ) : (
                            <MarkEmailUnreadIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="删除">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteConfirm(inquiry)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedInquiry && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              询盘详情
              {selectedInquiry.status === 'new' && (
                <Chip label="新" color="error" size="small" />
              )}
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="overline" color="text.secondary">姓名</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedInquiry.name}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={4}>
                  <Box>
                    <Typography variant="overline" color="text.secondary">电话</Typography>
                    <Typography variant="body1">{selectedInquiry.phone}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="overline" color="text.secondary">邮箱</Typography>
                    <Typography variant="body1">{selectedInquiry.email}</Typography>
                  </Box>
                </Stack>
                <Box>
                  <Typography variant="overline" color="text.secondary">国家 / 地区</Typography>
                  <Typography variant="body1">
                    {formatCountry(selectedInquiry.countryCode)}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      (IP: {selectedInquiry.ip})
                    </Typography>
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">产品需求</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                    {selectedInquiry.message}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">提交时间</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatTime(selectedInquiry.timestamp)}
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                startIcon={<WhatsAppIcon />}
                color="success"
                variant="contained"
                href={whatsappLink(selectedInquiry.phone)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp 联系
              </Button>
              <Button
                startIcon={<EmailIcon />}
                variant="outlined"
                href={`mailto:${selectedInquiry.email}`}
              >
                发邮件
              </Button>
              <Button onClick={() => setDetailOpen(false)}>关闭</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>确认删除？</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除来自 <strong>{deleteConfirm?.name}</strong> 的询盘吗？此操作不可恢复。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>取消</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InquiryManager;
