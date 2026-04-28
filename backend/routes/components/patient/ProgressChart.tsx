
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProgressLogEntry } from '../../types';

interface ProgressChartProps {
  data: ProgressLogEntry[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const formattedData = data.map(entry => ({
    ...entry,
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  if (data.length === 0) {
      return <div className="flex items-center justify-center h-full text-gray-500">No progress logged yet.</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={formattedData}
        margin={{
          top: 5,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="weight" stroke="#F97316" activeDot={{ r: 8 }} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;
