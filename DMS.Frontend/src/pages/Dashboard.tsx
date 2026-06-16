import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Description, CloudUpload, Storage } from '@mui/icons-material';
import { getDocumentsApi } from '../api/documents';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, totalSize: 0 });

  useEffect(() => {
    getDocumentsApi({ page: 1, pageSize: 1 }).then((res) => {
      const sizeMB = res.items.reduce((sum, d) => sum + d.fileSize, 0) / (1024 * 1024);
      setStats({ total: res.totalCount, totalSize: sizeMB });
    }).catch(() => {});
  }, []);

  const cards = [
    { title: 'Total Documents', value: stats.total, icon: <Description sx={{ fontSize: 40 }} />, color: '#1976d2' },
    { title: 'Total Size', value: `${stats.totalSize.toFixed(2)} MB`, icon: <Storage sx={{ fontSize: 40 }} />, color: '#388e3c' },
    { title: 'Storage Used', value: `${((stats.totalSize / 1024) * 100).toFixed(1)}%`, icon: <CloudUpload sx={{ fontSize: 40 }} />, color: '#f57c00' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Dashboard</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {cards.map((card) => (
          <Box key={card.title} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.33% - 16px)' } }}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ color: card.color }}>{card.icon}</Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{card.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{card.title}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
