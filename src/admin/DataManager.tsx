/**
 * Data management page — import, export, and reset admin data.
 *
 * Provides buttons to export all admin data as a downloadable JSON file,
 * import data from an uploaded JSON file, and reset all data to code
 * defaults. Also displays the current data version and last modification
 * timestamp.
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
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAdminData } from './AdminDataContext';
import { CURRENT_DATA_VERSION } from './adminStorage';

/**
 * Data management page with export, import, and reset functionality.
 */
function DataManager(): JSX.Element {
  const { exportAllData, importAllData, resetAllData, dataVersion, lastModified } = useAdminData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetOpen, setResetOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /** Triggers a JSON file download. */
  const handleExport = (): void => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autoparts-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Data exported successfully!' });
  };

  /** Opens the file picker for import. */
  const handleImportClick = (): void => {
    fileInputRef.current?.click();
  };

  /** Reads and imports the selected JSON file. */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e): void => {
      const text = e.target?.result as string;
      const success = importAllData(text);
      if (success) {
        setMessage({ type: 'success', text: 'Data imported successfully! All changes are now live.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to import data. The file format is invalid or corrupted.' });
      }
    };
    reader.onerror = (): void => {
      setMessage({ type: 'error', text: 'Failed to read the file. Please try again.' });
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  /** Confirms the reset action. */
  const handleResetConfirm = (): void => {
    resetAllData();
    setResetOpen(false);
    setMessage({ type: 'success', text: 'All data has been reset to defaults.' });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
        Data Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Export, import, or reset all admin-managed data. Exported JSON files can be used as backups or transferred between environments.
      </Typography>

      {/* Data info */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography variant="overline" color="text.secondary">
              Data Version
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              v{dataVersion}
              {dataVersion < CURRENT_DATA_VERSION && (
                <Typography component="span" variant="caption" color="warning.main" sx={{ ml: 1 }}>
                  (outdated)
                </Typography>
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="overline" color="text.secondary">
              Last Modified
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {lastModified
                ? new Date(lastModified).toLocaleString()
                : 'Never (using defaults)'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="overline" color="text.secondary">
              Storage
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Browser localStorage
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
          <DownloadIcon color="primary" /> Export Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Download all products, contact info, and company info as a JSON file. Use this for backups or migration.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export to JSON
        </Button>
      </Paper>

      {/* Import */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadIcon color="primary" /> Import Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload a previously exported JSON file to restore data. This will overwrite all current admin data.
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<UploadIcon />}
          onClick={handleImportClick}
        >
          Choose JSON File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Reset */}
      <Paper variant="outlined" sx={{ p: 3, borderColor: 'error.light' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <RestartAltIcon /> Reset Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Remove all admin data from localStorage and revert to the original code defaults. This action cannot be undone.
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<RestartAltIcon />}
          onClick={() => setResetOpen(true)}
        >
          Reset to Defaults
        </Button>
      </Paper>

      {/* Reset confirmation dialog */}
      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Reset</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to reset all data to defaults?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            All products, contact info, and company info will be reverted to the original seed data. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setResetOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleResetConfirm} variant="contained" color="error">
            Reset Everything
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DataManager;
