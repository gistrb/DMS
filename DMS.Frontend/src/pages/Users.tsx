import { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, Select, MenuItem, InputLabel, FormControl, Switch
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { getUsersApi, updateUserApi, deleteUserApi } from '../api/users';
import type { User, UpdateUserRequest } from '../types';

const ROLES = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Manager' },
  { id: 3, name: 'Editor' },
  { id: 4, name: 'Viewer' },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserRequest>({});

  const loadUsers = async () => {
    try { setUsers(await getUsersApi()); } catch { /* ignore */ }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleEdit = (u: User) => {
    setEditUser(u);
    setEditForm({ fullName: u.fullName, email: u.email, isActive: u.isActive, roleId: u.roleId });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editUser) return;
    try {
      await updateUserApi(editUser.id, editForm);
      setEditOpen(false);
      loadUsers();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      await deleteUserApi(id);
      loadUsers();
    } catch { /* ignore */ }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>User Management</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.fullName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Chip label={u.roleName} size="small" color={u.roleName === 'Admin' ? 'error' : u.roleName === 'Manager' ? 'warning' : 'default'} /></TableCell>
                <TableCell><Chip label={u.isActive ? 'Active' : 'Disabled'} size="small" color={u.isActive ? 'success' : 'default'} /></TableCell>
                <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEdit(u)}><Edit /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(u.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User: {editUser?.username}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Full Name" margin="dense" value={editForm.fullName || ''}
            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
          <TextField fullWidth label="Email" margin="dense" value={editForm.email || ''}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select value={editForm.roleId || 4} label="Role"
              onChange={(e) => setEditForm({ ...editForm, roleId: Number(e.target.value) })}>
              {ROLES.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography sx={{ mr: 1 }}>Active</Typography>
            <Switch checked={editForm.isActive ?? true} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
