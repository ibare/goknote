# goknote — Claude Code 작업 프롬프트

작곡 공부하는 사용자가 특정 곡의 편곡/악기 구성/구간별 뉘앙스를 텍스트로 노트해 두는 1인용 웹앱을 만든다. 음악을 재생하지 않으며, 완전한 정적 웹앱으로 GitHub Pages에 배포한다.

---

## 0. 프로젝트 메타

- **이름**: `goknote`
- **배포 URL**: `https://ibare.github.io/goknote/`
- **리포지토리 경로 가정**: `ibare/goknote`
- **사용자**: 단일 사용자 (본인)
- **진입 게이트**: 4자리 패스코드 (비밀번호가 아닌 UX 락, 실제 인증은 Firebase Anonymous Auth로 처리)
- **타깃 디바이스**: 모바일/태블릿 우선 (아이폰, 아이패드). 데스크톱도 무리 없이 동작해야 함. 터치 퍼스트 UX.

---

## 1. 기술 스택

| 레이어 | 선택 | 비고 |
|---|---|---|
| 빌드 | Vite 5 + React 18 + TypeScript 5 | `npm create vite@latest goknote -- --template react-ts` |
| 스타일 | Tailwind CSS 3 | JIT, 커스텀 토큰 전부 theme에 정의 |
| 아이콘 | `@phosphor-icons/react` | 기본 weight: `regular`, 액티브 상태는 `fill` |
| 애니메이션 | `framer-motion` | 화면 전환, 아코디언, 바텀 시트, 드래그 리프트 |
| DnD | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | 터치 안정성 때문에 이 조합 선택 |
| 라우팅 | `react-router-dom` v6 (**HashRouter**) | GitHub Pages SPA 호환을 위해 반드시 HashRouter |
| 상태 | `zustand` | 전역 상태(패스코드 언락 여부, 필터 선택) 최소 사용. 서버 데이터는 Firebase 구독 훅에서 직접 관리 |
| 백엔드 | Firebase (Firestore, Anonymous Auth) | 모듈러 SDK v10+ |
| 폰트 | Pretendard Variable | `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/variable/pretendardvariable.min.css">` |

설치 명령:
```bash
npm create vite@latest goknote -- --template react-ts
cd goknote
npm i react-router-dom @phosphor-icons/react framer-motion @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities zustand firebase
npm i -D tailwindcss@3 postcss autoprefixer gh-pages
npx tailwindcss init -p
```

---

## 2. 프로젝트 구성

### 2.1 Vite 설정 (`vite.config.ts`)

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/goknote/',
});
```

### 2.2 GitHub Pages 배포

`package.json`에 추가:
```json
{
  "homepage": "https://ibare.github.io/goknote/",
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

라우터는 반드시 `HashRouter` 사용 — GitHub Pages가 SPA 리라이트를 못 하므로 URL은 `…/goknote/#/songs` 형태.

### 2.3 Firebase 설정

`src/lib/firebase.ts`에 초기화. 설정값은 `.env.local`에 두고 `import.meta.env`로 읽음. `.env.local`은 `.gitignore`에 추가.

```ts
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
});

export const db = getFirestore(app);
export const auth = getAuth(app);

export const ensureAuth = async () => {
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
};
```

앱 부트 시 `ensureAuth()`를 호출해 Firebase Anonymous Auth를 보장한다. Firestore 보안 규칙:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{doc=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

익명 인증 UID는 기기별로 달라지므로, 동일 데이터에 여러 기기에서 접근하려면 단일 익명 UID를 고정할 수단이 필요. **MVP에서는 한 기기만 쓴다고 가정하고 익명 UID 그대로 둔다.** 차후 멀티 디바이스 필요 시 Google Auth 추가 여지를 열어둔다.

---

## 3. 디자인 시스템

첨부된 레퍼런스 이미지(핀테크 앱)의 시각 언어를 따른다:
- 따뜻한 크림 배경 + 순백 카드
- 굵은 산세리프 타이틀 (세리프 아님)
- 검정을 주 액션 컬러로
- 파스텔 태그 컬러 (세이지, 라벤더, 피치, 버터, 스카이, 로즈)
- 큰 둥근 카드 (radius 20px+)와 pill 버튼
- 4탭 + 중앙 `+` FAB 구조의 하단 탭바
- 원형 아이콘 버튼 (44px) 상단 우측 배치

### 3.1 Tailwind 토큰 (`tailwind.config.js`)

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F3F1EA',
        'cream-soft': '#FAF8F2',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#0A0A0A',
          2: '#6B6B6B',
          3: '#A3A3A3',
          4: '#CFCFCF',
        },
        line: 'rgba(10,10,10,0.06)',
        'line-strong': 'rgba(10,10,10,0.12)',
        tag: {
          'lavender-bg': '#E3D9FE',
          'lavender-ink': '#4B3C9A',
          'sage-bg': '#D1E9CE',
          'sage-ink': '#1F5F2E',
          'peach-bg': '#FCD9C4',
          'peach-ink': '#8A4320',
          'sky-bg': '#CDE2F0',
          'sky-ink': '#1F4A6E',
          'rose-bg': '#F7CFD9',
          'rose-ink': '#7C2B47',
          'butter-bg': '#F4E4A1',
          'butter-ink': '#6B5300',
          'slate-bg': '#E2E2DE',
          'slate-ink': '#3D3D3D',
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        field: '14px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,10,10,0.04)',
        lift: '0 8px 24px rgba(10,10,10,0.08)',
        fab: '0 8px 20px rgba(10,10,10,0.18)',
      },
      fontSize: {
        display: ['34px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        title: ['20px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
    },
  },
};
```

### 3.2 글로벌 스타일 (`src/styles/index.css`)

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/variable/pretendardvariable.min.css');
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; background: #F3F1EA; color: #0A0A0A; }
body { font-family: 'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

/* 안전 영역 */
.safe-bottom { padding-bottom: calc(env(safe-area-inset-bottom) + 16px); }
.safe-top { padding-top: calc(env(safe-area-inset-top) + 8px); }
```

### 3.3 타입 스케일

- Display H1 (탭 루트 타이틀): 32–36px / 700 / tracking -0.02em
- Section Title (카드 섹션 헤더): 18–20px / 600
- Body: 15px / 400 / line-height 1.55
- Caption: 12–13px / 400, ink-2 컬러
- Eyebrow (이탤릭 영문 캡션): 11–12px / 400, ink-3 컬러, 약간 letter-spacing 0.03em

한글은 기본 Pretendard, 영문 이탤릭 부분은 `italic` 클래스로 처리 (Pretendard의 영문 이탤릭 스타일).

### 3.4 레이아웃 상수

- 페이지 수평 패딩: 20px
- 카드 내부 패딩: 16–20px
- 탭바 높이: 72px + safe-area
- FAB 크기: 58px (검정 원형), 탭바 중앙에서 위로 살짝 띄움
- 아이콘 버튼: 44px 원형, 1px 외곽선 `line` 또는 배경 `cream-soft`

---

## 4. 폴더 구조

```
src/
  main.tsx
  App.tsx
  routes.tsx
  styles/index.css
  lib/
    firebase.ts
    hash.ts              # SHA-256 간단 래퍼
    id.ts                # nanoid 랜덤 id
    format.ts            # 날짜 포맷 등
  types/
    index.ts             # 모든 도메인 타입
  data/
    presets.ts           # 초기 시드 데이터
  stores/
    session.ts           # zustand: 패스코드 언락 플래그
    filters.ts           # zustand: 탭별 필터/정렬 상태
  features/
    auth/
      PasscodeScreen.tsx
      PasscodePad.tsx
      PasscodeDots.tsx
      usePasscode.ts
    songs/
      SongsTab.tsx
      SongCard.tsx
      SongDetail.tsx
      SectionCard.tsx
      ChannelRow.tsx
      AddSongSheet.tsx
      AddSectionSheet.tsx
      AddChannelSheet.tsx
      SongFilterSheet.tsx
      useSongs.ts
    genres/
      GenresTab.tsx
      GenreGroup.tsx
      useGenres.ts
    instruments/
      InstrumentsTab.tsx
      InstrumentGroup.tsx
    settings/
      SettingsTab.tsx
      InstrumentsManager.tsx
      GenresManager.tsx
      SectionsManager.tsx
      ChangePasscode.tsx
  components/
    ui/
      AppHeader.tsx
      TabBar.tsx
      FAB.tsx
      IconButton.tsx
      Pill.tsx
      Tag.tsx
      Card.tsx
      SearchBar.tsx
      BottomSheet.tsx
      EmptyState.tsx
      ConfirmDialog.tsx
      TextField.tsx
      TextArea.tsx
      DragHandle.tsx
      SortableItem.tsx
    motion/
      Collapse.tsx
      PageTransition.tsx
      StaggerList.tsx
```

---

## 5. 데이터 모델

### 5.1 TypeScript 타입 (`src/types/index.ts`)

```ts
export type GenreColorKey =
  | 'lavender' | 'sage' | 'peach' | 'sky' | 'rose' | 'butter' | 'slate';

export type InstrumentCategory =
  | '리듬' | '저음' | '키보드' | '스트링' | '보컬' | '관악' | '기타';

export interface Genre {
  id: string;
  name: string;
  color: GenreColorKey;
  order: number;
  isPreset: boolean;
  createdAt: number;
}

export interface InstrumentPreset {
  id: string;
  name: string;
  category: InstrumentCategory;
  order: number;
  isPreset: boolean;
  createdAt: number;
}

export interface SectionPreset {
  id: string;
  name: string;
  order: number;
  isPreset: boolean;
  createdAt: number;
}

export interface Channel {
  id: string;
  presetId?: string;   // InstrumentPreset.id 참조 (선택)
  name: string;        // 스냅샷. 프리셋 삭제·개명에도 영향 없음
  category?: InstrumentCategory;
  note: string;
  order: number;
}

export interface Section {
  id: string;
  presetId?: string;   // SectionPreset.id 참조 (선택)
  name: string;        // 스냅샷
  note: string;
  order: number;
  channels: Channel[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  genreId: string;     // Genre.id 참조
  note: string;
  sections: Section[];
  createdAt: number;
  updatedAt: number;
}

export interface AppMeta {
  passcodeHash: string;
  createdAt: number;
  version: number;
}
```

### 5.2 Firestore 컬렉션

```
/meta/app                  → AppMeta
/songs/{id}                → Song (sections/channels 임베디드 배열)
/genres/{id}               → Genre
/instruments/{id}          → InstrumentPreset
/sectionPresets/{id}       → SectionPreset
```

**임베디드 구조 선택 근거**: 섹션·채널의 드래그 재정렬이 흔하고, 곡 하나의 섹션/채널 총량이 작으므로 (섹션 ≤ 20, 섹션당 채널 ≤ 15 수준) 부모 문서 쓰기로 처리하는 게 단순. 곡 하나당 문서 크기는 충분히 1MB 이하.

### 5.3 프리셋 시드 (`src/data/presets.ts`)

최초 진입 시 해당 컬렉션이 비어 있으면 시드.

```ts
export const GENRE_SEEDS: Omit<Genre, 'id' | 'createdAt'>[] = [
  { name: 'R&B / Soul', color: 'lavender', order: 0, isPreset: true },
  { name: 'Funk',       color: 'peach',    order: 1, isPreset: true },
  { name: 'Jazz',       color: 'sky',      order: 2, isPreset: true },
  { name: 'Indie',      color: 'sage',     order: 3, isPreset: true },
  { name: 'Folk',       color: 'butter',   order: 4, isPreset: true },
  { name: 'Pop',        color: 'rose',     order: 5, isPreset: true },
  { name: 'Rock',       color: 'slate',    order: 6, isPreset: true },
  { name: 'Hip-hop',    color: 'lavender', order: 7, isPreset: true },
  { name: 'Electronic', color: 'sky',      order: 8, isPreset: true },
  { name: 'K-pop',      color: 'rose',     order: 9, isPreset: true },
  { name: 'Ballad',     color: 'slate',    order: 10, isPreset: true },
  { name: 'Classical',  color: 'butter',   order: 11, isPreset: true },
];

export const SECTION_SEEDS: Omit<SectionPreset, 'id' | 'createdAt'>[] = [
  { name: 'Intro',      order: 0, isPreset: true },
  { name: 'Verse',      order: 1, isPreset: true },
  { name: 'Pre-Chorus', order: 2, isPreset: true },
  { name: 'Chorus',     order: 3, isPreset: true },
  { name: 'Post-Chorus',order: 4, isPreset: true },
  { name: 'Bridge',     order: 5, isPreset: true },
  { name: 'Breakdown',  order: 6, isPreset: true },
  { name: 'Drop',       order: 7, isPreset: true },
  { name: 'Interlude',  order: 8, isPreset: true },
  { name: 'Outro',      order: 9, isPreset: true },
];

export const INSTRUMENT_SEEDS: Omit<InstrumentPreset, 'id' | 'createdAt'>[] = [
  { name: 'Drums',           category: '리듬',  order: 0,  isPreset: true },
  { name: 'Percussion',      category: '리듬',  order: 1,  isPreset: true },
  { name: 'Claps',           category: '리듬',  order: 2,  isPreset: true },
  { name: 'Bass',            category: '저음',  order: 3,  isPreset: true },
  { name: 'Synth Bass',      category: '저음',  order: 4,  isPreset: true },
  { name: 'Sub',             category: '저음',  order: 5,  isPreset: true },
  { name: 'Rhodes',          category: '키보드', order: 6,  isPreset: true },
  { name: 'Piano',           category: '키보드', order: 7,  isPreset: true },
  { name: 'Organ',           category: '키보드', order: 8,  isPreset: true },
  { name: 'Synth Lead',      category: '키보드', order: 9,  isPreset: true },
  { name: 'Synth Pad',       category: '키보드', order: 10, isPreset: true },
  { name: 'Acoustic Guitar', category: '스트링', order: 11, isPreset: true },
  { name: 'Electric Guitar', category: '스트링', order: 12, isPreset: true },
  { name: 'Strings',         category: '스트링', order: 13, isPreset: true },
  { name: 'Lead Vocal',      category: '보컬',  order: 14, isPreset: true },
  { name: 'BG Vocals',       category: '보컬',  order: 15, isPreset: true },
  { name: 'Harmony',         category: '보컬',  order: 16, isPreset: true },
  { name: 'Horns',           category: '관악',  order: 17, isPreset: true },
  { name: 'Saxophone',       category: '관악',  order: 18, isPreset: true },
  { name: 'Trumpet',         category: '관악',  order: 19, isPreset: true },
  { name: 'Sample',          category: '기타',  order: 20, isPreset: true },
  { name: 'FX',              category: '기타',  order: 21, isPreset: true },
];
```

---

## 6. 라우팅

HashRouter 기준:

```
/                               → PasscodeScreen (잠겨 있으면)
/songs                          → SongsTab
/songs/:songId                  → SongDetail
/genres                         → GenresTab
/instruments                    → InstrumentsTab
/settings                       → SettingsTab
/settings/instruments           → InstrumentsManager
/settings/genres                → GenresManager
/settings/sections              → SectionsManager
/settings/passcode              → ChangePasscode
```

`App.tsx`는 부트 시:
1. `ensureAuth()` 호출
2. `/meta/app` 구독 시작
3. AppMeta 없음 → PasscodeScreen(setup 모드)
4. 있음 + 세션 언락 안 됨 → PasscodeScreen(unlock 모드)
5. 언락됨 → 내부 라우트로 이동

탭 루트 4개(`/songs`, `/genres`, `/instruments`, `/settings`)는 탭바가 항상 하단에 보이며, 서브 라우트(`/songs/:id`, `/settings/*`)에서는 탭바 숨김 + 상단 뒤로가기 버튼 표시.

---

## 7. 패스코드 플로우

### 7.1 상태 머신

```
AppMeta 없음 ─ setup enter ─→ setup confirm ─ match ─→ save & unlock ─→ /songs
                                      └ mismatch → shake & reset
AppMeta 있음 ─ unlock ─→ compare ─ match ─→ unlock → /songs
                                 └ mismatch → shake & reset
```

### 7.2 `PasscodeScreen` UI

- 상단: 작은 영문 이탤릭 eyebrow ("set a passcode" / "enter passcode") + 큰 한글 타이틀 ("패스코드 설정" / "잠금 해제")
- 중앙: 4개 도트 인디케이터. 입력된 만큼 검정 채움, 나머지는 `ink-4` 외곽선.
- 하단: 3×4 숫자 패드. 각 버튼 60px 원형, `cream-soft` 배경, 탭 시 `surface` + scale(0.96) 스프링. 좌하단 공백, 우하단 backspace 아이콘(phosphor `Backspace`).
- 에러: 도트 행을 x축으로 -8, 8, -4, 4, 0 범위로 흔드는 Framer Motion shake (8ms × 5). 이후 도트 초기화.

### 7.3 해싱 (`src/lib/hash.ts`)

```ts
export const sha256 = async (text: string): Promise<string> => {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
};
```

### 7.4 세션 유지

- `sessionStorage['goknote.unlocked'] = '1'`로 설정. 탭 닫히면 만료.
- 앱 재진입 시 세션 플래그 + AppMeta 존재 → 바로 언락.

---

## 8. 공통 컴포넌트 사양

### 8.1 `AppHeader`

모든 탭 루트와 대부분의 서브 화면 상단에 사용. props:

```ts
interface AppHeaderProps {
  eyebrow?: string;          // 영문 이탤릭 캡션 (예: 'library · 12 songs')
  title: string;             // 큰 한글 타이틀
  leading?: 'back' | ReactNode;  // 서브 화면은 'back', 루트는 생략
  trailing?: ReactNode;      // 우상단 아이콘 버튼(들)
}
```

레이아웃:
- 수평 패딩 20px
- 상단 safe-top + 12px
- trailing이 있으면 title과 같은 라인에 우측 정렬. leading은 title 위 라인에 왼쪽 정렬.

### 8.2 `TabBar`

하단 고정. 5칸 구조: `songs | genres | [FAB] | instruments | settings`.

- 높이 72 + safe-area
- 배경 `surface`, 상단에 1px `line` 보더
- 각 탭: 아이콘 22px + 라벨 11px. 비활성 `ink-3`, 활성 `ink` + 아이콘을 phosphor `fill` weight로 교체
- 중앙 FAB: 58px 원형 검정 버튼. 위로 8px 튀어나오게 (`translateY(-8px)`). Phosphor `Plus` 화이트.
- FAB 탭 시 `AddSongSheet` 오픈.

아이콘 매핑:
- 곡: `MusicNote`
- 장르: `Tag`
- 악기: `Sliders` (수평)
- 설정: `Gear`

### 8.3 `Pill` / `Tag`

Pill (선택 가능한 필터 칩):
- 기본: `bg-surface` + `border-line` + `text-ink`
- 활성: `bg-ink` + `text-surface`
- 높이 36px, 가로 패딩 16px, radius pill

Tag (장르 표시용 정적 태그):
- 컬러 key(`GenreColorKey`)에 따라 `bg-tag-{key}-bg` + `text-tag-{key}-ink`
- 높이 24px, 가로 패딩 10px, 11px / 500, radius pill

### 8.4 `Card`

- `bg-surface`, `rounded-card`, `shadow-card`, 내부 패딩 기본 20px
- tap 시 `scale-[0.985]` (Framer `whileTap`)

### 8.5 `BottomSheet`

- backdrop: `bg-black/30`, tap to close
- sheet: 하단에서 위로 슬라이드 (Framer `y: '100%' → 0`, spring `{stiffness: 380, damping: 34}`)
- 상단에 드래그 인디케이터(회색 바 40×4 rounded-pill)
- 내부 최대 높이 80vh, 세로 스크롤
- 드래그다운 close: 핸들 영역에서 드래그하여 120px 넘게 내려가면 닫힘 (`@dnd-kit` 불필요, Framer `drag="y"` + `dragConstraints`)

### 8.6 `SearchBar`

- `bg-cream-soft`, `rounded-pill`, 높이 44px, 내부 좌측 Phosphor `MagnifyingGlass` + placeholder + 우측 필터 아이콘(선택)
- 포커스 시 약간의 `box-shadow: shadow-card`

### 8.7 `IconButton`

- 44px 원형. `bg-surface` + `border-line` 또는 `bg-cream-soft` (맥락에 따라)
- 눌림 시 `scale-[0.94]`

### 8.8 `SortableItem`

`@dnd-kit/sortable` 래퍼. 드래그 중:
- `scale(1.02)`, `shadow-lift`
- 드래그 핸들 (좌측 `DotsSixVertical` 아이콘)만 드래그 트리거. 나머지 영역은 탭/편집 영역.
- 드래그 중 해당 아이템은 살짝 기울인 `rotate(1deg)`

---

## 9. 화면별 스펙

### 9.1 곡 탭 (`/songs`)

**헤더**
- Eyebrow: `library · {count} songs` (영문 소문자 이탤릭)
- Title: `곡`
- Trailing: 필터 아이콘 버튼 → `SongFilterSheet` 오픈

**콘텐츠**
1. `SearchBar`: placeholder `곡, 가수 검색`. 입력값이 있으면 리스트를 실시간 필터(제목/아티스트 대소문자 무관 substring).
2. 정렬 pill: 단일 pill `{현재 정렬} ▾`. 탭하면 바텀 시트로 정렬 선택.
3. 곡 리스트:

`SongCard`:
- 좌: 타이틀(15/600) + 아티스트(13/400 ink-2)
- 우 상단: 장르 `Tag`
- 본문 하단: note 프리뷰 2줄 ellipsis (13/400 ink-2). note 없으면 생략.
- 탭 시 `/songs/{id}`로 이동
- 길게 누르기 (500ms) 시 액션 시트 (`편집`, `삭제`)

빈 상태: `EmptyState` 컴포넌트 — 음표 아이콘 + `아직 등록된 곡이 없어요` + CTA 버튼 `곡 추가하기`

**FAB 동작**: 중앙 FAB → `AddSongSheet` 오픈

### 9.2 장르 탭 (`/genres`)

**헤더**
- Eyebrow: `by genre · {count} categories`
- Title: `장르`
- Trailing: 필터 아이콘 → `GenreFilterSheet` (정렬 옵션만)

**콘텐츠**
장르별 아코디언 리스트. 각 `GenreGroup`:
- Collapsed: 카드 1개 높이. 좌측에 장르 컬러 8px dot + 장르명(15/600) + 곡 수(12 ink-3) · 우측 chevron
- Expanded: 해당 장르 아래에 곡 리스트를 `SongCard`의 축소판으로 표시 (no note preview, 1행)
- 기본 상태: 모두 collapsed

0곡 장르는 기본적으로 숨김. 필터에서 `빈 장르 표시` 토글 시 노출.

### 9.3 악기 탭 (`/instruments`)

장르 탭과 동일 구조. 단 그룹 단위가 악기.

**헤더**
- Eyebrow: `by instrument · {count} tracked`
- Title: `악기`

**콘텐츠**
`InstrumentGroup`:
- Collapsed: 좌측에 카테고리 아이콘 (작은 박스 34px) + 악기명 + `{category} · {count}곡 사용`
- Expanded: 이 악기가 채널로 등록된 모든 곡 리스트. 각 행: 곡 제목 + 아티스트 + 해당 악기가 등장한 섹션 태그들 (예: `Intro · Verse · Chorus`)

악기 아이콘 매핑 (Phosphor):
- 리듬 → `DrumsticksFilled` (혹은 `Drum`이 없으면 `MusicNotes`)
- 저음 → `WaveSquare`
- 키보드 → `PianoKeys`
- 스트링 → `GuitarLine` (없으면 `MusicNote`)
- 보컬 → `Microphone`
- 관악 → `Waveform`
- 기타 → `Sparkle`

### 9.4 설정 탭 (`/settings`)

**헤더**
- Eyebrow: `preferences`
- Title: `설정`
- Trailing: 없음

**콘텐츠**
섹션 2개, 각각 묶음 카드 형태 (카드 안에 여러 행, 행 사이 1px `line` 구분).

**카탈로그**
- 악기 관리 → `/settings/instruments`
- 장르 관리 → `/settings/genres`
- 구조 관리 → `/settings/sections`
  
각 행: 좌 아이콘 박스(30px radius-field) + 이름 + 부제(`{count}개 프리셋`) + chevron

**앱**
- 패스코드 변경 → `/settings/passcode`
- 테마 (추후) — 비활성 행, 우측에 `준비중` 태그
- 버전 `0.1.0` (비인터랙티브)

### 9.5 설정 서브 화면 — `InstrumentsManager` / `GenresManager` / `SectionsManager`

공통 구조:
- 헤더: leading back, trailing + 아이콘 (새 항목 추가). Eyebrow: `catalog · presets`, Title: `악기`/`장르`/`구조`
- 소제목: `{count} presets · 길게 눌러 순서 변경` (ink-3, 12px, 이탤릭 영문 혼용)
- 리스트: 각 행에 좌측 드래그 핸들 (`DotsSixVertical`) + 이름 + 부제 + chevron (편집 진입)
- 행 탭 → 편집 바텀 시트 (이름/카테고리/컬러 등 수정)
- 행 왼쪽으로 스와이프 → 삭제 버튼 노출 (`framer-motion`의 drag로 구현, 또는 swipe-to-reveal 패턴)
- 드래그 리오더: `@dnd-kit/sortable` + `verticalListSortingStrategy`

**필드 정의**
- InstrumentsManager: `이름`, `카테고리`(Segmented), 사용 횟수(읽기 전용)
- GenresManager: `이름`, `컬러`(7개 컬러 선택 스와치), 사용 횟수(읽기 전용)
- SectionsManager: `이름`, 사용 횟수(읽기 전용)

### 9.6 `ChangePasscode`

- 헤더: Title `패스코드 변경`, back
- 단계: 현재 패스코드 확인 → 새 패스코드 입력 → 확인 재입력
- UI는 `PasscodeScreen` 재사용

### 9.7 곡 상세 (`/songs/:songId`)

**헤더**
- Leading back, trailing `...` 메뉴 (편집/삭제)
- Eyebrow: 장르 태그 + `·` + 아티스트
- Title: 곡 제목 (탭하면 인라인 편집)

**곡 전체 노트**
- Title 아래 여백 16px. `TextArea`처럼 보이지만 비활성 상태에서는 본문 텍스트로 렌더(이탤릭 영문 아닌 일반 한글). placeholder: `이 곡의 전체 인상을 적어보세요`
- 탭하면 실제 입력 필드로 전환. blur 시 자동 저장 (debounce 600ms).

**섹션 메타 바**
- `Arrangement · {section count} sections`
- 우측에 `+ 섹션` 작은 pill 버튼 → `AddSectionSheet`

**섹션 리스트 (아코디언)**
각 `SectionCard`:
- 상단 헤더 행: 좌 드래그 핸들 + 섹션 이름(15/600) + 채널 수 배지(11 ink-3 pill) + 우측 chevron
- 섹션 노트: 이탤릭 세리프풍 대신 여기서는 일반 ink-2 본문 스타일로. 비어 있을 때 placeholder `이 구간의 뉘앙스를 적어보세요`
- Collapsed 상태에서 하단에 채널 이름 미리보기 한 줄: `Drums · Bass · Rhodes · …` (11 ink-3)
- Expanded 상태: 채널 리스트 + `+ 채널 추가` pill 버튼

`ChannelRow`:
- 좌 드래그 핸들 + 채널 이름(14/500) + 채널 노트(13 ink-2, 여러 줄 허용, 자동 높이)
- 탭하면 채널 노트 인라인 편집 (textarea 전환). 이름도 탭하면 rename 시트.

**Chorus 하이라이트 — 지금은 생략** (이전 프로토타입에서 있던 보라 틴트는 MVP에서 제거. 나중에 "focus 섹션" 기능 추가할 때 부활).

**섹션 · 채널 드래그 재정렬**
- 섹션 드래그: 바깥쪽 `DndContext` + 섹션들의 `SortableContext`
- 채널 드래그: 각 펼쳐진 섹션 내부의 독립 `SortableContext` (중첩). 채널 크로스-섹션 이동은 **MVP에서 제외** (같은 섹션 내 순서 변경만 허용).

**섹션 · 채널 삭제**
- 각 아이템 우측 스와이프 또는 편집 모드 버튼 → Confirm dialog → 삭제

### 9.8 모달 / 바텀 시트

**`AddSongSheet`**
- 입력: 제목 (필수), 아티스트 (필수), 장르 (바텀 시트로 칩 선택, 필수), 첫 노트 (선택)
- 하단: `취소` outline pill + `저장` 검정 pill (full-width 분할)
- 저장 시 Firestore에 Song 문서 생성 (sections 빈 배열, note, createdAt/updatedAt), `/songs/{newId}`로 이동

**`AddSectionSheet`**
- 상단에 검색 입력
- 프리셋 칩 그리드 (2열). 탭 시 해당 이름으로 섹션 생성 + 닫기
- 하단에 `+ 직접 입력` 버튼 → 인라인 이름 입력 필드 노출

**`AddChannelSheet`**
- 상단 탭 바: 카테고리 세그먼티드 (`전체 | 리듬 | 저음 | 키보드 | 스트링 | 보컬 | 관악 | 기타`)
- 선택된 카테고리의 프리셋 칩 그리드
- 검색 입력 (이름으로 필터)
- `+ 직접 입력` 버튼
- 다중 선택 허용 (MVP는 단일 선택부터 시작, 여유되면 다중 추가)

**`SongFilterSheet`**
- 섹션: `정렬 기준` (pill 라디오) — 최근 편집 / 제목 / 아티스트 / 등록 순
- 섹션: `장르 필터` — 장르 태그 다중 선택 (모두 선택 해제 = 모두 보기)
- 섹션: `악기 필터` — 악기 프리셋 다중 선택 (선택된 악기가 채널에 등록된 곡만 노출)
- 하단: `초기화` + `적용`

**`GenreFilterSheet`** / **`InstrumentFilterSheet`**
- 정렬: `사용 많은 순 | 가나다 | 등록 순 (+ 악기 탭만 카테고리별)`
- 토글: `빈 카테고리 표시`

---

## 10. 필터 & 정렬 상태 관리

`src/stores/filters.ts` (zustand):

```ts
interface FilterState {
  songs: {
    search: string;
    sort: 'recent' | 'title' | 'artist' | 'created';
    genreIds: string[];
    instrumentIds: string[];
  };
  genres: { sort: 'count' | 'name' | 'order'; showEmpty: boolean };
  instruments: { sort: 'count' | 'name' | 'order' | 'category'; showEmpty: boolean };
  // setters…
}
```

필터 상태는 인메모리만 유지 (새로고침 시 초기화). 필요하면 `localStorage`에 퍼시스트.

---

## 11. 인터랙션 & 애니메이션 (Framer Motion)

과하지 않게, 기능적 의미가 있을 때만 애니메이션을 쓴다.

### 11.1 라우트 전환
- 탭 간 전환: opacity fade (120ms) + x translate 8px. `AnimatePresence` + `mode="wait"`.
- 서브 라우트 진입(곡 상세, 설정 서브): x translate 24px + fade (180ms). 돌아올 때 역방향.

### 11.2 아코디언 (`Collapse`)
- `height: 'auto'` 애니메이션 (Framer는 직접 지원 안 함 → `react-use-measure`로 내용 높이 측정 후 motion에 전달). 스프링 `{stiffness: 400, damping: 38}`
- chevron 회전 180°

### 11.3 리스트 스태거
- 곡 카드, 장르 그룹 등 리스트 최초 마운트 시 stagger 30ms, 각 아이템 `opacity 0→1 + y 12→0`, duration 220ms
- 재렌더(필터 변경)에는 stagger 없이 크로스페이드

### 11.4 바텀 시트
- 앞서 서술. backdrop fade 180ms + sheet spring.

### 11.5 드래그 (dnd-kit)
- 드래그 오버레이에 scale(1.02), shadow-lift, rotate(1deg)
- 드롭 타겟 하이라이트: 대상 아이템의 배경 `cream-soft` 플래시

### 11.6 FAB
- `whileTap={{ scale: 0.92 }}`
- 열릴 때 회전: Plus → X 회전 45° (시트 열림 동안)

### 11.7 입력 즉시 저장
- textarea blur 시 저장. 저장 중 상단에 `저장 중…` 은은한 ink-3 토스트(1.5초 페이드).

### 11.8 삭제 확인
- Confirm dialog: 카드 스케일 `0.94 → 1` + opacity. backdrop 40%.

---

## 12. 삭제/연결 무결성 규칙

프리셋 삭제 시 참조 무결성:

- **장르 삭제**: 해당 genreId를 쓰는 곡이 하나라도 있으면 삭제 불가. Alert로 `이 장르를 쓰는 곡이 {n}곡 있어요. 먼저 다른 장르로 변경해 주세요.`
- **악기 프리셋 삭제**: 삭제 가능. 단, 이미 채널에 등록된 경우 채널의 `presetId`만 `undefined`로 변경 (이름은 스냅샷이므로 유지). 삭제 시 `{n}곡의 채널이 프리셋 연결을 잃습니다. 진행할까요?` 확인.
- **섹션 프리셋 삭제**: 악기와 동일 규칙.
- **장르 이름/컬러 변경**: 즉시 반영. Song은 genreId 참조이므로 변경 후 모든 곡 카드에서 새 이름/컬러로 표시.
- **악기/섹션 프리셋 이름 변경**: 이미 등록된 채널/섹션의 이름은 스냅샷이므로 변경 안 됨. 프리셋 라이브러리에서만 변경 반영. (의도된 동작. 작곡 공부 노트에서 "내가 적을 때의 이름"이 보존되는 게 맞다.)

---

## 13. 작업 순서 (체크리스트)

Claude Code는 아래 순서대로 작업한다. 각 단계 끝에서 빌드/타입체크 통과를 확인하고 다음으로 진행.

1. **프로젝트 스캐폴드**: Vite + React + TS + Tailwind 세팅. `vite.config.ts` base 설정, Pretendard 로드, 토큰 정의.
2. **폴더 구조 생성**: 위 7번 폴더 구조 그대로 빈 파일 생성.
3. **타입 정의** (`src/types/index.ts`) + **프리셋 시드** (`src/data/presets.ts`).
4. **Firebase 설정**: `.env.local` 스케폴드(키 placeholder) + `lib/firebase.ts` + `ensureAuth`. README에 Firebase 콘솔 세팅 단계 문서화.
5. **패스코드 플로우**: `PasscodeScreen`, `PasscodePad`, `PasscodeDots`, `usePasscode`. 세션 store. AppMeta 시드 + 비교 로직.
6. **공통 UI 컴포넌트**: `AppHeader`, `TabBar`, `FAB`, `IconButton`, `Pill`, `Tag`, `Card`, `SearchBar`, `BottomSheet`, `TextField`, `TextArea`, `DragHandle`, `ConfirmDialog`, `EmptyState`, motion 래퍼.
7. **레이아웃 셸**: `App.tsx`에서 패스코드 게이트, 라우터, 탭바, FAB 조립.
8. **곡 데이터 훅** (`useSongs`): Firestore 구독, CRUD. `useGenres`, `useInstruments`, `useSectionPresets`도 동일 패턴.
9. **곡 탭 구현**: SongsTab, SongCard, AddSongSheet, SongFilterSheet, 검색/정렬.
10. **곡 상세 구현**: SongDetail, SectionCard (아코디언), ChannelRow, AddSectionSheet, AddChannelSheet, dnd-kit 정렬, 인라인 편집.
11. **장르 탭 & 악기 탭**: 그룹 아코디언 + 필터 시트.
12. **설정 탭**: Settings 루트 + InstrumentsManager/GenresManager/SectionsManager + ChangePasscode.
13. **애니메이션 다듬기**: 라우트 전환, 리스트 스태거, 드래그 오버레이, FAB 회전.
14. **에지 케이스**: 삭제 무결성, 빈 상태, 오프라인 처리(Firestore 기본 오프라인 캐시 활성화).
15. **README**: Firebase 세팅, 로컬 개발, 빌드, 배포 (`npm run deploy`) 절차.
16. **배포**: GitHub Pages 설정 + 최초 배포. CNAME 불필요 (기본 도메인 사용).

---

## 14. 완료 기준 (Acceptance)

아래를 모두 만족하면 MVP 완료로 본다.

- [ ] `https://ibare.github.io/goknote/`에서 정상 로드, 새 기기 진입 시 패스코드 설정 → 이후 진입 시 해제 플로우 동작
- [ ] 곡 등록 · 수정 · 삭제, 장르 · 아티스트 입력 필수 검증
- [ ] 곡 상세에서 섹션 추가 → 펼쳤을 때 채널 추가 → 채널 노트 입력 후 blur 시 저장 로그 표시
- [ ] 섹션 드래그로 순서 변경 후 새로고침 시 순서 유지
- [ ] 채널 드래그로 같은 섹션 내 순서 변경 후 새로고침 시 순서 유지
- [ ] 곡 탭에서 검색/정렬/장르·악기 다중 필터가 정확히 합집합이 아닌 교집합으로 동작
- [ ] 장르 탭 · 악기 탭에서 그룹 펼침 상태, 정렬, 빈 그룹 표시 토글 동작
- [ ] 설정에서 악기/장르/구조 프리셋 CRUD 및 드래그 재정렬
- [ ] 장르 삭제 시도 시 해당 장르 쓰는 곡이 있으면 차단 메시지
- [ ] 아이폰 Safari, 아이패드 Safari, 데스크톱 Chrome에서 레이아웃 깨짐 없음
- [ ] Framer Motion 전환이 모든 주요 화면에 자연스럽게 적용, 드래그 중 리프트 효과 작동
- [ ] Firebase Firestore 보안 규칙이 익명 인증 요구로 설정되어 있음
- [ ] README에 Firebase 설정 단계, 환경 변수, 배포 명령이 기술됨

---

## 15. 추가 가이드

- 모든 한글 카피는 문체 통일: 평서체 짧고 담담하게. 명령문은 `해 주세요` 대신 `하세요`로 간결.
- 버튼 라벨: `저장`, `취소`, `추가`, `삭제`, `변경`, `완료`, `닫기` 등 2–3자 한글 기본.
- 에러 메시지는 친절하되 과하게 장황하지 않게. 예: `저장하지 못했어요. 네트워크를 확인해 주세요.`
- 불필요한 스켈레톤 로딩은 지양. Firestore 오프라인 캐시로 첫 로드 이후는 즉시 표시됨.
- 타입 안정성: `any` 금지. Firestore 문서 ↔ 도메인 타입 변환 유틸(`toSong`, `toGenre` 등)을 `lib/` 또는 각 훅 파일 내부에 둔다.
- 접근성 최소치: 모든 인터랙티브 요소 `aria-label` 또는 명시적 텍스트. 포커스 링 유지 (Tailwind `focus-visible:ring`).
- 라이트 모드만 지원 (MVP). 다크 모드 훅은 남기되 비활성.

---

끝. 불명확한 부분이 생기면 **곡 상세의 편곡 노트 경험**(섹션/채널 노트 입력과 아코디언 동작)을 최우선 체험으로 간주하고 나머지는 해당 경험을 해치지 않는 선에서 결정한다.
