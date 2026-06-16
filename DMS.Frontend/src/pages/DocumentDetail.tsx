import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, LinearProgress
} from '@mui/material';
import { ArrowBack, Download, CloudUpload, Edit } from '@mui/icons-material';
import { getDocumentApi, updateDocumentApi, newVersionApi, downloadDocumentApi } from '../api/documents';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from '../components/FileUpload';

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [doc, setDoc] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [changeNote, setChangeNote] = useState('');

  const canEdit = hasPermission('documents.edit');
  const canCreate = hasPermission('documents.create');
  const canDownload = hasPermission('documents.download');

  useEffect(() => {
    if (id) getDocumentApi(Number(id)).then(setDoc).catch(() => navigate('/documents'));
  }, [id, navigate]);

  const handleEdit = async () => {
    if (!doc) return;
    try {
      const updated = await updateDocumentApi(doc.id, editData);
      setDoc(updated);
      setEditOpen(false);
    } catch { /* ignore */ }
  };

  const handleNewVersion = async () => {
    if (!doc || !versionFile) return;
    const fd = new FormData();
    fd.append('changeNote', changeNote);
    fd.append('file', versionFile);
    try {
      const updated = await newVersionApi(doc.id, fd);
      setDoc(updated);
      setVersionOpen(false);
      setVersionFile(null);
      setChangeNote('');
    } catch { /* ignore */ }
  };

  const handleDownload = async () => {
    if (!doc) return;
    try {
      const blob = await downloadDocumentApi(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = doc.fileName; a.click();
      window.URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  if (!doc) return <LinearProgress />;

  const fields = [
    { label: 'File', value: doc.fileName, xs: 6, sm: 3 },
    { label: 'Version', value: <Chip label={`v${doc.version}`} size="small" />, xs: 6, sm: 3 },
    { label: 'Category', value: doc.categoryName || '-', xs: 6, sm: 3 },
    { label: 'Size', value: `${(doc.fileSize / 1024).toFixed(1)} KB`, xs: 6, sm: 3 },
    { label: 'Uploaded By', value: doc.uploadedByName, xs: 6, sm: 3 },
    { label: 'Created', value: new Date(doc.createdAt).toLocaleString(), xs: 6, sm: 3 },
    ...(doc.updatedAt ? [{ label: 'Updated', value: new Date(doc.updatedAt).toLocaleString(), xs: 6, sm: 3 }] : []),
  ];

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/documents')} sx={{ mb: 2 }}>Back</Button>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{doc.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{doc.description}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {canEdit && <Button variant="outlined" startIcon={<Edit />} onClick={() => { setEditData({ title: doc.title, description: doc.description }); setEditOpen(true); }}>Edit</Button>}
            {canDownload && <Button variant="outlined" startIcon={<Download />} onClick={handleDownload}>Download</Button>}
            {canCreate && <Button variant="contained" startIcon={<CloudUpload />} onClick={() => setVersionOpen(true)}>New Version</Button>}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
          {fields.map((f) => (
            <Box key={f.label} sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(25% - 12px)' } }}>
              <Typography variant="caption" color="text.secondary">{f.label}</Typography>
              <Typography>{f.value}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Document</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Title" margin="dense" value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
          <TextField fullWidth label="Description" margin="dense" multiline rows={3} value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={versionOpen} onClose={() => setVersionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload New Version</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Change Note" margin="dense" multiline rows={2} value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)} />
          <Box sx={{ mt: 2 }}><FileUpload onFileSelect={(f) => setVersionFile(f)} /></Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleNewVersion} disabled={!versionFile}>Upload Version</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
