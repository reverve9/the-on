/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary - 바다 블루 (채도 낮춤, 고급스럽게)
        primary: {
          50: '#F0F7FA',
          100: '#E1EFF5',
          200: '#C3DFEB',
          300: '#9AC9DC',
          400: '#6BAFC9',
          500: '#4A95B5',
          600: '#3B7A96',  // 메인
          700: '#336478',
          800: '#2D5264',
          900: '#284555',
        },
        // Secondary - 강릉 그린 (채도 낮춤)
        green: {
          50: '#F2F7F5',
          100: '#E0EDE8',
          200: '#C2DCD2',
          300: '#9AC4B5',
          400: '#6FA694',
          500: '#4F8A78',
          600: '#3D6E60',  // 강릉시 CI 기반 (톤다운)
          700: '#345A4F',
          800: '#2D4A42',
          900: '#273E38',
        },
        // Accent - 코랄/테라코타 (채도 낮춤, 고급스럽게)
        accent: {
          50: '#FDF6F4',
          100: '#FBEAE6',
          200: '#F7D5CD',
          300: '#F0B8AA',
          400: '#E69580',
          500: '#D97860',  // 메인 코랄
          600: '#C4624A',
          700: '#A4503D',
          800: '#874436',
          900: '#6F3A30',
        },
        // 카테고리별 컬러 (채도 낮춤)
        category: {
          news: '#3D6E60',      // 지역소식 - 그린
          culture: '#3B7A96',   // 문화/여가 - 블루
          life: '#B8860B',      // 생활/정보 - 다크골드
          community: '#6B5B7B', // 커뮤니티 - 머드퍼플
        },
        // 배지용 (은은하게)
        badge: {
          news: {
            bg: '#F2F7F5',
            text: '#3D6E60',
          },
          culture: {
            bg: '#F0F7FA',
            text: '#3B7A96',
          },
          life: {
            bg: '#FAF6EE',
            text: '#8B7355',
          },
          community: {
            bg: '#F5F3F7',
            text: '#6B5B7B',
          },
        },
      },
    },
  },
  plugins: [],
}
