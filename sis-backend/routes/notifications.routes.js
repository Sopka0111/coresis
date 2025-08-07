import express from 'express'

const router = express.Router()

// Sample notifications data
const sampleNotifications = [
  {
    id: 1,
    title: 'New student enrolled',
    message: 'Sarah Johnson has enrolled in Advanced Massage Therapy course',
    timestamp: new Date().toISOString(),
    read: false,
    important: true,
    type: 'success',
    category: 'Admissions'
  },
  {
    id: 2,
    title: 'Payment received',
    message: 'Tuition payment received from Michael Chen',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: false,
    type: 'info',
    category: 'Finance'
  },
  {
    id: 3,
    title: 'Course completion',
    message: 'Introduction to Swedish Massage completed by 15 students',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    type: 'success',
    category: 'Academics'
  }
]

// GET /api/notifications - Get all notifications
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      notifications: sampleNotifications
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    })
  }
})

// PATCH /api/notifications/:id - Update notification
router.patch('/:id', (req, res) => {
  try {
    const notificationId = parseInt(req.params.id)
    const updates = req.body
    
    const notification = sampleNotifications.find(n => n.id === notificationId)
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      })
    }
    
    Object.assign(notification, updates)
    
    res.json({
      success: true,
      notification
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update notification',
      error: error.message
    })
  }
})

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', (req, res) => {
  try {
    const notificationId = parseInt(req.params.id)
    const index = sampleNotifications.findIndex(n => n.id === notificationId)
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      })
    }
    
    sampleNotifications.splice(index, 1)
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    })
  }
})

export default router