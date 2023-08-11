/*
 * author: ovsexia
 * version: 1.3.2
 * name: xtiper
 * describe: 弹层解决方案
 */


/*
 * 短消息提示
 * tip:   | 消息内容
 * times: | 停顿秒数 [可选] [默认:1]
 */
function xtiper_msg(tip,times)
{
  //让按钮失去焦点
  loseblur();

  if(!tip){
    return false;
  }

  var rand = Math.random().toString().split(".")[1];
  var mainid = "xtiper_"+rand;

  if(!times){
    times = 1;
  }

  //创建div
  var body = document.body;
  var div = document.createElement("div");
  div.setAttribute("id", mainid);
  div.setAttribute("class", "xtiper_msg");

  //html
  html = '<p>'+tip+'</p>';
  div.innerHTML = html;
  body.appendChild(div);
  xtiper = document.getElementById(mainid);

  !function(window,xdivid){
    xwidth = xdivid.offsetWidth;
    xwidth = xwidth / 2;
    xdivid.style.marginLeft = "-"+xwidth+"px";

    setTimeout(function(){
      xdivid.classList.add("on");
    },1);

    setTimeout(function(){
      xdivid.classList.remove("on");
      setTimeout(function(){
        xdivid.parentNode.removeChild(xdivid);
      },201);
    },times*1000);
  }(window,xtiper);
}


/*
 * 气泡提示
 * tip:            | 消息内容
 * divid:          | 关联元素
 * config.bgcolor: | 背景颜色 [可选] [默认:#000000]
 * config.color:   | 字体颜色 [可选] [默认:#ffffff] [说明:当背景色为白色时，字体颜色自动变成黑色，也可以手动设置]
 * config.times:   | 停顿秒数 [可选] [默认:2]
 * config.pos:     | 方向 [可选] [默认:r] [选择:u(上)|d(下)|l(左)|r(右)]
 */
function xtiper_tips(tip,divid,config)
{
  //让按钮失去焦点
  loseblur();

  if(!tip || !divid){
    return false;
  }
  if(config==null){
    config = new Object();
  }
  bgcolor = config.bgcolor ? config.bgcolor : "#000000";
  if(config.color){
    color = config.color;
  }else{
    reg = /rgba\((255\,){3}[0-9.]+/;
    rgba = reg.test(bgcolor);
    if(bgcolor=="#fff" || bgcolor=="#ffffff" || bgcolor=="white" || bgcolor=="rgb(255,255,255)" || bgcolor=="rgba(255,255,255)" || rgba===true){
      color = "#333333";
    }else{
      color = "#ffffff";
    }
  }
  times = config.times ? config.times : 2;
  pos = config.pos ? config.pos : "r";
  pos = pos.toLowerCase();
  
  divid = document.getElementById(divid) || divid;
  dataTips = divid.dataset.xtips;
  if(dataTips){
    return false; //只能有一个实例
  }else{
    divid.dataset.xtips = 1;
  }
  var rand = Math.random().toString().split(".")[1];
  var mainid = "xtiper_"+rand;

  //定位
  S = document.documentElement.scrollTop || document.body.scrollTop;
  C = divid.getBoundingClientRect()
  W = divid.offsetWidth;
  H = divid.offsetHeight;
  dtop = S + C.top;
  dleft = C.left;
  B = 10;

  //创建div
  var body = document.body;
  var div = document.createElement("div");
  div.setAttribute("id", mainid);
  div.setAttribute("class", "xtiper_tips " + pos);

  //html
  if(bgcolor){
    if(color){
      html = '<p style="background-color:'+bgcolor+'; color:'+color+';">'+tip+'</p>';
    }else{
      html = '<p style="background-color:'+bgcolor+'">'+tip+'</p>';
    }
  }else{
    html = '<p>'+tip+'</p>';
  }
  if(pos=="l" || pos=="r"){
    emstyle = 'background-color:'+bgcolor+';'
  }else{
    emstyle = 'background-color:'+bgcolor+';'
  }
  html += '<em style="'+emstyle+'"></em>';
  div.innerHTML = html;
  body.appendChild(div);
  xtiper = document.getElementById(mainid);
  
  !function(window,xdivid,divid){
    if(pos=="l"){
      selfWidth = xdivid.offsetWidth;
      dleft = dleft - selfWidth - B;
    }else if(pos=="r"){
      dleft = dleft + W + B;
    }else if(pos=="t"){
      selfHeight = xdivid.offsetHeight;
      dtop = dtop - selfHeight - B;
    }else if(pos=="b"){
      dtop = dtop + H + B;
    }
    xdivid.style.left = dleft + "px";
    xdivid.style.top = dtop + "px";

    setTimeout(function(){
      xdivid.classList.add("on");
    },1);

    setTimeout(function(){
      xdivid.classList.remove("on");
      divid.dataset.xtips = "";
      setTimeout(function(){
        xdivid.parentNode.removeChild(xdivid);
      },201);
    },times*1000);
  }(window,xtiper,divid);
}


/*
 * 弹框提示
 * tip:   | 消息内容 [可选] [默认:空]
 * icon:  | 图标 [可选] [默认:空] [选择:success(成功,简写:s)|error(失败,简写:e)|warning(警告,简写:w)|ask(询问,简写:a)|laugh(微笑,简写:l)]
 * times: | 自动关闭停顿秒数 [可选] [默认:3] [说明:当为0时，不自动关闭]
 */
function xtiper_alert(tip,icon,times)
{
  tip = tip ? tip : "";
  icon = icon ? icon : "warning";
  times = times!=null ? times : 2;

  xtiper_win({
    type: "alert",
    tip: tip,
    icon: icon,
    times: times,
    title: "提示",
    btn: ["确定"],
    fun0: function(){
      return false;
    },
  });
}


/*
 * 选择提示
 * tip:   | 消息内容 [可选] [默认:空]
 * myfun: | 按钮0的回调函数 [可选] [默认:空]
 * icon:  | 图标 [可选] [默认:空] [选择:success(成功,简写:s)|error(失败,简写:e)|warning(警告,简写:w)|ask(询问,简写:a)|laugh(微笑,简写:l)]
 */
function xtiper_confirm(tip,myfun,icon)
{
  tip = tip ? tip : "";
  myfun = myfun!=null ? myfun : null;
  icon = icon ? icon : "warning";

  xtiper_win({
    type: "confirm",
    tip: tip,
    icon: icon,
    title: "警告",
    btn: ["确定","取消"],
    fun0: myfun,
  });
}


/*
 * 弹层
 * config.type:  | 弹窗类型 [选择:alert|confirm]
 * config.tip:   | 消息内容 [可选] [默认:空]
 * config.icon:  | 图标 [可选] [默认:空] [选择:success(成功,简写:s)|error(失败,简写:e)|warning(警告,简写:w)|ask(询问,简写:a)|laugh(微笑,简写:l)]
 * config.times: | alert 类型停留时间 [可选] [默认:2]
 * config.title: | 标题 [可选] [默认:提示]
 * config.shade: | 是否开启点击空白处关闭 [可选] [默认:true(开启)]
 * config.lock:  | 是否锁定滚动条 [可选] [默认:false(不锁定)]
 * config.btn:   | 按钮 [可选] [默认:确定,取消] [限制:最多只能3个按钮]
 * config.fun0:  | 按钮0的回调函数 [可选] [默认:空]
 * config.fun1:  | 按钮1的回调函数 [可选] [默认:空]
 * config.fun2:  | 按钮2的回调函数 [可选] [默认:空]
 */
function xtiper_win(config)
{
  if(config.type==null || config.type==""){
    return false;
  }
  type = config.type;
  tip = config.tip ? config.tip : "";
  icon = config.icon ? config.icon : "";
  icon = iconfix(icon);
  times = config.times!=null ? config.times : 2;
  title = config.title ? config.title : "提示";
  shade = config.shade!=null ? config.shade : true;
  lock = config.lock ? config.lock : false;
  if(type=="alert"){
    btn = config.btn!=null ? config.btn : ["确定"];
    fun0 = config.fun0!=null ? config.fun0 : function(){return false;}
    fun1 = config.fun1!=null ? config.fun1 : null;
    fun2 = config.fun2!=null ? config.fun2 : null;
  }else if(type=="confirm"){
    btn = config.btn!=null ? config.btn : ["确定","取消"];
    fun0 = config.fun0!=null ? config.fun0 : function(){return false;}
    fun1 = config.fun1!=null ? config.fun1 : null;
    fun2 = config.fun2!=null ? config.fun2 : null;
  }
  
  btnclass = new Array();
  btnclass[0] = fun0!=null ? ' class="active"' : '';
  btnclass[1] = fun1!=null ? ' class="active"' : '';
  btnclass[2] = fun2!=null ? ' class="active"' : '';

  //让按钮失去焦点
  loseblur();

  var rand = Math.random().toString().split(".")[1];
  var mainid = "xtiper_"+rand;
  xtiper = document.getElementById(mainid);

  //创建div
  var body = document.body;
  var div = document.createElement("div");
  div.setAttribute("id", mainid);
  div.setAttribute("class", "xtiper_win");

  if(type=="alert"){
    if(times==0){
      flag = false;
    }else{
      times++;
      flag = true;
    }
  }

  //html
  html = '<div class="xtiper_bg"></div><div class="xtiper_main">';
  html += '<div class="xtiper_tit">'+title+'<div class="xtiper_close"></div></div>';
  html += '<div class="xtiper_pad"><div class="xtiper_pr"><div class="xtiper_tip"><i class="xtiper_icon xtiper_icon_'+icon+'"></i><div class="xtiper_con"><div class="xtiper_conin">'+tip;
  if(type=="alert" && flag===true){
    html += '(<span class="xtiper_times">'+times+'</span>)';
  }
  html += '</div></div></div></div>';
  html += '<div class="xtiper_btn">';
  
  for(i=0;i<3;i++){
    if(btn[i]){
      html += '<button'+btnclass[i]+'>'+btn[i]+'</button>';
    }
  }

  html += '</div></div></div>';
  div.innerHTML = html;
  body.appendChild(div);
  xtiper = document.getElementById(mainid);
  xtiper_main = xtiper.getElementsByClassName("xtiper_main")[0];
  xwidth = (window.innerWidth - xtiper_main.offsetWidth) / 2;
  xheight = (window.innerHeight - xtiper_main.offsetHeight) / 2;
  xtiper_main.style.left = xwidth+'px';
  xtiper_main.style.top = xheight+'px';

  setTimeout(function(){
    xtiper.classList.add("on");
  },1);

  var timer;

  //锁定滚动条
  if(lock===true){
    document.documentElement.style.overflowY = 'hidden';
  }

  button = xtiper.getElementsByTagName("button");
  button[0].addEventListener('click', function() {
    xtiper_close(xtiper,timer);
    if(fun0){
      fun0();
    }
  });
  if(button[1]){
    button[1].addEventListener('click', function() {
      xtiper_close(xtiper,timer);
      if(fun1){
        fun1();
      }
    });
  }  
  if(button[2]){
    button[2].addEventListener('click', function() {
      xtiper_close(xtiper,timer);
      if(fun2){
        fun2();
      }
    });
  }
  close = xtiper.getElementsByClassName("xtiper_close")[0];
  close.addEventListener('click', function() {
    xtiper_close(xtiper,timer);
  });
  
  if(shade){
    bg = xtiper.getElementsByClassName("xtiper_bg")[0];
    bg.addEventListener('click', function() {
      xtiper_close(xtiper,timer);
    });
  }

  //倒计时
  if(type=="alert" && flag===true){
    var i = times-1;
    var fn = function() {
      xtiper_times = xtiper.getElementsByClassName("xtiper_times")[0];
      xtiper_times.innerHTML = i;
      if(i<=0){
        xtiper_close(xtiper,timer);
        clearInterval(timer);
      } 
      i--;
    };
    timer = setInterval(fn, 1000);
    fn();
  }

  //键盘事件
  document.onkeydown = function(event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if(e && e.keyCode == 27){ //按 Esc
      xtiper_close(xtiper,timer);
    }
    //多按钮取消回车事件
    if(fun1 || fun2){
      return false;
    }
    if(e && e.keyCode == 13) { //按 Enter
      xtiper_close(xtiper,timer);
      if(fun0){
        fun0();
      }
      return false;
    }
  };

  
  //鼠标拖动
  xdrag(xtiper,true);
}


/*
 * 加载中
 * tip:   | 消息内容 [可选] [默认:空]
 * times: | 自动关闭 [可选] [默认:不自动关闭]
 * lock:  | 是否锁定滚动条 [可选] [默认:false(不锁定)]
 */
function xtiper_load(tip,times,lock)
{
  tip = tip!=null ? tip : null;
  times = times!=null ? times : 0;
  lock = lock ? lock : false;

  //让按钮失去焦点
  loseblur();

  var rand = Math.random().toString().split(".")[1];
  var mainid = "xtiper_"+rand;
  xtiper = document.getElementById(mainid);

  //创建div
  var body = document.body;
  var div = document.createElement("div");
  div.setAttribute("id", mainid);
  div.setAttribute("class", "xtiper_load");

  html = '<div class="xtiper_bg xtiper_bg_white"></div><div class="xtiper_loadin"><div class="xtiper_icon xtiper_icon_load"></div>';
  if(tip){
    html += '<span>'+tip+'</span>';
  }
  html += '</div>';
  div.innerHTML = html;
  body.appendChild(div);
  xtiper = document.getElementById(mainid);

  setTimeout(function(){
    xtiper.classList.add("on");
  },1);

  //锁定滚动条
  if(lock===true){
    document.documentElement.style.overflowY = 'hidden';
  }

  if(times && times>0){
    setTimeout(function(){
      xtiper.classList.remove("on");
      setTimeout(function(){
        xtiper_close(xtiper);
      },201);
    },times*1000);
  }

  //键盘事件
  document.onkeydown = function(event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if(e && e.keyCode == 27){ //按 Esc
      return false;
    }
    if(e && e.keyCode == 13) { //按 Enter
      return false;
    }
  };

  return xtiper;
}


/*
 * 打开url页面
 * config.url:    | url链接
 * config.title:  | 标题 [可选] [默认:无]
 * config.width:  | 宽度 [可选] [默认:800px]
 * config.height: | 高度 [可选] [默认:600px]
 * config.shade:  | 是否开启点击空白处关闭 [可选] [默认:true(开启)]
 * config.end:    | 关闭后的回调函数 [可选] [默认:空]
 * config.max:    | 是否开启最大化按钮 [可选] [默认:false(不开启)]
 * config.lock:   | 是否锁定滚动条 [可选] [默认:false(不锁定)]
 */
function xtiper_open(config)
{
  //让按钮失去焦点
  loseblur();

  if(config.url==null || config.url==''){
    return false;
  }
  url = config.url;
  title = config.title ? config.title : null;
  width = config.width ? config.width : '800px';
  height = config.height ? config.height : '600px';
  shade = config.shade!=null ? config.shade : true;
  end = config.end!=null ? config.end : null;
  max = config.max ? config.max : false;
  lock = config.lock ? config.lock : false;

  width = getsize(width);
  height = getsize(height);
  if(title){
    height2 = height[0] - 40;
  }else{
    height2 = height[0];
  }
  

  var rand = Math.random().toString().split(".")[1];
  var mainid = "xtiper_"+rand;
  xtiper = document.getElementById(mainid);

  //创建div
  var body = document.body;
  var div = document.createElement("div");
  div.setAttribute("id", mainid);
  div.setAttribute("class", "xtiper_win");

  html = '<div class="xtiper_bg"></div><div class="xtiper_main" style="width:'+width[0]+""+width[1]+'; height:'+height[0]+""+height[1]+';">';
  if(title){
    html += '<div class="xtiper_tit">'+title+'<div class="xtiper_close"></div>';
    if(max===true){
      html += '<div class="xtiper_max"></div>';
    }
    html += '</div>';
  }else{
    html += '<div class="xtiper_close xtiper_close2"></div>';
  }
  html += '<div class="xtiper_iframe" style="height:'+height2+'px;"><div class="zw"></div><iframe id="'+rand+'" scrolling="auto" allowtransparency="true" frameborder="0" src="'+url+'" style="width:100%; height:100%;"></iframe></div>';
  html += '</div>';
  //html += '<script>var indexid='+rand+'</script>';
  div.innerHTML = html;
  body.appendChild(div);
  xtiper = document.getElementById(mainid);
  xtiper_main = xtiper.getElementsByClassName("xtiper_main")[0];
  xwidth = (window.innerWidth - xtiper_main.offsetWidth) / 2;
  xheight = (window.innerHeight - xtiper_main.offsetHeight) / 2;
  xtiper_main.style.left = xwidth+'px';
  xtiper_main.style.top = xheight+'px';

  setTimeout(function(){
    xtiper.classList.add("on");
  },1);

  //锁定滚动条
  if(lock===true){
    document.documentElement.style.overflowY = 'hidden';
  }

  //鼠标拖动
  xdrag(xtiper,true);

  close = xtiper.getElementsByClassName("xtiper_close")[0];
  close.addEventListener('click', function() {
    xtiper_close(xtiper);
    if(end){
      end();
    }
  });

  if(shade){
    bg = xtiper.getElementsByClassName("xtiper_bg")[0];
    bg.addEventListener('click', function() {
      xtiper_close(xtiper);
      if(end){
        end();
      }
    });
  }

  if(max===true){
    maxbtn = xtiper.getElementsByClassName("xtiper_max")[0];
    maxbtn.addEventListener('click', function() {
      xtiper_max(xtiper);
    });
  }
}


/*
 * 打开内容页面
 * config.divid:  | 元素节点 [限制:只能以#或.开头，即选择器只能是 id 或 class(取第一个)]
 * config.ifhas:  | 内容类型 [可选] [默认:true] [选择:true(元素outerHTML)|false(元素innerHTML的注释内容)] [说明:为true时会过滤id属性防止冲突]
 * config.code:   | html源码 [限制:当config.divid参数不存在时才会生效]
 * config.title:  | 标题 [可选] [默认:无]
 * config.width:  | 宽度 [可选] [默认:800px]
 * config.height: | 高度 [可选] [默认:600px]
 * config.shade:  | 是否开启点击空白处关闭 [可选] [默认:true(开启)]
 * config.max:    | 是否开启最大化按钮 [可选] [默认:false(不开启)]
 * config.lock:   | 是否锁定滚动条 [可选] [默认:false(不锁定)]
 */
function xtiper_content(config)
{
  //让按钮失去焦点
  loseblur();

  if(config.divid==null || config.divid==''){
    if(config.code==null || config.code==''){
      return false;
    }
  }
  divid = config.divid;
  ifhas = config.ifhas!=null ? config.ifhas : true;
  code = config.code;
  title = config.title ? config.title : null;
  width = config.width ? config.width : '800px';
  height = config.height ? config.height : '600px';
  shade = config.shade!=null ? config.shade : true;
  end = config.end!=null ? config.end : null;
  max = config.max ? config.max : false;
  lock = config.lock ? config.lock : false;

  width = getsize(width);
  height = getsize(height);

  //如果在页面中已存在
  if(divid){
    fir = divid.substr(0,1);
    if(fir=="#"){
      divid = divid.substr(1,);
      divel = document.getElementById(divid);
    }else if(fir=="."){
      divid = divid.substr(1,);
      divel = document.getElementsByClassName(divid)[0];
    }else{
      return false;
    }

    if(ifhas===true){
      content = divel.outerHTML;
      //移除id
      reg = /\s+(id\=["'][A-z0-9_-]*["'])/g;
      content = content.replace(reg,'');
    }
    //以注释形式显示
    else{
      content = divel.innerHTML;
      reg = /\<\!\-{2}[\s\n]*([\S\s]*)[\s\n]*\-{2}\>/;
      match = content.match(reg);
      if(!match || !match[1]){
        return false;
      }
      content = match[1];
    }
  }else{
    if(code){
      content = code;
    }
  }

  var rand = Math.random().toString().split(".")[1];
  var mainid = "xtiper_"+rand;
  xtiper = document.getElementById(mainid);

  //创建div
  var body = document.body;
  var div = document.createElement("div");
  div.setAttribute("id", mainid);
  div.setAttribute("class", "xtiper_win");

  html = '<div class="xtiper_bg"></div><div class="xtiper_main" style="width:'+width[0]+""+width[1]+'; height:'+height[0]+""+height[1]+';">';
  if(title){
    html += '<div class="xtiper_tit">'+title+'<div class="xtiper_close"></div>';
    if(max===true){
      html += '<div class="xtiper_max"></div>';
    }
    html += '</div>';
  }else{
    html += '<div class="xtiper_close xtiper_close2"></div>';
  }
  html += '<div class="xtiper_content">'+content+'</div>';
  html += '</div>';
  div.innerHTML = html;
  body.appendChild(div);
  xtiper = document.getElementById(mainid);
  xtiper_main = xtiper.getElementsByClassName("xtiper_main")[0];
  xwidth = (window.innerWidth - xtiper_main.offsetWidth) / 2;
  xheight = (window.innerHeight - xtiper_main.offsetHeight) / 2;
  xtiper_main.style.left = xwidth+'px';
  xtiper_main.style.top = xheight+'px';

  setTimeout(function(){
    xtiper.classList.add("on");
  },1);

  //锁定滚动条
  if(lock===true){
    document.documentElement.style.overflowY = 'hidden';
  }

  //鼠标拖动
  xdrag(xtiper,true);

  close = xtiper.getElementsByClassName("xtiper_close")[0];
  close.addEventListener('click', function() {
    xtiper_close(xtiper);
  });
  
  if(shade){
    bg = xtiper.getElementsByClassName("xtiper_bg")[0];
    bg.addEventListener('click', function() {
      xtiper_close(xtiper);
    });
  }

  if(max===true){
    maxbtn = xtiper.getElementsByClassName("xtiper_max")[0];
    maxbtn.addEventListener('click', function() {
      xtiper_max(xtiper);
    });
  }
}


/*
 * 关闭弹层
 * box:   | 元素节点 [例:document.getElementById("xxx")]
 * timer: | 停止定时器 [可选] [默认:空]
 */
function xtiper_close(box,timer)
{
  if(timer){
    clearInterval(timer);
  }

  if(box && box.hasChildNodes()){
    box.classList.remove("on");
    setTimeout(function(){
      box.parentNode.removeChild(box);
    },201);
  }

  document.onkeydown = function(event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    return e;
  };

  document.documentElement.style.overflowY = ''; 
}


/*
 * 让按钮失去焦点
 */
function loseblur()
{
  button = document.getElementsByTagName("button");
  if(button.length>0){
    for(i=0;i<button.length;i++)
    {
      button[i].blur();
    }
  }
  input = document.getElementsByTagName("input");
  if(input.length>0){
    for(i=0;i<input.length;i++)
    {
      input[i].blur();
    }
  }
}


/*
 * 单位处理
 * size: | [例:100px或100%]
 */
function getsize(size)
{
  reg = /([0-9]+)(px|\%)/;
  size_arr = size.match(reg);
  arr = new Array();
  arr[0] = Number(size_arr[1]);
  arr[1] = size_arr[2];
  return arr;
}


/*
 * 补齐图标名称
 */
function iconfix(icon)
{
  if(icon=="s" || icon=="success"){
    return "success";
  }else if(icon=="e" || icon=="error"){
    return "error";
  }else if(icon=="w" || icon=="warning"){
    return "warning";
  }else if(icon=="a" || icon=="ask"){
    return "ask";
  }else if(icon=="l" || icon=="laugh"){
    return "laugh";
  }else{
    return "warning";
  }
}


/*
 * 鼠标拖动
 */
function xdrag(xtiper,open)
{
  var drag = xtiper.getElementsByClassName("xtiper_tit")[0];
  if(!drag){
    return false;
  }
  var drag_main = xtiper.getElementsByClassName("xtiper_main")[0];
  //允许3/4的区域拖动到页面外
  var overX = drag_main.offsetWidth/4*3;
  var overY = drag_main.offsetHeight/4*3;
  if(open===true){
    drag.onmousedown = function(event){
      xtiper_iframe = xtiper.getElementsByClassName("xtiper_iframe")[0];
      if(xtiper_iframe){
        xtiper_iframe.classList.add("on");
      }
      var event = event || window.event;
      var diffX = event.clientX - drag_main.offsetLeft;
      var diffY = event.clientY - drag_main.offsetTop;
      if(typeof drag_main.setCapture !== 'undefined'){
        drag_main.setCapture();
      }
      document.onmousemove = function(event){
        var event = event || window.event;
        var moveX = event.clientX - diffX;
        var moveY = event.clientY - diffY;
        if(moveX < - overX){
          moveX = - overX;
        }else if(moveX > document.body.offsetWidth - drag_main.offsetWidth + overX){
          moveX = document.body.offsetWidth - drag_main.offsetWidth + overX;
        }
        if(moveY < 0){
          moveY = 0
        }else if(moveY > window.innerHeight - drag_main.offsetHeight + overY){
          moveY =  window.innerHeight - drag_main.offsetHeight + overY;
        }
        drag_main.style.left = moveX + 'px';
        drag_main.style.top = moveY + 'px'
      }
      document.onmouseup = function(event){
        if(xtiper_iframe){
          xtiper_iframe.classList.remove("on");
        }
        this.onmousemove = null;
        this.onmouseup = null;
        //修复低版本ie bug
        if(typeof drag_main.releaseCapture!='undefined'){
          drag_main.releaseCapture();
        }
      }
    }
  }else{
    drag.onmousedown = function(event){
      return false;
      document.onmousemove = function(event){
        return false;
      }
      document.onmouseup = function(event){
        return false;
      }
    }
  }
}


/*
 * 最大化
 */
function xtiper_max(xtiper)
{
  ifmax = xtiper.dataset.xmax;
  xtiper_tit = xtiper.getElementsByClassName("xtiper_tit")[0];
  maxbtn = xtiper.getElementsByClassName("xtiper_max")[0];
  if(ifmax==1){ //还原
    xtiper_main.style.width = xtiper.dataset.width;
    xtiper_main.style.height = xtiper.dataset.height;
    data_width = xtiper_main.offsetWidth;
    data_height = xtiper_main.offsetHeight;
    xwidth = (window.innerWidth - data_width) / 2;
    xheight = (window.innerHeight - data_height) / 2;
    xtiper_main.style.left = xwidth+'px';
    xtiper_main.style.top = xheight+'px';
    xtiper_tit.style.cursor = 'move';
    xtiper.dataset.xmax = "";
    xtiper.dataset.width = "";
    xtiper.dataset.height = "";
    maxbtn.classList.remove("on");
    xdrag(xtiper,true);
  }else{ //最大化
    xtiper.dataset.xmax = 1;
    xtiper.dataset.width = xtiper_main.style.width;
    xtiper.dataset.height = xtiper_main.style.height;
    xtiper_main.style.width = '100%';
    xtiper_main.style.height = '100%';
    xtiper_main.style.top = '0';
    xtiper_main.style.left = '0';
    xtiper_tit.style.cursor = 'default';
    maxbtn.classList.add("on");
    xdrag(xtiper,false);
  }
}


!function(window){
  xtip = new Object();

  xtip.msg = function(tip,times){
    xtiper_msg(tip,times);
  };
  xtip.tips = function(tip,divid,config){
    xtiper_tips(tip,divid,config);
  };
  xtip.alert = function(tip,icon,times){
    xtiper_alert(tip,icon,times);
  }
  xtip.confirm = function(tip,myfun,icon){
    xtiper_confirm(tip,myfun,icon);
  }
  xtip.win = function(config){
    xtiper_win(config);
  }
  xtip.load = function(tip,times,lock){
    xtiper_load(tip,times,lock);
  }
  xtip.open = function(config){
    xtiper_open(config);
  }
  xtip.content = function(config){
    xtiper_content(config);
  }
  xtip.close = function(box){
    xtiper_close(box);
  }
  return xtip;
}(window);