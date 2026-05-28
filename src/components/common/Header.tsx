/**
 * ************************************************************************************
 * *******************************   HEADER COMPONENT   ********************************
 * ************************************************************************************
 *
 * A reusable top navigation header for the dashboard.
 *
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';

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
  backgroundPrimaryColor = '#282c34',
  textPrimaryColor = '#FFFFFF',
  title,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path: string) => {
    if (location.pathname === path) {
      navigate(0);
    } else {
      navigate(path);
    }
  };

  const navItems = [
    { label: 'Home', onClick: () => goTo('/') },
    { label: 'Models', onClick: () => goTo('/models') },
    { label: 'Scenarios', onClick: () => goTo('/scenarios') },
  ];

  return (
    <AppBar position="sticky" style={{ backgroundColor: backgroundPrimaryColor, height: '64px' }}>
      <Toolbar className="App-header">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100%',
            gap: { xs: '8px', sm: '16px', md: '24px' },
          }}
        >
          <Button onClick={() => goTo('/')} sx={{ color: textPrimaryColor, gap: '8px' }}>
            <Box
              component="img"
              src="/lotus.svg"
              alt="Lotus logo"
              sx={{ height: 'clamp(14px, calc(1.3vw + 1rem), 28px)', width: 'auto' }}
            />
            <Typography
              variant="h4"
              style={{ fontWeight: '700', fontSize: 'clamp(14px, calc(1.3vw + 1rem),28px)' }}
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
                fontWeight: '700',
                fontSize: 'clamp(8px, calc(0.8vw + 0.8rem), 18px)',
              }}
              sx={{ color: textPrimaryColor }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
