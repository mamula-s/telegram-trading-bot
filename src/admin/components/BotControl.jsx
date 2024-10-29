// src/admin/components/BotControl.jsx
import React, { useState } from 'react';
import AdminAPI from '../services/api';

const BotControl = () => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState({
    subscriptionType: 'all',
    isActive: true
  });

  const handleBroadcast = async () => {
    try {
      setSending(true);
      const result = await AdminAPI.broadcastMessage(message, filter);
      alert(`Message sent successfully to ${result.success} users`);
      setMessage('');
    } catch (error) {
      console.error('Broadcast error:', error);
      alert('Error sending message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium mb-4">Broadcast Message</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            rows={4}
            className="mt-1 block w-full border rounded-md shadow-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message text..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subscription Type
            </label>
            <select
              className="mt-1 block w-full rounded-md border"
              value={filter.subscriptionType}
              onChange={(e) => setFilter({
                ...filter,
                subscriptionType: e.target.value
              })}
            >
              <option value="all">All Users</option>
              <option value="free">Free Users</option>
              <option value="premium">Premium Users</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              User Status
            </label>
            <select
              className="mt-1 block w-full rounded-md border"
              value={filter.isActive.toString()}
              onChange={(e) => setFilter({
                ...filter,
                isActive: e.target.value === 'true'
              })}
            >
              <option value="true">Active Users</option>
              <option value="false">All Users</option>
            </select>
          </div>
        </div>

        <button
          className="w-full btn-primary"
          onClick={handleBroadcast}
          disabled={sending || !message.trim()}
        >
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </div>
  );
};

export default BotControl;