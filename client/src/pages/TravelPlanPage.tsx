import React, { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  Divider,
  Chip,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Box as MuiBox
} from '@mui/material'
import {
  CalendarToday,
  Map,
  People,
  Wallet,
  Star,
  Edit,
  ChevronRight,
  ChevronLeft,
  Map as MapIcon
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useTravelStore } from '@store/travelStore'
import mapboxgl from 'mapbox-gl'

// 配置 Mapbox (需要设置您的 Mapbox token)
mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2x0aG5uN244MDB0czJqcWN4OTdub3VxNiJ9.3J5oW9X1n40X3V1TQkHcig'

const TravelPlanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getPlanById, currentPlan, isLoading } = useTravelStore()
  const [activeTab, setActiveTab] = useState(0)
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null)
  const mapContainer = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) {
      getPlanById(id)
    }
  }, [id, getPlanById])

  useEffect(() => {
    // 初始化地图
    if (currentPlan && mapContainer.current && !mapInstance) {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [116.404, 39.915], // 默认北京坐标
        zoom: 12
      })

      map.on('load', () => {
        // 添加地图控件
        map.addControl(new mapboxgl.NavigationControl(), 'top-right')
        
        // 添加标记点
        if (currentPlan.schedule) {
          currentPlan.schedule.forEach(day => {
            day.activities.forEach(activity => {
              if (activity.destination.coordinates) {
                new mapboxgl.Marker()
                  .setLngLat(activity.destination.coordinates)
                  .setPopup(new mapboxgl.Popup().setHTML(`<h3>${activity.activity}</h3><p>${activity.destination.name}</p>`))
                  .addTo(map)
              }
            })
          })
        }
        
        // 如果有第一个目的地，调整地图中心
        if (currentPlan.schedule && currentPlan.schedule[0]?.activities[0]?.destination.coordinates) {
          const firstCoord = currentPlan.schedule[0].activities[0].destination.coordinates
          map.setCenter(firstCoord)
        }
      })

      setMapInstance(map)

      // 清理函数
      return () => {
        map.remove()
        setMapInstance(null)
      }
    }
  }, [currentPlan, mapInstance])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  if (isLoading || !currentPlan) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const getDaySchedule = (dayIndex: number) => {
    return currentPlan.schedule?.[dayIndex]
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            {currentPlan.name}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Chip 
              icon={<Map fontSize="small" />} 
              label={currentPlan.destination} 
              color="primary" 
              sx={{ fontWeight: 500 }}
            />
            <Chip 
              icon={<CalendarToday fontSize="small" />} 
              label={`${formatDate(currentPlan.startDate)} - ${formatDate(currentPlan.endDate)}`}
            />
            <Chip 
              icon={<People fontSize="small" />} 
              label={`${currentPlan.people} 人`}
            />
            <Chip 
              icon={<Wallet fontSize="small" />} 
              label={`预算 ¥${currentPlan.budget.toLocaleString()}`}
            />
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate(`/budget/${currentPlan._id}`)}
          startIcon={<Wallet />}
          sx={{ ml: 2 }}
        >
          管理预算
        </Button>
      </Box>

      {/* 选项卡 */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="行程概览" icon={<CalendarToday fontSize="small" />} iconPosition="start" />
          <Tab label="地图视图" icon={<MapIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* 行程概览 */}
      {activeTab === 0 && (
        <Box>
          {currentPlan.schedule?.map((day, index) => (
            <Card key={day.day} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
                  <Typography variant="h6" fontWeight="bold">
                    第 {day.day} 天 ({formatDate(day.date)})
                  </Typography>
                </Box>
                
                {/* 住宿信息 */}
                {day.accommodation && (
                  <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2, minWidth: 80 }}>
                      住宿
                    </Typography>
                    <Box flexGrow={1}>
                      <Typography variant="body1" fontWeight="500">
                        {day.accommodation.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {day.accommodation.address}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {/* 活动列表 */}
                {day.activities.map((activity, actIndex) => (
                  <React.Fragment key={actIndex}>
                    <Box sx={{ p: 3, display: 'flex', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2, minWidth: 80 }}>
                        {activity.time}
                      </Typography>
                      <Box flexGrow={1}>
                        <Typography variant="body1" fontWeight="500">
                          {activity.activity}
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                          {activity.destination.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.destination.address}
                        </Typography>
                        {activity.notes && (
                          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                            备注：{activity.notes}
                          </Typography>
                        )}
                      </Box>
                      <IconButton size="small">
                        <Edit fontSize="small" />
                      </IconButton>
                    </Box>
                    {actIndex < day.activities.length - 1 && (
                      <Divider sx={{ ml: 8 }} />
                    )}
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* 地图视图 */}
      {activeTab === 1 && (
        <Box sx={{ height: '70vh', position: 'relative' }}>
          <div 
            ref={mapContainer} 
            style={{ 
              width: '100%', 
              height: '100%',
              borderRadius: 8,
              overflow: 'hidden'
            }}
          />
          
          {/* 行程选择器 */}
          <Paper sx={{ 
            position: 'absolute', 
            top: 20, 
            left: 20, 
            p: 2, 
            maxWidth: 300,
            background: 'rgba(255, 255, 255, 0.95)'
          }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              选择日期查看行程
            </Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {currentPlan.schedule?.map((day, index) => (
                <Button
                  key={day.day}
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    // 切换到该天的第一个地点
                    if (day.activities[0]?.destination.coordinates && mapInstance) {
                      mapInstance.flyTo({
                        center: day.activities[0].destination.coordinates,
                        zoom: 14
                      })
                    }
                  }}
                  sx={{ mb: 1, justifyContent: 'flex-start' }}
                >
                  第 {day.day} 天: {formatDate(day.date)}
                </Button>
              ))}
            </Box>
          </Paper>
        </Box>
      )}
    </Container>
  )
}

export default TravelPlanPage