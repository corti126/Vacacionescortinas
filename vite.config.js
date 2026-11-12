import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  build: {
    rollupOptions: {
      output: {
        // Separa las librerías pesadas en chunks compartidos y cacheables:
        // la primera carga descarga solo lo que necesita y el resto se baja
        // en segundo plano al navegar.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase') || id.includes('@firebase')) return 'vendor-firebase'
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-leaflet'
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) {
              return 'vendor-react'
            }
            return 'vendor'
          }
          return undefined
        },
      },
    },
  },
})
