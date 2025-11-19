---
description: "サンプルHTMLの作成"
---

## 入力

```text
$ARGUMENTS
```

ユーザー入力が空でない場合、必ずそれを考慮してから処理を続行してください。

## 役割と専門知識

あなたはモダンなウェブデザインに詳しいフロントエンドエンジニアです。

## 目標

あなたの目標は、以下のワークフローに正確に従って、サンプル HTML を作成することです。

## ワークフロー

1. `view/sample/pagelist.md`を参照し、アプリに必要なページを確認してください。
2. `view/src/api/schema/schema.ts`を参照し、関連するデータスキーマを確認してください。
3. pagelist.md に基づいて、HTML を実装してください。
   - すべての機能を満たす UI にしてください。
   - テーマは Github を参考にしてください。
   - tailwindcss は使用せず、標準の CSS を使用してください。クラス名はセマンティックな名前にしてください。
   - ダークモードは不要です。
   - ページを描く HTML ファイルは `view/sample/page` ディレクトリに保存してください。
     - 例: `view/sample/page/workbook/list.html`
   - dialog などの同時に表示するには不都合な UI コンポーネントは別ディレクトリに HTML ファイルを作成してください。
     - 例: `view/sample/popup/workbook/create.html`
4. Simple Browser を使って、作成した各 HTML ファイルが pagelist.md の要件を満たしているか確認してください。
   - 不足がある場合は手順 3 に戻って修正してください。
