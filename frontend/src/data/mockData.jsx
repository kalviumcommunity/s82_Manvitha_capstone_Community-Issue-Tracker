// Removed: import { User, Ticket, Announcement, Comment, Notification, TicketCategory, TicketStatus, TicketPriority } from '../types';

// Mock Users
export const mockUsers = [
    {
      id: 'u1',
      name: 'John Smith',
      email: 'president@community.com',
      role: 'president',
      avatar: 'https://i.pravatar.cc/150?img=1',
      unit: 'Admin Office'
    },
    {
      id: 'u2',
      name: 'Sarah Johnson',
      email: 'vp@community.com',
      role: 'vice-president',
      avatar: 'https://i.pravatar.cc/150?img=2',
      unit: 'Admin Office'
    },
    {
      id: 'u3',
      name: 'Michael Brown',
      email: 'resident1@community.com',
      role: 'resident',
      avatar: 'https://i.pravatar.cc/150?img=3',
      unit: 'Apartment 101'
    },
    {
      id: 'u4',
      name: 'Emily Davis',
      email: 'resident2@community.com',
      role: 'resident',
      avatar: 'https://i.pravatar.cc/150?img=4',
      unit: 'Apartment 202'
    }
  ];
  
  // Mock Comments
  export const mockComments = [
    {
      id: 'c1',
      ticketId: 't1',
      userId: 'u1',
      userName: 'John Smith',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      userRole: 'president',
      content: 'I have assigned this to our maintenance team. They will be addressing this issue within 24 hours.',
      createdAt: '2025-04-05T14:30:00Z'
    },
    {
      id: 'c2',
      ticketId: 't1',
      userId: 'u3',
      userName: 'Michael Brown',
      userAvatar: 'https://i.pravatar.cc/150?img=3',
      userRole: 'resident',
      content: 'Thank you! The leak seems to be getting worse. Should I turn off the main water valve?',
      createdAt: '2025-04-05T15:10:00Z'
    },
    {
      id: 'c3',
      ticketId: 't2',
      userId: 'u2',
      userName: 'Sarah Johnson',
      userAvatar: 'https://i.pravatar.cc/150?img=2',
      userRole: 'vice-president',
      content: 'Security has been notified and will increase patrols in this area.',
      createdAt: '2025-04-06T09:15:00Z'
    }
  ];
  
  // Mock Tickets
  export const mockTickets = [
    {
      id: 't1',
      title: 'Water leak in bathroom',
      description: 'There is a leak coming from under the sink that is getting worse.',
      category: 'maintenance',
      priority: 'high',
      status: 'in-progress',
      createdBy: 'u3',
      createdAt: '2025-04-05T14:00:00Z',
      updatedAt: '2025-04-05T14:30:00Z',
      assignedTo: 'u2',
      comments: mockComments.filter(c => c.ticketId === 't1'),
      unit: 'Apartment 101'
    },
    {
      id: 't2',
      title: 'Suspicious activity in parking garage',
      description: 'I noticed someone looking into car windows last night around 11pm in the lower level.',
      category: 'security',
      priority: 'urgent',
      status: 'open',
      createdBy: 'u4',
      createdAt: '2025-04-06T08:00:00Z',
      updatedAt: '2025-04-06T09:15:00Z',
      assignedTo: 'u1',
      comments: mockComments.filter(c => c.ticketId === 't2'),
      unit: 'Apartment 202'
    },
    {
      id: 't3',
      title: 'Gym equipment broken',
      description: 'The treadmill nearest to the window is making a loud noise and stops working after a few minutes.',
      category: 'amenities',
      priority: 'medium',
      status: 'open',
      createdBy: 'u3',
      createdAt: '2025-04-07T10:30:00Z',
      updatedAt: '2025-04-07T10:30:00Z',
      comments: [],
      unit: 'Apartment 101'
    },
    {
      id: 't4',
      title: 'Noise complaint',
      description: 'The residents in 303 have been playing loud music past midnight every weekend.',
      category: 'noise',
      priority: 'medium',
      status: 'open',
      createdBy: 'u4',
      createdAt: '2025-04-08T09:00:00Z',
      updatedAt: '2025-04-08T09:00:00Z',
      comments: [],
      unit: 'Apartment 202'
    },
    {
      id: 't5',
      title: 'Garbage not collected',
      description: 'The garbage in the south bin area wasn\'t collected this week and is overflowing.',
      category: 'cleanliness',
      priority: 'high',
      status: 'resolved',
      createdBy: 'u3',
      createdAt: '2025-04-01T11:00:00Z',
      updatedAt: '2025-04-03T16:00:00Z',
      assignedTo: 'u2',
      comments: [],
      unit: 'Apartment 101'
    }
  ];
  
  // Mock Announcements
  export const mockAnnouncements = [
    {
      id: 'a1',
      title: 'Water Shutoff Notice',
      content: 'The water will be shut off on Monday, April 10th from 10am to 2pm for scheduled maintenance work on the main pipes.',
      createdBy: 'u1',
      createdAt: '2025-04-03T09:00:00Z',
      scheduledFor: '2025-04-10T10:00:00Z',
      important: true
    },
    {
      id: 'a2',
      title: 'Community Picnic',
      content: 'Join us for our annual community picnic in the central garden on Saturday, May 15th from 12pm to 4pm. Food and drinks will be provided!',
      createdBy: 'u1',
      createdAt: '2025-04-05T11:30:00Z',
      scheduledFor: '2025-05-15T12:00:00Z',
      important: false
    },
    {
      id: 'a3',
      title: 'New Security System Installation',
      content: 'We will be upgrading our security system next week. Technicians will need brief access to each unit. A schedule will be posted in the lobby.',
      createdBy: 'u2',
      createdAt: '2025-04-07T14:00:00Z',
      scheduledFor: '2025-04-14T09:00:00Z',
      important: true
    }
  ];
  
  // Mock Notifications
  export const mockNotifications = [
    {
      id: 'n1',
      userId: 'u1',
      title: 'New Urgent Ticket',
      message: 'A new urgent security ticket has been created and needs your attention.',
      read: false,
      createdAt: '2025-04-06T08:05:00Z',
      type: 'ticket',
      linkTo: '/tickets/t2'
    },
    {
      id: 'n2',
      userId: 'u2',
      title: 'Ticket Assigned',
      message: 'You have been assigned to handle the water leak ticket in Apartment 101.',
      read: true,
      createdAt: '2025-04-05T14:35:00Z',
      type: 'ticket',
      linkTo: '/tickets/t1'
    },
    {
      id: 'n3',
      userId: 'u3',
      title: 'Comment on Your Ticket',
      message: 'John Smith commented on your water leak ticket.',
      read: false,
      createdAt: '2025-04-05T14:32:00Z',
      type: 'ticket',
      linkTo: '/tickets/t1'
    },
    {
      id: 'n4',
      userId: 'u3',
      title: 'Important Announcement',
      message: 'Water Shutoff Notice: The water will be shut off on Monday, April 10th.',
      read: false,
      createdAt: '2025-04-03T09:01:00Z',
      type: 'announcement',
      linkTo: '/announcements/a1'
    }
  ];
  
  // Mock analytics data
  export const mockAnalytics = {
    ticketsByCategory: {
      maintenance: 10,
      security: 5,
      noise: 8,
      cleanliness: 12,
      amenities: 6,
      payments: 3,
      other: 2
    },
    ticketsByStatus: {
      open: 15,
      'in-progress': 12,
      resolved: 8,
      closed: 11
    },
    ticketsByPriority: {
      low: 10,
      medium: 15,
      high: 12,
      urgent: 9
    },
    ticketsTrend: [
      { date: '2025-03-01', count: 8 },
      { date: '2025-03-08', count: 10 },
      { date: '2025-03-15', count: 7 },
      { date: '2025-03-22', count: 12 },
      { date: '2025-03-29', count: 9 },
      { date: '2025-04-05', count: 14 }
    ],
    averageResolutionTime: 36 // hours
  };
  
  // Helper function to get tickets for a specific user
  export const getTicketsForUser = (userId) => {
    return mockTickets.filter(ticket => ticket.createdBy === userId || ticket.assignedTo === userId);
  };
  
  // Helper function to get all urgent tickets
  export const getUrgentTickets = () => {
    return mockTickets.filter(ticket => ticket.priority === 'urgent');
  };
  