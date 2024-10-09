/** @see https://ko.vitejs.dev/config/ */
import type {UserConfig} from 'vite'
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
