<!--
	
	//盤面評価用配列
	var cntcell = new Array(10);
	for(x=0;x<cntcell.length;x++){
		cntcell[x] = new Array(10);
			for(y=0;y<cntcell.length;y++){
				cntcell[x][y] = 0;			//盤面の初期化
			}
	}
	
	//盤面評価用配列2
	var cntcell2 = new Array(10);
	for(x=0;x<cntcell2.length;x++){
		cntcell2[x] = new Array(10);
			for(y=0;y<cntcell2.length;y++){
				cntcell2[x][y] = 0;			//盤面の初期化
			}
	}
	
	//盤面評価用配列3
	var cntcell3 = new Array(10);
	for(x=0;x<cntcell3.length;x++){
		cntcell3[x] = new Array(10);
			for(y=0;y<cntcell3.length;y++){
				cntcell3[x][y] = 0;			//盤面の初期化
			}
	}
	
	//盤面評価用配列2
	var cntcell4 = new Array(10);
	for(x=0;x<cntcell4.length;x++){
		cntcell4[x] = new Array(10);
			for(y=0;y<cntcell4.length;y++){
				cntcell4[x][y] = 0;			//盤面の初期化
			}
	}
	
	
	
	//(先読み用)指せるマスの座標を格納する配列
	var scell = new Array();
	scell[0] = new Array();		//xの座標
	scell[1] = new Array();		//yの座標

	//(先読み用)指せるマスの座標を格納する配列
	var scell2 = new Array();
	scell2[0] = new Array();		//xの座標
	scell2[1] = new Array();		//yの座標


	//コンピュータ側が盤面にコマを置く関数
	function computPiece(banmen,color,level){
		if(level==0)
			choiceEcell(banmen,-color);
		if(level==1)
			choiceEcell2(banmen,-color);
		if(level==2){
		switch(gamestatus){
			case 0:
				choiceJcell(banmen,-color);		//定石参照
				break;
			case 1:
				move2(banmen,-color);
				break;
			case 2:
				move(banmen,-color);
				break;
			default:
				alert("gamestatusのエラーです");
		}
		}
	}
	
	
	//指せるマスからランダムにマスを選んで指す関数
	function choiceEcell(banmen,color)
	{
		var ri = Math.ceil(Math.random() * putEcell(banmen,color));
		setEcell(banmen,ecell,color);
		ex = ecell[0][ri-1];
		ey = ecell[1][ri-1];
		var mainresult = main(banmen,color,ex,ey);
		if(mainresult=="PASS")
			choiceEcell(banmen,color);
	}
	
	
	//マスの評価値
	var cellpoint = new Array();
	cellpoint[1] = new Array(0,100,-10,50,5,5,50,-10,100,0);
	cellpoint[2] = new Array(0,-10,-20,2,2,2,2,-20,-10,0);
	cellpoint[3] = new Array(0,50,2,10,5,5,10,2,50,0);
	cellpoint[4] = new Array(0,5,2,5,0,0,5,2,5,0);
	cellpoint[5] = new Array(0,5,2,5,0,0,5,2,5,0);
	cellpoint[6] = new Array(0,50,2,10,5,5,10,2,50,0);
	cellpoint[7] = new Array(0,-10,-20,2,2,2,2,-20,-10,0);
	cellpoint[8] = new Array(0,100,-10,50,5,5,50,-10,100,0);
	
	//座標とポイントを格納する配列の定義
	function pointsort(x,y,point)
	{
		this.x = x;
		this.y = y;
		this.point = point;
	}
	
	//ポイントを比較する
	function cmp_point(a,b)
	{
		return b.point - a.point;
	}
	
	//評価値の高いマスを選んで指す関数
	function choiceEcell2(banmen,color)
	{
		var cellpointtmp = new Array();
		var cnt = putEcell(banmen,color);
		setEcell(banmen,ecell,color);
		
		for(i=0;i<cnt;i++)
		{
			cx = ecell[0][i];
			cy = ecell[1][i];
			cp = cellpoint[cx][cy];
			cellpointtmp[i] = new pointsort(cx,cy,cp);
		}
		cellpointtmp.sort(cmp_point);
		
		//ポイントの高いマスを取り出して置く
		ex = cellpointtmp[0].x;
		ey = cellpointtmp[0].y;
		var mainresult = main(banmen,color,ex,ey);
		if(mainresult=="PASS")
			choiceEcell2(banmen,color);
		delete cellpointtmp;
		
		if(count>=46)
			gamestatus = 2;
	}
	
	
	//序盤用Logistello_book参照関数
	function choiceEcell5(banmen,color)
	{
		var ex = "";
		var ey = "";
		var book = "";
		var tmp;
		
		var a = new Ajax.Request(
			"http://kaede1.ddo.jp/othello/book.php",
			{
				method: "get",
				parameters: "data="+logr+"&result="+color,
				onComplete: function(o){
					book = o.responseText;
					
					if(book.length != 0){
					ex = book.charAt(3*count+2);
					ey = book.charAt(3*count+1);
					ex = ex - 0;
					ey = mt2[ey];
					
					switch(fpiece){		//通常座標への変換処理
						case 3:
							ex = ex;
							ey = ey;
							break;
							
						case 4:
							var tmp;
							tmp = ey;
							ey = ex;
							ex = tmp;
							break;
							
						case 5:
							var tmp;
							tmp = 9 - ey;
							ey = 9 - ex;
							ex = tmp;
							break;
							
						case 6:
							ex = 9 - ex;
							ey = 9 - ey;
							break;
							
						default:
							alert("Logistello_book用ログからの変換エラーです");
					}
					
					main(banmen,color,ex,ey);
					
					}else
					{
						gamestatus = 1;		//中盤処理に移行
						choiceEcell2(banmen,color);
					}
					}
			}
		);
	}
	
	
	function tableCopy(banmen,copyban)		//盤面評価用配列　現在の盤面をコピー
	{
		for(cx=0;cx<10;cx++)
		{
			for(cy=0;cy<10;cy++)
			{
				copyban[cx][cy] = banmen[cx][cy];
			}
		}
	}

	function cloneBoard(banmen)
	{
		var copyban = new Array(10);
		for(var cx=0;cx<10;cx++)
		{
			copyban[cx] = new Array(10);
			for(var cy=0;cy<10;cy++)
			{
				copyban[cx][cy] = banmen[cx][cy];
			}
		}
		return copyban;
	}

	function legalMoves(banmen,color)
	{
		var moves = new Array();
		for(var mx=1;mx<9;mx++)
		{
			for(var my=1;my<9;my++)
			{
				if(banmen[mx][my] == EMPTY && checkCell(banmen,color,mx,my)==true)
					moves[moves.length] = new Point(mx,my);
			}
		}
		return moves;
	}

	function countDiscDiff(banmen,color)
	{
		var diff = 0;
		for(var dx=1;dx<9;dx++)
		{
			for(var dy=1;dy<9;dy++)
			{
				if(banmen[dx][dy] == color)
					diff++;
				else if(banmen[dx][dy] == -color)
					diff--;
			}
		}
		return diff;
	}

	function countEmptyCells(banmen)
	{
		var empty = 0;
		for(var dx=1;dx<9;dx++)
		{
			for(var dy=1;dy<9;dy++)
			{
				if(banmen[dx][dy] == EMPTY)
					empty++;
			}
		}
		return empty;
	}

	function cmp_move(a,b)
	{
		return b.point - a.point;
	}

	function orderedMoves(banmen,color)
	{
		var moves = legalMoves(banmen,color);
		var scored = new Array();
		for(var i=0;i<moves.length;i++)
		{
			var point = cellPoint(moves[i].x,moves[i].y);
			var tmpban = cloneBoard(banmen);
			turnPiece(tmpban,color,moves[i].x,moves[i].y);
			point = point + putEcell(tmpban,color) - putEcell(tmpban,-color) * 2;
			scored[i] = new pointsort(moves[i].x,moves[i].y,point);
		}
		scored.sort(cmp_move);
		return scored;
	}

	function searchEvaluator(banmen,color)
	{
		var empty = countEmptyCells(banmen);
		if(empty <= 12)
			return countDiscDiff(banmen,color) * 10000;
		return evaBoard(banmen,color) + countDiscDiff(banmen,color) * (count >= 44 ? 20 : -2);
	}

	function negamaxSearch(banmen,color,a,b,depth,perfect)
	{
		var moves = orderedMoves(banmen,color);
		var opponentMoves = legalMoves(banmen,-color);

		if(moves.length == 0 && opponentMoves.length == 0)
			return countDiscDiff(banmen,color) * 10000;

		if(moves.length == 0)
			return -negamaxSearch(banmen,-color,-b,-a,depth-1,perfect);

		if(depth <= 0 && perfect != true)
			return searchEvaluator(banmen,color);

		var score_max = -100000000;
		for(var q=0;q<moves.length;q++)
		{
			var nextban = cloneBoard(banmen);
			turnPiece(nextban,color,moves[q].x,moves[q].y);
			var score = -negamaxSearch(nextban,-color,-b,-a,depth-1,perfect);

			if(score > score_max)
				score_max = score;
			if(score > a)
				a = score;
			if(a >= b)
				break;
		}
		return score_max;
	}

	function selectBestMove(banmen,color,depth,perfect)
	{
		var moves = orderedMoves(banmen,color);
		var best = null;
		var eval_max = -100000000;

		for(var q=0;q<moves.length;q++)
		{
			var nextban = cloneBoard(banmen);
			turnPiece(nextban,color,moves[q].x,moves[q].y);
			var eval = -negamaxSearch(nextban,-color,-100000000,100000000,depth-1,perfect);
			if(eval > eval_max)
			{
				eval_max = eval;
				best = moves[q];
			}
		}
		return best;
	}
	

	//negamax法による終盤完全読み切り探索
	function negamax(banmen,color,a,b)
	{
		return negamaxSearch(banmen,color,a,b,countEmptyCells(banmen),true);
	}
	
	
	//打つ手を決定するための関数
	function move(banmen,color)
	{
		var best = selectBestMove(banmen,color,countEmptyCells(banmen),true);
		ex = best.x;
		ey = best.y;
		var mainresult = main(banmen,color,ex,ey);
		if(mainresult=="PASS")
			move(banmen,color);
	}


	//negamax法による中盤最善手探索
	function negamaxMid(banmen,color,a,b,depth)
	{
		return negamaxSearch(banmen,color,a,b,depth,false);
	}


	//【中盤】打つ手を決定するための関数
	function move2(banmen,color)
	{
		var empty = countEmptyCells(banmen);
		var depth = empty <= 16 ? empty : 4;
		var perfect = empty <= 16;
		var best = selectBestMove(banmen,color,depth,perfect);
		ex = best.x;
		ey = best.y;
		var mainresult = main(banmen,color,ex,ey);
		if(mainresult=="PASS")
			move2(banmen,color);
		if(count>=46)
			gamestatus = 2;
	}
	
	
	
	//評価関数による一手読み
	function choiceEcell3(banmen,color){
		tableCopy(banmen,cntcell)	//盤面のコピー
		tableCopy(cntcell,cntcell2);	//戻し用テーブルへコピー
		var inc_x;
		var inc_y;
		var cp;
		var cpt;
		var cellpointtmp = new Array();
		
		setEcell(cntcell,scell,color);
		var child_count = putEcell(cntcell,color);
		for(var q=0;q<child_count;q++){
			inc_x = scell[0][q];
			inc_y = scell[1][q];
			turnPiece(cntcell,color,inc_x,inc_y);			//コマを返す
			var cp = evaBoard(cntcell,color);
			tableCopy(cntcell2,cntcell);					//局面を戻す
			cp = cp + cellPoint(inc_x,inc_y);
			cellpointtmp[q] = new pointsort(inc_x,inc_y,cp);
//			alert(cp+","+inc_x+","+inc_y);
		}
		cellpointtmp.sort(cmp_point);
		ex = cellpointtmp[0].x;
		ey = cellpointtmp[0].y;
		var mainresult = main(banmen,color,ex,ey);
		if(mainresult=="PASS")
			choiceEcell3(banmen,color);
		if(count>=46)
			gamestatus = 2;
	}

    //定石参照処理
	function choiceJcell(banmen,color){
			//alert("定石参照処理実行");

		for(var i=1;i<joseki.length+1;i++){


			var result = joseki[i].match(logj);     //定石の配列にログと一致するものがあるか
			if(result != null){
					//alert("定石該当有");
					var next = joseki[i].substr( logj.length, 2 );  //マッチした定石から次の手を抜き出す
					//alert(next);
					var ny = next.substr(0,1);              //次の手の1文字目を抜き出す
					ny = changeS2num(ny);                   //次の手の1文字目を数字に変換
					var nx = next.substr(1);                //次の手の2文字目を抜き出す

					nx = Number(nx);        //文字列→数値変換
					ny = Number(ny);
					
					//座標に変換する
					switch(fpiece){
						case 5:
							nx;
							ny;
							break;
						case 6:
							var tmp;
							tmp = ny;
							ny = nx;
							nx = tmp;
							break;
						case 3:
							var tmp;
							tmp = 9 - ny;
							ny = 9 - nx;
							nx = tmp;
							break;
						case 4:
							nx = 9 - nx;
							ny = 9 - ny;
							break;
						default:
							alert("変換のエラーです");
					}

					var mainresult = main(banmen,color,nx,ny);
					if(mainresult=="PASS")
							choiceJcell(banmen,color);
					break;
					}else{
					if(i==joseki.length-1){
						//alert("定石該当なし");
						gamestatus = 1;         //中盤処理に移行
						move2(banmen,color);
						break;
					}
			}
		}
			
	}

        //文字を数字に変換
        function changeS2num(string){
                switch(string){
                        case "a": string = 1;
                                break;
                        case "b": string = 2;
                                break;
                        case "c": string = 3;
                                break;
                        case "d": string = 4;
                                break;
                        case "e": string = 5;
                                break;
                        case "f": string = 6;
                                break;
                        case "g": string = 7;
                                break;
                        case "h": string = 8;
                                break;
                        case "A": string = 1;
                                break;
                        case "B": string = 2;
                                break;
                        case "C": string = 3;
                                break;
                        case "D": string = 4;
                                break;
                        case "E": string = 5;
                                break;
                        case "F": string = 6;
                                break;
                        case "G": string = 7;
                                break;
                        case "H": string = 8;
                                break;
                }
                return string;
        }

        //数字を文字に変換
        function changeN2str(number){

        }
	
	
//-->
