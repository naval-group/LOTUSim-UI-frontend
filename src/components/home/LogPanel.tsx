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
import { DiagnosticLog, DiagnosticStatusLevel, Time } from '../../types';
import { Box, Typography, Paper, useTheme } from '@mui/material';

interface LogPanelProps {
  logs: DiagnosticLog[];
  onClear: () => void;
}

const formatStamp = (stamp: Time): string =>
  new Date(stamp.sec * 1000 + Math.floor(stamp.nanosec / 1e6)).toLocaleTimeString();

const LEVEL_DATA: Record<number, { label: string; color: string }> = {
  [DiagnosticStatusLevel.OK]: { label: 'OK', color: '#4ade80' },
  [DiagnosticStatusLevel.ERROR]: { label: 'ERROR', color: '#f87171' },
};

export const LogPanel: React.FC<LogPanelProps> = ({ logs, onClear }) => {
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              LOTUSim Log
            </Typography>
            <Box
              onClick={onClear}
              sx={{
                cursor: logs.length === 0 ? 'default' : 'pointer',
                opacity: logs.length === 0 ? 0.4 : 1,
                pointerEvents: logs.length === 0 ? 'none' : 'auto',
                px: 1,
                py: 0.25,
                fontSize: 11,
                borderRadius: 1,
                border: '1px solid #94a3b8',
                color: '#94a3b8',
                userSelect: 'none',
                '&:hover': { color: '#e2e8f0', borderColor: '#e2e8f0' },
              }}
            >
              Clear
            </Box>
          </Box>
          {logs.length === 0 ? (
            <Typography
              variant="caption"
              sx={{ color: '#94a3b8' }}
            >
              No log messages yet
            </Typography>
          ) : (
            logs.map((log, i) =>  {
              const data = LEVEL_DATA[log.status.level] ?? {
                label: String(log.status.level),
                color: '#e2e8f0',
              };
              return (
                <Box
                  key={i}
                  sx={{
                    whiteSpace: 'pre-wrap',
                    marginBottom: '6px',
                    fontSize: '12px',
                    lineHeight: 1.3,
                  }}
                >
                  <span style={{ color: '#94a3b8' }}>{formatStamp(log.stamp)} </span>
                  <span style={{ color: data.color, fontWeight: 'bold' }}>[{data.label}]</span>{' '}
                  <span style={{ color: '#94a3b8' }}>[{log.status.name}]</span>{' '}
                  {log.status.message}
                </Box>
              );
            })
          )}
        </Box>
      )}
    </>
  );
};