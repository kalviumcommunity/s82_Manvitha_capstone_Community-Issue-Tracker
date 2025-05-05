import React from 'react';

// Define sample ticket and user
const ticket = {
  id: 't1',
  title: 'Water Leakage in Unit 101',
  description: 'There is water leakage from the ceiling in Unit 101.',
  category: 'maintenance',
  priority: 'high',
  status: 'open',
  createdBy: 'user1',
  createdAt: '2025-05-02T10:00:00Z',
  updatedAt: '2025-05-02T10:30:00Z',
  comments: [
    {
      id: 'c1',
      ticketId: 't1',
      userId: 'user2',
      userName: 'Jane Doe',
      userRole: 'resident',
      content: 'I noticed this issue and reported it to maintenance.',
      createdAt: '2025-05-02T10:15:00Z',
    }
  ],
  unit: '101',
};

const UserDetails = ({ user }) => (
  <div>
    <h3>{user.name}</h3>
    <p>{user.email}</p>
    <p>Role: {user.role}</p>
  </div>
);

const TicketDetails = () => {
  return (
    <div className="ticket-details">
      <h2>{ticket.title}</h2>
      <p><strong>Description:</strong> {ticket.description}</p>
      <p><strong>Category:</strong> {ticket.category}</p>
      <p><strong>Priority:</strong> {ticket.priority}</p>
      <p><strong>Status:</strong> {ticket.status}</p>
      <p><strong>Created By:</strong> {ticket.createdBy}</p>
      <p><strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
      <p><strong>Updated At:</strong> {new Date(ticket.updatedAt).toLocaleString()}</p>
      <div className="comments-section">
        <h3>Comments:</h3>
        {ticket.comments.map((comment) => (
          <div key={comment.id} className="comment">
            <p><strong>{comment.userName} ({comment.userRole})</strong></p>
            <p>{comment.content}</p>
            <p><small>{new Date(comment.createdAt).toLocaleString()}</small></p>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  // Sample user
  const user = {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'president',
  };

  return (
    <div>
      <UserDetails user={user} />
      <TicketDetails />
    </div>
  );
};

export default App;
