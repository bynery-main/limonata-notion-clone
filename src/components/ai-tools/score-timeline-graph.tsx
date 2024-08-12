import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ScoreTimelineGraphProps {
  scores: number[];
}

const ScoreTimelineGraph: React.FC<ScoreTimelineGraphProps> = ({ scores }) => {
  const labels = scores.map((_, index) => `Evaluation ${index + 1}`);

  const data = {
    labels,
    datasets: [
      {
        label: "Mean Score",
        data: scores,
        fill: false,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Evaluation Timeline",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default ScoreTimelineGraph;
