/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ModelSelection from './components/models/ModelDashboard';
import { HomeDashboard } from './components/home/HomeDashboard';
import InstanceDashboard from './components/instances/InstancesDashboard';
import { ScenarioDashboard } from './components/scenarios/ScenariosDashboard';
import { ScenarioEditor } from './components/scenarios/ScenarioEditor';
import { ToastProvider } from './context/ToastContext';
import './App.css';

const theme = createTheme({
  components: {},
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <ToastProvider>
      <BrowserRouter>
        <div className="App-content">
          <Routes>
            <Route path="/models" element={<ModelSelection />} />
            <Route path="/instances" element={<InstanceDashboard />} />
            <Route path="/instances/:name" element={<InstanceDashboard />} />
            <Route path="/scenarios" element={<ScenarioDashboard />} />
            <Route path="/scenarios/:name" element={<ScenarioEditor />} />

            {/* TODO: Temp route for quick debugging. Currently only support one instance "" */}
            <Route path="/" element={<HomeDashboard />} />
            {/* <Route path="/" element={<InstanceDashboard />} /> */}

            <Route path="*" element={<InstanceDashboard />} />
          </Routes>
        </div>
      </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
