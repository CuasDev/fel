import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  BrightnessAuto as SystemModeIcon,
  Palette as ThemeIcon,
} from '@mui/icons-material';
import { useThemeContext, themeOptions } from '../context/ThemeContext';

const ThemeSelector = () => {
  const { mode, setThemeMode, themeOptions } = useThemeContext();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleThemeChange = (newMode) => {
    setThemeMode(newMode);
    handleClose();
  };
  
  // Determinar qué icono mostrar según el modo actual
  const getCurrentThemeIcon = () => {
    switch (mode) {
      case themeOptions.LIGHT:
        return <LightModeIcon />;
      case themeOptions.DARK:
        return <DarkModeIcon />;
      case themeOptions.SYSTEM:
        return <SystemModeIcon />;
      default:
        return <ThemeIcon />;
    }
  };
  
  return (
    <>
      <Tooltip title="Cambiar tema">
        <IconButton
          color="inherit"
          onClick={handleClick}
          size="large"
          aria-label="cambiar tema"
        >
          {getCurrentThemeIcon()}
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          onClick={() => handleThemeChange(themeOptions.LIGHT)}
          selected={mode === themeOptions.LIGHT}
        >
          <ListItemIcon>
            <LightModeIcon />
          </ListItemIcon>
          <ListItemText primary="Claro" />
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleThemeChange(themeOptions.DARK)}
          selected={mode === themeOptions.DARK}
        >
          <ListItemIcon>
            <DarkModeIcon />
          </ListItemIcon>
          <ListItemText primary="Oscuro" />
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleThemeChange(themeOptions.SYSTEM)}
          selected={mode === themeOptions.SYSTEM}
        >
          <ListItemIcon>
            <SystemModeIcon />
          </ListItemIcon>
          <ListItemText primary="Sistema" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default ThemeSelector;