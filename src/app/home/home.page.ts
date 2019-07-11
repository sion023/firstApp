import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';

import { Post } from '../models/post';
import { Comment } from '../models/comment';

import { CommentsPage } from '../comments/comments.page';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
    message: string; // 入力されるメッセージ用
    post: Post; // Postと同じデータ構造のプロパティーを指定できる
    posts: Post[]; // Post型の配列という指定もできる
    comment: Comment;

    // Firestoreのコレクションを扱うプロパティー
    postsCollection: AngularFirestoreCollection<Post>;

    constructor(
        private alertCtrl: AlertController,
        private toastCtrl: ToastController,
        private afStore: AngularFirestore,
        private afAuth: AngularFireAuth,
        private router: Router,
        private modalCtrl: ModalController
    ) { }

    ngOnInit() {
        this.afStore.firestore.enableNetwork();
        // コンポーネントの初期化時に、投稿を読み込むgetPosts()を実行
        this.getPosts();
    }

    addPost() {
        // 入力されたメッセージを使って、投稿データを作成
        this.post = {
            id: '',
            userName: this.afAuth.auth.currentUser.displayName,
            message: this.message,
            created: firebase.firestore.FieldValue.serverTimestamp()
        };

        // ここでFirestoreにデータを追加する
        this.afStore
            .collection('posts')
            .add(this.post)
            // 成功したらここ
            .then(docRef => {
                // 一度投稿を追加したあとに、idを更新している
                this.postsCollection.doc(docRef.id).update({
                    id: docRef.id
                });
                // ダイスボット処理
                this.searchDiceBot(this.message, docRef.id);
                // 追加できたら入力フィールドを空にする
                this.message = '';
            })
            .catch(async error => {
                // エラーをToastControllerで表示
                const toast = await this.toastCtrl.create({
                    message: error.toString(),
                    duration: 3000
                });
                await toast.present();
            });
    }

    // Firestoreから投稿データを読み込む
    getPosts() {
        // コレクションの参照をここで取得している
        this.postsCollection = this.afStore.collection(
            'posts', ref => ref.orderBy('created', 'desc'));

        // データに変更があったらそれを受け取ってpostsに入れる
        this.postsCollection.valueChanges().subscribe(data => {
            this.posts = data;
        });
    }

    async presentPrompt(post: Post) {
        const alert = await this.alertCtrl.create({
            header: 'メッセージ編集',
            inputs: [
                {
                    name: 'message',
                    type: 'text',
                    placeholder: 'メッセージ'
                }
            ],
            buttons: [
                {
                    text: 'キャンセル',
                    role: 'cancel',
                    handler: () => {
                        console.log('キャンセルが選択されました');
                    }
                },
                {
                    text: '更新',
                    handler: data => {
                        // 投稿を更新するメソッドを実行
                        this.updatePost(post, data.message);
                    }
                }
            ]
        });
        await alert.present();
    }

    // メッセージをアップデートする
    // 更新されると投稿とメッセージを受け取る
    updatePost(post: Post, message: string) {
        // 入力されたメッセージで投稿を更新
        this.postsCollection
            .doc(post.id)
            .update({
                message: message
            })
            .then(async () => {
                const toast = await this.toastCtrl.create({
                    message: '投稿が更新されました',
                    duration: 3000
                });
                await toast.present();
            })
            .catch(async error => {
                const toast = await this.toastCtrl.create({
                    message: error.toString(),
                    duration: 3000
                });
                await toast.present();
            });
    }

    // 投稿を削除する
    deletePost(post: Post) {
        //  受け取った投稿のidを参照して削除
        this.postsCollection
            .doc(post.id)
            .delete()
            .then(async () => {
                const toast = await this.toastCtrl.create({
                    message: '投稿が削除されました',
                    duration: 3000
                });
                await toast.present();
            })
            .catch(async error => {
                const toast = await this.toastCtrl.create({
                    message: error.toString(),
                    duration: 3000
                });
                await toast.present();
            });
    }

    // 投稿日時と現在日時との差を返す
    differenceTime(time: Date): string {
        moment.locale('ja');
        return moment(time).fromNow();
    }

    // ログアウト処理
    logout() {
        this.afStore.firestore.disableNetwork();
        this.afAuth.auth
            .signOut()
            .then(async () => {
                const toast = await this.toastCtrl.create({
                    message: 'ログアウトしました',
                    duration: 3000
                });
                await toast.present();
                this.router.navigateByUrl('/login');
            })
            .catch(async error => {
                const toast = await this.toastCtrl.create({
                    message: error.toString(),
                    duration: 3000
                });
                await toast.present();
            });
    }

    // コメントページへ現在の投稿を受け渡しつつ移動
    async showComment(post: Post) {
        const modal = await this.modalCtrl.create({
            component: CommentsPage,
            componentProps: {
                sourcePost: post
            }
        });
        return await modal.present();
    }

    // コマンドかどうかを調べる
    searchDiceBot(command, id) {
        let x;
        let y;
        let match;
        console.log(command.match(/[0-9]+d[0-9]+/));
        // コマンド1の一致
        match = command.match(/[0-9]+d[0-9]+/);
        if (match) {
            match = match[0];
            match = match.split('d');
            [x, y] = match;
            // 計算した結果をコメントする
            this.addBotComment(id, this.diceSum(x, y));
            console.log(x, y);
        }
        // コマンド2の一致
        match = command.match(/ccb<=[0-9]+/);
        if (match) {
            match = match[0];
            // 不要な文字列'ccb<='を削除
            match = match.replace('ccb<=', '');
            // 2〜99以外はコメントしない（処理を終了）
            if (match <= 1 || match >= 100) { return; }
            // 計算した結果をコメントする
            this.addBotComment(id, this.diceChallenge(match));
        }
    }

    // コマンド1 ランダムな数値を合計する
    diceSum(x, y) {
        let sum = 0;
        const sums = [];
        // ｘ回繰り返す
        for (let index = 0; index < x; index++) {
            // 1からyまでのランダムな整数をsums(配列)に格納
            sums.push(Math.round(Math.random() * (y - 1) + 1));
            // 合計する
            sum += sums[index];
        }
        console.log(sums);
        // 合計値を返す
        return '[' + sums + ']' + '→' + sum;
    }

    // コマンド2
    diceChallenge(x) {
        // 1~100の整数をランダムに出す
        const ccb = Math.round(Math.random() * 99 + 1);
        // ccbとxの値を比べる
        if (ccb <= x) {
            // ccbが５以下ならクリティカル、それ以外は成功
            if (ccb <= 5) {
                return ccb + '→クリティカル';
            } else {
                return ccb + '→成功';
            }
        } else {
            // ccbが96以上ならファンブル、それ以外は失敗
            if (ccb >= 96) {
                return ccb + '→ファンブル';
            } else {
                return ccb + '→失敗';
            }
        }
    }

    // ボット用コメント投稿
    addBotComment(id, message) {
        this.comment = {
            userName: this.afAuth.auth.currentUser.displayName,
            message: message,
            created: firebase.firestore.FieldValue.serverTimestamp(),
            sourcePostId: id,
            bot: true
        };

        this.afStore
            .collection('comments')
            .add(this.comment)
            .then(async () => {
            })
            .catch(async error => {
                const toast = await this.toastCtrl.create({
                    message: error.toString(),
                    duration: 3000
                });
                await toast.present();
            });
    }

}
