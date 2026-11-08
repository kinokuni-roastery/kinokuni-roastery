# きのくに焙煎所ホームページ：作業メモ

このリポジトリは kinokuni-roastery.com（Netlify で公開）のホームページです。
main ブランチに送ると、Netlify が自動で公開ページを更新します。

## お店の方とのやりとり
- 日本語で、親しみやすい話し方で返事をする
- スマホから修正の依頼をされることが多い
- 確認できていない味や産地の情報は作らない。未確定のものには「仮」マークを付ける
- 電話番号・営業時間・定休日・住所はホームページに載せない
- コロンビア デカフェ スプレモはスペシャルティではない

## 今の状態（準備中版）
- js/products.js の SHOP.preLaunch が true（準備中の帯・「近日販売予定」ボタン）
- SHOP.pricesConfirmed が false（価格に「仮」マーク）
- メールアドレスは仮（info@kinokuni-roastery.com）で、まだ受信できない
- お問い合わせフォームは送信先（SHOP.formEndpoint）が未設定
- 右下の「Powered by Netlify」バナーは無料プランでは消せない。後日 GitHub Pages への引っ越しを検討中

## ★開店前チェックリスト（開店の話が出たら必ずお店の方に確認する）
- [ ] お問い合わせフォームが届くように設定する（formEndpoint など）
- [ ] 本物のメールアドレスを決めて products.js の email を書き換える（独自ドメインのメール受信設定も検討）
- [ ] STORES のショップURLと各商品ページURLを入れる（storesUrl・shopLink）
- [ ] 価格を確定して pricesConfirmed を true にする
- [ ] preLaunch を false にして準備中表示をはずす
- [ ] STORES の特定商取引法の表記を確認する（個人なら住所・電話番号の非公開機能あり）
