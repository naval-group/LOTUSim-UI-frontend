/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * ************************************************************************************
 * *******************************   HEADER COMPONENT   ********************************
 * ************************************************************************************
 *
 * A reusable top navigation header for the dashboard.
 *
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";

interface HeaderProps {
  backgroundPrimaryColor?: string;
  textPrimaryColor?: string;
  title: string;
}

/**
 * Header Component
 * 
 * A top navigation header with a title and navigation buttons.
 *
 * @param backgroundPrimaryColor - Background color of the header bar.
 * @param textPrimaryColor - Color for the text and buttons.
 * @param title - Title text displayed in the header.
 * 
 *  * @example
 * <Header 
 *    title="Dashboard" 
 *    backgroundPrimaryColor="#1a2027" 
 *    textPrimaryColor="#FFFFFF" 
 * />
 */
const Header: React.FC<HeaderProps> = ({
  backgroundPrimaryColor = "#282c34",
  textPrimaryColor = "#FFFFFF",
  title,
}) => {
  const navigate = useNavigate();

  const goToHome = () => navigate("/");
  const goToInstances = () => navigate("/instances");
  const goToModels = () => navigate("/models");
  const goToScenarios = () => navigate("/scenarios");

  const navItems = [
    { label: "Home", onClick: goToHome },
    // { label: "Instances", onClick: goToInstances },
    { label: "Models", onClick: goToModels },
    // { label: "Scenarios", onClick: goToScenarios },
  ];


  return (
    <AppBar
      position="sticky"
      style={{ backgroundColor: backgroundPrimaryColor, height: "64px" }}
    >
      <Toolbar className="App-header">
        <Box
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%", gap: { xs: "8px", sm: "16px", md: "24px" }, }}
        >
          <Button onClick={goToHome} sx={{ color: textPrimaryColor }}>
            <Typography
              variant="h4"
              style={{ fontWeight: "700", fontSize: "clamp(10px, calc(1vw + 1rem),20px)" }}
              sx={{ color: textPrimaryColor }}
            >
              {title}
            </Typography>
          </Button>

          {navItems.map((item) => (
            <Button
              key={item.label}
              onClick={item.onClick}
              style={{
                fontWeight: "700",
                fontSize: "clamp(8px, calc(0.8vw + 0.8rem), 18px)",
              }}
              sx={{ color: textPrimaryColor }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar >
  );
};

export default Header;
