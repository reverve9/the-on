# TheON (더온) - 지역 종합 정보 플랫폼

강릉을 시작으로 지역의 모든 정보를 한눈에 볼 수 있는 통합 플랫폼

## 기술 스택

- **Frontend**: React 18 + Vite 5 + TypeScript
- **Styling**: Tailwind CSS 3.4
- **Backend**: Supabase (PostgreSQL 15)
- **Deployment**: Vercel
- **Package Manager**: pnpm 9
- **Monorepo**: Turborepo

## 프로젝트 구조

```
the-on/
├── apps/
│   ├── web/           # 사용자용 웹 (gangneung.the-on.co.kr)
│   └── admin/         # 관리자용 (admin.the-on.co.kr)
├── packages/
│   └── shared/        # 공통 타입, 유틸, 컴포넌트
├── supabase/
│   └── schema.sql     # DB 스키마
└── package.json
```

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경변수 설정

`.env.local` 파일에 Supabase 키 설정:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Supabase 스키마 적용

Supabase 대시보드 → SQL Editor에서 `supabase/schema.sql` 실행

### 4. 개발 서버 실행

```bash
# 전체 실행
pnpm dev

# web만 실행 (포트 3000)
pnpm dev:web

# admin만 실행 (포트 3001)
pnpm dev:admin
```

### 5. 빌드

```bash
pnpm build
```

## 도메인 구조

- `gangneung.the-on.co.kr` - 강릉 사용자용
- `sokcho.the-on.co.kr` - 속초 사용자용 (확장 예정)
- `admin.the-on.co.kr` - 통합 관리자

## 주요 기능

### 사용자용 (web)
- 카테고리별 콘텐츠 열람
- AI 요약 + 원문 링크
- 검색
- 태그 기반 필터링

### 관리자용 (admin)
- 콘텐츠 관리 (자동수집 + 직접작성)
- 카테고리/태그 관리
- 지역 관리
- 회원 관리
- 권한별 접근 제어

## 라이선스

© 2025 Nine Bridge. All rights reserved.
