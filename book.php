<?php
//sltest2.phpから入力フォーマットに入力されたデータをpostで渡されるので
//$HTTP_POST_VARSによりフィールド inpnum の内容を取り出し $safetextに格納
//$key = $HTTP_POST_VARS["inpnum"];

//検索する文字列
$sch = $_GET['data'];
$maix = $_GET['result'];

function book($sch,$maix){

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

if($maix == 1){
	$maix = "max";
}
else{
	$maix = "min";
}

//SQL文 book表からresult列の値が入力フィールドで入力された値と等しい行を抽出
$sql = "select ".$maix."(result), ".$maix."(data) from book where data like '$sch%'";

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
$rs = sqlite_query($dbHandle, $sql, SQLITE_BOTH, $err);

//SQL命令の実行に失敗した場合はエラー表示をおこない処理中断
if (!$rs) {
    die('query error'.$err);
}

//sqlite_num_fields数を使用しtab1表の列数を取得する
$fields = sqlite_num_fields($rs);

//sqlite_num_rows関数を使用しtab1表の行数を取得する
$rows = sqlite_num_rows($rs);

//入力されたnumberの行があった場合はデータを出力する
if ($rows > 0) {

//sqlite_fetch_array関数を使用しbook表のレコードの結果を
//配列として取得する
//それ以上レコードがなければFALSEを返す
	$row = sqlite_fetch_array($rs);

}

//DBへの接続を切断
sqlite_close($dbHandle);

return $row[1];
}


//関数呼び出し
echo book($sch,$maix);


?>