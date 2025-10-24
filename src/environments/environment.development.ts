export const environment = {
  production: false,

  // API Configuration
  api: {
    baseUrl: "http://localhost:5000",
    codeAnalysisBaseUrl: "http://localhost:5060",
    timeout: 10000,
    endpoints: {
      codeGenerator: "/api/create_app",
      codeAssessment: "/api/rate_app",
      uploadZip: "/api/upload-zip",
      getConfig: "/api/get_config",
      getEditor: "/api/get_editor",
      getBaseEditor: "/api/get_base_editor",
      getAvailableEditor: "/api/get_available_editor",
    },
  },
  

  // Feature Flags
  features: {
    enableMinimap: true,
    enableAutoSave: true,
    enableAutoArrange: true,
    debugMode: true,
    enableLogging: true,
  },

  // UI Configuration
  ui: {
    defaultTheme: "light",
    animationsEnabled: true,
    tooltipsEnabled: true,
    minimapSize: 200,
  },

  // Editor Configuration
  editor: {
    autoSaveInterval: 30000, // 30 seconds
    maxUndoSteps: 50,
    gridSize: 20,
    snapToGrid: true,
  },
};
