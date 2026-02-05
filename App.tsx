
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import AnalysisDetail from './pages/AnalysisDetail';
import Trends from './pages/Trends';

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/report/:id" element={<AnalysisDetail />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Layout>
      </HashRouter>
    </I18nextProvider>
  );
};

export default App;
