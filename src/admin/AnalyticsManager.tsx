/**
 * AnalyticsManager — admin analytics dashboard.
 *
 * Displays:
 * - Total / today product views
 * - Top 10 products by views (with names)
 * - Total inquiries count
 * - Page-view breakdown for key pages
 * - Visitor geography (country / city rankings)
 *
 * Data sources:
 * - /api/track?type=product   (product view counts, admin auth)
 * - /api/track?type=page      (page view counts,  admin auth)
 * - /api/track?type=country   (country view counts, admin auth)
 * - /api/track?type=city      (city view counts, admin auth)
 * - /api/inquiries            (inquiry list, admin auth)
 * - products from context      (to map slugs → display names)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Stack,
  LinearProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import BarChartIcon from '@mui/icons-material/BarChart';
import InboxIcon from '@mui/icons-material/Inbox';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PageviewIcon from '@mui/icons-material/Pageview';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAdminData } from './AdminDataContext';
import { getAuthToken } from './adminStorage';

/** One row returned by GET /api/track?type=product */
interface TrackRow {
  slug: string;
  count: number;
}

/** Inquiry (matches InquiryManager). */
interface Inquiry {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read';
}

/** Summary stat card. */
function StatCard({
  label,
  value,
  sub,
  icon,
  color = 'primary',
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: `${color}.light`,
              color: `${color}.main`,
              display: 'flex',
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            {sub && (
              <Typography variant="caption" color="text.disabled">
                {sub}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// -------- country helpers --------

function getCountryFlag(code: string): string {
  if (!code || code === 'unknown' || code === 'T1') return '🌐';
  return code.toUpperCase().replace(/./g, (c: string) =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );
}

const COUNTRY_NAMES: Record<string, string> = {
  CN: '中国', US: '美国', RU: '俄罗斯', DE: '德国', FR: '法国',
  GB: '英国', JP: '日本', KR: '韩国', IN: '印度', BR: '巴西',
  AU: '澳大利亚', CA: '加拿大', IT: '意大利', ES: '西班牙',
  MX: '墨西哥', ID: '印度尼西亚', NL: '荷兰', TR: '土耳其',
  SA: '沙特阿拉伯', CH: '瑞士', SE: '瑞典', NO: '挪威',
  DK: '丹麦', FI: '芬兰', PL: '波兰', TH: '泰国', VN: '越南',
  MY: '马来西亚', SG: '新加坡', AE: '阿联酋', ZA: '南非',
  EG: '埃及', NG: '尼日利亚', AR: '阿根廷', CL: '智利',
  CO: '哥伦比亚', PE: '秘鲁', PK: '巴基斯坦', BD: '孟加拉国',
  PH: '菲律宾',
};

function getCountryName(code: string): string {
  if (!code || code === 'unknown') return '🌐 未知';
  const name = COUNTRY_NAMES[code] || code;
  return `${getCountryFlag(code)} ${name}`;
}

/**
 * Analytics Manager — main component.
 */
function AnalyticsManager(): JSX.Element {
  const { products } = useAdminData();

  // -------- state --------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [productViews, setProductViews] = useState<TrackRow[]>([]);
  const [pageViews, setPageViews] = useState<TrackRow[]>([]);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [newInquiryCount, setNewInquiryCount] = useState(0);
  const [countryData, setCountryData] = useState<{ slug: string; count: number }[]>([]);
  const [cityData, setCityData] = useState<{ slug: string; count: number }[]>([]);

  // -------- fetch all data --------
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    const token = getAuthToken();
    if (!token) {
      setError('未登录，请重新登录');
      setLoading(false);
      return;
    }

    try {
      // Fetch product views, page views, country views, city views, and inquiries in parallel
      const [prodRes, pageRes, countryRes, cityRes, inqRes] = await Promise.all([
        fetch('/api/track?type=product', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/track?type=page', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/track?type=country', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/track?type=city', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/inquiries', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!prodRes.ok) throw new Error('获取产品浏览数据失败');
      if (!pageRes.ok) throw new Error('获取页面浏览数据失败');
      if (!countryRes.ok) throw new Error('获取国家浏览数据失败');
      if (!cityRes.ok) throw new Error('获取城市浏览数据失败');
      if (!inqRes.ok) throw new Error('获取询盘数据失败');

      const [prodData, pageData, countryDataJson, cityDataJson, inqData] = await Promise.all([
        prodRes.json() as Promise<{ data: TrackRow[] }>,
        pageRes.json() as Promise<{ data: TrackRow[] }>,
        countryRes.json() as Promise<{ data: { slug: string; count: number }[] }>,
        cityRes.json() as Promise<{ data: { slug: string; count: number }[] }>,
        inqRes.json() as Promise<{ inquiries: Inquiry[] }>,
      ]);

      setProductViews(prodData.data || []);
      setPageViews(pageData.data || []);
      setCountryData((countryDataJson.data || []).filter((d: { slug: string }) => d.slug && d.slug !== 'unknown'));
      setCityData(cityDataJson.data || []);

      const inquiries = inqData.inquiries || [];
      setInquiryCount(inquiries.length);
      setNewInquiryCount(inquiries.filter((i) => i.status === 'new').length);
    } catch (err) {
      setError(err instanceof Error ? err.message : '数据加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -------- merge product slugs → names --------
  const productViewWithNames = useMemo(() => {
    const map = new Map(products.map((p) => [p.slug, p]));
    return productViews.map((row) => ({
      ...row,
      name:
        map.get(row.slug)?.name?.['en'] ||
        map.get(row.slug)?.name?.['zh'] ||
        row.slug,
      category: map.get(row.slug)?.category || '',
    }));
  }, [productViews, products]);

  // -------- render --------
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalProductViews = productViews.reduce((s, r) => s + r.count, 0);
  const totalPageViews = pageViews.reduce((s, r) => s + r.count, 0);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        访客数据
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* -------- summary cards -------- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="产品浏览量"
            value={totalProductViews.toLocaleString()}
            sub="累计"
            icon={<VisibilityIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="页面浏览量"
            value={totalPageViews.toLocaleString()}
            sub="累计"
            icon={<PageviewIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="询盘总数"
            value={inquiryCount}
            sub={`${newInquiryCount} 条未读`}
            icon={<InboxIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="转化率估算"
            value={totalProductViews > 0 ? ((inquiryCount / totalProductViews) * 100).toFixed(1) + '%' : '—'}
            sub="询盘 / 产品浏览"
            icon={<TrendingUpIcon />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* -------- top products -------- */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <BarChartIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                热门产品 TOP 10
              </Typography>
              <Tooltip title="刷新">
                <IconButton size="small" onClick={fetchData}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            {productViewWithNames.length === 0 ? (
              <Alert severity="info">暂无浏览数据</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>排名</TableCell>
                      <TableCell>产品名称</TableCell>
                      <TableCell align="right">浏览量</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productViewWithNames.slice(0, 10).map((row, idx) => (
                      <TableRow key={row.slug} hover>
                        <TableCell>
                          <Chip
                            label={idx + 1}
                            size="small"
                            color={idx < 3 ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {row.name}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {row.slug}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {row.count.toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* -------- page views -------- */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <PageviewIcon color="info" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                页面浏览量
              </Typography>
            </Stack>

            {pageViews.length === 0 ? (
              <Alert severity="info">暂无页面浏览数据</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>页面</TableCell>
                      <TableCell align="right">浏览量</TableCell>
                      <TableCell>占比</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pageViews.map((row) => {
                      const pct =
                        totalPageViews > 0
                          ? ((row.count / totalPageViews) * 100).toFixed(1)
                          : '0.0';
                      return (
                        <TableRow key={row.slug} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {row.slug}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {row.count.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: 120 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <LinearProgress
                                variant="determinate"
                                value={parseFloat(pct)}
                                sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {pct}%
                              </Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* -------- visitor geography -------- */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>访客地域分布</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>国家/地区排名</Typography>
                {countryData.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">暂无数据</Typography>
                ) : (
                  countryData.slice(0, 10).map((item, index) => (
                    <Box key={item.slug} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ width: 28, color: 'text.secondary', fontSize: '0.85rem' }}>{index + 1}</Typography>
                      <Typography sx={{ flex: 1, fontSize: '0.9rem' }}>{getCountryName(item.slug)}</Typography>
                      <Typography sx={{ width: 40, textAlign: 'right', fontWeight: 600, fontSize: '0.9rem' }}>{item.count}</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={countryData[0].count > 0 ? (item.count / countryData[0].count) * 100 : 0}
                        sx={{ width: 80, mx: 1, height: 6, borderRadius: 3, bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }}
                      />
                    </Box>
                  ))
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>城市排名</Typography>
                {cityData.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">暂无数据</Typography>
                ) : (
                  cityData.slice(0, 10).map((item, index) => (
                    <Box key={item.slug} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ width: 28, color: 'text.secondary', fontSize: '0.85rem' }}>{index + 1}</Typography>
                      <Typography sx={{ flex: 1, fontSize: '0.9rem' }}>{item.slug}</Typography>
                      <Typography sx={{ width: 40, textAlign: 'right', fontWeight: 600, fontSize: '0.9rem' }}>{item.count}</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={cityData[0].count > 0 ? (item.count / cityData[0].count) * 100 : 0}
                        sx={{ width: 80, mx: 1, height: 6, borderRadius: 3, bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main' } }}
                      />
                    </Box>
                  ))
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AnalyticsManager;
