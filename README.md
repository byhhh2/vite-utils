# vite

## 특징

- 시작하기: https://ko.vitejs.dev/guide/
- 빠르다
- 모던 웹 프로젝트 개발 경험에 초점을 맞춘 빌드 도구

## vite를 사용해야 하는 이유

- https://ko.vitejs.dev/guide/why.html
- 브라우저에서 esm을 지원하기 전까지 esm을 네이티브 레벨에서 사용할 수 없었다. 그래서 번들링이라는 해결 방법을 사용해야 했다.
- app이 점점 발달하면서 모듈의 수가 늘었다. 그래서 성능 병목 현상이 발생됐고, 개발 서버를 가동하거나 HMR 적용을 기다리는게 엄청 오래걸린다. (초기에 번들링하는데 시간이 오래 걸림, 개발시 변경사항이 있으면 번들을 다시 생성해야 하는데 모듈이 많으니깐 HMR에 지연이 생김)
- 그래서 vite는 esm을 활용해서 문제를 해결하고자 한다.
  - 모든 모듈을 번들로 묶지 않는다. esm 기능을 사용해서 필요할 때 필요한 모듈만 로드한다. (필요한 부분만 빠르게 빠르게 준비)

> 결론: 모든 모듈을 번들링하는건 성능이 너무 안좋음. 브라우저가 esm을 로드할 수 있는 기능을 사용해서 필요할 때 필요한 모듈을 로드하도록 하자 (내가 다 번들링 안할거고 브라우저도 해라)

## 기능

지원하는 기능: https://ko.vitejs.dev/guide/features

### 네이티브 ES 모듈이란?

- 최신 브라우저나 nodejs에서 import와, export를 바로 사용할 수 있는 환경
  - 원래 제공되는 (import, export..) 형태로 지원하는 환경
- es6(es2015)부터 js는 표준적으로 모듈 시스템을 지원함 https://www.w3schools.com/js/js_es6.asp#mark_modules
- esm이 왜 cjs보다 나은가? https://rollupjs.org/faqs/#why-are-es-modules-better-than-commonjs-modules

### 지원하는 브라우저

- https://ko.vitejs.dev/guide/#browser-support
- 개발 단계에서는, 최신 브라우저를 사용한다고 가정하고 esnext를 지정해 빌드 수행
- 프로덕션 빌드의 경우, (1)네이티브 esm, (2)esm 동적 import, (3)import.meta를 지원하는 브라우저 대상으로 빌드 (레거시 브라우저는 @vitejs/plugin-legacy를 통해 지원 가능
  - Chrome >=87, Firefox >=78, Safari >=14, Edge >=88

### 사전 번들링

- 사전 번들링 된 디펜던시: https://ko.vitejs.dev/guide/dep-pre-bundling
- dependency는 개발시 내용이 바뀌지 않을 소스코드다.
- vite를 통해 개발 서버를 실행 할때 최초 1번 dependency를 사전 번들링한다.
  - 개발 서버에서는 esbuild를 이용해서 esm으로 변환, 프로덕션 빌드의 경우 @rollup/plugin-commonjs가 사용된다.
  - esbuild는 Go로 작성해서 webpack 등 기존 번들러 대비 10-100배 빠르다.
- cjs 형식으로 빌드된 npm 패키지가 있을 수 있는데, 이를 esm 형식으로 변환한다.
- lodash같은 npm 패키지는 여러개의 파일로 나뉘어져 있는데, 여러 파일을 다운로드 할 경우 성능이 느려진다. 그래서 파일들을 하나로 묶어 빌드한다. https://unpkg.com/browse/lodash-es@4.17.21/

### HMR

- vite에서는 번들러가 아닌 esm을 이용한다.
- 어떤 모듈이 수정되면 vite는 수정된 모듈과 관련된 부분만 교체하고, 브라우저가 다시 모듈을 요청하면 교체된 모듈을 전달한다.
- app 사이즈가 커져도 갱신 시간은 영향받지 않는다.

### 프로덕션 빌드

- 대부분의 환경에서 esm이 지원되지만.. import로 인한 추가 네트워크 통신은 HTTP/2를 사용하더라도 비효율적이다.
- 프로덕션 환경에서는 최적의 로딩 성능을 위해 트리 셰이킹, 지연 로딩, 청크 파일 분할을 이용해 번들링 하는게 더 좋다.
- **개발 환경에서는 esbuild 쓰면서 왜 프로덕션은 rollup 씀?** 호환이 안된다. 성능은 esbuild가 좋긴한데 rollup이 유연성이 좋다.
  - rollup이 rust 기반 rolldown을 만들고 있어서 rolldown이 만들어지면 rollup, esbuild를 rolldown으로 대체해서 개발, 빌드 사이 불일치 제거 예정

## 라이브러리 모드

- 라이브러리 만들꺼면 config.build.lib 쓰면 됨

## 성능 개선하기

- https://ko.vitejs.dev/guide/performance.html
- 식별 작업 줄이기
  - import 할 때 확장자 없이 가져올 경우 resolve.extensions에 있는 확장자 하나하나의 파일이 있는지 확인하기 때문에 import 경로를 명시적으로 지정해주세요.
- 배럴 파일 피하기
  - 모든 파일이 import되고, 변환되어야 하므로 개별 API만 import 하더라도 모든 파일이 가져와짐
  - 가능하면 subPath로 import 하세요.

## TODO?

- tsconfig에서 build를 번들러가 관여할 수 있게 설정하기
- package.json에 exports 써서 cjs, esm 둘 다 지원하기
- subpath
  - api 별로 path 나누기
  - `.d.ts`도 `exports`에 포함하기: 제공하는 api에 대한 타입 선언 파일만 접근 가능 하게
  - named import도 가능하게 `index.js`, `index.cjs`, `index.d.ts`도 내보내기 (`index.d.ts`도 배럴파일?)
  - 모듈 시스템에 따라 다른 타입 선언 파일(`d.ts`, `d.cts`) 제공하기 (cjs/esm 타입 정의가 다를 수 있다?)
- 배포할 때 dist 폴더는 빼고 올리기
- 만약에 패키지 문법이 사용처에서 지원되지 않으면 어떻게 처리할지?
