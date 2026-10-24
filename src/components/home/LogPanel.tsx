/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 * 
 * LogPanel.tsx file
 * 
 */
import React, { useState } from 'react';
import { LogEntry } from '../../types';
import { Box, Typography, Paper, useTheme } from '@mui/material';

interface LogPanelProps {
  logs: LogEntry[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  return (
    <>
      <Box
        onClick={() => setIsOpen((prev) => !prev)}
        sx={{
          position: 'absolute',
          top: 80,
          right: isOpen ? 320 : 0,
          zIndex: 1100,
          backgroundColor: '#282c34',
          color: '#e2e8f0',
          padding: '10px 6px',
          borderRadius: '6px 0 0 6px',
          cursor: 'pointer',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          userSelect: 'none',
          fontSize: 13,
          letterSpacing: 1,
          fontFamily: theme.typography.fontFamily,
          transition: 'right 0.2s ease',
        }}
      >
        Log
      </Box>

      {isOpen && (
        <Box
          component={Paper}
          elevation={4}
          sx={{
            position: 'absolute',
            top: 64,
            right: 0,
            width: 320,
            height: 'calc(100% - 64px)',
            zIndex: 1050,
            overflowY: 'auto',
            padding: 2,
            backgroundColor: '#282c34',
            color: '#e2e8f0',
            fontFamily: theme.typography.fontFamily,
            fontSize: 10,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            LOTUSim Log
          </Typography>
          {logs.length === 0 ? (
            <Typography
              variant="caption"
              sx={{ color: '#94a3b8' }}
            >
              No log messages yet
            </Typography>
          ) : (
            logs.map((log, i) => (
              <Box
                key={i}
                sx={{
                  whiteSpace: 'pre-wrap',
                  marginBottom: '6px',
                  fontSize: '12px',
                  lineHeight: 1.3,
                }}
              >
                [{log.level.toUpperCase()}] [{log.logger}]
                {log.message}
              </Box>
            ))
          )}
        </Box>
      )}
    </>
  );
};