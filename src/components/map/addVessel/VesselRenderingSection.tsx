import React from 'react';
import { Box, FormControlLabel, Checkbox, TextField } from '@mui/material';

interface VesselRenderingSectionProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
  rendererType: string;
  onRendererTypeChange: (v: string) => void;
  publishRender: boolean;
  onPublishRenderChange: (v: boolean) => void;
}

export const VesselRenderingSection: React.FC<VesselRenderingSectionProps> = ({
  enabled,
  onToggle,
  rendererType,
  onRendererTypeChange,
  publishRender,
  onPublishRenderChange,
}) => (
  <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 2 }}>
    <FormControlLabel
      control={
        <Checkbox checked={enabled} onChange={(e) => onToggle(e.target.checked)} name="rendering engine" />
      }
      label="Rendering Engine"
    />
    {enabled && (
      <>
        <TextField
          label="Model name in Renderer"
          value={rendererType}
          onChange={(e) => onRendererTypeChange(e.target.value)}
          fullWidth
          sx={{ mt: 2 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={publishRender}
              onChange={(e) => onPublishRenderChange(e.target.checked)}
            />
          }
          label="Publish Render"
          sx={{ mt: 1 }}
        />
      </>
    )}
  </Box>
);
