# firstApp
##あったらいいなこんな機能

##ダイスボット

特定のコマンドを打つと、DiceBotという名前のユーザーからコメントがつく
もしくは行と色を変えて結果を同じ投稿内に表示する
できそうなほうでいいです、要はインチキとそうでないものを見分けられればなんだっていい

###コマンド1
(x)d(y) (x),(y)は実際には数字
	→1から(y)までの整数をランダムに(x)回出し、合計する
表示例:
2d6
2d6→[3,2]→5

###コマンド2
ccb<=(x) (x)は実際には数字
	→1から100までの整数をランダムに出し、
	(x)以下が出たら成功
	(x)以下かつ5以下ならクリティカル
	(x)を上回りかつ96以上ならファンブル
	それ以外は失敗	を同時に表示する
表示例a:
ccb<=60
→46→成功
表示例b:
ccb<=20
→3→クリティカル
表示例c:
ccb<=80
→97→ファンブル
表示例d:
ccb<=35
→48→失敗

表示例e:
ccb<=1
→3→失敗
表示例f:
ccb<=99
→97→成功
(5以下、96以上の判定より成功失敗の判定を優先する)

最低限これだけできればいい