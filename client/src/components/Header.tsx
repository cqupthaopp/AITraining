import React from 'react'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton, 
  Avatar, 
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material'
import { 
  Menu as MenuIcon, 
  Search, 
  Notifications, 
  Settings,
  Logout,
  AccountCircle
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'

const Header: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const isAuthenticated = !!user
  const isLoginPage = location.pathname === '/login' || location.pathname === '/register'

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleMenuClose()
  }

  const handleSettings = () => {
    navigate('/settings')
    handleMenuClose()
  }

  if (isLoginPage) {
    return null
  }

  return (
    <AppBar position="static" elevation={1} sx={{ bgcolor: 'white', color: 'primary.main' }}>
      <Toolbar>
        <Box sx={{ display: { xs: 'block', md: 'none' }, mr: 2 }}>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
        </Box>
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          AI 旅行规划师
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isAuthenticated && (
            <>
              <Tooltip title="通知">
                <IconButton color="inherit">
                  <Notifications />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="设置">
                <IconButton color="inherit" onClick={handleSettings}>
                  <Settings />
                </IconButton>
              </Tooltip>
              
              <Box>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenuOpen}
                  color="inherit"
                >
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleMenuClose}>
                    <AccountCircle size={18} sx={{ mr: 2 }} />
                    <Typography>{user?.name}</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleSettings}>
                    <Settings fontSize="small" sx={{ mr: 2 }} />
                    <Typography>设置</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Logout fontSize="small" sx={{ mr: 2, color: 'error.main' }} />
                    <Typography color="error">退出登录</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header