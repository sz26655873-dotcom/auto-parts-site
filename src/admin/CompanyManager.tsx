/**
 * Company info management page — form for editing company details.
 *
 * Edits company name, about section title, descriptions (all 5 languages),
 * statistics, and advantage card titles/descriptions (5 languages).
 * Changes are saved to localStorage and immediately reflected on the site.
 */

import { useState, type FormEvent, type ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PublicIcon from '@mui/icons-material/Public';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAdminData } from './AdminDataContext';
import type { CompanyInfo } from './adminStorage';
import LocalizedTextField from './LocalizedTextField';

/**
 * Company info editor form with save button.
 */
function CompanyManager(): JSX.Element {
  const { companyInfo, updateCompanyInfo } = useAdminData();
  const [formData, setFormData] = useState<CompanyInfo>({
    ...companyInfo,
    stats: { ...companyInfo.stats },
    advantages: {
      oem: { ...companyInfo.advantages.oem },
      shipping: { ...companyInfo.advantages.shipping },
      price: { ...companyInfo.advantages.price },
      exportAdv: { ...companyInfo.advantages.exportAdv },
    },
  });
  const [saved, setSaved] = useState<boolean>(false);

  /** Updates a localized top-level field. */
  const handleLocalizedChange = (field: 'name' | 'title' | 'description1' | 'description2') => (
    value: typeof formData.name,
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  /** Updates a stat value. */
  const handleStatChange = (statKey: keyof CompanyInfo['stats']) => (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    setFormData((prev) => ({
      ...prev,
      stats: { ...prev.stats, [statKey]: event.target.value },
    }));
    setSaved(false);
  };

  /** Updates a localized advantage field. */
  const handleAdvantageChange = (
    advKey: keyof CompanyInfo['advantages'],
    field: 'title' | 'desc',
    value: typeof formData.name,
  ): void => {
    setFormData((prev) => ({
      ...prev,
      advantages: {
        ...prev.advantages,
        [advKey]: { ...prev.advantages[advKey], [field]: value },
      },
    }));
    setSaved(false);
  };

  /** Saves the company info. */
  const handleSave = (event: FormEvent): void => {
    event.preventDefault();
    updateCompanyInfo(formData);
    setSaved(true);
  };

  /** Stat input configuration. */
  const statFields: { key: keyof CompanyInfo['stats']; label: string }[] = [
    { key: 'stat1', label: 'Export Volume / Year' },
    { key: 'stat2', label: 'Countries Served' },
    { key: 'stat3', label: 'Product Types' },
    { key: 'stat4', label: 'Active Clients' },
  ];

  /** Advantage section configuration. */
  const advantageSections: {
    key: keyof CompanyInfo['advantages'];
    label: string;
    icon: JSX.Element;
  }[] = [
    { key: 'oem', label: 'OEM Quality', icon: <VerifiedIcon color="secondary" /> },
    { key: 'shipping', label: 'Fast Shipping', icon: <LocalShippingIcon color="secondary" /> },
    { key: 'price', label: 'Competitive Price', icon: <AttachMoneyIcon color="secondary" /> },
    { key: 'exportAdv', label: 'Global Export', icon: <PublicIcon color="secondary" /> },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
        Company Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Edit company name, descriptions, statistics, and advantage cards. All text fields support 5 languages.
      </Typography>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 } }}>
        <form onSubmit={handleSave}>
          {saved && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Company information saved successfully!
            </Alert>
          )}

          {/* Company name and title */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Company Name & Title
          </Typography>
          <LocalizedTextField
            label="Company Name"
            value={formData.name}
            onChange={handleLocalizedChange('name')}
          />
          <LocalizedTextField
            label="About Section Title"
            value={formData.title}
            onChange={handleLocalizedChange('title')}
          />

          <Divider sx={{ my: 3 }} />

          {/* Descriptions */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Company Description
          </Typography>
          <LocalizedTextField
            label="Description (Paragraph 1)"
            multiline
            rows={4}
            value={formData.description1}
            onChange={handleLocalizedChange('description1')}
          />
          <LocalizedTextField
            label="Description (Paragraph 2)"
            multiline
            rows={4}
            value={formData.description2}
            onChange={handleLocalizedChange('description2')}
          />

          <Divider sx={{ my: 3 }} />

          {/* Statistics */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="secondary" /> Statistics
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {statFields.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.key}>
                <TextField
                  fullWidth
                  label={stat.label}
                  value={formData.stats[stat.key]}
                  onChange={handleStatChange(stat.key)}
                  size="small"
                />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Advantages */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Advantage Cards
          </Typography>
          {advantageSections.map((section, index) => (
            <Box key={section.key}>
              {index > 0 && <Divider sx={{ my: 3 }} />}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                {section.icon} {section.label}
              </Typography>
              <LocalizedTextField
                label="Title"
                value={formData.advantages[section.key].title}
                onChange={(value) => handleAdvantageChange(section.key, 'title', value)}
              />
              <LocalizedTextField
                label="Description"
                multiline
                rows={2}
                value={formData.advantages[section.key].desc}
                onChange={(value) => handleAdvantageChange(section.key, 'desc', value)}
              />
            </Box>
          ))}

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" justifyContent="flex-end">
            <Button type="submit" variant="contained" color="primary" size="large">
              Save Changes
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}

export default CompanyManager;
