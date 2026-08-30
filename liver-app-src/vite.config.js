import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
// ビルド結果は一つ上の階層（サイト本体）の liver-app/ フォルダに出力し、
// そのまま Vercel の静的サイトとして配信できるようにする。
//
// vite-plugin-singlefile で JS・CSS を1枚の index.html に完全に埋め込む。
// 通常の Vite ビルド（type="module" の分割ファイル）は、Chrome/Edge で
// file:// から直接開くとCORSでブロックされて真っ白になるため、
// このサイトの「ファイルをダブルクリックして開く」という使い方に
// 対応するには、外部ファイルを一切参照しない1ファイル構成が必須。
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: {
    outDir: '../liver-app',
    emptyOutDir: true,
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
})
