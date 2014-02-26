/**
 * sts(アクセスキー,シークレットキー)
 * {
 *   getFederationToken(name,durationSeconds,policy)
 *   getFederationSession(name,durationSeconds,policy)
 * }
 */
function Sts(accessKey,secretAccessKey){
  var aws=new Aws(accessKey,secretAccessKey,'sts.amazonaws.com');
  return {
    /**
     * http://docs.aws.amazon.com/STS/latest/APIReference/API_GetSessionToken.html
     * @param name            ログインユーザの名前
     * @param durationSeconds この権限の有効時間(秒) 900秒(15分)から 129600秒(36時間)
     * @param policy          ポリシー
     */
    getFederationToken:function getFederationToken(name,durationSeconds,policy){
      return aws.httpsGet({
        'Version':'2011-06-15',
        'Action':'GetFederationToken',
        'Name':name,
        'Timestamp': aws.getTimestamp(),
        'Policy': Utilities.jsonStringify(policy),
        'DurationSeconds':durationSeconds
      });
    },
    /**
     * フェデレーションに必要なセッションオブジェクトを得る
     * @param name            ログインユーザの名前
     * @param durationSeconds この権限の有効時間(秒) 900秒(15分)から 129600秒(36時間)
     * @param policy          ポリシー
     */
    getFederationSession:function getFederationSession(name,durationSeconds,policy){
      var xml = XmlService.parse(this.getFederationToken(name,durationSeconds,policy));
      var sts = XmlService.getNamespace("https://sts.amazonaws.com/doc/2011-06-15/");
      var credentials = xml.getRootElement().getChild("GetFederationTokenResult",sts).getChild("Credentials",sts);
      return {
        "sessionId":credentials.getChildText("AccessKeyId",sts),
        "sessionToken":credentials.getChildText("SessionToken",sts),
        "sessionKey":credentials.getChildText("SecretAccessKey",sts)
      };
    }
  };
}
