/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: '#F4F4F1',
        ink: '#1A1A1A',
        safety: '#FF5C00',
        mint: '#B3E5E1'
      },
      spacing: {
        // 8px baseline (1 => 8px). 0.5 for 4px micro spacing.
        '0.5': '4px',
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '8': '64px',
        '10': '80px'
      },
      borderRadius: {
        // Squircle-first radii (so components use these by name)
        'squircle-sm': '14px',
        'squircle-md': '20px',
        'squircle-lg': '28px',
        // keep Tailwind's 2xl/3xl feel but a little larger for the nerdy-cute look
        '2xl': '22px',
        '3xl': '30px'
      },
      borderWidth: {
        DEFAULT: '2px'
      },
      boxShadow: {
        'hard-stop': '0 4px 0 rgba(0,0,0,0.06)',
        'hard-stop-sm': '0 2px 0 rgba(0,0,0,0.04)'
      },
      fontFamily: {
        rsvp: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        ui: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system']
      }
    }
  },
  plugins: []
}
