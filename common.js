<!--
	//コマ色の定義
	var EMPTY = 0;
	var BLACK = 1;
	var WHITE = -1;
//	var WALL = 2;
	
	
	//盤面用２次元配列の定義
	var cell = new Array(10);
	for(x=0;x<cell.length;x++){
		cell[x] = new Array(10);
		for(y=0;y<cell.length;y++){
			cell[x][y] = 0;			//盤面の初期化
		}
	}
	
	//縦(x)の座標対応
	var mt = new Array("","a","b","c","d","e","f","g","h");
	var mt2 = new Array();
	mt2["a"] = 1;
	mt2["b"] = 2;
	mt2["c"] = 3;
	mt2["d"] = 4;
	mt2["e"] = 5;
	mt2["f"] = 6;
	mt2["g"] = 7;
	mt2["h"] = 8;
	
	//プレーヤーの初期状態
	var piece = BLACK;
	
	//指した回数
	var count = 0;
	
	//ゲームの進行状況
	var gamestatus = 0;		//「0」序盤「1」中盤「2」終盤
	
	//ゲームの難易度設定
	var gamelevel = 0;
	
	//コンピュータ思考中フラグ
	var computerThinking = false;
	
	//ログ用
	var blackside = "human";
	var whiteside = "com";
	var log = "";
	var logr = "";		//Logistello_book形式のログ
	var logj = "";		//定石参照用
	var fpiece = "";	//初手の場所(xのみ)を格納する

	//指せるマスの座標を格納する配列
	var ecell = new Array();
	ecell[0] = new Array();		//xの座標
	ecell[1] = new Array();		//yの座標

	
	//変更点を記録する配列
	var UpdateLog = new Array();
	for(i=0;i<60;i++){
		UpdateLog[i] = new Array();
	}
	
	
	//座標を定義する
	function Point(x,y){
		this.x = x;
		this.y = y;
	}

	
	//石を表現する
	function Disc(x,y,color){
		this.x = x;
		this.y = y;
		this.color = color;
	}
	
	
	//盤面を表示する関数
	function tableDisplay(banmen){
		i = 11;
		for(x=1;x<9;x++){
			for(y=1;y<9;y++){
				switch(banmen[x][y]){
					//空のマス
					case EMPTY:
						document.getElementById(i).innerHTML = "<img src=image/0.png border=0>";
						break;
					//黒の駒
					case BLACK:
						document.getElementById(i).innerHTML = "<img src=image/1.png border=0>";
						break;
					//白の駒
					case WHITE:
						document.getElementById(i).innerHTML = "<img src=image/-1.png border=0>";
						break;
					default:
						alert("Program Error!! 盤面データに無効な値が与えたれています。");
				}
			//壁に当たる部分は飛ばして次に移る。
			if(i==18 || i==28 || i==38 || i==48 || i==58 || i==68 || i==78 || i==88){
			i=i+3;
			}else{
			i++;
			}
			}
		}
	}
	
	
	//メイン関数
	function main(banmen,color,x,y){
	var result = "";
		//すでにコマがあるか、返せるコマがなければ処理を行わない
		if(checkPiece(banmen,x,y) != false && checkCell(banmen,color,x,y) != false)
		{
			//コマを返す
			turnPiece(banmen,color,x,y);
			//カウントを1つ上げる
			count++;
			//盤面を表示する
			tableDisplay(banmen);
			//ユーザ番手の時、着手可能手を表示させるチェックがあれば表示させる
			if(document.control.disecell.checked == true && color != piece)
				displayEcell(banmen,-color);
			//ステータスにメッセージを表示する
			statusMessage(banmen);
			//ログを格納する
			logOutput2(color,x,y);
			//alert(logj);
			//パスチェックの結果を返す
			result = checkPass(banmen,-color);
		}
		else
		{
			//置く場所がないのでエラー応答
			result = "ENABLE";
		}
		
		//マスのチェックとパスチェックの結果を受けた後の処理
		switch(result){
			//次の番手がパスだった場合
			case "PASS":
				//次の番手がコンピュータの時
				if(color == piece)
				{
					alert("コンピュータ側はパスします");
					//着手可能手を表示させる
					if(document.control.disecell.checked == true && color == piece)
						displayEcell(cell,color);
				}
				//次の番手がユーザーの時
				else
				{
					alert("あなたが置けるマスがないのでパスします");
				}
				break;
			//置けないマスを指定していた場合
			case "ENABLE":
				//コンピュータの時
				if(color != piece)
					alert("ProgramError!! 置けないマスを指定しています");
				//ユーザーの時
				else
					alert("そのマスには置く事ができません");
				break;
			//ゲームが終了した場合
			case "GAMEEND":
				//ログをサーバーに送信する
				//logSend(log);
				//盤面上のコマの値を合算して結果を表示する
				var cntpiece = countPiece(banmen);
				if(cntpiece > 0)
					alert("ゲーム終了\n黒の勝ち");
				if(cntpiece == 0)
					alert("ゲーム終了\n引き分け");
				if(cntpiece < 0)
					alert("ゲーム終了\n白の勝ち");
				break;
		}
		return result;
	}
	
	
	//盤面に駒を置く関数
	function putPiece(banmen,color,x,y){
		if(computerThinking == true){
			$('container').innerHTML = "コンピュータが思考中です...";
			return;
		}
		var mainresult = main(banmen,color,x,y);
		if(mainresult == "")
			requestComputerMove(banmen,color,gamelevel);
	}
	
	
	//コンピュータの思考表示を出してから着手する関数
	function requestComputerMove(banmen,color,level){
		computerThinking = true;
		$('container').innerHTML = "コンピュータが思考中です...";
		setTimeout(function(){
			try{
				computPiece(banmen,color,level);
			}finally{
				computerThinking = false;
			}
		}, 100);
	}
	
	
	//すでにコマがあるかチェックする関数
	//修正: マスが空の場合にtrueを返すようにした
	function checkPiece(banmen,x,y){
		if(banmen[x][y] == EMPTY)
			return true;
		else
			return false;
	}
	
	
	//挟める場所かチェックする関数
	function checkCell(banmen,color,x,y){
		var result;
		for(tx=-1;tx<=1;tx++){
		for(ty=-1;ty<=1;ty++){
			if(banmen[x+tx][y+ty] == -color){
				i = 2;
				//マスの最大値と最小値まで調べる
				while(x+tx*i <= 8 && x+tx*i >= 1 && y+ty*i <= 8 && y+ty*i >= 1){
					switch(banmen[x+(tx*i)][y+(ty*i)]){
						//2つ目以降に自分と同じコマがあればOK
						case color:	
							result = true;
							i = 9;
							break;
						//相手のコマだった場合は隣を検索
						case -color:
							i++;
							break;
						//途中に空白があった場合はNG
						case EMPTY:
							i = 9;
							break;
					}
				}
			}
		}
		}
		if(result==null)
			result = false;
	return result;
	}
	
	
	//挟んだ駒を裏返す関数
	function turnPiece(banmen,color,x,y){
		//指したマスにコマを置く
		banmen[x][y] = color;
		//指したコマを記録する。
//		UpdateLog[count][0] = new Disc(x,y,color);
		//裏返す処理
		for(tx=-1;tx<=1;tx++){
		for(ty=-1;ty<=1;ty++){
			//隣が相手のコマだったら
			if(banmen[x+tx][y+ty] == -color){
					//隣から
					i = 2;
					//マスの最大値と最小値まで調べる
					while(x+tx*i <= 8 && x+tx*i >= 1 && y+ty*i <= 8 && y+ty*i >= 1)
					{
						switch(banmen[x+(tx*i)][y+(ty*i)]){
							//自分と同じコマがあったところから順番に相手のコマを裏返す
							case color:
								for(j=1;i-j>=1;j++){
									banmen[x+tx*(i-j)][y+ty*(i-j)] = color;
									//裏返したコマの座標と色を記録する。
//									UpdateLog[count][j] = new Disc(x+tx*(i-j),y+ty*(i-j),-color);
								}
								i = 9;
								break;
							//相手のコマだった場合は隣を検索
							case -color:
								i++;
								break;
							//途中に空白があればNGなので途中で抜ける
							case EMPTY:
								i = 9;
								break;
						}
					}
			}
		}
		}
	}
	
	
	//ログを出力する関数
	function logOutput(color,x,y){
		var rx;
		var ry;
		//黒の時は「＋」をつける
		if(color == BLACK)
			log = log + "+" + mt[y] + x;
		//白のときは「－」をつける
		else if(color == WHITE)
			log = log + "-" + mt[y] + x;
		//最初の1手目のx座標を格納する
		if(count == 1)
			fpiece = x;
		
		//Logistello_book用のログ座標に変換する
		switch(fpiece){
			case 3:
				rx = x;
				ry = y;
				break;
			case 4:
				var tmp;
				tmp = y;
				ry = x;
				rx = tmp;
				break;
			case 5:
				var tmp;
				tmp = 9 - y;
				ry = 9 - x;
				rx = tmp;
				break;
			case 6:
				rx = 9 - x;
				ry = 9 - y;
				break;
			default:
				alert("Logistello_book用ログ変換のエラーです");
		}
		
		if(color==BLACK)
			logr = logr + "+" + mt[ry] + rx;
		else if(color==WHITE)
			logr = logr + "-" + mt[ry] + rx;
	}

	//ログを出力する関数(オセロ協会フォーマット)
	function logOutput2(color,x,y){
		var rx;
		var ry;
		//黒の時は大文字にする
		if(color == BLACK)
			log = log + mt[y].toUpperCase() + x;
		//白の時はそのままにする
		else if(color == WHITE)
			log = log + mt[y] + x;
		//最初の1手目のx座標を格納する
		if(count == 1)
			fpiece = x;
		
		//座標に変換する
		switch(fpiece){
			case 5:
				rx = x;
				ry = y;
				break;
			case 6:
				var tmp;
				tmp = y;
				ry = x;
				rx = tmp;
				break;
			case 3:
				var tmp;
				tmp = 9 - y;
				ry = 9 - x;
				rx = tmp;
				break;
			case 4:
				rx = 9 - x;
				ry = 9 - y;
				break;
			default:
				alert("変換のエラーです");
		}
		
		if(color==BLACK)
			logj = logj + mt[ry].toUpperCase() + rx;
		else if(color==WHITE)
			logj = logj + mt[ry] + rx;
	}

	
	
	//パス判定しゲームの終了を判定する関数
	function checkPass(banmen,color){
		//検索1回目チェック結果
		var ckpass1 = 0;
		//検索2回目チェック結果
		var ckpass2 = 0;
		//リターン値
		var result = "";
		//全てのマスをチェックする
		for(x=1;x<9;x++){
		for(y=1;y<9;y++){
			//空白のマスだけ検索する
			if(banmen[x][y] == EMPTY){
				//検索1回目
				if(checkCell(banmen,color,x,y)==true)
					ckpass1 = 1;
				//検索2回目
				if(checkCell(banmen,-color,x,y)==true)
					ckpass2 = 1;
			}
		}
		}
		//白黒ともに置くところがない場合はゲーム終了
		if(ckpass1==0 && ckpass2==0)
			result = "GAMEEND";
		//最初の検索で置くところがなかった場合はパスが発生
		if(ckpass1==0 && ckpass2==1)
			result = "PASS";
	return result;
	}


	//指せるマスを格納する関数
	function setEcell(banmen,kakunomen,color){
		var cnt = 0;
		for(ex=1;ex<9;ex++){
		for(ey=1;ey<9;ey++){
		if(banmen[ex][ey] == 0){
			if(checkCell(banmen,color,ex,ey)==true){
				kakunomen[0][cnt] = ex;
				kakunomen[1][cnt] = ey;
				cnt++;
			}
		}
		}
		}
	}


	//指せるマスを表示する関数
	function displayEcell(banmen,color){
		for(ex=1;ex<9;ex++){
		for(ey=1;ey<9;ey++){
		if(banmen[ex][ey] == 0){
			if(checkCell(banmen,color,ex,ey)==true)
				document.getElementById(ex*10+ey).innerHTML = "<img src=image/2.png border=0>";
		}
		}
		}
	}


	//ゲーム開始時の処理をする関数
	function gameStart(banmen,color){
		for(x=0;x<10;x++){			//盤面の初期化
			for(y=0;y<10;y++){
				banmen[x][y] = 0;
			}
		}

		//初期駒の配置
		banmen[4][4] = -1;
		banmen[4][5] = 1;
		banmen[5][4] = 1;
		banmen[5][5] = -1;
		
		//カウンタの初期化
		count = 0;
		
		//ゲーム進行状況の初期化
		gamestatus = 0;
		
		//ゲーム難易度を設定する
		gamelevel = document.control.level.selectedIndex;
		
		//ログの初期化
		log = "";
		logr = "";
		fpiece ="";
		
		//初期ゴマの初期描写
		tableDisplay(cell);
		
		//ステータスバーの出力
		$('container').innerHTML = "ゲームを開始します。";
		
		//着手可能手の表示有無
		if(document.control.disecell.checked == true)
			displayEcell(banmen,color);
		
		//先手がコンピュータの場合
		if(document.control.pcolor[1].checked == true){
			//ユーザーを白に設定
			piece = WHITE;
			//コンピュータが1手目を指す
			requestComputerMove(banmen,piece,gamelevel);
		}else{
			//ユーザーを黒に設定
			piece = BLACK;
		}
	}


	//ログ送信処理
	function logSend(logs){
		var comwin = 0;			//コンピュータの勝敗
		var message = "";
		var resultlog = countPiece(cell);	//コマ数の結果
		if((piece==1&&resultlog>0)||(piece==-1&&resultlog<0)){			//試合結果の判定
			comwin = -1;
			message = "あなたの勝ちです。　";
		}else if((piece==1&&resultlog<0)||(piece==-1&&resultlog>0)){
			comwin = 1;
			message = "コンピュータの勝ちです。　";
		}else if(resultlog==0){
			comwin = 0;
			message = "引き分けです。　";
		}
//		var a = new Ajax.Request(
//			"http://kaede1.ddo.jp/othello/logs.php",
//			{
//				method: "get",
//				parameters: "data="+logs+"&result="+resultlog+"&win="+comwin,
//				onComplete: function(o){
//					ps = o.responseText;
//					$('container').innerHTML = message+"ログの送信が完了しました。";
//				},
//				onFailure: function(){
//					$('container').innerHTML = message+"ログの送信に失敗しました。";
//				},
//				onException: function(){
//					$('container').innerHTML = message+"ログの送信処理中に問題が発生しました。";
//				}
//			}
//		);
	}
	
	
	//ステータスバーにコマ数を表示する
	function statusMessage(banmen){
		var cnt = countPiece(banmen);
		$('container').innerHTML = "現在："+count+"手目　黒："+(4+count+cnt)/2+"　白："+(4+count-cnt)/2;
	}
	
	
	//盤面を1手数戻す
	function backTurn(banmen){
		count--;
		var t_x;
		var t_y;
		var t_color;
		var i = 0;
		
		while(UpdateLog[count][i] != null)
		{
			t_x = UpdateLog[count][i].x;
			t_y = UpdateLog[count][i].y;
			t_color = UpdateLog[count][i].color;
			
			if(i==0)
				banmen[t_x][t_y] = 0;
			else
				banmen[t_x][t_y] = t_color;
			
			UpdateLog.pop();
			
			i++;
		}
		tableDisplay(banmen);
	}




	
//--> 
