/**
 * BulkUpload — batch product creation with AI auto-fill.
 *
 * Workflow:
 * 1. User downloads a CSV template (or pastes product names directly)
 * 2. Fills in product names + categories
 * 3. Clicks "AI自动补齐全部"
 * 4. AI generates description, metaTitle, metaDescription, applicableModels for each product
 * 5. User reviews results and clicks "全部保存"
 * 6. Photos can be uploaded later via individual product editing
 */

import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import { useAdminData } from './AdminDataContext';
import { productCategories, type Product, type ApplicableModel, type LocalizedString } from '../data/products';
import { emptyLocalizedString, getAuthToken } from './adminStorage';
import { generateSlug } from '../utils/slug';
import { useLanguage } from '../i18n/LanguageContext';

/** CSV template columns */
const TEMPLATE_HEADERS = ['category', 'model', 'name_zh', 'name_en'];

/** Status of a batch product during AI processing */
type BatchStatus = 'pending' | 'processing' | 'done' | 'error';

/** A product in the batch queue with AI-generated content and status */
interface BatchProduct {
  id: number;
  category: string;
  model: string;
  name: LocalizedString;
  description: LocalizedString;
  metaTitle: LocalizedString | undefined;
  metaDescription: LocalizedString | undefined;
  applicableModels: ApplicableModel[];
  status: BatchStatus;
  errorMsg?: string;
}

/** Generates and downloads a CSV template file */
function downloadTemplate(): void {
  const csv = [
    TEMPLATE_HEADERS.join(','),
    'bmw,G06,BMW X6 前保险杠总成,BMW X6 Front Bumper Assembly G06',
    'bmw,G05,BMW X5 后尾灯总成,BMW X5 Tail Light Assembly G05',
    'mercedes,X253,奔驰GLC前保险杠,Mercedes GLC Front Bumper X253',
  ].join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'altai-products-template.csv';
  link.click();
  URL.revokeObjectURL(url);
}

/** Parses a CSV string into BatchProduct array */
function parseCsv(csvText: string): Array<{ category: string; model: string; name_zh: string; name_en: string }> {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Skip header row
  const results: Array<{ category: string; model: string; name_zh: string; name_en: string }> = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parse (handles commas, not quoted fields)
    const cols = line.split(',').map((c) => c.trim());
    if (cols.length < 1) continue;

    results.push({
      category: cols[0] || 'bmw',
      model: cols[1] || '',
      name_zh: cols[2] || '',
      name_en: cols[3] || cols[2] || '',
    });
  }
  return results;
}

function BulkUpload(): JSX.Element {
  const { lang } = useLanguage();
  const { products, updateProducts } = useAdminData();

  const [textInput, setTextInput] = useState('');
  const [defaultCategory, setDefaultCategory] = useState('bmw');
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

  /** Parse pasted text (one product per line: "name" or "category|model|name_zh|name_en") */
  const handleParseText = (): void => {
    setError('');
    const lines = textInput.trim().split('\n').filter((l) => l.trim());
    if (lines.length === 0) {
      setError('请输入至少一行产品名称');
      return;
    }

    const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
    const maxSort = products.reduce((max, p) => Math.max(max, p.sortOrder ?? 0), 0);
    const batch: BatchProduct[] = lines.map((line, i) => {
      const parts = line.split('|').map((p) => p.trim());
      const name = parts[0] || line.trim();
      return {
        id: maxId + i + 1,
        category: parts[1] || defaultCategory,
        model: parts[2] || '',
        name: { zh: name, en: parts[3] || name, ru: '', ar: '', ko: '' },
        description: emptyLocalizedString(),
        metaTitle: undefined,
        metaDescription: undefined,
        applicableModels: [],
        status: 'pending' as BatchStatus,
      };
    });
    // Assign sort orders
    batch.forEach((p, i) => {
      (p as any).sortOrder = maxSort + i + 1;
    });
    setBatchProducts(batch);
    setSnackbar({ open: true, message: `已解析 ${batch.length} 个产品`, severity: 'success' });
  };

  /** Handle CSV file upload */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      const parsed = parseCsv(csvText);
      if (parsed.length === 0) {
        setError('CSV文件为空或格式不正确');
        return;
      }

      const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
      const maxSort = products.reduce((max, p) => Math.max(max, p.sortOrder ?? 0), 0);
      const batch: BatchProduct[] = parsed.map((p, i) => ({
        id: maxId + i + 1,
        category: p.category || defaultCategory,
        model: p.model,
        name: { zh: p.name_zh, en: p.name_en || p.name_zh, ru: '', ar: '', ko: '' },
        description: emptyLocalizedString(),
        metaTitle: undefined,
        metaDescription: undefined,
        applicableModels: [],
        status: 'pending' as BatchStatus,
        sortOrder: maxSort + i + 1,
      }));
      setBatchProducts(batch);
      setSnackbar({ open: true, message: `已导入 ${batch.length} 个产品`, severity: 'success' });
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  /** Call AI to generate content for a single product */
  const aiGenerateForProduct = async (product: BatchProduct, token: string): Promise<Partial<BatchProduct>> => {
    const productInfo = {
      model: product.model,
      category: product.category,
      name: product.name,
      oemNumber: '',
      specifications: {},
      applicableModels: [],
      description: {},
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

  /** Process all batch products with AI */
  const handleAiProcessAll = async (): Promise<void> => {
    if (batchProducts.length === 0) return;
    const token = getAuthToken();
    if (!token) {
      setError('未登录，请刷新页面');
      return;
    }

    setProcessing(true);
    setError('');
    setProgress({ current: 0, total: batchProducts.length });

    const updated = [...batchProducts];

    for (let i = 0; i < updated.length; i++) {
      setProgress({ current: i + 1, total: updated.length });

      // Skip already-processed products
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
        updated[i].errorMsg = err.message || 'AI处理失败';
      }
      setBatchProducts([...updated]);
    }

    const doneCount = updated.filter((p) => p.status === 'done').length;
    const errorCount = updated.filter((p) => p.status === 'error').length;

    setSnackbar({
      open: true,
      message: `处理完成: ${doneCount}成功, ${errorCount}失败`,
      severity: errorCount > 0 ? 'error' : 'success',
    });
    setProcessing(false);
  };

  /** Save all successfully processed products to KV */
  const handleSaveAll = async (): Promise<void> => {
    const toSave = batchProducts.filter((p) => p.status === 'done');
    if (toSave.length === 0) {
      setError('没有可保存的产品（请先AI处理）');
      return;
    }

    const newProducts: Product[] = toSave.map((bp) => ({
      id: bp.id,
      model: bp.model,
      category: bp.category,
      image: '',
      images: [],
      name: bp.name,
      description: bp.description,
      slug: generateSlug(bp.category, bp.model || bp.name.en),
      oemNumber: '',
      applicableModels: bp.applicableModels,
      specifications: {},
      metaTitle: bp.metaTitle,
      metaDescription: bp.metaDescription,
      featured: false,
      sortOrder: (bp as any).sortOrder ?? 0,
    }));

    try {
      await updateProducts([...products, ...newProducts]);
      setSnackbar({ open: true, message: `${newProducts.length} 个产品已保存`, severity: 'success' });
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
      <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
        批量添加产品
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        填写产品名称，AI自动补齐全部内容（描述、SEO、适用车型）。图片稍后在产品管理中上传。
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Step 1: Input methods */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          第一步：输入产品信息
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadTemplate}
          >
            下载CSV模板
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            上传CSV文件
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </Stack>

        <Divider sx={{ my: 2 }}><Chip label="或直接粘贴" size="small" /></Divider>

        <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
          <InputLabel>默认分类</InputLabel>
          <Select
            value={defaultCategory}
            label="默认分类"
            onChange={(e) => setDefaultCategory(e.target.value)}
          >
            {editableCategories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.label[lang]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={6}
          placeholder={
            '每行一个产品，格式：\n' +
            '产品中文名|分类|型号|英文名\n' +
            '或直接输入产品名称（使用默认分类）\n\n' +
            '示例：\n' +
            'BMW X6 前保险杠总成|bmw|G06|BMW X6 Front Bumper G06\n' +
            'BMW X5 后尾灯'
          }
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={handleParseText}
          disabled={!textInput.trim()}
        >
          解析产品列表
        </Button>
      </Paper>

      {/* Step 2: Review & AI Process */}
      {batchProducts.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              第二步：AI自动补齐 ({batchProducts.length} 个产品)
            </Typography>
            <Stack direction="row" spacing={1}>
              {processing && (
                <Chip
                  icon={<CircularProgress size={16} />}
                  label={`${progress.current}/${progress.total}`}
                  color="primary"
                  size="small"
                />
              )}
              <Button
                variant="contained"
                color="secondary"
                startIcon={processing ? <CircularProgress size={18} color="inherit" /> : <AutoFixHighIcon />}
                onClick={handleAiProcessAll}
                disabled={processing || batchProducts.every((p) => p.status === 'done')}
              >
                {processing ? 'AI处理中...' : 'AI自动补齐全部'}
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveAll}
                disabled={doneCount === 0 || processing}
              >
                全部保存 ({doneCount})
              </Button>
            </Stack>
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>序号</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>产品名称</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>分类</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>型号</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>描述</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>车型</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>状态</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batchProducts.map((bp, i) => (
                  <TableRow key={bp.id} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {bp.name.zh}
                      </Typography>
                      {bp.name.en && bp.name.en !== bp.name.zh && (
                        <Typography variant="caption" color="text.secondary">
                          {bp.name.en}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={editableCategories.find((c) => c.id === bp.category)?.label[lang] || bp.category}
                        size="small"
                        sx={{ backgroundColor: 'primary.light', color: '#fff', fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {bp.model || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{
                        display: 'block',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {bp.description.zh?.slice(0, 60) || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={bp.applicableModels.length}
                        size="small"
                        color={bp.applicableModels.length > 0 ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {bp.status === 'pending' && <Tooltip title="待处理"><PendingIcon color="disabled" fontSize="small" /></Tooltip>}
                      {bp.status === 'processing' && <CircularProgress size={18} />}
                      {bp.status === 'done' && <Tooltip title="完成"><CheckCircleIcon color="success" fontSize="small" /></Tooltip>}
                      {bp.status === 'error' && <Tooltip title={bp.errorMsg || '错误'}><ErrorIcon color="error" fontSize="small" /></Tooltip>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {errorCount > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {errorCount} 个产品AI处理失败，可点击"AI自动补齐全部"重试
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
