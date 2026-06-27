/**
 * ImageUpload — upload button + preview for R2 cloud storage.
 *
 * Renders an "Upload Image" button next to a text field. When clicked,
 * opens file picker → compresses → uploads to Cloudflare R2 → fills
 * in the URL field automatically.
 */

import { useState, useRef, type ChangeEvent } from 'react';
import { Button, Box, LinearProgress, Typography, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { compressImage, uploadImageToR2 } from './r2Upload';

interface ImageUploadProps {
  /** Current image URL (controlled). */
  value: string;
  /** Callback when URL changes. */
  onChange: (url: string) => void;
  /** Optional label for the text field. */
  label?: string;
}

function ImageUpload({ value, onChange, label = '图片链接' }: ImageUploadProps): JSX.Element {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [fileInfo, setFileInfo] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = (): void => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate it's an image
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件（支持 JPG、PNG、WebP 等格式）');
      return;
    }

    // Size check before compression (warn at >5MB original)
    if (file.size > 5 * 1024 * 1024) {
      setError('文件过大（>5MB），请先压缩后再上传');
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);
    setFileInfo('');

    try {
      // Show local preview immediately
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Compress & upload
      const result = await uploadImageToR2(file, (pct) => setProgress(pct));

      // Update parent with new URL
      onChange(result.url);

      setFileInfo(`${result.width}×${result.height} · ${(result.sizeBytes / 1024).toFixed(0)}KB`);
    } catch (err) {
      console.error('[ImageUpload] Upload failed:', err);
      setError(err instanceof Error ? err.message : '上传失败，请重试');
      setPreviewUrl('');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset so same file can be re-selected
    }
  };

  return (
    <Box>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Button row: text field + upload button */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 0.5 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {label}
          </Typography>
          <Box
            component="input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="粘贴图片链接或点击右侧按钮上传"
            disabled={uploading}
            sx={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '0.875rem',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              fontFamily: 'monospace',
              bgcolor: 'background.paper',
              '&:focus': {
                outline: 'none',
                borderColor: 'primary.main',
                boxShadow: '0 0 0 1px primary.main',
              },
              '&:disabled': {
                bgcolor: 'action.disabledBackground',
                cursor: 'not-allowed',
              },
            }}
          />
          {value && !uploading && (
            <Typography variant="caption" color="text.secondary">
              已设置图片链接
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={uploading ? undefined : <CloudUploadIcon />}
          onClick={handlePick}
          disabled={uploading}
          sx={{
            whiteSpace: 'nowrap',
            mt: uploading ? 3.25 : 0,
            minWidth: 110,
            height: 37,
          }}
        >
          {uploading ? `${progress}%` : '上传图片'}
        </Button>
      </Box>

      {/* Progress bar */}
      {uploading && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mt: 1, mb: 1, height: 6, borderRadius: 3 }}
        />
      )}

      /* Preview area */
      {(previewUrl || value) && !error && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <img
            src={previewUrl || value}
            alt="预览"
            style={{
              maxWidth: 200,
              maxHeight: 150,
              objectFit: 'contain',
              borderRadius: 8,
              border: '1px solid',
              borderColor: 'divider',
            }}
            onLoad={() => {
              if (previewUrl) URL.revokeObjectURL(previewUrl);
            }}
          />
          {fileInfo && (
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
              ✓ {fileInfo}
            </Typography>
          )}
        </Box>
      )}

      /* Error message */
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          ⚠️ {error}
        </Typography>
      )}
    </Box>
  );
}

export default ImageUpload;
