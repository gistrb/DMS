import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, LinearProgress, Paper, IconButton } from '@mui/material';
import { CloudUpload, Close } from '@mui/icons-material';

interface Props {
  onFileSelect: (file: File) => void;
}

export default function FileUpload({ onFileSelect }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setSelectedFile(accepted[0]);
      onFileSelect(accepted[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3, textAlign: 'center', cursor: 'pointer', border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          {isDragActive ? 'Drop file here...' : 'Drag & drop a file here, or click to select'}
        </Typography>
      </Paper>
      {selectedFile && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress variant="determinate" value={100} sx={{ flexGrow: 1 }} />
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{selectedFile.name}</Typography>
          <IconButton size="small" onClick={() => setSelectedFile(null)}><Close fontSize="small" /></IconButton>
        </Box>
      )}
    </Box>
  );
}
