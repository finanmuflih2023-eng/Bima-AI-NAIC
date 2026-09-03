/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                jawaCream: '#FDF8F4',
                jawaBrown: '#8C5A42',
                jawaTeracotta: '#C86A4B',
                jawaDark: '#3A2312'
            }
        },
    },
    plugins: [],
}