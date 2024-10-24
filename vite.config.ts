/** @see https://ko.vitejs.dev/config/ */
import type {UserConfig} from 'vite'
import {getBabelOutputPlugin} from '@rollup/plugin-babel'
import dts from 'vite-plugin-dts'

export default {
  build: {
    // 라이브러리 모드
    lib: {
      // 진입 파일
      entry: './src/index.ts',
      // 지원하는 모듈 시스템
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      plugins: [
        getBabelOutputPlugin({
          presets: [
            [
              '@babel/preset-env',
              {
                // `targets`을 설정하지 않으면 `.browserslistrc`를 읽는다.
                targets: undefined,
                // 폴리필 처리 최적화
                // 필요한 폴리필만 자동으로 포함시킨다.
                useBuiltIns: 'usage',
                // babel에게 어떤 corejs 버전을 쓸건지 알려주기
                corejs: '3.38',
                // targets이 뭔지 출력하기
                debug: true,
              },
            ],
          ],
        }),
      ],
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
  ],
} satisfies UserConfig
