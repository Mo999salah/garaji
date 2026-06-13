/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Stitch Material 3 Tokens (DESIGN.md)
        primary: "#00685f",
        "on-primary": "#ffffff",
        "primary-container": "#008378",
        "on-primary-container": "#f4fffc",
        
        secondary: "#5d5c74",
        "on-secondary": "#ffffff",
        "secondary-container": "#e2e0fc",
        "on-secondary-container": "#63627a",

        tertiary: "#555c6a",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#6e7583",
        "on-tertiary-container": "#fefcff",
        
        background: "#f9f9fa",
        "on-background": "#1a1c1d",
        surface: "#f9f9fa",
        "on-surface": "#1a1c1d",
        "surface-variant": "#e2e2e3",
        "on-surface-variant": "#3d4947",

        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f3f4",
        "surface-container": "#eeeeef",
        "surface-container-high": "#e8e8e9",
        "surface-container-highest": "#e2e2e3",
        
        outline: "#6d7a77",
        "outline-variant": "#bcc9c6",
        
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        warning: "#F59E0B",
        "on-warning": "#1a1c1d",
        "warning-container": "#FEF3C7",

        success: "#10b981",
        "on-success": "#ffffff",
        "success-container": "#d1fae5",

        whatsapp: "#25D366",

        info: "#0284C7",
        "on-info": "#ffffff",
        "info-container": "#e0f2fe",
      },
      spacing: {
        'unit': '4px',
        'margin-mobile': '20px',
        'margin-desktop': '40px',
        'gutter': '16px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
        "full": "9999px"
      },
      fontSize: {
        'display-lg': ['32px', { lineHeight: '40px' }],
        'display-lg-mobile': ['28px', { lineHeight: '36px' }],
        'title-md': ['20px', { lineHeight: '28px' }],
        'body-md': ['16px', { lineHeight: '24px' }],
        'label-sm': ['13px', { lineHeight: '18px' }],
        'button-text': ['16px', { lineHeight: '16px' }],
      },
      fontFamily: {
        sans: ["Tajawal", "System"],
        tajawal: ["Tajawal"],
        "tajawal-medium": ["Tajawal_500Medium"],
        "tajawal-bold": ["Tajawal_700Bold"],
        "display-lg": ["Tajawal_700Bold"],
        "display-lg-mobile": ["Tajawal_700Bold"],
        "title-md": ["Tajawal_700Bold"],
        "body-md": ["Tajawal"],
        "label-sm": ["Tajawal_500Medium"],
        "button-text": ["Tajawal_700Bold"],
      },
      boxShadow: {
        "soft": "0px 4px 20px rgba(0,0,0,0.04)",
        "elevated": "0px 8px 30px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
