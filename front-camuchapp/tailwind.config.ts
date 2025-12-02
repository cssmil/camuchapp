import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Define your custom color palette
        border: 'hsl(210 20% 90%)', // Light neutral for borders
        input: 'hsl(210 20% 95%)', // Lighter neutral for input backgrounds
        ring: 'hsl(217 91% 60%)', // Primary blue for focus rings
        background: 'hsl(210 30% 98%)', // Off-white/very light gray for background
        foreground: 'hsl(210 10% 20%)', // Dark gray for text

        primary: {
          DEFAULT: 'hsl(217 91% 60%)', // A vibrant blue
          foreground: 'hsl(0 0% 100%)', // White text on primary
        },
        secondary: {
          DEFAULT: 'hsl(210 20% 96%)', // Light gray for secondary elements
          foreground: 'hsl(210 10% 20%)', // Dark gray text on secondary
        },
        accent: {
          DEFAULT: 'hsl(217 91% 95%)', // Very light blue accent
          foreground: 'hsl(217 91% 40%)', // Darker blue text on accent
        },
        muted: {
          DEFAULT: 'hsl(210 20% 96%)', // Muted background, similar to secondary
          foreground: 'hsl(210 10% 50%)', // Medium gray for muted text
        },
        destructive: {
          DEFAULT: 'hsl(0 80% 60%)', // Red for destructive actions
          foreground: 'hsl(0 0% 100%)', // White text on destructive
        },
        success: {
          DEFAULT: 'hsl(140 70% 40%)', // Green for success messages
          foreground: 'hsl(0 0% 100%)', // White text on success
        },
        card: {
          DEFAULT: 'hsl(0 0% 100%)', // White card background
          foreground: 'hsl(210 10% 20%)', // Dark gray text on card
        },
        popover: {
          DEFAULT: 'hsl(0 0% 100%)', // White popover background
          foreground: 'hsl(210 10% 20%)', // Dark gray text on popover
        },
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
      boxShadow: {
        light: '0 4px 6px rgba(0, 0, 0, 0.05)', // Light shadow for depth
        neumorphic: '5px 5px 10px #bebebe, -5px -5px 10px #ffffff', // Placeholder for neumorphic
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config