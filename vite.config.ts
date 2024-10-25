/** @see https://ko.vitejs.dev/config/ */
import type {UserConfig} from 'vite'
import {getBabelOutputPlugin, babel} from '@rollup/plugin-babel'
import dts from 'vite-plugin-dts'
import pkg from './package.json'

export default {
  build: {
    // 트랜스파일은 esbuild가 하고
    // 폴리필은 babel이 해줘

    // 라이브러리는 runtime
    //

    // 변수 타입을 모르니깐 이름 같은 폴리필 넣음;
    // 이름에 예약어 넣지마?

    target: 'chrome120',
    // 라이브러리 모드
    lib: {
      // 진입 파일
      entry: './src/index.ts',
      // 지원하는 모듈 시스템
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        // ...Object.keys(pkg.peerDependencies),
        ...Object.keys(pkg.dependencies),
      ].flatMap((dep) => [dep, new RegExp(`^${dep}/.*`)]),

      output: [
        {
          dir: 'dist',
          format: 'es',
          entryFileNames: '[name].js',
          // 개별 모듈 유지 (subpath 지원)
          preserveModules: true,
        },
        {
          dir: 'dist',
          format: 'cjs',
          entryFileNames: '[name].cjs',
          preserveModules: true,
        },
      ],
    },
  },
  plugins: [
    dts({
      // index.d.ts 파일을 생성 (배럴 파일)
      insertTypesEntry: true,
      // 선언 파일을 index.d.ts 하나로 안묶고 배럴 파일만..
      rollupTypes: false,
    }),
    babel({
      babelHelpers: 'runtime',
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          {
            corejs: {version: 3, proposals: true},
            debug: true,
          },
        ],
      ],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      exclude: 'node_modules/**',
    }),
  ],
} satisfies UserConfig
