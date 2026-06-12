<?php
//sltest2.phpから入力フォーマットに入力されたデータをpostで渡されるので
//$HTTP_POST_VARSによりフィールド inpnum の内容を取り出し $safetextに格納
//$key = $HTTP_POST_VARS["inpnum"];

//検索する文字列
$a = $_GET['data'];
$b = $_GET['result'];
$c = $_GET['win'];

function logs($a,$b,$c){

//DBへ接続開始
//sqlite_openの文法
//sqlite_open(データベースのファイル名,ファイルのモード,エラーメッセージ)
//
//データベースのファイル名 --- SQLite データベースのファイル名
//PHPのファイルがある位置を基点として相対位置でデータベースファイル名を指定
//ファイルが存在しない場合はSQLiteはファイルを生成する
//
//ファイルのモード --- 読み込み専用モードでデータベースをオープンする
//デフォルト値は、8 進数値 0666 
//
//エラーメッセージ --- エラーメッセージを格納する変数を指定する
$dbHandle = sqlite_open('othello.db', 0666, $err);

//DBの接続に失敗した場合はエラー表示をおこない処理中断
if ($dbHandle == False) {
    die('can not connect db\n'.$err);
	exit;
}

$today = date("Y-m-d H:i:s");

//SQL文 book表からresult列の値が入力フィールドで入力された値と等しい行を抽出
$sql = "insert into logs (date, data, result, win) values ('$today', '$a', ".$b.", ".$c.")";

//SQL文を実行する
//sqlite_queryの文法
//sqlite_query(SQLiteデータベースリソース, 実行するクエリ,配列の添字のタイプ,エラーメッセージ)
//
//SQLiteデータベースリソース --- SQLiteのデータベースリソースを指定する
//
//実行するクエリ --- 実行SQL文を指定する
//
//配列の添字のタイプ --- 返される配列の添字のタイプを指定する
//SQLITE_ASSOC --- 連想配列の添字のみが返される
//SQLITE_NUM   --- 数値の添字のみが返される
//SQLITE_BOTH  --- デフォルト値で連想配列の添字と数値の添字の両方が返される
//
//エラーメッセージ --- エラーメッセージを格納する変数を指定する
//
$rs = sqlite_exec($dbHandle, $sql, $err);

//SQL命令の実行に失敗した場合はエラー表示をおこない処理中断
if (!$rs) {
    die('query error'.$err);
}


//DBへの接続を切断
sqlite_close($dbHandle);

}


//関数呼び出し
echo logs($a,$b,$c);

?>