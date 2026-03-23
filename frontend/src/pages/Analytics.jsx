import React from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import { getDailyStudyData, getSubjectDistribution, getMoodDistribution } from '../utils/analyticsHelpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Analytics = () => {
  const { data: studyData } = useStudy();
  const { sessions } = studyData;

  const dailyData = getDailyStudyData(sessions);
  const subjectData = getSubjectDistribution(sessions);
  const moodData = getMoodDistribution(sessions);

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Study Hours (Last 7 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Subject Distribution',
      },
    },
  };

  const barChartData = {
    labels: dailyData.labels,
    datasets: [
      {
        label: 'Study Hours',
        data: dailyData.data,
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const doughnutChartData = {
    labels: subjectData.labels,
    datasets: [
      {
        data: subjectData.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Rule-based Insights (Simple AI)
  const getInsights = () => {
    const insights = [];
    if (sessions.length === 0) return ["Start studying to get insights!"];
    
    // Check if mostly studying in evening (after 6 PM)
    const eveningSessions = sessions.filter(s => new Date(s.startTime).getHours() >= 18);
    if (eveningSessions.length > sessions.length / 2) {
      insights.push("🌙 You seem to be a night owl! Most of your sessions are in the evening.");
    }

    // Check average session length
    const avgDuration = sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length;
    if (avgDuration > 45 * 60) {
      insights.push("🧠 You have great stamina! Your sessions average over 45 minutes.");
    } else {
      insights.push("⚡ You prefer short bursts. Try the Pomodoro technique!");
    }

    // Mood Insights
    const moods = sessions.map(s => s.mood || 'neutral');
    const focusedCount = moods.filter(m => m === 'focused').length;
    if (focusedCount > sessions.length / 3) {
      insights.push("🔥 You are in the zone! High focus detected in many sessions.");
    }

    return insights;
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-500">Visualize your progress and habits.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <Bar options={barOptions} data={barChartData} />
        </div>

        {/* Subject Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="h-64 flex items-center justify-center">
             {subjectData.labels.length > 0 ? (
               <Doughnut options={doughnutOptions} data={doughnutChartData} />
             ) : (
               <p className="text-gray-400">No data yet</p>
             )}
          </div>
        </div>

        {/* Mood Tracker */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="h-64 flex items-center justify-center">
             {moodData.labels.length > 0 ? (
               <div className="w-full max-w-md">
                  <Pie options={moodOptions} data={moodChartData} />
               </div>
             ) : (
               <p className="text-gray-400">Track your mood after sessions to see data</p>
             )}
          </div>
        </div>
      </div>

      {/* Smart Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
        <h2 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
          ✨ Smart Study Insights
        </h2>
        <div className="space-y-2">
          {getInsights().map((insight, index) => (
            <div key={index} className="flex items-start gap-2 bg-white/60 p-3 rounded-lg">
              <span className="text-indigo-600">•</span>
              <p className="text-indigo-800">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
