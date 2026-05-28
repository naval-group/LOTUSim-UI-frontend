/**
 * ************************************************************************************
 * *******************************   MODEL PANELS COMPONENT   ************************
 * ************************************************************************************
 *
 * Displays a responsive grid of model previews with options to edit or delete each model.
 *
 * Features:
 * - Uses Material-UI ImageList to display model previews.
 * - Responsive column count based on screen size (xs, sm, md).
 * - Fetches preview images from the server using model names.
 * - Provides delete functionality for each model.
 * - (Optional) Edit functionality can be enabled via handleEdit callback.
 *
 * Props:
 * - model_name_list: string[] — Array of model names to display.
 * - handleEdit: (modelName: string) => void — Callback when the edit button is clicked.
 * - handleDelete: (modelName: string) => void — Callback when the delete button is clicked.
 *
 */

import DeleteIcon from '@mui/icons-material/Delete';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import { getAddress } from '../../services/api';
import { useTheme, useMediaQuery } from '@mui/material';

interface ModelPanelsProps {
  modelNameList: string[];
  handleDelete: (modelName: string) => void;
}

const ModelPanels: React.FC<ModelPanelsProps> = ({ modelNameList, handleDelete }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const cols = isXs ? 1 : isMd ? 4 : 2;

  const models = Array.isArray(modelNameList) ? modelNameList : [];
  if (models.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <p
          style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 500,
          }}
        >
          No models available
        </p>
      </div>
    );
  }

  const { ip, port } = getAddress();

  return (
    <ImageList style={{ width: '100%', height: '100%' }} cols={cols} rowHeight={300}>
      {models.map((modelName) => (
        <ImageListItem
          key={modelName}
          style={{ height: '500px', width: '100%', overflow: 'hidden' }}
        >
          <img
            src={`http://${ip}:${port}/models/${modelName}/preview`}
            alt={modelName}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: '#282c34',
            }}
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const placeholder = document.createElement('div');
              placeholder.textContent = 'No image is found';
              placeholder.style.cssText =
                'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#aaa;background:#282c34;font-size:50px;';
              target.parentElement?.insertBefore(placeholder, target);
            }}
          />
          <ImageListItemBar
            title={modelName}
            actionIcon={
              <IconButton
                sx={{
                  color: 'rgba(255, 255, 255, 0.54)',
                  '&:hover': { color: 'white' },
                }}
                aria-label={`delete ${modelName}`}
                onClick={() => handleDelete(modelName)}
              >
                <DeleteIcon />
              </IconButton>
            }
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export default ModelPanels;
