import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AppUser, Patient } from '../../types';

interface PlatformChartProps {
  patients: Patient[];
  dieticians: AppUser[];
}

const PlatformChart: React.FC<PlatformChartProps> = ({ patients, dieticians }) => {

  const data = React.useMemo(() => {
    const chartData = [];
    const today = new Date();
    const totalPatients = patients.length;
    const totalDieticians = dieticians.length;

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        // Simulate a growth curve. Using a power function for a gentle curve.
        // `(7-i)/7` gives a value from 1/7 to 1.
        const ratio = (7 - i) / 7;
        
        let patientCount, dieticianCount;

        if (i === 0) {
            // Ensure the last day (today) shows the exact total
            patientCount = totalPatients;
            dieticianCount = totalDieticians;
        } else {
            patientCount = Math.round(totalPatients * Math.pow(ratio, 1.5));
            dieticianCount = Math.round(totalDieticians * Math.pow(ratio, 1.5));
        }
        
        chartData.push({
            name: dayName,
            Patients: patientCount,
            Dieticians: dieticianCount,
        });
    }

    return chartData;
  }, [patients, dieticians]);


  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Patients" fill="#F97316" />
        <Bar dataKey="Dieticians" fill="#10B981" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PlatformChart;