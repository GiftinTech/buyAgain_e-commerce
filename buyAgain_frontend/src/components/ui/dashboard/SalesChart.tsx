import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const SalesChart: React.FC = () => {
  const [hasError, setHasError] = useState(false);
  console.log('SalesChart:', hasError);

  // simulate or handle dynamic data fetching here

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales ($)',
        data: [5000, 7000, 6000, 8000, 9000, 11000],
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.3)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: {
        display: true,
        text: 'Monthly Sales',
        color: '#ec4899',
        font: { size: 18, weight: 'bold' as const },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' },
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' },
      },
    },
  };

  // Error boundary for catching rendering issues
  try {
    return (
      <section className="mt-10 rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <Line data={data} options={options} />
      </section>
    );
  } catch (error) {
    console.error('Error rendering SalesChart:', error);
    setHasError(true);
    return (
      <section className="mt-10 rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <p className="text-red-500">
          Failed to load chart. Please try again later.
        </p>
      </section>
    );
  }
};

export default SalesChart;
