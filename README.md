# あったらいいなこんな機能

## ダイスボット

特定のコマンドから始まる文を打つと、DiceBotという名前のユーザーからコメントがつく  
もしくは行と色を変えて結果を同じ投稿内に表示する  
できそうなほうでいいです、要はインチキとそうでないものを見分けられればなんだっていい  

**・コマンド1(完成)**  
(x)d(y) (x),(y)は実際には数字  
	→1から(y)までの整数をランダムに(x)回出し、合計する  


**・コマンド2(完成)**  
ccb<=(x) (x)は実際には数字  
	→1から100までの整数をランダムに出し、  
	(x)以下が出たら成功  
	(x)以下かつ5以下ならクリティカル  
	(x)を上回りかつ96以上ならファンブル  
	それ以外は失敗	を同時に表示する  
	
**ここから未実装**

**・コマンド3**
cbrb<=(x) ,(y) , ...   <=の後に数字がいくつかコンマで区切られて入る
	→基本はccbと同じ
	1から100までの整数をランダムに出し、
	並べられた数字全てで成功判定が出れば完全成功
	一つでも成功すれば部分的成功
	全部失敗判定なら失敗
	クリティカル・ファンブルもあります

**・コマンド4**
res((x)-(y))  (x),(y)は実際には数字
	→ccb<=50+5(x-y)で判定
	例1：
	res(15-10)の場合成功値75

	例2：
	res(7-11)の場合成功値30

##投稿者の名前とか

投稿の入力欄の上に入力欄を作り
そこに入力することで投稿者の名前がいつでも変えれる
何も入力しない場合最後に入力した名前をそのまま使う

あと文字色も変えれるようにしたい