import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useLanguage } from '../i18n/LanguageContext';
import { useAdminData } from '../admin/AdminDataContext';

/** Company statistics displayed as animated counters in the About section. */
interface Stat {
  value: string;
  labelKey: string;
}

/** Stat label keys (values come from AdminDataContext). */
const statConfig: Stat[] = [
  { value: '', labelKey: 'about.stat1.label' },
  { value: '', labelKey: 'about.stat2.label' },
  { value: '', labelKey: 'about.stat3.label' },
  { value: '', labelKey: 'about.stat4.label' },
];

/**
 * About Us section — company introduction text paired with
 * key statistics showcasing export scale and reach.
 */
function About(): JSX.Element {
  const { t, lang } = useLanguage();
  const { companyInfo } = useAdminData();

  /** Merge stat config with values from admin data. */
  const stats: Stat[] = [
    { ...statConfig[0], value: companyInfo.stats.stat1 },
    { ...statConfig[1], value: companyInfo.stats.stat2 },
    { ...statConfig[2], value: companyInfo.stats.stat3 },
    { ...statConfig[3], value: companyInfo.stats.stat4 },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: '#F8FAFC',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="overline"
              sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: 2 }}
            >
              {t('about.badge')}
            </Typography>
            <Typography variant="h2" sx={{ mt: 1, mb: 3 }}>
              {companyInfo.title[lang]}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.8 }}
            >
              {companyInfo.description1[lang]}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ lineHeight: 1.8 }}
            >
              {companyInfo.description2[lang]}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              {stats.map((stat, index) => (
                <Grid item xs={6} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 3 },
                      textAlign: 'center',
                      borderRadius: 3,
                      backgroundColor: '#fff',
                      border: '1px solid #E2E8F0',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'secondary.main',
                        boxShadow: '0 8px 25px rgba(10,35,66,0.08)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        mb: 1,
                        color: 'secondary.main',
                      }}
                    >
                      <TrendingUpIcon />
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        color: 'primary.main',
                        fontSize: { xs: '1.75rem', sm: '2.25rem' },
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500, mt: 0.5 }}
                    >
                      {t(stat.labelKey)}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default About;
