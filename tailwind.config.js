/** @type {import('tailwindcss').Config} */
export default {
content: [
'./index.html',
'./src/**/*.{js,jsx}',
],
theme: {
extend: {
colors: {
surface: '#FAFAFA',
card: '#FFFFFF',
primary: '#0EA5E9',
},
boxShadow: {
soft: '0 8px 30px rgba(0,0,0,0.06)'
},
borderRadius: {
xl2: '1.25rem'
}
},
},
plugins: [],
}