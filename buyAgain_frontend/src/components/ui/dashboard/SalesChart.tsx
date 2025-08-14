import React from 'react';
import { Line } from 'react-chartjs-2';

const SalesChart: React.FC = () => {
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

  return (
    <section className="mt-10 rounded-lg bg-white p-6 shadow dark:bg-gray-900">
      <Line data={data} options={options} />
    </section>
  );
};

export default SalesChart;
