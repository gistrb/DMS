import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, TablePagination, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { Add, Delete, Download, Visibility } from '@mui/icons-material';
import { getDocumentsApi, deleteDocumentApi, uploadDocumentApi, downloadDocumentApi } from '../api/documents';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from '../components/FileUpload';
import type { DocumentItem } from '../types';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function Documents() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '', categoryId: 0 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const canCreate = hasPermission('documents.create');
  const canDelete = hasPermission('documents.delete');
  const canDownload = hasPermission('documents.download');

  const loadDocs = useCallback(async () => {
    try {
      const res = await getDocumentsApi({ search: search || undefined, page: page + 1, pageSize: rowsPerPage });
      setDocs(res.items);
      setTotal(res.totalCount);
    } catch { /* ignore */ }
  }, [search, page, rowsPerPage]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    const fd = new FormData();
    fd.append('title', uploadData.title);
    fd.append('description', uploadData.description);
    if (uploadData.categoryId > 0) fd.append('categoryId', String(uploadData.categoryId));
    fd.append('file', selectedFile);
    try {
      await uploadDocumentApi(fd);
      setUploadOpen(false);
      setSelectedFile(null);
      setUploadData({ title: '', description: '', categoryId: 0 });
      loadDocs();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this document?')) return;
    try {
      await deleteDocumentApi(id);
      loadDocs();
    } catch { /* ignore */ }
  };

  const handleDownload = async (id: number, fileName: string) => {
    try {
      const blob = await downloadDocumentApi(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName; a.click();
      window.URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Documents</Typography>
        {canCreate && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setUploadOpen(true)}>Upload Document</Button>
        )}
      </Box>

      <TextField fullWidth size="small" placeholder="Search documents..." value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ mb: 2 }} />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Uploaded By</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {docs.map((doc) => (
              <TableRow key={doc.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{doc.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{doc.fileName}</Typography>
                </TableCell>
                <TableCell>{doc.categoryName ? <Chip label={doc.categoryName} size="small" /> : '-'}</TableCell>
                <TableCell>v{doc.version}</TableCell>
                <TableCell>{formatSize(doc.fileSize)}</TableCell>
                <TableCell>{doc.uploadedByName}</TableCell>
                <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => navigate(`/documents/${doc.id}`)}><Visibility /></IconButton>
                  {canDownload && <IconButton size="small" onClick={() => handleDownload(doc.id, doc.fileName)}><Download /></IconButton>}
                  {canDelete && <IconButton size="small" color="error" onClick={() => handleDelete(doc.id)}><Delete /></IconButton>}
                </TableCell>
              </TableRow>
            ))}
            {docs.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center"><Typography sx={{ py: 2 }} color="text.secondary">No documents found</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
      </TableContainer>

      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Title" margin="dense" value={uploadData.title}
            onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })} required />
          <TextField fullWidth label="Description" margin="dense" multiline rows={2} value={uploadData.description}
            onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select value={uploadData.categoryId} label="Category"
              onChange={(e) => setUploadData({ ...uploadData, categoryId: Number(e.target.value) })}>
              <MenuItem value={0}>None</MenuItem>
              <MenuItem value={1}>General</MenuItem>
              <MenuItem value={2}>HR</MenuItem>
              <MenuItem value={3}>Finance</MenuItem>
              <MenuItem value={4}>Technical</MenuItem>
              <MenuItem value={5}>Legal</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <FileUpload onFileSelect={(f) => setSelectedFile(f)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload} disabled={!selectedFile || !uploadData.title}>Upload</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
