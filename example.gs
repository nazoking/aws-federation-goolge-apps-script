/* =====================================
 使い方 
　AWSのIAMで、IAM Userを作成(Roleではない)
 　なお、そのユーザには最低限 sts:GetFederationToken の権限が必要
     {"Version": "2012-10-17","Statement": [{"Effect": "Allow","Action": "sts:GetFederationToken","Resource":"*"}]}
   　( この例ではすべてのユーザの権限を委譲出来る。細かく指定する場合は下記参照
         http://docs.aws.amazon.com/STS/latest/UsingSTS/STSPermission.html )
 　そのユーザのAccess Credentials を作成する。

 Google Drive で新しい「スクリプト」を作成する。
 
  「ファイル」→「プロジェクトのプロパティー」「プロジェクトのプロパティー」で、
  　　AwsAccessKeyId というプロパティーに Access Key ID: の値を
    　AwsAccessSecret というプロパティーに Secret Access Key: の値を
     それぞれ追加して保存する
  
  error.html, success.html を作成
    error.html => <? output.appendUntrusted( errormessage ) ?>
    success.htm => <a href="<? output.appendUntrusted(creator.create("https://console.aws.amazon.com/console/home")) ?>">ログイン AWS</a>
  doGet() を下記のように実装
  
  「ファイル」→「版を管理」→新しいバージョンとして保存する（ここで保存したときの状態が公開される）
 
  「公開」→「WEBアプリケーションとして公開」
  　　次のユーザーとしてアプリケーションを実行　＝　自分
    　アプリケーションにアクセスできるユーザー　＝　全員 （アクセスしてほしいい人だけに絞ってもよい）
     「導入」
  することで、ほかの人に使ってもらえるようになる。
  
  
  「その操作を実行するには承認が必要です。」と出た場合
  　→　「実行」→「doGet」を実行する→「承認が必要です」と出るので承認する
   　　エラーが出なければ再度アクセスすると出なくなっているはず
     　sts.amazon.com/? のようなエラーが出た場合、
      　　・委譲APIにアクセスする権限がない(sts:GetFederationToken)
        　・AwsAccessKeyId / AwsAccessSecret が間違っている、設定されていない

　このスクリプト自体の共有範囲は、次の事に注意して設定する（自分しかメンテしないなら未公開でもよい）
 　　・このスクリプトの編集権限を持っている人
   　　　＝プロジェクトのプロパティーにアクセス出来る＝Secret Access Keyを見える
     　　＝スクリプトを適当に書き換えて認証部分をどうにでもできる
     ・このスクリプトの閲覧権限を持っている人
     　　＝どのような仕組みで誰がアクセスできるのかが理解出来るようになる
 ======================================= */
/**
 * Webアプリケーションの入り口
 * ここでは皆に同じ権限を与えているが、メールアドレスや所属グループを見てポリシーを変更したりできる。
 * ここで誰かがログインするとメールを飛ばしたりスプレッドシートやデータベースにログを保存するようにしてもよい。
 */
function doGet(){
  var user = Session.getActiveUser();
  // 権限チェック。ここではGoogleAppsスクリプトの機能を使って、特定のグループに所属しているかどうかをチェックしている。
  const GROUP="xxxxx@team-lab.com";
  if(!GroupsApp.getGroupByEmail(GROUP).hasUser(user)){
    var template = HtmlService.createTemplateFromFile("error");
    template.error = GROUP+" のユーザしかログイン出来ません";
    return template.evaluate();
  }else{
    var creator = AwsFederatedLogin.FederatedLoginUrlCreator({
      // スクリプトをこのまま利用するときはスクリプトのプロパティーとして AwsAccessKeyId AwsAccessSecret を設定してください。
      secretAccessKey:ScriptProperties.getProperty("AwsAccessSecret"),
      accessKeyId:ScriptProperties.getProperty("AwsAccessKeyId"),
      // ログインユーザの名前(ツールバーに表示されるなど)
      name: user.getEmail(),
      //この権限の有効時間(秒) 
      durationSeconds:43200,
      // ポリシー（権限）。ここでどれだけの権限を設定しても、委譲元のユーザが持っている以上の権限は与えられない
      // もちろん IAM User へのフルアクセス権限などがあったりすると委譲元のユーザの権限を書き換えて云々出来るので注意
      policy:{
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": "*",
            "Resource": "*"
          }
        ]
      }
    });
    var template = HtmlService.createTemplateFromFile("success");
    template.creator = creator;
    return template.evaluate();
  }
}
