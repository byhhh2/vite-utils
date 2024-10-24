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
