/**
 * Product management page — CRUD interface for the product catalog.
 *
 * Displays a sortable table of all products with thumbnail, name (current
 * language), model, category, and action buttons. Supports adding new
 * products, editing existing ones (with multi-language tabs for name and
 * description), and deleting with a confirmation dialog.
 *
 * Also includes an SEO fields panel (metaTitle, metaDescription, oemNumber),
 * an applicable models editor, and
 * a specifications key-value editor.
 */

import { useState, type ChangeEvent, type FormEvent, type SyntheticEvent } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Avatar,
  Tooltip,
  Alert,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  Divider,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SyncIcon from '@mui/icons-material/Sync';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useLanguage } from '../i18n/LanguageContext';
import { useAdminData } from './AdminDataContext';
import { productCategories, type Product, type ProductCategory, type ApplicableModel, type LocalizedString } from '../data/products';
import { emptyLocalizedString, getAuthToken } from './adminStorage';
import { generateSlug } from '../utils/slug';
import { translateLocalizedString } from '../utils/translator';
import type { Language } from '../i18n/translations';
import LocalizedTextField from './LocalizedTextField';
import MultiImageGallery from './MultiImageGallery';

/**
 * Creates a new blank product with a unique ID.
 * The ID is computed as max(existing IDs) + 1.
 */
function createBlankProduct(existingProducts: Product[]): Product {
  const maxId = existingProducts.reduce((max, p) => Math.max(max, p.id), 0);
  const maxSortOrder = existingProducts.reduce((max, p) => Math.max(max, p.sortOrder ?? 0), 0);
  return {
    id: maxId + 1,
    model: '',
    category: 'bmw',
    image: '',
    name: emptyLocalizedString(),
    description: emptyLocalizedString(),
    slug: '',
    oemNumber: '',
    images: [],
    applicableModels: [],
    specifications: {},
    metaTitle: undefined,
    metaDescription: undefined,
    featured: false,
    sortOrder: maxSortOrder + 1,
  };
}

/**
 * Product manager with table, add/edit dialog, and delete confirmation.
 */
function ProductManager(): JSX.Element {
  const { lang } = useLanguage();
  const { products, updateProducts } = useAdminData();

  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [aiGenerating, setAiGenerating] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  /** Product categories excluding the "all" filter. */
  const editableCategories = productCategories.filter((c) => c.id !== 'all');

  /** Opens the edit dialog for a new product. */
  const handleAdd = (): void => {
    setEditingProduct(createBlankProduct(products));
    setError('');
    setEditOpen(true);
  };

  /** Opens the edit dialog for an existing product. */
  const handleEdit = (product: Product): void => {
    setEditingProduct({
      ...product,
      applicableModels: product.applicableModels ? [...product.applicableModels] : [],
      specifications: { ...(product.specifications || {}) },
      images: product.images ? [...product.images] : [product.image],
    });
    setError('');
    setEditOpen(true);
  };

  /** Opens the delete confirmation dialog. */
  const handleDeleteClick = (product: Product): void => {
    setDeleteTarget(product);
  };

  /** Confirms deletion and removes the product. */
  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteTarget) return;
    try {
      await updateProducts(products.filter((p) => p.id !== deleteTarget.id));
      setSnackbar({ open: true, message: '产品删除成功', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: '删除失败: ' + (err.message || '未知错误'), severity: 'error' });
    }
    setDeleteTarget(null);
  };

  /** Saves the edited/created product. */
  const handleSave = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!editingProduct) return;

    // Validate required fields.
    if (!editingProduct.model.trim()) {
      setError('请填写型号。');
      return;
    }
    const hasImages = (editingProduct.images || []).filter((img) => img && img.trim()).length > 0;
    if (!hasImages) {
      setError('请至少上传一张产品图片。');
      return;
    }
    if (!editingProduct.name[lang].trim()) {
      setError(`产品名称（${lang}）为必填项。`);
      return;
    }

    // Ensure slug is set and images are normalized.
    const normalizedImages = (editingProduct.images || []).filter((img) => img && img.trim());
    const savedProduct: Product = {
      ...editingProduct,
      slug: editingProduct.slug || generateSlug(editingProduct.category, editingProduct.model),
      image: normalizedImages[0] || editingProduct.image,
      images: normalizedImages,
    };

    setSaving(true);
    try {
      const exists = products.some((p) => p.id === savedProduct.id);
      if (exists) {
        await updateProducts(products.map((p) => (p.id === savedProduct.id ? savedProduct : p)));
      } else {
        await updateProducts([...products, savedProduct]);
      }
      setEditOpen(false);
      setEditingProduct(null);
      setSnackbar({ open: true, message: '产品保存成功', severity: 'success' });
    } catch (err: any) {
      setError('保存失败: ' + (err.message || '未知错误'));
      setSnackbar({ open: true, message: '保存失败: ' + (err.message || '未知错误'), severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  /** Updates a field on the editing product. */
  const handleFieldChange = <K extends keyof Product>(field: K, value: Product[K]): void => {
    setEditingProduct((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  /** Calls the AI SEO generation API and returns the generated localized text (all languages). */
  const handleAiGenerate = async (field: 'description' | 'metaTitle' | 'metaDescription'): Promise<LocalizedString> => {
    setAiGenerating(field);
    setAiError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('未登录，请刷新页面');
      const res = await fetch('/api/ai/generate-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          field,
          productInfo: {
            model: editingProduct?.model || '',
            category: editingProduct?.category || '',
            name: editingProduct?.name || { zh: '', en: '' },
            oemNumber: editingProduct?.oemNumber || '',
            specifications: editingProduct?.specifications || {},
            applicableModels: editingProduct?.applicableModels || [],
            description: editingProduct?.description || {},
          },
          // No lang param → multi-language mode (returns all languages)
        }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        let errMsg = `AI 生成失败 (HTTP ${res.status})`;
        try {
          const errJson = JSON.parse(errBody);
          errMsg = errJson.error || errMsg;
        } catch { /* not JSON */ }
        if (errBody && errBody.length < 200) errMsg += `: ${errBody}`;
        throw new Error(errMsg);
      }
      const data = await res.json();
      // Return as LocalizedString
      return data.text as LocalizedString;
    } catch (err: any) {
      const msg = err.message || '网络连接失败';
      setAiError(msg);
      console.error('[AI Generate]', err);
      throw err;
    } finally {
      setAiGenerating(null);
    }
  };

  /** Calls AI to auto-fill applicable vehicle models based on product name. */
  const handleAiFillModels = async (): Promise<void> => {
    setAiGenerating('applicableModels');
    setAiError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('未登录，请刷新页面');

      // Require at least a product name or model
      const nameEn = editingProduct?.name?.en || '';
      const modelCode = editingProduct?.model || '';
      if (!nameEn && !modelCode) {
        setAiError('请先填写产品名称或型号，AI 才能推断适用车型');
        return;
      }

      const res = await fetch('/api/ai/generate-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          field: 'applicableModels',
          productInfo: {
            model: modelCode,
            category: editingProduct?.category || '',
            name: editingProduct?.name || { zh: '', en: '' },
            oemNumber: editingProduct?.oemNumber || '',
            specifications: editingProduct?.specifications || {},
            applicableModels: [],
            description: editingProduct?.description || {},
          },
        }),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        let errMsg = `AI 生成车型失败 (HTTP ${res.status})`;
        try {
          const errJson = JSON.parse(errBody);
          errMsg = errJson.error || errMsg;
        } catch { /* not JSON */ }
        throw new Error(errMsg);
      }

      const data = await res.json();
      const aiModels = data.models as ApplicableModel[];

      if (!aiModels || aiModels.length === 0) {
        setAiError('AI 无法确定适用车型，请手动填写');
        return;
      }

      // Merge with existing models (avoid duplicates by brand+model+year)
      const existing = editingProduct?.applicableModels || [];
      const existingKeys = new Set(existing.map((m) => `${m.brand}|${m.model}|${m.year}`));
      const newModels = aiModels.filter((m) => !existingKeys.has(`${m.brand}|${m.model}|${m.year}`));
      const merged = [...existing, ...newModels];

      handleFieldChange('applicableModels', merged);
      setSnackbar({ open: true, message: `AI 已补齐 ${newModels.length} 个车型`, severity: 'success' });
    } catch (err: any) {
      const msg = err.message || '网络连接失败';
      setAiError(msg);
      console.error('[AI Fill Models]', err);
    } finally {
      setAiGenerating(null);
    }
  };

  /** One-click sync: translates name, description, metaTitle, metaDescription from Chinese to all other languages. */
  const handleSyncLanguages = async (): Promise<void> => {
    if (!editingProduct) return;
    setAiGenerating('sync');
    setAiError(null);
    try {
      const fieldsToLocalize: Array<{ key: keyof Product; label: string }> = [
        { key: 'name', label: '产品名称' },
        { key: 'description', label: '描述' },
        { key: 'metaTitle', label: 'SEO Title' },
        { key: 'metaDescription', label: 'SEO Description' },
      ];

      const updated = { ...editingProduct };
      const sourceLang: Language = 'zh';

      for (const { key, label } of fieldsToLocalize) {
        const source = (updated as any)[key] as LocalizedString | undefined;
        if (!source || !source[sourceLang] || !source[sourceLang].trim()) continue;

        setSnackbar({ open: true, message: `正在翻译${label}...`, severity: 'success' });
        const translated = await translateLocalizedString(source, sourceLang);
        (updated as any)[key] = { ...source, ...translated };
      }

      setEditingProduct(updated);
      setSnackbar({ open: true, message: '语言同步完成', severity: 'success' });
    } catch (err: any) {
      const msg = err.message || '翻译失败';
      setAiError(msg);
      console.error('[Sync Languages]', err);
    } finally {
      setAiGenerating(null);
    }
  };

  /** One-click SEO: calls AI to generate description, metaTitle, metaDescription, and applicableModels in parallel. */
  const handleOptimizeSeo = async (): Promise<void> => {
    if (!editingProduct) return;
    setAiGenerating('optimizeSeo');
    setAiError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('未登录，请刷新页面');

      const productInfo = {
        model: editingProduct.model || '',
        category: editingProduct.category || '',
        name: editingProduct.name || { zh: '', en: '' },
        oemNumber: editingProduct.oemNumber || '',
        specifications: editingProduct.specifications || {},
        applicableModels: [],
        description: editingProduct.description || {},
      };

      const apiCall = async (field: string) => {
        const res = await fetch('/api/ai/generate-seo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ field, productInfo }),
        });
        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          throw new Error(`AI生成${field}失败: ${errBody.slice(0, 100)}`);
        }
        return res.json();
      };

      // Use allSettled so one field failing doesn't block others
      const results = await Promise.allSettled([
        apiCall('description'),
        apiCall('metaTitle'),
        apiCall('metaDescription'),
        apiCall('applicableModels'),
      ]);

      // Extract successful results, log failures
      const descData = results[0].status === 'fulfilled' ? results[0].value : null;
      const titleData = results[1].status === 'fulfilled' ? results[1].value : null;
      const metaDescData = results[2].status === 'fulfilled' ? results[2].value : null;
      const modelsData = results[3].status === 'fulfilled' ? results[3].value : null;

      // Collect error messages from failed calls
      const errors: string[] = [];
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          const fieldNames: Record<number, string> = { 0: '描述', 1: '标题', 2: 'Meta描述', 3: '车型' };
          errors.push(`${fieldNames[i]}: ${(r.reason as Error)?.message || '未知错误'}`);
        }
      });

      // Merge AI models with existing (dedup by brand+model+year)
      let mergedModels = editingProduct.applicableModels || [];
      let newModelCount = 0;
      if (modelsData?.models) {
        const aiModels = modelsData.models as ApplicableModel[];
        const existing = editingProduct.applicableModels || [];
        const existingKeys = new Set(existing.map((m) => `${m.brand}|${m.model}|${m.year}`));
        const newModels = aiModels.filter((m) => !existingKeys.has(`${m.brand}|${m.model}|${m.year}`));
        mergedModels = [...existing, ...newModels];
        newModelCount = newModels.length;
      }

      setEditingProduct((prev) => prev ? {
        ...prev,
        ...(descData?.text ? { description: descData.text } : {}),
        ...(titleData?.text ? { metaTitle: titleData.text } : {}),
        ...(metaDescData?.text ? { metaDescription: metaDescData.text } : {}),
        ...(modelsData ? { applicableModels: mergedModels } : {}),
      } : prev);

      // Show appropriate message based on how many fields succeeded
      const successCount = [descData, titleData, metaDescData, modelsData].filter(Boolean).length;
      if (successCount === 4) {
        setSnackbar({
          open: true,
          message: `SEO优化完成！描述+标题+Meta+${newModelCount}个车型已自动填充`,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: `SEO优化部分完成（${successCount}/4 成功）${errors.length ? ` — ${errors.join('; ')}` : ''}`,
          severity: 'success',
        });
      }
    } catch (err: any) {
      const msg = err.message || 'AI优化失败';
      setAiError(msg);
      console.error('[Optimize SEO]', err);
    } finally {
      setAiGenerating(null);
    }
  };

  /** Gets the category label for display. */
  const getCategoryLabel = (categoryId: string): string => {
    const cat = productCategories.find((c) => c.id === categoryId);
    return cat?.label[lang] ?? categoryId;
  };

  /** Moves a product one position up in the display order. */
  const handleMoveUp = async (product: Product): Promise<void> => {
    const sorted = [...products].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id);
    const idx = sorted.findIndex((p) => p.id === product.id);
    if (idx <= 0) return;
    const prev = sorted[idx - 1];
    const currentOrder = product.sortOrder ?? idx;
    const prevOrder = prev.sortOrder ?? idx - 1;
    const updated = products.map((p) => {
      if (p.id === product.id) return { ...p, sortOrder: prevOrder };
      if (p.id === prev.id) return { ...p, sortOrder: currentOrder };
      return p;
    });
    try {
      await updateProducts(updated);
      setSnackbar({ open: true, message: '排序已更新', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: '排序更新失败: ' + (err.message || '未知错误'), severity: 'error' });
    }
  };

  /** Moves a product one position down in the display order. */
  const handleMoveDown = async (product: Product): Promise<void> => {
    const sorted = [...products].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id);
    const idx = sorted.findIndex((p) => p.id === product.id);
    if (idx < 0 || idx >= sorted.length - 1) return;
    const next = sorted[idx + 1];
    const currentOrder = product.sortOrder ?? idx;
    const nextOrder = next.sortOrder ?? idx + 1;
    const updated = products.map((p) => {
      if (p.id === product.id) return { ...p, sortOrder: nextOrder };
      if (p.id === next.id) return { ...p, sortOrder: currentOrder };
      return p;
    });
    try {
      await updateProducts(updated);
      setSnackbar({ open: true, message: '排序已更新', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: '排序更新失败: ' + (err.message || '未知错误'), severity: 'error' });
    }
  };

  /** Products sorted by sortOrder for display in the admin table. */
  const sortedProducts = [...products].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id);
  const handleToggleFeatured = async (product: Product): Promise<void> => {
    try {
      await updateProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, featured: !p.featured } : p
        )
      );
      setSnackbar({ open: true, message: product.featured ? '已取消精选' : '已设为精选', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: '操作失败: ' + (err.message || '未知错误'), severity: 'error' });
    }
  };

  // --- Applicable Models editor handlers ---

  /** Adds a new blank applicable model entry. */
  const handleAddModel = (): void => {
    if (!editingProduct) return;
    const newModel: ApplicableModel = { brand: '', model: '', year: '', engine: '' };
    handleFieldChange('applicableModels', [...(editingProduct.applicableModels || []), newModel]);
  };

  /** Updates a specific applicable model entry. */
  const handleModelChange = (index: number, field: keyof ApplicableModel, value: string): void => {
    if (!editingProduct) return;
    const models = [...(editingProduct.applicableModels || [])];
    models[index] = { ...models[index], [field]: value };
    handleFieldChange('applicableModels', models);
  };

  /** Removes an applicable model entry. */
  const handleRemoveModel = (index: number): void => {
    if (!editingProduct) return;
    const models = (editingProduct.applicableModels || []).filter((_, i) => i !== index);
    handleFieldChange('applicableModels', models);
  };

  // --- Specifications editor handlers ---

  /** Adds a new specification key-value pair. */
  const handleAddSpec = (): void => {
    if (!editingProduct) return;
    const specs = { ...(editingProduct.specifications || {}) };
    const newKey = `spec_${Object.keys(specs).length + 1}`;
    specs[newKey] = '';
    handleFieldChange('specifications', specs);
  };

  /** Updates a specification key or value. */
  const handleSpecChange = (oldKey: string, newKey: string, value: string): void => {
    if (!editingProduct) return;
    const specs = { ...(editingProduct.specifications || {}) };
    if (oldKey !== newKey) {
      delete specs[oldKey];
    }
    specs[newKey] = value;
    handleFieldChange('specifications', specs);
  };

  /** Removes a specification key-value pair. */
  const handleRemoveSpec = (key: string): void => {
    if (!editingProduct) return;
    const specs = { ...(editingProduct.specifications || {}) };
    delete specs[key];
    handleFieldChange('specifications', specs);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
            产品管理
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {products.length} 个产品
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          添加产品
        </Button>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">序号</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>图片</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>名称 ({lang})</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>型号</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>分类</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>精选</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">排序</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProducts.map((product, index) => (
              <TableRow key={product.id} hover>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {index + 1}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Avatar
                    src={product.image}
                    alt={product.name[lang]}
                    variant="rounded"
                    sx={{ width: 56, height: 42 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {product.name[lang] || '(空)'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {product.description[lang]?.slice(0, 60)}
                    {product.description[lang]?.length > 60 ? '...' : ''}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {product.model}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getCategoryLabel(product.category)}
                    size="small"
                    sx={{ backgroundColor: 'primary.light', color: '#fff', fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={product.featured || false}
                    onChange={() => handleToggleFeatured(product)}
                    color="secondary"
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="上移">
                    <span>
                      <IconButton
                        onClick={() => handleMoveUp(product)}
                        disabled={index === 0}
                        size="small"
                      >
                        <KeyboardArrowUpIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="下移">
                    <span>
                      <IconButton
                        onClick={() => handleMoveDown(product)}
                        disabled={index === sortedProducts.length - 1}
                        size="small"
                      >
                        <KeyboardArrowDownIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="编辑">
                    <IconButton onClick={() => handleEdit(product)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="删除">
                    <IconButton onClick={() => handleDeleteClick(product)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSave}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {products.some((p) => p.id === editingProduct?.id) ? '编辑产品' : '添加新产品'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {aiError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setAiError(null)}>
                {aiError}
              </Alert>
            )}
                        {editingProduct && (
              <Box sx={{ mt: 1 }}>
                {/* ══════════════════════════════════════════════════════
                    ① 快捷操作栏 — 固定在顶部，带使用提示
                    ══════════════════════════════════════════════════════ */}
                <Paper
                  elevation={2}
                  sx={{
                    p: 2.5,
                    mb: 2.5,
                    bgcolor: '#fafbff',
                    border: '1.5px solid',
                    borderColor: 'primary.light',
                    borderRadius: 2.5,
                  }}
                >
                  <Stack spacing={1.5}>
                    {/* 使用提示 */}
                    <Alert
                      severity="info"
                      icon={<LightbulbIcon fontSize="small" />}
                      sx={{
                        py: 0,
                        '& .MuiAlert-message': { fontSize: '0.82rem' },
                      }}
                    >
                      填写完下方「核心信息」后，点击以下按钮自动补齐多语言内容和SEO信息
                    </Alert>

                    {/* 操作按钮 */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <Tooltip title="将中文内容自动翻译为英文、俄文、西班牙文、韩文" placement="top">
                        <Button
                          variant="contained"
                          color="secondary"
                          fullWidth
                          startIcon={aiGenerating === 'sync' ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
                          onClick={handleSyncLanguages}
                          disabled={aiGenerating !== null}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            py: 1.3,
                            fontSize: '0.92rem',
                            borderRadius: 2,
                          }}
                        >
                          🌐 一键同步语言
                        </Button>
                      </Tooltip>
                      <Tooltip title="AI 自动生成 SEO 标题、描述、关键词，优化 Google 搜索排名" placement="top">
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          startIcon={aiGenerating === 'optimizeSeo' ? <CircularProgress size={18} color="inherit" /> : <AutoFixHighIcon />}
                          onClick={handleOptimizeSeo}
                          disabled={aiGenerating !== null || (!editingProduct.name?.en && !editingProduct.model)}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            py: 1.3,
                            fontSize: '0.92rem',
                            borderRadius: 2,
                          }}
                        >
                          ⚡ 一键优化 SEO
                        </Button>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Paper>

                {/* ══════════════════════════════════════════════════════
                    ② 核心信息（必填）— 默认展开
                    ══════════════════════════════════════════════════════ */}
                <Accordion defaultExpanded sx={{ mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ bgcolor: 'grey.50', borderRadius: 1 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label="①" size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.75rem' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        核心信息（必填）
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 2.5, pb: 2.5 }}>
                    <Stack spacing={2.5}>
                      {/* 型号 + 分类 */}
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          fullWidth
                          label="型号 *"
                          required
                          value={editingProduct.model}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange('model', e.target.value)}
                          size="small"
                          helperText="例如：X6 G06、E300 W213"
                        />
                        <Autocomplete
                          fullWidth
                          freeSolo
                          size="small"
                          options={editableCategories}
                          getOptionLabel={(option) => {
                            if (typeof option === 'string') return option;
                            return option.label[lang];
                          }}
                          value={
                            editableCategories.find((c) => c.id === editingProduct.category) ?? editingProduct.category
                          }
                          onChange={(event: SyntheticEvent, newValue: ProductCategory | string | null) => {
                            if (newValue === null) {
                              handleFieldChange('category', '');
                            } else if (typeof newValue === 'string') {
                              handleFieldChange('category', newValue);
                            } else {
                              handleFieldChange('category', newValue.id);
                            }
                          }}
                          onInputChange={(event: SyntheticEvent, newInputValue: string) => {
                            const matchedOption = editableCategories.find(
                              (c) => c.label[lang] === newInputValue || c.id === newInputValue
                            );
                            if (!matchedOption && newInputValue) {
                              handleFieldChange('category', newInputValue);
                            }
                          }}
                          renderOption={(props, option) => {
                            const { key, ...restProps } = props as unknown as Record<string, unknown>;
                            const isCategory = typeof option !== 'string';
                            const displayLabel = isCategory ? option.label[lang] : option;
                            const logoSrc = isCategory ? option.logo : undefined;
                            return (
                              <li key={key as string} {...restProps as React.HTMLAttributes<HTMLLIElement>}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {logoSrc && (
                                    <img
                                      src={logoSrc}
                                      alt={displayLabel}
                                      style={{ width: 24, height: 24, objectFit: 'contain' }}
                                    />
                                  )}
                                  <span>{displayLabel}</span>
                                </Box>
                              </li>
                            );
                          }}
                          renderInput={(params) => (
                            <TextField {...params} label="分类 *" helperText="输入或选择产品分类" />
                          )}
                        />
                      </Stack>

                      {/* 产品名称（多语言） */}
                      <LocalizedTextField
                        label="产品名称 *"
                        required
                        value={editingProduct.name}
                        onChange={(value) => handleFieldChange('name', value)}
                        showActions={false}
                      />

                      {/* 产品图片 */}
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <span>📷</span> 产品图片
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                            （第一张为主图，最多5张）
                          </Typography>
                        </Typography>
                        <MultiImageGallery
                          images={editingProduct.images || (editingProduct.image ? [editingProduct.image] : [])}
                          onChange={(newImages) => {
                            handleFieldChange('image', newImages[0] || '');
                            handleFieldChange('images', newImages);
                          }}
                        />
                      </Box>
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* ══════════════════════════════════════════════════════
                    ③ 产品描述和SEO信息
                    ══════════════════════════════════════════════════════ */}
                <Accordion sx={{ mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ bgcolor: 'grey.50', borderRadius: 1 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label="②" size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.75rem' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        产品描述和SEO信息
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 2.5, pb: 2.5 }}>
                    <Stack spacing={2.5}>
                      {/* 产品描述（多语言） */}
                      <LocalizedTextField
                        label="产品描述"
                        multiline
                        rows={4}
                        value={editingProduct.description}
                        onChange={(value) => handleFieldChange('description', value)}
                        showActions={false}
                      />

                      {/* SEO 信息 */}
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <span>📈</span> SEO 优化
                          <Tooltip title="SEO信息帮助Google正确收录您的产品页面，提高搜索排名">
                            <Chip label="?" size="small" sx={{ ml: 0.5, cursor: 'help', fontSize: '0.7rem', height: 18 }} />
                          </Tooltip>
                        </Typography>
                        <Stack spacing={2}>
                          <LocalizedTextField
                            label="SEO Meta 标题"
                            value={editingProduct.metaTitle || emptyLocalizedString()}
                            onChange={(value) => handleFieldChange('metaTitle', value)}
                            showActions={false}
                            helperText="建议长度：50-60字符，包含核心关键词"
                          />
                          <LocalizedTextField
                            label="SEO Meta 描述"
                            multiline
                            rows={3}
                            value={editingProduct.metaDescription || emptyLocalizedString()}
                            onChange={(value) => handleFieldChange('metaDescription', value)}
                            showActions={false}
                            helperText="建议长度：150-160字符，概括产品卖点"
                          />
                          <TextField
                            fullWidth
                            label="SEO 关键词"
                            value={editingProduct.metaKeywords || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange('metaKeywords', e.target.value)}
                            size="small"
                            helperText="用逗号分隔多个关键词，例如：BMW X6 bumper, G06 front bumper"
                          />

                          {/* SEO 预览卡片 */}
                          {(editingProduct.metaTitle?.[lang] || editingProduct.name?.[lang]) && (
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
                                📱 Google 搜索结果预览
                              </Typography>
                              <Box sx={{ maxWidth: 600 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: '#1a0dab',
                                    fontSize: '1.1rem',
                                    fontWeight: 400,
                                    lineHeight: 1.3,
                                    mb: 0.5,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' },
                                  }}
                                >
                                  {editingProduct.metaTitle?.[lang] || editingProduct.name?.[lang] || '产品标题'}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#006621',
                                    fontSize: '0.82rem',
                                    lineHeight: 1.4,
                                    mb: 0.5,
                                    display: 'block',
                                  }}
                                >
                                  altai.parts › {editingProduct.category || 'category'} › {editingProduct.model || 'model'}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#545454',
                                    fontSize: '0.82rem',
                                    lineHeight: 1.4,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {editingProduct.metaDescription?.[lang] || editingProduct.description?.[lang] || '产品描述将显示在这里...'}
                                </Typography>
                              </Box>
                            </Paper>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* ══════════════════════════════════════════════════════
                    ④ 适用车型
                    ══════════════════════════════════════════════════════ */}
                <Accordion sx={{ mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ bgcolor: 'grey.50', borderRadius: 1 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                      <Chip label="③" size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.75rem' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        适用车型
                      </Typography>
                      <Chip
                        label={`${editingProduct.applicableModels?.length || 0} 个车型`}
                        size="small"
                        color="default"
                        sx={{ ml: 1, fontSize: '0.72rem' }}
                      />
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 2.5, pb: 2.5 }}>
                    <Stack spacing={2}>
                      {/* AI 自动识别按钮 - 更突出 */}
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: '#f0f7ff',
                          border: '1.5px dashed',
                          borderColor: 'primary.light',
                          borderRadius: 2,
                        }}
                      >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
                          <Typography variant="body2" sx={{ flex: 1, color: 'text.secondary' }}>
                            根据产品名称和型号，AI 可自动识别适用的车型
                          </Typography>
                          <Button
                            size="medium"
                            variant="contained"
                            color="primary"
                            startIcon={aiGenerating === 'applicableModels' ? <CircularProgress size={18} color="inherit" /> : <SmartToyIcon />}
                            onClick={handleAiFillModels}
                            disabled={aiGenerating === 'applicableModels' || (!editingProduct.name?.en && !editingProduct.model)}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 700,
                              borderRadius: 2,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            🤖 AI 自动识别适用车型
                          </Button>
                        </Stack>
                      </Paper>

                      {/* 车型列表 */}
                      {(editingProduct.applicableModels || []).map((model, index) => (
                        <Paper key={index} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                            <Chip label={`#${index + 1}`} size="small" sx={{ fontSize: '0.7rem', height: 22 }} />
                            <TextField
                              label="品牌"
                              value={model.brand}
                              onChange={(e) => handleModelChange(index, 'brand', e.target.value)}
                              size="small"
                              sx={{ flex: 1 }}
                            />
                            <TextField
                              label="车型"
                              value={model.model}
                              onChange={(e) => handleModelChange(index, 'model', e.target.value)}
                              size="small"
                              sx={{ flex: 1 }}
                            />
                            <TextField
                              label="年份"
                              value={model.year}
                              onChange={(e) => handleModelChange(index, 'year', e.target.value)}
                              size="small"
                              sx={{ flex: 1 }}
                            />
                            <TextField
                              label="发动机"
                              value={model.engine || ''}
                              onChange={(e) => handleModelChange(index, 'engine', e.target.value)}
                              size="small"
                              sx={{ flex: 1 }}
                            />
                            <IconButton onClick={() => handleRemoveModel(index)} color="error" size="small">
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </Paper>
                      ))}

                      {/* 添加车型按钮 */}
                      <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddModel}
                        variant="outlined"
                        size="medium"
                        sx={{ alignSelf: 'flex-start', textTransform: 'none', borderRadius: 2 }}
                      >
                        手动添加车型
                      </Button>
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* ══════════════════════════════════════════════════════
                    ⑤ 高级信息（选填）
                    ══════════════════════════════════════════════════════ */}
                <Accordion sx={{ mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ bgcolor: 'grey.50', borderRadius: 1 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label="④" size="small" color="default" sx={{ fontWeight: 700, fontSize: '0.75rem' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        高级信息（选填）
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 2.5, pb: 2.5 }}>
                    <Stack spacing={2.5}>
                      {/* OEM 编号 */}
                      <TextField
                        fullWidth
                        label="OEM 编号"
                        value={editingProduct.oemNumber || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange('oemNumber', e.target.value)}
                        size="small"
                        helperText="多个编号用逗号分隔"
                      />

                      {/* 规格参数 */}
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                          规格参数 ({Object.keys(editingProduct.specifications || {}).length} 项)
                        </Typography>
                        <Stack spacing={1.5}>
                          {Object.entries(editingProduct.specifications || {}).map(([key, value]) => (
                            <Stack key={key} direction="row" spacing={1} alignItems="center">
                              <TextField
                                label="参数名"
                                value={key}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                  handleSpecChange(key, e.target.value, value)
                                }
                                size="small"
                                sx={{ flex: 1 }}
                              />
                              <TextField
                                label="参数值"
                                value={value}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                  handleSpecChange(key, key, e.target.value)
                                }
                                size="small"
                                sx={{ flex: 1 }}
                              />
                              <IconButton onClick={() => handleRemoveSpec(key)} color="error" size="small">
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          ))}
                          <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddSpec}
                            variant="outlined"
                            size="small"
                            sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                          >
                            添加规格参数
                          </Button>
                        </Stack>
                      </Box>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setEditOpen(false)} color="inherit" disabled={saving}>
              取消
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={saving}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : undefined}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>确认删除</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            确定要删除{' '}
            <strong>{deleteTarget?.name[lang]}</strong> ({deleteTarget?.model})？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">
            取消
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for success/error notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}

export default ProductManager;
