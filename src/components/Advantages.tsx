import { Box, Container, Typography, Grid } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PublicIcon from '@mui/icons-material/Public';
import { useLanguage } from '../i18n/LanguageContext';
import { useAdminData } from '../admin/AdminDataContext';
import type { CompanyInfo } from '../admin/adminStorage';

/** Advantage item definition with icon and key into companyInfo.advantages. */
interface AdvantageItem {
  icon: JSX.Element;
  advKey: keyof CompanyInfo['advantages'];
}

/** The four company advantages displayed in this section. */
const advantages: AdvantageItem[] = [
  {
    icon: <VerifiedIcon sx={{ fontSize: 48 }} />,
    advKey: 'oem',
  },
  {
    icon: <LocalShippingIcon sx={{ fontSize: 48 }} />,
    advKey: 'shipping',
  },
  {
    icon: <AttachMoneyIcon sx={{ fontSize: 48 }} />,
    advKey: 'price',
  },
  {
    icon: <PublicIcon sx={{ fontSize: 48 }} />,
    advKey: 'exportAdv',
  },
];

/**
 * Advantages section — four feature cards with icons highlighting
 * OEM quality, fast shipping, competitive pricing, and global export.
 */
function Advantages(): JSX.Element {
  const { lang } = useLanguage();
  const { companyInfo } = useAdminData();

  return (
    <Box id="advantages" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {advantages.map((adv, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'secondary.main',
                    boxShadow: '0 8px 25px rgba(255,107,0,0.12)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    mb: 2,
                    borderRadius: '50%',
                    backgroundColor: 'primary.light',
                    color: '#fff',
                  }}
                >
                  {adv.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {companyInfo.advantages[adv.advKey].title[lang]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {companyInfo.advantages[adv.advKey].desc[lang]}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Advantages;
