# vite

## browserslist와 vite 연동하기

### 목표

- browserslist를 구닥다리로 생성하기
- 트랜스파일(ex. `??=`)과 폴리필(ex. `Array.prototype.at`)이 잘 생성되는지 확인하기

### browserslist 만들기

- `.browserslistrc`를 만들자
- `chrome >= 79`로 설정

### vite 설정

- vite의 build.target(production build)은 최소한 `es2015` 이상이어야 한다. <https://ko.vite.dev/guide/build#browser-compatibility>
  - chrome 79는 가능 <https://caniuse.com/?search=es2015>
  - 그럼 플러그인 안써도 되는거 아냐..?
    - vite는 트랜스파일만 하고 폴리필은 추가 안함 (build.target만 수정하면 `??=`은 처리되는데 `at`은..)
    - browserslist 형식으로 쓰는건 되는데 `.browserslistrc`를 읽을 수 있다는 말은 없다.
- `@vitejs/plugin-legacy`를 쓰라는데.. (얘는 `.browserslistrc`도 읽나봄) <https://github.com/vitejs/vite/tree/main/packages/plugin-legacy#targets>
  - 근데 라이브러리 모드를 지원안한다. (@vitejs/plugin-legacy does not support library mode.) (바벨..을 써라?)
  - `@rollup/plugin-babel`을 써서 `.browserslistrc`와 연동해보자..

### `@rollup/plugin-babel`

- `@babel/preset-env`
  - allows you to use the latest JavaScript without needing to micromanage which syntax transforms (and optionally, browser polyfills)
  - `useBuiltIns: usage`: build된 파일에서 core-js 폴리필을 직접 import 해준다. (core-js 설치 필수) <https://babeljs.io/docs/babel-preset-env#usebuiltins>
- `core-js`
  - 폴리필 모음집
  - `@babel/preset-env`에서 core-js를 쓸거면 버전을 써줘야 된다;
  - 메이저만 쓰면 신기술을 포함 안될 수 있으니 마이너도 쓸 것; <https://github.com/zloirock/core-js?tab=readme-ov-file#babelpreset-env>
  - 생각해보니..생각없이 devDep에 깔았는데 사용처에서 import해서 쓰려면 dep로 깔야야 된다...(맞나?)
- `@rollup/plugin-babel` api <https://github.com/rollup/plugins/tree/master/packages/babel#why>
  - `getBabelOutputPlugin`: rollup을 먼저 실행하고, babel을 output에 실행한다.
    - `babel()`과 반대로 bundle된 파일에 사용해서 크고 복잡한 파일을 읽어야 돼서 느리다.
    - 파일들이 정리된 상태로 폴리필이 추가되다보니 폴리필이 중복안된다. (내가 신경 안써도 돼서 설정도 쉬움)
    - 근데 난 bundle을 안한다?
- 트랜스파일
  - `??=`을 왜 `??` 안쓰지 했는데 Nullish coalescing operator가 es2020인데 79 버전에서 호환 안됨 ㅎ 성능확실

### 피드백

- vite config에서 build.target은 누구의 target인가?
  - 요건 esbuild의 target이다.
  - [프로덕션 빌드 > 변환은 esbuild에 의해 수행된다.](https://ko.vite.dev/config/build-options.html#build-target)
    - target은 언어 버전이나 브라우저 버전이 올 수 있음 <https://esbuild.github.io/api/#target>
    - esbuild는 `.browserslistrc`를 읽지 않아서 `browserslistToEsbuild` 라이브러리가 필요하다.
  - 프로덕션 빌드에서 esbuild를 안쓴다는 건 번들링에서 안쓴다고..🙄 번들링은 rollup이 (잘못이해함;) <https://ko.vite.dev/guide/why.html#why-not-bundle-with-esbuild>
- 지금 rollup babel plugin에 `@babel/preset-env`가 지정되어 있는데 이러면 트랜스파일도, 폴리필도 babel + corejs가 한다.
  - 증거: `getBabelOutputPlugin` + `@babel/preset-env` + `target: undefined (=.browserslistrc)`로 빌드하면 chrome >= 79에 맞춰서 `??=`가 `(o = n[t]) !== null && o !== void 0 || (n[t] = r[t]);`로 바뀌어서 빌드가 됨 (왜냠 babel이 browserslist를 읽어서 트랜스 파일도 했으니깐)
    - `getBabelOutputPlugin` 부분을 아예 지워버리면 `??=`가 `??`로 트랜스파일 됨 (esbuild가 browserslistrc를 못 읽어서) = 바벨이 트랜스파일 했군.
  - 폴리필은 babel + corejs 조합으로 하고 트랜스파일은 빠른 esbuild가 했으면 함
    - 그래서 `@babel/preset-env`을 못 쓸듯? 🙄
  - 설정 후에 트랜스파일을 esbuild가 하는지 확인 필요

![image](https://github.com/user-attachments/assets/f051ee8d-b49e-4337-9dc3-75fac099b008)

- `@rollup/plugin-babel`의 `babelHelpers`
  - 바벨 헬퍼를 코드에 삽입하는 방법
  - 바벨 헬퍼란?
  - `runtime`
    - 라이브러리를 만들 때 권장
    - `@babel/plugin-transform-runtime` 사용 필요, `@babel/runtime` dep에 설치 필요
    - 왜 `@babel/runtime`를 dep에 설치하냐 요게 핵심인데, 내 라이브러리 번들에 `@babel/runtime`을 포함 안시키고 내 라이브러리 사용처에서 `@babel/runtime`이 설치되게 만들어서 난 import만 하겠다는 뜻
    - 그래서 rollup 설정에 external 옵션을 지정해줘야 함
- `@rollup/plugin-babel`의 `getBabelOutputPlugin`
  - 얘는 애초에 번들 이후에 폴리필 처리를 하는건데.. runtime이 bundled 일수가 있..나?
  - 아무튼 `getBabelOutputPlugin`로 runtime 설정하는 법 <https://github.com/rollup/plugins/tree/master/packages/babel#injected-helpers> (babelHelpers runtime과 동일하게 `@babel/plugin-transform-runtime` 사용)
  - 왜 지금 코드는 그냥 import로 처리됐나? `@babel/preset-env` 설정을 `useBuiltIns: 'usage'`로 했기 때문 <https://babeljs.io/docs/babel-preset-env#usebuiltins>
    - When either the usage or entry options are used, @babel/preset-env will add direct references to core-js modules as bare imports (or requires).

> 결론? 트랜스파일 (esbuild) + 폴리필 (babel + corejs) + 번들링 (rollup)
