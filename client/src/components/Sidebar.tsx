import React from 'react'
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider,
  Box
} from '@mui/material'
import { 
  Home, 
  CalendarToday, 
  Wallet, 
  Map, 
  Settings, 
  Help, 
  Info,
  Add as AddIcon
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTravelStore } from '@store/travelStore'
import { useAuthStore } from '@store/authStore'

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { plans } = useTravelStore()

  const getActiveRoute = (route: string) => {
    return location.pathname.includes(route)
  }

  const menuItems = [
    {
      text: '首页',
      icon: <Home />,
      route: '/',
      color: 'primary.main'
    },
    {
      text: '我的行程',
      icon: <CalendarToday />,
      route: '/',
      color: 'primary.main'
    },
    {
      text: '预算管理',
      icon: <Wallet />,
      route: '/budget',
      color: 'secondary.main'
    },
    {
      text: '地图视图',
      icon: <Map />,
      route: '/plan',
      color: 'info.main'
    },
    {
      text: '设置',
      icon: <Settings />,
      route: '/settings',
      color: 'default'
    },
  ]

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: 'border-box',
          borderRight: '1px solid #f0f0f0',
          backgroundColor: 'white'
        },
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          AI 旅行规划师
        </Typography>
        {user && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            您好，{user.name}
          </Typography>
        )}
      </Box>
      
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => navigate(item.route)}
            sx={{
              backgroundColor: getActiveRoute(item.route) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ color: getActiveRoute(item.route) ? item.color : 'default' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontWeight: getActiveRoute(item.route) ? 600 : 400
              }}
            />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ p: 2 }}>
        <ListItem 
          button 
          onClick={() => navigate('/')}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <AddIcon />
          </ListItemIcon>
          <ListItemText 
            primary="创建新计划" 
            primaryTypographyProps={{ fontWeight: 600, color: 'white' }}
          />
        </ListItem>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          最近的旅行计划
        </Typography>
        <List>
          {plans.slice(0, 3).map((plan) => (
            <ListItem 
              button 
              key={plan._id}
              onClick={() => navigate(`/plan/${plan._id}`)}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                },
                py: 1
              }}
            >
              <ListItemText 
                primary={plan.name} 
                secondary={plan.destination}
                primaryTypographyProps={{ fontSize: '0.875rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItem>
          ))}
          {plans.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              暂无旅行计划
            </Typography>
          )}
        </List>
      </Box>
      
      <Box sx={{ mt: 'auto', p: 3, borderTop: '1px solid #f0f0f0' }}>
        <List>
          <ListItem button key="help">
            <ListItemIcon><Help fontSize="small" /></ListItemIcon>
            <ListItemText primary="帮助中心" />
          </ListItem>
          <ListItem button key="about">
            <ListItemIcon><Info fontSize="small" /></ListItemIcon>
            <ListItemText primary="关于我们" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  )
}

export default Sidebar