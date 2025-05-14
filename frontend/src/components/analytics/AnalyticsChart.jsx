import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const AnalyticsChart = ({ data, title, type }) => {
  const renderChart = () => {
    if (type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'currentColor' }}
              tickLine={{ stroke: 'currentColor' }}
              axisLine={{ stroke: 'currentColor' }}
              className="text-gray-500 dark:text-gray-400"
              angle={-45}
              textAnchor="end"
            />
            <YAxis 
              tick={{ fill: 'currentColor' }}
              tickLine={{ stroke: 'currentColor' }}
              axisLine={{ stroke: 'currentColor' }}
              className="text-gray-500 dark:text-gray-400"
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'var(--tooltip-bg, #fff)', 
                borderColor: 'var(--tooltip-border, #ccc)',
                color: 'var(--tooltip-text, #333)'
              }}
              itemStyle={{ color: 'var(--tooltip-item, inherit)' }}
              formatter={(value) => [`${value}`, '']}
              labelFormatter={(label) => `${label}`}
            />
            <Bar 
              dataKey="value" 
              name={title}
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'var(--tooltip-bg, #fff)', 
                borderColor: 'var(--tooltip-border, #ccc)',
                color: 'var(--tooltip-text, #333)'
              }}
              formatter={(value) => [`${value}`, '']}
              itemStyle={{ color: 'var(--tooltip-item, inherit)' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="text-gray-700 dark:text-gray-300">
        {renderChart()}
      </div>
    </div>
  );
};

export default AnalyticsChart;
