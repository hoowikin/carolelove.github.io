/*
 * author: ovsexia
 * version: 1.1.0
 * name: findpair
 * describe: js小游戏神经衰弱
 */

function Findpair(divid,output,config){
  if(!divid){
    return false;
  }

  //默认参数
  var defaults = {
    hard: 1,  //难度 1:4x4  2:5x5  3:6x6  4:8x8
  };
  
  //初始化
  if(config==null){
    config = new Object();
  }
  var fbox = new Object();
  fbox = (function(fbox){
    fbox.hard = config.hard ? config.hard : defaults.hard;
    fbox.fboxid = document.getElementById(divid);
    return fbox;
  })(fbox);

  //游戏设置
  fbox.set = function(obj){
    var _this = this;
    _this.hard = obj.hard;
  };

  //开始新游戏
  fbox.newgame = function(){
    var _this = this;
    var hard = _this.hard;
    var fboxid = _this.fboxid;
    _this.success = 0;
    _this.step = 0;
    _this.times1 = 0;
    _this.times2 = 0;
    _this.timeflag = false;
    var row;
    var data1 = null; //存储第1个格子id
    var data2 = null; //存储第2个格子id
    if(hard==1){
      row = 4;
      pairs = 4;
    }else if(hard==2){
      row = 6;
      pairs = 9;
    }else if(hard==3){
      row = 8;
      pairs = 10;
    }else if(hard==4){
      row = 10;
      pairs = 10;
    }else if(hard=='debug'){
      row = 2;
      pairs = 2;
    }

    fboxid.className = "fbox hard_"+hard;
    fboxid.innerHTML = '';

    let fid = 1;
    for(let i=0;i<row;i++){
      //创建div
      let ul = document.createElement("ul");
      let html = '';
      for(let y=0;y<row;y++){
        html += '<li data-fid="'+fid+'"><div><p></p></div></li>';
        fid++;
      }
      ul.innerHTML = html;
      fboxid.appendChild(ul);
    }

    //随机素材
    icons = new Array();
    for(i=0;i<pairs;i++){
      rander = randomNum(1,20,icons);
      icons.push(rander);
    }

    //分配随机数组
    total = row*row/2;
    averarr = average(total,pairs);

    //格子数列
    liarr = new Array();
    for(let i=1;i<=row*row;i++){
      liarr.push(i);
    }

    //配对格子
    rowarr = new Array();
    for(let i=0;i<icons.length;i++){
      for(let y=0;y<averarr[i];y++){
        //12,9,2 解释：第12格和第9格配对，素材id为2
        let a = arrforone(liarr);
        liarr = delarr(liarr,a);
        let b = arrforone(liarr);
        liarr = delarr(liarr,b);
        let c = a+','+b+','+icons[i];
        rowarr.push(c);
      }
    }
    //分配素材
    for(let i=0;i<rowarr.length;i++) {
      let sarr = rowarr[i].split(',');
      let td1 = fboxid.querySelector('[data-fid="'+sarr[0]+'"]').getElementsByTagName('p')[0];
      let td2 = fboxid.querySelector('[data-fid="'+sarr[1]+'"]').getElementsByTagName('p')[0];
      td1.style.backgroundImage = td2.style.backgroundImage = 'url("images/'+sarr[2]+'.png")';
    }

    //添加点击事件
    var tout;
    li = fboxid.getElementsByTagName('li');
    outputdiv = document.getElementById(output);
    for(let i=0;i<li.length;i++){
      li[i].addEventListener('click', function() {
        if(_this.timeflag === false){
          var day = new Date();
          _this.times1 = day.getTime();
          _this.timeflag = true;
          if(outputdiv){
            let outhtml = '<div class="outdiv outstep"><span class="outstep_star">游戏开始</span><span class="outdiv_span outstep_span"></span></div>';
            outhtml += '<div class="outdiv outpro">游戏进度：<span class="outdiv_span outpro_span">0/'+total+'</span></div>';
            outputdiv.innerHTML = outhtml;
          }
        }
        //第三次点击
        if(tout && tout!=null && tout!=""){
          clearTimeout(tout);
          fboxid.querySelector('[data-fid="'+data1+'"]').classList.remove('on');
          fboxid.querySelector('[data-fid="'+data2+'"]').classList.remove('on');
          data1 = data2 = null;
          tout = null;
        }
        //已打开的格子不能操作
        if(this.classList.contains('on')==true){
          return false;
        }
        this.classList.add('on');
        let lid = Number(li[i].dataset.fid);
        if(data1==null && data2==null){
          data1 = lid;
        }else{
          data2 = lid;
          bg1 = fboxid.querySelector('[data-fid="'+data1+'"]').getElementsByTagName('p')[0].style.backgroundImage;
          bg2 = fboxid.querySelector('[data-fid="'+data2+'"]').getElementsByTagName('p')[0].style.backgroundImage;
          if(bg1==bg2){ //成功配对
            fboxid.querySelector('[data-fid="'+data1+'"]').classList.add('done');
            fboxid.querySelector('[data-fid="'+data2+'"]').classList.add('done');
            data1 = data2 = null;
            _this.success = _this.success + 1;
          }else{
            tout = setTimeout(function(){
              fboxid.querySelector('[data-fid="'+data1+'"]').classList.remove('on');
              fboxid.querySelector('[data-fid="'+data2+'"]').classList.remove('on');
              data1 = data2 = null;
              tout = null;
            },1000);
          }
          _this.step++; //计数器
          if(outputdiv){
            let stephtml = _this.step+'步';
            if(_this.step<=1){
              outputdiv.getElementsByClassName('outstep_star')[0].innerHTML = '你已经进行了';
            }
            outputdiv.getElementsByClassName('outstep_span')[0].innerHTML = stephtml;
            prohtml = _this.success+'/'+total;
            outputdiv.getElementsByClassName('outpro_span')[0].innerHTML = prohtml;
          }
        }
        //判断游戏进程
        if(_this.success==total){
          var day = new Date();
          _this.times2 = day.getTime();
          overtime = _this.times2 - _this.times1;
          ifbest = '，总用时<span style="color:red">'+formatTime(overtime)+'</span>';
          ifbest += '。<br>能达到的最少步数为<span style="color:red">'+_this.success+'</span>步。';
          xtip.win({
            type: 'alert',
            tip: '恭喜你，游戏通关！总共用了<span style="color:red">'+_this.step+'</span>步'+ifbest,
            icon: 'l',
            times: 0,
            lock: true,
            shade: false,
          });
        }
      });
    }
  };

  //毫秒数转时分秒
  function formatTime(mss)
  {
    var days = parseInt(mss / (1000 * 60 * 60 * 24));
    var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = (mss % (1000 * 60)) / 1000;
    msg = '';
    if(days){
      msg += days + ' 天';
    }
    if(hours){
      msg += hours + ' 时';
    }
    if(minutes){
      msg += minutes + ' 分';
    }
    msg += seconds + ' 秒';
    return msg;
  }

  //数组取值
  function arrforone(items)
  {
    let item = items[Math.floor(Math.random()*items.length)];
    return item;
  }

  //删除数组里特定值
  function delarr(arr,a)
  {
    if(!arr || !a){
      return false;
    }
    let newarr = new Array();
    for(let i=0;i<arr.length;i++){
      if(arr[i]!=a){
        newarr.push(arr[i]);
      }
    }
    return newarr;
  }

  //随机范围取不重复值
  function randomNum(n,m,arr)
  {
    let result = Math.round(Math.random()*(m-n))+n;
    if(arr){
      for(let i=0;i<arr.length;i++){
        if(arr[i]==result){
          return randomNum(n,m,arr);
        }
      }
    }
    return result;
  }

  //极限分配法
  function average(total,pageid)
  {
    if(pageid>total){
      return false;
    }
    let parr = new Array();
    if(Math.floor(total/pageid) === total/pageid){ //整除
      isfix = true;
      psize = total/pageid;
    }else{ //非整除
      isfix = false;
      psize = Math.ceil(total/pageid); //向上取整
    }
    if(isfix === true){
      for(i=0;i<pageid;i++){
        parr.push(psize);
      }
    }else{
      y = 0;
      for(i=0;i<pageid;i++){
        psize = Math.floor(total/pageid);
        y += psize;
        parr.push(psize);
      }
      if(y<total){
        last = total - y;
        for(i=0;i<last;i++){
          parr[i]++;
        }
      }
    }
    return parr;
  }

  return fbox;
};