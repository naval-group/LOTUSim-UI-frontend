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
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ModelSelection from "./components/models/modelDashboard";
import { HomeDashboard } from "./components/home/home_dashboard";
import InstanceDashboard from "./components/instances/instances_dashboard";
import { ScenarioDashboard } from "./components/scenarios/scenario_dashboard"
import "./App.css";

const theme = createTheme({
  components: {

  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <div className="App-content">
          <Routes>
            <Route path="/models" element={<ModelSelection />} />
            <Route path="/instaces" element={<InstanceDashboard />} />
            <Route path="/instances/:name" element={<InstanceDashboard />} />
            <Route path="/scenarios" element={<ScenarioDashboard />} />

            {/* TODO: Temp route for quick debugging. Currently only support one instance "" */}
            <Route path="/" element={<HomeDashboard />} />
            {/* <Route path="/" element={<InstanceDashboard />} /> */}

            <Route path="*" element={<InstanceDashboard />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

