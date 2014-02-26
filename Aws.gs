function test(){
  var a={}
  Logger.log(a.hoge.toString())
}
/**
 * aws(アクセスキー,シークレットキー, server（ホスト名）)
 */
function Aws(accessKey,secretAccessKey,server){
  if(accessKey==undefined||accessKey==null||accessKey.toString()==""
    || secretAccessKey==undefined||secretAccessKey==null||secretAccessKey.toString()==""){
      throw Error(" accessKey, secretAccessKey を設定してください")
  }
  return {
    /**
     * URLエンコードする。encodeURIComponentより多めにエンコードする
     * encodeURIComponent のままだと署名が違ってしまう。
     * @param str エンコードされる文字列
     */
    encodeRFC3986:function(str){
      return encodeURIComponent(str).replace(/[!*'()]/g, function(p){
        return "%" + p.charCodeAt(0).toString(16).toUpperCase();
      });
    },
    /** クエリパラメータに署名する
     * @param method  HTTPメソッド
     * @param path    パス
     * @param params  クエリパラメータオブジェクト
     */
    sign:function sign(method, path, params){
      params.AWSAccessKeyId   = accessKey;
      params.SignatureVersion = 2;
      params.SignatureMethod  = 'HmacSHA256';
      var keys = [];
      for(var i in params){
        keys.push(i);
      }
      keys.sort();
      var vals = [];
      for(var i=0; i<keys.length; i++){
        vals.push(keys[i]+"="+ this.encodeRFC3986(params[keys[i]]));
      }
      var queryParams = vals.join("&");
      var sign = [method.toUpperCase(), server.toLowerCase(), path, queryParams].join("\n");
      var sig = Utilities.base64Encode(Utilities.computeHmacSha256Signature(sign, secretAccessKey));
      return queryParams + '&Signature=' + encodeURIComponent(sig);
    },
    /** フォーマットされたタイムスタンプを得る。
     * @param date 対象時刻。未定の場合は現在時刻
     */
    getTimestamp:function(date){
      return Utilities.formatDate((date||new Date()), "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'");
    },
    /** https で get して結果のbody文字列を得る
     * @param params クエリパラメータ
     * @param path   対象のパス。未指定の場合は "/"
     */
    httpsGet:function(params,path){
      path = typeof(path)=='undefined' ? "/" : path
      var url = "https://" + server + path + "?" + this.sign("get",path,params);
      Logger.log(url);
      var xml= UrlFetchApp.fetch(url).getContentText();
      Logger.log(xml);
      return xml;
    }
  };
}
