/**
 * Product management page — CRUD interface for the product catalog.
 *
 * Displays a sortable table of all products with thumbnail, name (current
 * language), model, category, and action buttons. Supports adding new
 * products, editing existing ones (with multi-language tabs for name and
 * description), and deleting with a confirmation dialog.
 */

import { useState, type ChangeEvent, type FormEvent } from 'react';
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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Avatar,
  Tooltip,
  Alert,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLanguage } from '../i18n/LanguageContext';
import { useAdminData } from './AdminDataContext';
import { productCategories, type Product } from '../data/products';
import { emptyLocalizedString } from './adminStorage';
import LocalizedTextField from './LocalizedTextField';

/**
 * Creates a new blank product with a unique ID.
 * The ID is computed as max(existing IDs) + 1.
 */
function createBlankProduct(existingProducts: Product[]): Product {
  const maxId = existingProducts.reduce((max, p) => Math.max(max, p.id), 0);
  return {
    id: maxId + 1,
    model: '',
    category: 'engine',
    image: '',
    name: emptyLocalizedString(),
    description: emptyLocalizedString(),
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
    setEditingProduct({ ...product });
    setError('');
    setEditOpen(true);
  };

  /** Opens the delete confirmation dialog. */
  const handleDeleteClick = (product: Product): void => {
    setDeleteTarget(product);
  };

  /** Confirms deletion and removes the product. */
  const handleDeleteConfirm = (): void => {
    if (deleteTarget) {
      updateProducts(products.filter((p) => p.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  /** Saves the edited/created product. */
  const handleSave = (event: FormEvent): void => {
    event.preventDefault();
    if (!editingProduct) return;

    // Validate required fields.
    if (!editingProduct.model.trim()) {
      setError('Model is required.');
      return;
    }
    if (!editingProduct.image.trim()) {
      setError('Image URL is required.');
      return;
    }
    if (!editingProduct.name[lang].trim()) {
      setError(`Product name (${lang}) is required.`);
      return;
    }

    const exists = products.some((p) => p.id === editingProduct.id);
    if (exists) {
      updateProducts(products.map((p) => (p.id === editingProduct.id ? editingProduct : p)));
    } else {
      updateProducts([...products, editingProduct]);
    }
    setEditOpen(false);
    setEditingProduct(null);
  };

  /** Updates a field on the editing product. */
  const handleFieldChange = <K extends keyof Product>(field: K, value: Product[K]): void => {
    setEditingProduct((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  /** Gets the category label for display. */
  const getCategoryLabel = (categoryId: string): string => {
    const cat = productCategories.find((c) => c.id === categoryId);
    return cat?.label[lang] ?? categoryId;
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
            Product Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {products.length} products in catalog
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Product
        </Button>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Image</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Name ({lang})</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Model</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} hover>
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
                    {product.name[lang] || '(empty)'}
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
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(product)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
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
            {products.some((p) => p.id === editingProduct?.id) ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {editingProduct && (
              <Box sx={{ mt: 1 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Model"
                    required
                    value={editingProduct.model}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange('model', e.target.value)}
                    size="small"
                  />
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={editingProduct.category}
                      label="Category"
                      onChange={(e) => handleFieldChange('category', e.target.value)}
                    >
                      {editableCategories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.label[lang]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <TextField
                  fullWidth
                  label="Image URL"
                  required
                  value={editingProduct.image}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange('image', e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                  helperText="e.g. https://picsum.photos/seed/engine1/400/300"
                />
                {editingProduct.image && (
                  <Box sx={{ mb: 2 }}>
                    <Avatar
                      src={editingProduct.image}
                      alt="Preview"
                      variant="rounded"
                      sx={{ width: 120, height: 90 }}
                    />
                  </Box>
                )}
                <LocalizedTextField
                  label="Product Name"
                  required
                  value={editingProduct.name}
                  onChange={(value) => handleFieldChange('name', value)}
                />
                <LocalizedTextField
                  label="Description"
                  multiline
                  rows={3}
                  value={editingProduct.description}
                  onChange={(value) => handleFieldChange('description', value)}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setEditOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save
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
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete{' '}
            <strong>{deleteTarget?.name[lang]}</strong> ({deleteTarget?.model})?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProductManager;
