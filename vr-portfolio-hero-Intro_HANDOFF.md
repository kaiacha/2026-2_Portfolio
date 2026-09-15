# VR 포트폴리오 인트로 — 개발 인수인계 문서

> Kaia 포트폴리오 **첫 화면 인트로 인터랙션**의 현재 상태·구조·튜닝 포인트·삽질 기록.
> 메인 페이지(`Kaia-Cha-Portfolio.html`, Claude Design 작업분)는 §10에서 iframe으로 통합 완료.

---

## 1. 컨셉 (한 줄)

흰 배경(최종 `BG_MODE=1`; 레드 블롭·다크 옵션은 §5) 위에 **XREAL 글라스**가 떠 있다. 앞에는 안경을 살짝 감싸는 **반투명 커브드 대시보드 패널**이 떠서 "여기 인터랙션이 있다"는 힌트를 준다. **스크롤하면 카메라가 안경 주변을 원형으로 돌며 가속 접근** → 렌즈 앞에서 안경이 사라지고 **포털 마스크가 열리며 메인(visionOS 스타일 랜딩)** 이 나타난다.

참고한 원리: david-hckh.com 방식 = **Lenis(스무스 스크롤) → GSAP ScrollTrigger(scrub으로 스크롤을 진행도 0~1로) → 3D 값 갱신 → lerp 보간**.

---

## 2. 파일

| 파일 | 설명 |
|---|---|
| `vr-portfolio-hero-Intro.html` | **소스(최종본).** GLB·로고 폰트는 외부 파일로 분리됨(아래). |
| `xreal_2_ultra.glb` | 모델 파일(153KB, 원래 HTML에 base64로 내장돼 있던 것을 분리). `GLTFLoader().load('./xreal_2_ultra.glb', ...)`로 로드. |
| `Rock3D-Regular.woff2` | Google Fonts "Rock 3D"(87KB, 라틴 서브셋만). `KAIA CHA` 로고 전용 `@font-face`. Figma 스펙: `font-family:'Rock 3D'; font-weight:400; font-size:140px(1440 기준); color:#000` |
| `Roboto-Variable.woff2` | Google Fonts "Roboto" 가변 폰트(37KB, 라틴 서브셋, weight 100~900 전체 포함). `#nav`(Medium 500) / 이메일·태그라인·스크롤 힌트(Light 300)에 공용 사용. |
| `Kaia-Cha-Portfolio.html` | **메인 포트폴리오**(Claude Design 캔버스 산출물). `#home`에 iframe으로 임베드됨 — §10 참고. `support.js`, `_ds/industry-.../`, `assets/portfolio/` 폴더가 같은 디렉토리에 있어야 함. Figma `2026 2 Portfolio` node 18:2 기준으로 실제 사진·다이어그램 반영 완료(아래). |
| `assets/portfolio/*.jpg,*.png,*.svg` | `Kaia-Cha-Portfolio.html` 전용 실사진/다이어그램(약 1.2MB, Figma 원본 37MB에서 리사이즈+JPEG 압축). Figma asset URL은 7일 후 만료되므로 반드시 로컬 파일로 내려받아 씀. |
| `scroll-3d-character.html` | 초기 원리 데모(로봇). 참고용, 무시해도 됨. |

### `Kaia-Cha-Portfolio.html`의 Figma 반영 관련 판단 (다음에 또 Figma 업데이트할 때 참고)

- **HCI 2번째 프로젝트(XRehab)의 "technical pipeline" 다이어그램**은 아이콘·미니카드 수십 개로 된 복잡한 커스텀 그래픽이라, 각 요소를 인라인 스타일로 일일이 재현하는 대신 **Figma `get_screenshot`으로 그 서브노드 하나를 통째로 PNG로 떠서(`hci-2-pipeline.png`)** `<img>` 하나로 넣음. 텍스트가 안에 박혀서 선택/검색은 안 되지만, 순수 장식용 인포그래픽이라 트레이드오프로 적절하다고 판단. 디자인이 또 바뀌면 이 노드만 다시 스크린샷 떠서 교체하면 됨.
- **Figma가 HCI 2개(Aspire, XRehab)/UX 3개(Lifeline, Korddiz, Anticancer)만 보여줬지만**, 기존에 있던 EMG 동기화, Qualitative Research Aide, NGL, NAVER 항목은 **삭제하지 않고 그대로 유지** — 대신 실사진이 없으니 기존의 회색 플레이스홀더 figure로 렌더링됨(`p.figureImg`가 없으면 `sc-if`가 플레이스홀더 분기를 탐). 실제 이력을 Figma가 다시 디자인하지 않았다고 지우는 게 맞다고 보기 어려워서 이렇게 처리함 — Figma에 이 항목들도 나중에 정식으로 그려지면 그때 `figureImg`를 채워주면 됨.
- **디자인 토큰**: Figma가 쓰는 `--bg/--text/--divider/--neutral-*/--accent/--accent-700` 이름은 공용 `_ds/industry-.../styles.css`의 `--color-*` 토큰과 이름도 다르고 값도 다름(공용 시스템 기본값은 연회색 배경 + 블루 액센트, 이 포트폴리오는 흰 배경 + 레드 액센트). 그래서 공용 stylesheet는 안 건드리고, `Kaia-Cha-Portfolio.html` 자체 `<style>`에 `:root`로 Figma 이름 그대로 로컬 오버라이드를 선언함. 다른 Claude Design 산출물에 영향 없음.

> ⚠️ **`.glb`를 fetch로 로드하므로 이제 `file://`로 더블클릭하면 CORS로 모델 로드가 실패한다.** 이 폴더에서 로컬 서버로 열 것: `npx serve .` 또는 VS Code Live Server 등. (base64 내장 방식으로 되돌리려면 §9 참고 방향의 역순 — `.glb`를 다시 base64로 인코딩해 `GLB_B64` 상수로 넣고 `.parse(glbBuf, '', cb)` 로 되돌리면 됨.)

### 내장된 라이브러리 (전부 `<script>` 인라인)
- three.js **r128** (UMD, `window.THREE`)
- three r128 `examples/js/loaders/GLTFLoader.js` (`THREE.GLTFLoader`)
- GSAP **3.12.5** + ScrollTrigger
- Lenis **1.1.14**

> ⚠️ 왜 인라인인가: **cdnjs는 three r128의 `examples/js/loaders/GLTFLoader.js`를 404로 반환**한다. CDN 의존으로 두면 헤드셋만 안 뜨는 조용한 실패가 난다. 그래서 전부 내장. VS Code/Vite로 옮길 땐 §9 참고.

---

## 3. 화면 레이어 구조 (z-index)

```
z0  #bg            풀스크린 WebGL 캔버스 — 배경 셰이더(블롭 그라디언트, 마우스 반응)
z1  #stage > #c    three.js 캔버스, alpha:true(투명) → 배경이 비침. 안경 + 대시보드 패널
z2  #nav           상단 내비 HOME / HCI / UX / ABOUT — 클릭 시 인트로 끝까지 스크롤 후 포트폴리오 iframe의 해당 섹션으로 이동 (아래 참고)
z2  #intro-footer  좌: 이메일 + "KAIA CHA"(Rock 3D 로고) / 우: 태그라인. 헤드셋 아래 겹침
z2  #scroll-hint   "Scroll"(밑줄) + "↓"(bob 애니메이션)
z3  #home          Kaia-Cha-Portfolio.html을 iframe으로 임베드(§10). 포털 마스크(--m)로 열림
z4  #flash         진입 순간 화이트 플래시
```

> `#nav`/`#intro-footer`는 `applyTransition(p)`의 `io`(등장·페이드 통합값)로 함께 움직임 (변수명: `nav`, `introFooter`). **스크롤 50%까지는 opacity가 정확히 0으로 고정**되고, `t = smooth(0.50, 0.55, p)` 구간(50~55%)에서만 서서히 등장 — 위치(translateY)는 `backOut(t)`로 살짝 튕기게 처리. 이후 `0.62~0.78`에서 `outFade`로 미리 페이드아웃(헤드셋 전환·포털 오픈과 안 겹치게). ⚠️ 완전히 보이는 구간이 0.55~0.62(7%p)로 짧음 — 더 오래 보이게 하려면 `outFade`의 0.62도 같이 뒤로 밀 것.
>
> **버그 2건이 있었다가 고침** — 등장 관련 로직 만질 때 둘 다 다시 만들지 말 것:
> 1. `opacity`에 `backOut(t)`를 그대로 곱하면 안 됨 — `backOut`은 구간 중반에 이미 1을 넘겨버리는(오버슈트) 커브라, 임계값을 50%로 설정해도 실제로는 스크롤 20%만 해도 거의 다 보여버림(실측: p=0.2일 때 opacity 0.73). `backOut`은 위치 튕김에만 쓰고, opacity는 오버슈트 없는 `t`를 그대로 쓸 것.
> 2. `smooth(0, 0.50, p)`처럼 **구간을 0에서 시작**하면 "50% 전엔 안 보인다"가 아니라 "0%부터 서서히 나타나 50%에 다 보인다"가 됨 — 완전히 다른 동작. 반드시 `smooth(0.50, X, p)`처럼 **임계값에서 시작**하는 구간을 써야 그 전엔 opacity가 정확히 0으로 고정됨.
>
> **오프닝 등장/사라짐 값을 조정할 땐 반드시 실제 스크롤로 opacity를 찍어서 확인할 것** — 이징 함수를 합성하거나 구간을 잘못 잡으면 숫자로 설정한 임계값과 눈에 보이는 동작이 어긋나기 쉬움(위 두 버그 다 이 케이스). — 처음부터 내비가 다 보이면 스크롤 인터랙션을 안 타고 바로 클릭해버릴 수 있어서 "일단 스크롤을 시작해야 내비가 나타나는" 구조로 바꿈. 이후 `0.62~0.78` 구간에서 미리 페이드아웃(헤드셋 전환·포털 오픈과 안 겹치게).
> `#scroll-hint`는 반대로 **처음부터 보임**(스크롤을 유도하는 역할이라 숨기면 안 됨) — `smooth(0.03,0.15,p)`로 내비가 다 나타나는 시점(~15%)에 맞춰 크로스페이드로 사라짐. 변수명은 여전히 `hint`이지만 `io`가 아니라 자체 공식 사용.
> 텍스트가 초반엔 안 보이는 만큼 빈 공간을 채우려고 `TARGET_WIDTH`도 3.4 → **4.0**으로 키움(§6, §11 참고).

### Figma 소스 (node 1:2, 1440×1024 프레임) vs 실제 구현 차이

Figma는 헤드셋을 **고정 스크린샷**으로 배치해 하단 텍스트와 절대 안 겹치지만, 실제 페이지는 **라이브 3D 씬**이라 뷰포트 높이가 짧을수록(예: 1440×900) 헤드셋/대시보드가 상대적으로 더 아래까지 내려온다. 그래서 `KAIA CHA` 로고 크기와 `#intro-footer`의 `bottom` 오프셋에 **vh 상한**을 추가로 걸어 짧은 뷰포트에서도 `#scroll-hint`와는 절대 안 겹치게, 헤드셋과는 (반투명 80% 패널이라) 약간 겹쳐도 가독성엔 문제없게 타협함:
```css
#intro-footer { bottom: max(9vh, 80px); }
#intro-footer .logo { font-size: clamp(40px, min(9.7vw, 11vh), 140px); }  /* Figma 값: 9.7vw(=140px/1440), 140px 캡 */
```
필요하면 `11vh`를 조절해 크기/여백을 다시 잡을 것. 완전히 안 겹치게 하려면 3D 카메라 구도(§6 `placeCamera`) 자체를 손봐야 함 — 여긴 손대지 않음.

> `#scroll-hint` 내부에 `.hint-set` 래퍼가 하나 더 있음 — "Scro"+화살표 2개가 **한 세트로 같이 동동 뜨는** bob 애니메이션은 이 래퍼에 걸려 있다. `#scroll-hint` 자체(바깥 div)에는 못 건다 — JS가 매 프레임 `transform`(등장 슬라이드 + `translateX(-50%)` 가운데 정렬)을 인라인으로 덮어써서 CSS 애니메이션과 충돌하기 때문. 화살표만 따로 動는 예전 버전은 "ll"처럼 안 읽혀서 세트 전체를 묶음.

### `#scroll-hint` 구성 (Figma 그대로 재현)
텍스트가 `"Scroll"`이 아니라 **`"Scro"` + 손그림 화살표 SVG 2개**(겹쳐서 "ll"처럼 보이는 자리를 화살표가 대신함)로 되어 있음. Figma 원본 그대로 재현한 것이며 오타 아님:
```html
<span class="word">Scro</span>
<svg class="arrow">...</svg><svg class="arrow">...</svg>
```

- `#scroll-space { height: 500vh }` — 이 높이만큼 스크롤하는 동안 인트로가 재생. 캔버스들은 전부 `position: fixed`.
- 캔버스 두 개 = WebGL 컨텍스트 2개. 문제 없음(브라우저 한도 ~16).

---

## 4. 스크롤 파이프라인

```
Lenis(lerp 0.1, smoothWheel)  ──scroll──▶  ScrollTrigger.update()
ScrollTrigger { trigger:'#scroll-space', start:'top top', end:'bottom bottom', scrub:1 }
   onUpdate → targetP = self.progress (0~1)
renderLoop(매 프레임):
   curP = lerp(curP, targetP, 0.09)      ← 추가 스무딩
   placeCamera(curP)                     ← 카메라 경로
   applyTransition(curP)                 ← 페이드/포털/플래시
   안경 아이들 부유 + 스크린 마우스 스윙
   renderer.render()
```

- **모든 상태는 `p`의 함수**로만 정의(상태 저장 X) → 스크롤 업하면 그대로 되감김.
- 렌더 루프 함수 이름은 `renderLoop`. (**`frame`으로 짓지 말 것** — §8 참고)

### 카메라 경로 `placeCamera(p)`
```js
const e = p * p;                       // ease-in → 뒤로 갈수록 가속
const radius = 7 - 6.75 * e;           // 7 → 0.25 (접근)
const theta  = e * Math.PI * 3.5;      // 원형 회전 (약 1.75바퀴)
const y      = Math.sin(p*Math.PI)*1.3 + 0.2;   // 떠올랐다 내려오는 호
camera.position.set(sin(theta)*radius, y, cos(theta)*radius + lensTarget.z);
camera.lookAt(lensTarget);             // lensTarget = (0, 0.4, 0.4)
camera.fov = 42 + e * 26;              // 마지막에 광각 → 빨려드는 느낌
```

### 전환 타이밍 `applyTransition(p)` — 전부 `smooth(a,b,p)`(smoothstep)
| 요소 | 구간 | 비고 |
|---|---|---|
| 인트로 카피/힌트 페이드아웃 | 0.05 → 0.25 | |
| **대시보드 스크린 사라짐** | 0.70 → 0.80 | 카메라가 스크린(z≈2.6)을 물리적으로 뚫기 직전. 끝까지 두려면 0.80→0.92로 (뚫는 순간 화면 꽉 참 주의) |
| **안경 페이드아웃** | 0.80 → 0.92 | `parts` 재질 opacity = base × fade. 카메라가 메시 뚫는 걸 감춤 |
| 화이트 플래시 | 0.84 → 0.90 ↑, 0.90 → 0.96 ↓ | 최대 0.9 |
| 포털 마스크 열림 `--m` | 0.82 → 1.0 | `#home`의 `mask: radial-gradient(circle at 50% 44%, #000 calc(var(--m)*160%), transparent 0)` |
| `#home` opacity | 0.82 → 0.95 | |
| `#home` pointer-events | p > 0.985 | 이때부터 클릭 가능 |

---

## 5. 배경 셰이더 (`#bg`)

파일 상단 `<!-- 배경 셰이더 -->` 아래 `<script>`. 외부 라이브러리 없음, GLSL 인라인.

```js
const BG_MODE = 1;   // ★ 숫자만 바꿔 전환 (최종본 = 1, 흰색)
// 0 = 흰색 + 큰 레드 블롭(현재, 애플 배경화면 느낌)
// 1 = 그냥 흰색
// 2 = 아주 연한 빨강 원형 그라디언트 + 흰색
// 3 = 다크 블루 3색(네이비→블루→퍼플)  ← body.dark-bg 클래스로 글자색 자동 밝게
//     ⚠️ 최종본엔 아래 CSS가 빠져 있어 모드 3을 쓰면 글자가 안 보임. 쓸 거면 <style>에 추가:
//     body.dark-bg #intro-copy h1{color:#f2f2f7} body.dark-bg #intro-copy .kicker{color:#ff7a86} body.dark-bg #scroll-hint{color:#b8b8c8}
```

- 유니폼: `u_res, u_time, u_mouse(0~1, lerp 0.05로 부드럽게), u_mode`
- 모드 0/3은 **가우시안 블롭 `blob(p,c,r)=exp(-|p-c|²/r²)` 3~4개** + 저주파 snoise 워프. (처음엔 5옥타브 fbm 노이즈였는데 마블링처럼 정신없어서 교체)
- 모드 0 튜닝 포인트:
  ```glsl
  float b1=blob(pp, vec2(0.12*ar.x,0.86)+drift, 0.42);  // 좌상단  (중심x, 중심y), 반지름
  float b2=blob(pp, vec2(0.94*ar.x,0.40)+drift, 0.46);  // 우측
  float b3=blob(pp, vec2(0.55*ar.x,1.10)+drift, 0.36);  // 상단 가장자리
  float b4=blob(pp, vec2(0.08*ar.x,0.08)+drift, 0.34);  // 좌하단
  float red=clamp(b1*0.55+b2*0.55+b3*0.40+b4*0.32, 0.0, 0.60);  // 마지막 0.60 = 레드 상한(눈 피로 방지)
  ```
  블롭은 **가장자리에 배치해 가운데(안경·제목)는 흰색 유지**. 속도는 `float t=u_time*0.05`.
- 레드 색: `vec3(0.86,0.14,0.18)`. 브랜드 레드로 교체 가능.

---

## 6. 안경 (XREAL GLB)

### 로드
- `new THREE.GLTFLoader().load('./xreal_2_ultra.glb', cb)` — 외부 `.glb` 파일을 fetch로 로드 (기존엔 base64 내장 + `.parse()`였으나 분리함). **로컬 서버 필요** — `file://` 직접 열기는 CORS로 실패.
- 로드 후 `Box3`로 **자동 센터링 + `TARGET_WIDTH`(3.4) 기준 스케일 정규화** → 어떤 GLB를 넣어도 화면에 맞음.
- `MODEL_TILT_X/Y/Z` (라디안) 로 방향 보정. **최종값 (0, 0.6, 0.2)**.

### 재질 — GLB는 메시 1개·재질 1개라 런타임에 지오메트리를 쪼갬
```
렌즈(투명)  = 월드 노멀 z > 0.35  &&  삼각형 중심 z > zLens   (최종값. 0.55에서 완화)
              zLens = zMax - (zMax - zMin) * 0.50   ← 앞쪽 50% 깊이 (최종값. 0.30에서 넓힘)
테(블랙)    = 나머지
→ geometry.groups 2개, mesh.material = [frameMat, lensMat]
```
| 재질 | 값 |
|---|---|
| `frameMat` (테) | `MeshStandardMaterial` color `0x000000`, metalness 0.2, roughness 0.48, envMapIntensity 0.22, 불투명 |
| `lensMat` (앞 바이저) | `MeshPhysicalMaterial` color `0x000000`, metalness 0, roughness 0.13, **transparent, opacity 0.72**, depthWrite false, clearcoat 0.7, DoubleSide |

> ⚠️ **opacity는 두 곳을 같이 바꿔야 한다.** 렌더 루프가 매 프레임 `mat.opacity = base × fade`로 덮어쓰므로, `lensMat`의 `opacity`와 `parts.push({mat:lensMat, base:0.72})`의 `base`를 **같은 값**으로.
> (실제로 최종본에서 opacity만 0.72로 바꾸고 base는 0.82로 남아 있어서 수정이 안 먹던 버그가 있었음 → 수정본에서 base 0.72로 맞춤.)

### 조명 (검정 재질 기준으로 낮게)
```js
HemisphereLight(0xdfe4ff, 0x0a0a12, 0.04)
key  DirectionalLight(0xffffff, 1.5) at (0, 14, -1)   // 거의 머리 위 → 상단 엣지만 하이라이트, 정면은 그늘
fill DirectionalLight(0xffffff, 0.0) at (-6, 1, 4)    // 앞쪽 채움광 OFF
rimA PointLight(0xaab0d0, 1.8, 22) at (-7, 2, 5)
rimB PointLight(0xaab0d0, 1.8, 22) at (7, -1, 5)
```
- 환경맵: 캔버스 세로 그라디언트(어두운 균일) → `PMREMGenerator.fromEquirectangular` → `scene.environment`. 밝은 밴드 넣으면 정면 렌즈가 은색으로 뜨니 **어둡게 유지**.
- 아이들 모션: `headset.position.y = sin(t)*0.08*idle`, `headset.rotation.y = sin(t)*0.25*idle`, `idle = 1 - min(1, curP*1.4)` (가까워지면 잦아듦).

---

## 7. 커브드 대시보드 스크린 (`// ── 2.5`)

안경 앞을 살짝 감싸는 **원기둥 조각(호)** 에 캔버스 텍스처. 인터랙션 힌트용.

```js
const SCREEN_ALPHA = 0.8;                        // 패널 투명도 (최종값)
const SCR_R = 2.6, SCR_H = 1.02, SCR_THETA = 1.55;   // 반지름(작을수록 더 휨) / 높이 / 호 각도(클수록 넓게 감쌈)
CylinderGeometry(SCR_R, SCR_R, SCR_H, 64, 1, true, -SCR_THETA/2, SCR_THETA)
MeshBasicMaterial({ map, transparent, opacity: SCREEN_ALPHA, side: DoubleSide, depthWrite: false }); renderOrder 5
screen.position.set(0, 0.22, -0.2);   // z = 안경과의 거리.  실제 거리 = SCR_R + z = 2.4  (가깝게: z 더 음수)
```
- **계층: `headset` ▶ `screenPivot`(rotation = MODEL_TILT_*) ▶ `screen`** → 안경 틸트·부유·회전을 그대로 따라감. 마우스 스윙은 `screen`에 상대적으로 얹힘.
- 마우스: `screen.rotation.y → mX*0.14`, `rotation.x → -mY*0.08` (lerp 0.06). 부유 `±0.05`.
- 캔버스 `drawDashboard()` 1600×405: 라운드 22 스모키 패널 + 좌측 흰 라인 3줄 + 레드 필 + 가운데 탭 3개 + 우측 흰 스퀘어(라운드 18). 미니멀 마크만(레퍼런스: iconscout VR 헤드셋 아이콘).
- ⚠️ **호 끝단은 옆으로 꺾여 콘텐츠가 얇게 보인다** → UI는 캔버스 좌우 끝에서 안쪽(≈12%)에 배치. 커브를 더 세게 하면 콘텐츠 x도 더 안쪽으로.

---

## 8. 삽질 기록 (같은 실수 방지)

1. **`const frame`(메시) vs `function frame`(렌더 루프) 이름 충돌** → `SyntaxError: Identifier 'frame' has already been declared` → 스크립트 통째로 실행 안 됨 → "헤드셋이 안 떠요". 렌더 루프는 `renderLoop`.
2. **cdnjs three r128 `examples/js/loaders/GLTFLoader.js` = 404.** `THREE.GLTFLoader` undefined → 모델만 조용히 실패. 그래서 전부 인라인.
3. **정면이 흰-회색으로 보이는 원인은 조명이 아니라 렌즈 투명도**였다. 투명 렌즈로 **흰 배경이 비쳐** 밝아 보인 것. 조명 줄여도 안 변함 → `lensMat.opacity`(+`base`)가 진짜 노브.
4. 검정 재질이 **은색/시안으로 뜨는 원인** = 강한 포인트 라이트(세기 22)·밝은 env 밴드·clearcoat 광택 반사. 검정은 **환경이 어둡고 라이트가 약해야** 검게 보인다.
5. 모든 재질에 `transparent:true`를 켜두면 **곡면 안쪽 레이어가 비친다**(정렬 문제). 평소엔 `transparent=false`, 전환 구간에서만 켠다 → `mat.transparent = (base<1) || (fade<0.999)`.
6. 노멀 방향(+Z)만으로 렌즈를 고르면 **다리 앞면까지 투명**해진다 → 깊이 조건(`cz > zLens`) 추가.
7. 헤드리스 테스트에서 `window.scrollTo`는 **Lenis와 충돌**해 끝까지 안 내려간다. 실제 휠 스크롤은 정상. (Playwright 검증 시 참고)
8. 이 파일은 `Read`로 한 번에 못 읽는다(인라인 라이브러리가 한 줄 600KB). **grep으로 위치 잡고 범위 읽기**, 편집은 문자열 치환.

---

## 9. VS Code / Vite 로 옮길 때 권장

지금은 "한 파일 더블클릭" 최적화라 인라인이 많다. 프로젝트로 옮기면:

```js
// npm i three@0.128.0 gsap lenis
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);
new GLTFLoader().load('/models/xreal_2_ultra.glb', gltf => { ... });   // base64 대신 파일
```
- 인라인 `<script>` 5개(three/GLTFLoader/gsap/ScrollTrigger/lenis) 제거, `GLB_B64`/`glbBuf` 제거 → 파일 ~1MB → 수십 KB.
- `THREE.` 접두 그대로 쓰면 됨(`import * as THREE`). `THREE.GLTFLoader` → `GLTFLoader`.
- 배경 셰이더 스크립트는 그대로 모듈로 옮겨도 됨(의존성 없음).
- three r128의 `renderer.outputEncoding = THREE.sRGBEncoding`, `texture.encoding` 는 **r152+에서 `colorSpace`로 바뀜**. 버전 올리면 수정 필요. r128 고정 권장(또는 함께 마이그레이션).

---

## 10. 메인 페이지와 통합 — **완료**

`#home`은 이제 플레이스홀더가 아니라 **`Kaia-Cha-Portfolio.html`(Claude Design 캔버스 산출물)을 iframe으로 임베드**한다:
```html
<div id="home">
  <iframe src="./Kaia-Cha-Portfolio.html" title="Kaia Cha Portfolio" loading="lazy"></iframe>
</div>
```
- **왜 iframe인가**: `Kaia-Cha-Portfolio.html`은 자체 런타임(`support.js`, `_ds/industry-.../_ds_bundle.js`, `_ds/industry-.../styles.css`, `<x-dc>` 커스텀 엘리먼트, `DCLogic` 클래스 기반 컴포넌트)에 의존하는 완전히 별개의 시스템. 인트로 쪽 three.js/GSAP/Lenis와 전역 스코프(변수명·CSS)가 섞일 위험이 커서, 직접 인라인하는 대신 iframe으로 격리 — §10 이전 버전에서 우려했던 "인트로 CSS를 `.intro`로 스코프해야 함", "three/gsap 중복 로드 금지" 문제가 애초에 발생하지 않음.
- `#home` 배경을 기존 다크 코스믹 그라디언트에서 **흰색**으로 변경(`Kaia-Cha-Portfolio.html`이 흰 배경이라 톤 일치, 화이트 플래시 전환과도 자연스러움). 포털 마스크(`--m`) 열리는 메커니즘은 그대로.
- 기존 `.glass-nav`/`.hero-window`/`.grid`/`.card`/`.blob` 플레이스홀더 CSS·HTML은 전부 삭제(죽은 코드).
- `#home`의 `pointer-events`는 여전히 JS(`applyTransition`)가 `p > 0.985`에서 `auto`로 바꿔주므로, iframe도 그 시점부터 자연스럽게 클릭 가능해짐 — 추가 처리 불필요.
- **필수 조건**: `Kaia-Cha-Portfolio.html`, `support.js`, `_ds/` 폴더가 `vr-portfolio-hero-Intro.html`과 **같은 디렉토리**에 있어야 상대경로(`./Kaia-Cha-Portfolio.html`, `_ds/...`)가 풀린다. 이미 로컬 서버로 여는 게 전제(§2 GLB 관련 주석 참고)이므로 추가 제약은 없음.
- `Kaia-Cha-Portfolio.html` 자체가 Google Fonts(Roboto)를 CDN에서 로드한다 — 인트로 쪽의 "외부 네트워크 0" 원칙은 iframe 내부까지는 적용 안 됨(별도 산출물이라 손대지 않음).

### ⚠️ 미해결 이슈: 인트로 끝난 뒤 iframe 안에서 마우스 휠 스크롤이 안 먹을 수 있음

증상: 인트로 스크롤을 끝까지 마치고 `#home`(iframe)이 완전히 보이는 상태에서, 마우스를 그 위에 올리고 휠을 굴려도 포트폴리오 내용이 스크롤 안 되는 케이스가 보고됨.

**적용한 방어 조치 2가지** (both 안전 — 필요 없으면 그냥 아무 일도 안 함):
1. `#home`이 `pointer-events:auto`로 바뀌는 순간(§4 `applyTransition`의 `nowInteractive && !homeInteractive`) `portfolioFrame.focus()` 호출 — iframe이 도착 직후 한 번도 클릭/포커스된 적 없어서 그럴 수 있다는 가설.
2. 부모 `window`에 `wheel` 리스너를 달아서 `homeInteractive`일 때 `portfolioFrame.contentWindow.scrollBy(0, e.deltaY)`로 강제 전달(§5.5) — 혹시 이벤트가 iframe으로 안 넘어가고 부모에서 잡히는 경우 대비.

**Playwright 헤드리스로 재현·디버깅한 결과**: 이 두 조치로도 자동화 테스트에서는 여전히 재현됐음. 더 깊이 파보니 —
- `Kaia-Cha-Portfolio.html`을 iframe 없이 **단독으로 열면 휠 스크롤 정상 작동**(포트폴리오 자체 버그 아님).
- iframe 안에서 wheel 이벤트는 실제로 도착함(`defaultPrevented: false`, `deltaY` 값도 정상, `document.scrollingElement`/`scrollHeight` 등 스크롤 가능 조건도 다 정상)인데도 `window.scrollY`가 안 움직임.
- 이건 Chromium DevTools Protocol이 합성(synthetic)하는 `mouse.wheel()` 이벤트가 **iframe 경계를 넘어갈 때 네이티브 스크롤을 못 트리거하는 알려진 한계**일 가능성이 높음(Playwright 이슈로 보고된 적 있는 패턴) — 즉 **실제 사용자의 진짜 마우스/트랙패드 입력에서는 재현 안 될 수도 있음**.

**결론**: 위 방어 조치 2가지는 실제 버그였을 경우를 대비해 남겨뒀지만, 헤드리스 테스트로는 완전히 고쳤다고 확인 못 했음. **실제 브라우저(로컬 서버로 열고)에서 재확인 필요** — 여전히 안 되면: (a) 어떤 브라우저/OS인지, (b) 스크롤 전에 포트폴리오 화면을 한 번 클릭해도 여전히 안 되는지 확인해서 알려줄 것. (b)가 "클릭하면 된다"면 focus 관련 문제로 좁혀지고, "클릭해도 안 된다"면 다른 원인(마스크/z-index/pointer-events 타이밍 등)을 더 파야 함.

### `#nav` 클릭 동작 (인트로 내비 → 포트폴리오 섹션 이동)

처음엔 `<span>`이라 클릭이 안 됐음(라우팅 대상이 없던 플레이스홀더였음). 지금은 `<a>`로 바꾸고 클릭 시:
1. `lenis.scrollTo('bottom', { duration: 1.6, onComplete })`로 인트로를 끝까지 재생(스킵이 아니라 애니메이션을 실제로 태움 — 카메라 접근·포털 오픈까지 보여준 뒤 도착).
2. `onComplete`에서 `#home iframe`의 `contentWindow.document.getElementById(id)`를 찾아 `scrollIntoView`. iframe이 아직 로드 전이면 `load` 이벤트를 기다렸다가 실행.
3. `#nav`의 `pointer-events`는 원래 `none` 고정이었는데, 지금은 `applyTransition`에서 `io > 0.5`일 때만 `auto`로 켜짐 — 다 사라진 뒤에 안 보이는 채로 클릭을 가로채는 버그 방지용.

⚠️ `window.scrollTo`가 아니라 꼭 `lenis.scrollTo`를 쓸 것 — §8-7 참고(Lenis와 네이티브 스크롤 충돌).

---

## 11. 파라미터 치트시트

| 바꾸고 싶은 것 | 어디 |
|---|---|
| 배경 종류 | `BG_MODE` (0~3) |
| 레드 양/위치/속도 | 셰이더 `// ── 0.` 블록 `b1~b4`, `clamp(...,0.60)`, `u_time*0.05` |
| 안경 크기/방향 | `TARGET_WIDTH`, `MODEL_TILT_X/Y/Z` |
| 테 색 | `frameMat.color` |
| 렌즈 투명도/색 | `lensMat.opacity` **+** `parts.push(... base)` 둘 다 / `lensMat.color` |
| 렌즈 영역 범위 | `fn.z > 0.55`, `zLens ... * 0.30` |
| 정면 밝기 | `key` 세기·위치, `fill` 세기 (정면은 렌즈 opacity가 더 큼) |
| 스크린 크기/커브/투명도 | `SCR_H`, `SCR_R`, `SCR_THETA`, `SCREEN_ALPHA` |
| 스크린–안경 거리 | `screen.position.set(0, 0.22, z)` (거리 = SCR_R + z) |
| 스크린 UI | `drawDashboard()` 캔버스 |
| 회전 바퀴 수/가속/접근 | `placeCamera`: `Math.PI*3.5`, `p*p`, `7 - 6.75*e` |
| 진입 타이밍 | `applyTransition` 구간 표(§4) |
| 스크롤 길이 | `#scroll-space { height: 500vh }` |
| 스무딩 | Lenis `lerp:0.1`, ScrollTrigger `scrub:1`, `curP lerp 0.09` |
