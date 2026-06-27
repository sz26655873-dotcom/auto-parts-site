/**
 * Data management page — import, export, reset, and migrate admin data.
 *
 * All operations are now async (calling KV API endpoints).
 * Displays "云端数据库 (Cloudflare KV)" as the storage location.
 * Includes a data migration section for legacy localStorage → KV transfer.
 */

import { useRef, useState, type ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  CircularProgress,
  Chip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAdminData } from './AdminDataContext';
import { CURRENT_DATA_VERSION } from './adminStorage';

/**
 * Data management page with export, import, reset, and migration features.
 */
function DataManager(): JSX.Element {
  const {
    exportAllData,
    importAllData,
    resetAllData,
    dataVersion,
    lastModified,
    hasLegacyLocalStorageData,
    migrateLegacyData,
  } = useAdminData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetOpen, setResetOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [importLoading, setImportLoading] = useState<boolean>(false);
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [migrateLoading, setMigrateLoading] = useState<boolean>(false);
  const [migrateDone, setMigrateDone] = useState<boolean>(false);

  /** Triggers a JSON file download. */
  const handleExport = async (): Promise<void> => {
    setExportLoading(true);
    try {
      const json = await exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autoparts-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: '数据导出成功！' });
    } catch (err: any) {
      setMessage({ type: 'error', text: '导出失败: ' + (err.message || '未知错误') });
    } finally {
      setExportLoading(false);
    }
  };

  /** Opens the file picker for import. */
  const handleImportClick = (): void => {
    fileInputRef.current?.click();
  };

  /** Reads and imports the selected JSON file. */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    const reader = new FileReader();
    reader.onload = async (e): Promise<void> => {
      const text = e.target?.result as string;
      try {
        const success = await importAllData(text);
        if (success) {
          setMessage({ type: 'success', text: '数据导入成功！所有更改已生效。' });
        } else {
          setMessage({ type: 'error', text: '数据导入失败。文件格式无效或已损坏。' });
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: '导入失败: ' + (err.message || '未知错误') });
      } finally {
        setImportLoading(false);
      }
    };
    reader.onerror = (): void => {
      setMessage({ type: 'error', text: '读取文件失败，请重试。' });
      setImportLoading(false);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  /** Confirms the reset action. */
  const handleResetConfirm = async (): Promise<void> => {
    setResetLoading(true);
    try {
      await resetAllData();
      setResetOpen(false);
      setMessage({ type: 'success', text: '所有数据已恢复为默认值。' });
    } catch (err: any) {
      setMessage({ type: 'error', text: '重置失败: ' + (err.message || '未知错误') });
    } finally {
      setResetLoading(false);
    }
  };

  /** Migrates legacy localStorage data to KV. */
  const handleMigrate = async (): Promise<void> => {
    setMigrateLoading(true);
    try {
      const success = await migrateLegacyData();
      if (success) {
        setMigrateDone(true);
        setMessage({ type: 'success', text: '数据迁移成功！本地数据已上传到云端。' });
      } else {
        setMessage({ type: 'error', text: '迁移失败，请稍后重试。' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: '迁移失败: ' + (err.message || '未知错误') });
    } finally {
      setMigrateLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
        数据管理
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        导出、导入、重置或迁移所有后台管理数据。数据存储在云端数据库 (Cloudflare KV)。
      </Typography>

      {/* Data info */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography variant="overline" color="text.secondary">
              数据版本
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              v{dataVersion}
              {dataVersion < CURRENT_DATA_VERSION && (
                <Typography component="span" variant="caption" color="warning.main" sx={{ ml: 1 }}>
                  （需更新）
                </Typography>
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="overline" color="text.secondary">
              最后修改
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {lastModified
                ? new Date(lastModified).toLocaleString()
                : '从未（使用默认值）'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="overline" color="text.secondary">
              存储位置
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              云端数据库 (Cloudflare KV)
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Export */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DownloadIcon color="primary" /> 导出数据
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          下载所有产品、联系方式和公司信息的 JSON 文件。可用于备份或迁移。
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={exportLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          onClick={handleExport}
          disabled={exportLoading}
        >
          {exportLoading ? '导出中...' : '导出为 JSON'}
        </Button>
      </Paper>

      {/* Import */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadIcon color="primary" /> 导入数据
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          上传之前导出的 JSON 文件来恢复数据。这将覆盖所有当前后台数据。
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={importLoading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
          onClick={handleImportClick}
          disabled={importLoading}
        >
          {importLoading ? '导入中...' : '选择 JSON 文件'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </Paper>

      {/* Data Migration */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderColor: hasLegacyLocalStorageData ? 'warning.main' : 'success.light' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudSyncIcon color={migrateDone ? 'success' : hasLegacyLocalStorageData ? 'warning' : 'success'} /> 数据迁移
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          将浏览器本地存储中的旧数据迁移到云端数据库 (Cloudflare KV)。
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          {migrateDone || !hasLegacyLocalStorageData ? (
            <Chip
              icon={<CheckCircleIcon />}
              label="已迁移 / 无旧数据"
              color="success"
              variant="outlined"
            />
          ) : (
            <Chip
              label="存在旧数据，待迁移"
              color="warning"
              variant="outlined"
            />
          )}
        </Stack>
        {!migrateDone && hasLegacyLocalStorageData && (
          <Button
            variant="contained"
            color="warning"
            startIcon={migrateLoading ? <CircularProgress size={20} color="inherit" /> : <CloudSyncIcon />}
            onClick={handleMigrate}
            disabled={migrateLoading}
          >
            {migrateLoading ? '迁移中...' : '迁移本地数据到云端'}
          </Button>
        )}
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Reset */}
      <Paper variant="outlined" sx={{ p: 3, borderColor: 'error.light' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <RestartAltIcon /> 重置数据
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          清除云端数据库中的所有后台数据并恢复为代码默认值。此操作无法撤销。
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={resetLoading ? <CircularProgress size={20} color="inherit" /> : <RestartAltIcon />}
          onClick={() => setResetOpen(true)}
          disabled={resetLoading}
        >
          恢复默认值
        </Button>
      </Paper>

      {/* Reset confirmation dialog */}
      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>确认重置</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            定要将所有数据恢复为默认值吗？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            所有产品、联系方式和公司信息将恢复为初始数据。此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setResetOpen(false)} color="inherit">
            取消
          </Button>
          <Button
            onClick={handleResetConfirm}
            variant="contained"
            color="error"
            disabled={resetLoading}
            startIcon={resetLoading ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {resetLoading ? '重置中...' : '全部重置'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DataManager;
