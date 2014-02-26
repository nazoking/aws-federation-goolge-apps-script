/* =====================================
 使い方 は example.gs を見てください
 ======================================= */

/**
 * ログイン用のURLを作るオブジェクトを返します。
 * @params r ログインパラメータ {
 *  accessKeyId: AWSアクセスキー(必須)
 *  secretAccessKey: AWSシークレットキー(必須)
 *  policy:ポリシー（権限 必須）,
 *  name:ログインユーザの名前(未指定ならセッションユーザのEmailアドレス),
 *  durationSeconds:この権限の有効時間(秒) 900秒(15分)から 129600秒(36時間) デフォルトは43200秒(12時間),
 * }
 */
function FederatedLoginUrlCreator(r){
  var sts = new Sts(r.accessKeyId,r.secretAccessKey);
  var name = typeof(r.name)=='undefined' ? Session.getActiveUser().getEmail() : r.name;
  var session = sts.getFederationSession(name, r.durationSeconds||43200, r.policy);
  var signin_url = "https://signin.aws.amazon.com/federation";
  var signinToken = Utilities.jsonParse(UrlFetchApp.fetch(signin_url + "?Action=getSigninToken&SessionType=json&Session=" + encodeURIComponent(Utilities.jsonStringify(session))).getContentText()).SigninToken;
  return {
    /** ログイン用のURLを作ります。
     * @param url AWSのコンソールのログインURLです。未指定の場合は https://console.aws.amazon.com/console/home
     * @param return_url 認証切れの場合などにリダイレクトされるURLです。未指定の場合はこのスクリプトのURL
     */
    create:function(url,return_url){
      return signin_url + "?"+[
        "Action=login",
        "SigninToken="+encodeURIComponent(signinToken),
        "Issuer=" + encodeURIComponent(return_url||ScriptApp.getService().getUrl()),
        "Destination=" + encodeURIComponent(url||"https://console.aws.amazon.com/console/home")
      ].join("&");
    }
  };
}
// for example
var AwsFederatedLogin={
  FederatedLoginUrlCreator:FederatedLoginUrlCreator
}
