/**
 * MultiImageGallery — manages up to 5 product images.
 *
 * Features:
 * - Upload images to Cloudflare R2 (reuses r2Upload service)
 * - Set primary image (first image = primary, shown with ★ badge)
 * - Reorder images (← → buttons)
 * - Delete individual images
 * - Max 5 images enforced
 */

import { useState, useRef, type ChangeEvent } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  IconButton,
  Chip,
  Tooltip,
  Stack,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import DeleteIcon from '@mui/icons-material/Delete';
import { uploadImageToR2 } from './r2Upload';

interface MultiImageGalleryProps {
  /** Current array of image URLs (primary = index 0). */
  images: string[];
  /** Called when the images array changes. */
  onChange: (images: string[]) => void;
}

/** Max number of images a product can have. */
const MAX_IMAGES = 5;

function MultiImageGallery({ images, onChange }: MultiImageGalleryProps): JSX.Element {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isAtMax = images.length >= MAX_IMAGES;

  /** Opens the file picker. */
  const handlePick = (): void => {
    if (isAtMax) return;
    inputRef.current?.click();
  };

  /** Handles file selection → compress → upload → append to array. */
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件（支持 JPG、PNG、WebP 等格式）');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('文件过大（>5MB），请先压缩后再上传');
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      const result = await uploadImageToR2(file, (pct) => setProgress(pct));
      onChange([...images, result.url]);
    } catch (err) {
      console.error('[MultiImageGallery] Upload failed:', err);
      setError(err instanceof Error ? err.message : '上传失败，请重试');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  /** Moves an image one position left (closer to primary). */
  const handleMoveLeft = (index: number): void => {
    if (index <= 0) return;
    const next = [...images];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  /** Moves an image one position right. */
  const handleMoveRight = (index: number): void => {
    if (index >= images.length - 1) return;
    const next = [...images];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  /** Sets an image as primary (moves to index 0). */
  const handleSetPrimary = (index: number): void => {
    if (index === 0 || index >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(index, 1);
    next.unshift(moved);
    onChange(next);
  };

  /** Removes an image at the given index. */
  const handleDelete = (index: number): void => {
    const next = images.filter((_, i) => i !== index);
    onChange(next);
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

      {/* Progress bar */}
      {uploading && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mt: 1, mb: 1.5, height: 6, borderRadius: 3 }}
        />
      )}

      {/* Error message */}
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          ⚠️ {error}
        </Typography>
      )}

      {/* Image rows */}
      {images.length > 0 && (
        <Stack spacing={1} sx={{ mb: 1.5 }}>
          {images.map((url, index) => (
            <Box
              key={`${url}-${index}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                border: '1px solid',
                borderColor: index === 0 ? 'primary.main' : 'divider',
                borderRadius: 2,
                bgcolor: index === 0 ? 'primary.50' : 'background.paper',
              }}
            >
              {/* Thumbnail */}
              <Box
                component="img"
                src={url}
                alt={`图片 ${index + 1}`}
                sx={{
                  width: 100,
                  height: 75,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  flexShrink: 0,
                }}
              />

              {/* Meta + controls */}
              <Stack direction="column" spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
                {/* Primary badge or set-primary button */}
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {index === 0 ? (
                    <Chip
                      icon={<StarIcon />}
                      label="主图"
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                  ) : (
                    <Tooltip title="设为主图">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<StarBorderIcon />}
                        onClick={() => handleSetPrimary(index)}
                        sx={{ fontSize: '0.7rem', py: 0.25, px: 1, minWidth: 'auto' }}
                      >
                        设为主图
                      </Button>
                    </Tooltip>
                  )}

                  {/* Image URL (truncated) */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      ml: 1,
                    }}
                  >
                    {url.length > 50 ? `${url.slice(0, 47)}...` : url}
                  </Typography>
                </Stack>
              </Stack>

              {/* Action buttons */}
              <Stack direction="row" spacing={0.25}>
                <Tooltip title={index === 0 ? '已是第一张' : '向左移动'}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveLeft(index)}
                      disabled={index === 0}
                      sx={{ color: 'text.secondary' }}
                    >
                      <ArrowLeftIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={index === images.length - 1 ? '已是最后一张' : '向右移动'}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveRight(index)}
                      disabled={index === images.length - 1}
                      sx={{ color: 'text.secondary' }}
                    >
                      <ArrowRightIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="删除此图片">
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(index)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      {/* Empty state */}
      {images.length === 0 && !uploading && (
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            color: 'text.secondary',
            mb: 1.5,
          }}
        >
          <Typography variant="body2">尚未上传产品图片</Typography>
        </Box>
      )}

      {/* Upload button */}
      <Button
        variant="outlined"
        startIcon={uploading ? undefined : <AddPhotoAlternateIcon />}
        onClick={handlePick}
        disabled={isAtMax || uploading}
        sx={{ fontSize: '0.8rem' }}
      >
        {uploading ? `上传中 ${progress}%` : isAtMax ? '已达上限 (5张)' : '上传图片'}
      </Button>

      {!isAtMax && (
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'inline' }}>
          {images.length}/{MAX_IMAGES} 张
        </Typography>
      )}
    </Box>
  );
}

export default MultiImageGallery;
