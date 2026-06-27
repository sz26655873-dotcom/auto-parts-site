/**
 * BulkUpload v2 — 极简批量上传，AI全自动补齐
 *
 * Workflow:
 * 1. 用户下载 CSV 模版（或直接粘贴产品名称）
 * 2. 只需填写：产品名称 + 产品图片 URL（主图必填，其余可选）
 * 3. 上传/解析后，点击"AI一键补齐全部"
 * 4. AI 自动识别：品牌、车型、年份、零件类别、OEM号
 * 5. AI 自动生成：描述(4语言)、SEO标题/描述/关键词、适用车型列表
 * 6. 用户确认无误后，点击"全部发布"
 */

import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  TextField,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Snackbar,
  Divider,
  Tooltip,
  Avatar,
  IconButton,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { useAdminData } from './AdminDataContext';
import { productCategories, type Product, type ApplicableModel, type LocalizedString } from '../data/products';
import { emptyLocalizedString, getAuthToken } from './adminStorage';
import { generateSlug } from '../utils/slug';
import { useLanguage } from '../i18n/LanguageContext';

// ──────────────────── 类型定义 ────────────────────

/** CSV 模版列头 — 用户只需填这 6 列 */
const TEMPLATE_HEADERS = [
  '产品名称*',       // 必填：如 "BMW X6 G06 前保险杠总成"
  '主图URL*',        // 必填：产品主图链接
  '图片2',           // 可选
  '图片3',           // 可选
  '图片4',           // 可选
  '图片5',           // 可选
];

type BatchStatus = 'pending' | 'processing' | 'done' | 'error';

interface BatchProduct {
  id: number;
  name: LocalizedString;
  images: string[];
  category: string;
  model: string;
  oemNumber: string;
  description: LocalizedString;
  metaTitle: LocalizedString | undefined;
  metaDescription: LocalizedString | undefined;
  applicableModels: ApplicableModel[];
  status: BatchStatus;
  errorMsg?: string;
  sortOrder?: number;
}

// ──────────────────── CSV 模版下载 ───────────────────

function downloadTemplate(): void {
  const csv = [
    TEMPLATE_HEADERS.join(','),
    'BMW X6 G06 前保险杠总成带漆,https://example.com/bmw-x6-bumper-1.jpg,,,,,',
    'Mercedes W213 E级 前大灯LED,https://example.com/w213-headlight.jpg,https://example.com/w213-headlight-2.jpg,,,',
    'Audi Q7 后保险杠总成,https://example.com/q7-rear-bumper.jpg,,,,',
  ].join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'altai-batch-upload.csv';
  link.click();
  URL.revokeObjectURL(url);
}

// ──────────────────── CSV 解析 ───────────────────

function parseCsv(csvText: string): Array<{ name: string; images: string[] }> {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const results: Array<{ name: string; images: string[] }> = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(',').map((c) => c.trim());
    if (!cols[0]) continue;

    results.push({
      name: cols[0],
      images: [cols[1], cols[2], cols[3], cols[4], cols[5]].filter(Boolean),
    });
  }
  return results;
}

// ──────────────────── 主组件 ───────────────────

function BulkUpload(): JSX.Element {
  const { lang } = useLanguage();
  const { products, updateProducts } = useAdminData();

  const [textInput, setTextInput] = useState('');
  const [batchProducts, setBatchProducts] = useState<BatchProduct[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editableCategories = productCategories.filter((c) => c.id !== 'all');

  /** 解析粘贴文本（每行一个产品名）*/
  const handleParseText = (): void => {
    setError('');
    const lines = textInput.trim().split('\n').filter((l) => l.trim());
    if (lines.length === 0) {
      setError('请输入至少一个产品名称');
      return;
    }

    const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
    const maxSort = products.reduce((max, p) => Math.max(max, p.sortOrder ?? 0), 0);
    const batch: BatchProduct[] = lines.map((line, i) => ({
      id: maxId + i + 1,
      name: { zh: line.trim(), en: '', ru: '', ar: '', ko: '' },
      images: [],
      category: '',
      model: '',
      oemNumber: '',
      description: emptyLocalizedString(),
      metaTitle: undefined,
      metaDescription: undefined,
      applicableModels: [],
      status: 'pending' as BatchStatus,
      sortOrder: maxSort + i + 1,
    }));
    setBatchProducts(batch);
    setSnackbar({ open: true, message: `已解析 ${batch.length} 个产品`, severity: 'success' });
  };

  /** 处理 CSV 文件上传 */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      const parsed = parseCsv(csvText);
      if (parsed.length === 0) {
        setError('CSV 文件为空或格式不正确');
        return;
      }

      const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
      const maxSort = products.reduce((max, p) => Math.max(max, p.sortOrder ?? 0), 0);
      const batch: BatchProduct[] = parsed.map((p, i) => ({
        id: maxId + i + 1,
        name: { zh: p.name, en: p.name, ru: '', ar: '', ko: '' },
        images: p.images,
        category: '',
        model: '',
        oemNumber: '',
        description: emptyLocalizedString(),
        metaTitle: undefined,
        metaDescription: undefined,
        applicableModels: [],
        status: 'pending' as BatchStatus,
        sortOrder: maxSort + i + 1,
      }));
      setBatchProducts(batch);
      setSnackbar({
        open: true,
        message: `已导入 ${batch.length} 个产品（${batch.filter(b => b.images.length > 0).length} 个有图片）`,
        severity: 'success',
      });
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  /** AI 全自动补齐单个产品 */
  const aiGenerateForProduct = async (product: BatchProduct, token: string): Promise<Partial<BatchProduct>> => {
    const productInfo = {
      model: product.model || '',
      category: product.category || '',
      name: product.name,
      oemNumber: product.oemNumber || '',
      specifications: {},
      applicableModels: [],
      description: {},
      images: product.images,
    };

    const apiCall = async (field: string) => {
      const res = await fetch('/api/ai/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ field, productInfo }),
      });
      if (!res.ok) throw new Error(`AI ${field} failed: HTTP ${res.status}`);
      return res.json();
    };

    const [descData, titleData, metaDescData, modelsData] = await Promise.all([
      apiCall('description'),
      apiCall('metaTitle'),
      apiCall('metaDescription'),
      apiCall('applicableModels'),
    ]);

    return {
      description: descData.text || emptyLocalizedString(),
      metaTitle: titleData.text || undefined,
      metaDescription: metaDescData.text || undefined,
      applicableModels: (modelsData.models || []) as ApplicableModel[],
    };
  };

  /** 批量 AI 处理 */
  const handleAiProcessAll = async (): Promise<void> => {
    if (batchProducts.length === 0) return;
    const token = getAuthToken();
    if (!token) {
      setError('未登录，请刷新页面重试');
      return;
    }

    setProcessing(true);
    setError('');
    setProgress({ current: 0, total: batchProducts.length });

    const updated = [...batchProducts];

    for (let i = 0; i < updated.length; i++) {
      setProgress({ current: i + 1, total: updated.length });

      if (updated[i].status === 'done') continue;

      updated[i].status = 'processing';
      setBatchProducts([...updated]);

      try {
        const generated = await aiGenerateForProduct(updated[i], token);
        updated[i] = {
          ...updated[i],
          ...generated,
          status: 'done',
        };
      } catch (err: any) {
        updated[i].status = 'error';
        updated[i].errorMsg = err.message || 'AI 处理失败';
      }
      setBatchProducts([...updated]);
    }

    const doneCount = updated.filter((p) => p.status === 'done').length;
    const errorCount = updated.filter((p) => p.status === 'error').length;

    setSnackbar({
      open: true,
      message: `AI 处理完成：${doneCount} 成功${errorCount > 0 ? `，${errorCount} 失败` : ''}`,
      severity: errorCount > 0 ? 'error' : 'success',
    });
    setProcessing(false);
  };

  /** 一键保存全部 */
  const handleSaveAll = async (): Promise<void> => {
    const toSave = batchProducts.filter((p) => p.status === 'done');
    if (toSave.length === 0) {
      setError('没有可保存的产品（请先点击「AI 一键补齐全部」）');
      return;
    }

    const newProducts: Product[] = toSave.map((bp) => ({
      id: bp.id,
      model: bp.model || bp.name.en,
      category: bp.category || 'bmw',
      image: bp.images[0] || '',
      images: bp.images.slice(1).filter(Boolean),
      name: bp.name,
      description: bp.description,
      slug: generateSlug(bp.category || 'bmw', bp.model || bp.name.en || bp.name.zh),
      oemNumber: bp.oemNumber || '',
      applicableModels: bp.applicableModels,
      specifications: {},
      metaTitle: bp.metaTitle,
      metaDescription: bp.metaDescription,
      featured: false,
      sortOrder: bp.sortOrder ?? 0,
    }));

    try {
      await updateProducts([...products, ...newProducts]);
      setSnackbar({ open: true, message: `${newProducts.length} 个产品已成功发布！`, severity: 'success' });
      setBatchProducts([]);
      setTextInput('');
    } catch (err: any) {
      setError('保存失败: ' + (err.message || '未知错误'));
    }
  };

  const doneCount = batchProducts.filter((p) => p.status === 'done').length;
  const errorCount = batchProducts.filter((p) => p.status === 'error').length;

  return (
    <Box>
      {/* 标题 */}
      <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
        批量添加产品
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        只需填写<strong>产品名称</strong>和<strong>产品图片</strong>，其余全部由 AI 自动补齐。
        适用车型、多语言描述、SEO 信息一键搞定。
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* ═══════ 第一步：输入 ═══════ */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{
            width: 28, height: 28, borderRadius: '50%', bgcolor: 'primary.main',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 800, mr: 1,
          }}>1</Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            输入产品信息（只需产品名 + 图片）
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadTemplate}>
            下载 CSV 模版
          </Button>
          <Button variant="outlined" startIcon={<UploadFileIcon />}
            onClick={() => fileInputRef.current?.click()}>
            上传 CSV 文件
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv"
            onChange={handleFileUpload} style={{ display: 'none' }} />
        </Stack>

        <Divider sx={{ my: 2 }}>
          <Chip label="或直接粘贴产品名称（每行一个）" size="small" icon={<PhotoLibraryIcon />} />
        </Divider>

        <TextField fullWidth multiline rows={5}
          placeholder={
            '每行输入一个产品名称，例如：\n\n' +
            'BMW X6 G06 前保险杠总成 带漆\n' +
            'Mercedes W213 E级 LED前大灯\n' +
            'Audi Q7 后保险杠总成\n' +
            'Porsche Cayenne 前进气格栅\n' +
            'Land Rover Range Rover 运动版侧裙'
          }
          value={textInput} onChange={(e) => setTextInput(e.target.value)} sx={{ mb: 2 }} />

        <Button variant="contained" onClick={handleParseText} disabled={!textInput.trim()}>
          解析产品列表
        </Button>
      </Paper>

      {/* ═══════ 第二步：AI 补齐 + 发布 ═══════ */}
      {batchProducts.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center">
              <Box sx={{
                width: 28, height: 28, borderRadius: '50%', bgcolor: 'secondary.main',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 800, mr: 1,
              }}>2</Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                AI 一键补齐 ({batchProducts.length} 个产品)
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
              {processing && (
                <Chip icon={<CircularProgress size={16} />} label={`${progress.current}/${progress.total}`} color="primary" size="small" />
              )}
              <Button variant="contained" color="secondary" size="large"
                startIcon={processing ? <CircularProgress size={18} color="inherit" /> : <AutoFixHighIcon />}
                onClick={handleAiProcessAll}
                disabled={processing || batchProducts.every(p => p.status === 'done')}
                sx={{ fontWeight: 700, px: 3 }}>
                {processing ? 'AI 处理中...' : '⚡ AI 一键补齐全部'}
              </Button>
              <Button variant="contained" size="large" startIcon={<SaveIcon />}
                onClick={handleSaveAll} disabled={doneCount === 0 || processing}
                sx={{ fontWeight: 700, px: 3 }}>
                全部发布 ({doneCount})
              </Button>
            </Stack>
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#061629' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, width: 50 }}>#</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>产品名称</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, width: 80 }}>图片</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, width: 90 }}>品牌</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, width: 80 }}>车型</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>描述预览</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, width: 60 }}>状态</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batchProducts.map((bp, i) => (
                  <TableRow key={bp.id} hover sx={{ '&:hover': { backgroundColor: '#f0f7ff' } }}>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{i + 1}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{bp.name.zh}</Typography>
                      {bp.oemNumber && (
                        <Tooltip title={`OEM: ${bp.oemNumber}`}>
                          <Chip label={bp.oemNumber} size="small" variant="outlined"
                            sx={{ mt: 0.5, fontSize: '0.65rem', height: 20 }} />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      {bp.images.length > 0 ? (
                        <Avatar src={bp.images[0]} variant="rounded"
                          sx={{ width: 48, height: 48, cursor: 'pointer' }}
                          onClick={() => window.open(bp.images[0], '_blank')}>
                          <PhotoLibraryIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                      ) : (
                        <Tooltip title="暂无图片">
                          <IconButton size="small" disabled>
                            <PhotoLibraryIcon sx={{ fontSize: 20, color: '#ccc' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {bp.images.length > 1 && (
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.secondary' }}>
                          +{bp.images.length - 1}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {bp.category ? (
                        <Chip label={(editableCategories.find(c => c.id === bp.category)?.label[lang] || bp.category).toUpperCase()}
                          size="small" sx={{ bgcolor: 'primary.light', color: '#fff', fontSize: '0.65rem', fontWeight: 700, height: 22 }} />
                      ) : (
                        <Typography variant="caption" sx={{ color: '#999' }}>待识别</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                        {bp.model || <span style={{ color: '#999' }}>—</span>}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden', maxWidth: 280,
                      }}>
                        {bp.description.zh || <span style={{ color: '#999' }}>等待 AI...</span>}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {bp.status === 'pending' && <Tooltip title="等待处理"><PendingIcon color="disabled" fontSize="small" /></Tooltip>}
                      {bp.status === 'processing' && <CircularProgress size={18} />}
                      {bp.status === 'done' && <Tooltip title="完成"><CheckCircleIcon color="success" fontSize="small" /></Tooltip>}
                      {bp.status === 'error' && <Tooltip title={bp.errorMsg}><ErrorIcon color="error" fontSize="small" /></Tooltip>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {errorCount > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {errorCount} 个产品处理失败 — 点击「AI 一键补齐全部」重试
            </Alert>
          )}
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}

export default BulkUpload;