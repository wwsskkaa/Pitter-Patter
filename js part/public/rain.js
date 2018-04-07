var streams = [];
var fadeInterval = 0.7;
var symbolSize = 20;
var socket;
var textPool = [];
var coord={};
var x = 0;
function setup() {
  createCanvas(window.innerWidth,window.innerHeight);
  background(0);
  /*textPool.push("太辛苦了 很累很累");
  textPool.push("don't laugh at me for my disabilities");
  textPool.push("what is this");
  textPool.push("can't do this anymore.");
  textPool.push("i love you so much");*/
  Addstring("太辛苦了 很累很累");
  Addstring("don't laugh at me for my disabilities");
  Addstring("what is this");
  Addstring("can't do this anymore.");
  Addstring("i love you so much");
  Addstring("don't leave me.");
  Addstring("i can't, i really can't");
  Addstring("future is scary.");
  Addstring("please, love me. please.");
  Addstring("世界太大了可我没有时间去闯，一天恨不得有100个小时");

  socket=io();
  socket.emit('add user','rainshuang');
  socket.on('addstring',Addstring);
  socket.on('catcher', function (data) {
    //console.log("received: ",data);
    coord=data;
    if(Math.floor((Math.random() * 10) + 1)==1){
      socket.emit('returnmsg');

    }
    
    //addChatMessage(data);
  });
  /*for (var i = 0; i <= width/(symbolSize*4); i++) {
    var str="";
    var stream = new Stream(str.split("").reverse().join(""));
    stream.generateSymbols(x,random(-2000,0));
    streams.push(stream);
    x+=symbolSize*4;
  }*/

  textFont('Consolas');
  textSize(symbolSize);
}

function Addstring(data){
  textPool.push(data);
  console.log(textPool);
    var stream = new Stream(data,true);
    //data.split("").reverse().join("")
    stream.generateSymbols(x,random(-2000,0));
    if(streams.length<width/(symbolSize*4))
    {
      streams.push(stream);
    }
    else{
      streams[x/(symbolSize*4)]=stream;
    }
    //streams.push(stream);
    x+=symbolSize*4;
    if(x>=width){
      x=0;
    }
}

function draw() {
  
  background(0, 150);
  streams.forEach(function(stream){
    stream.render();
  });
    var value;
    for (var username in coord) {
    value = coord[username];
    stroke(value.color);
    line(value.x1*window.innerWidth-40, value.y1*window.innerHeight, value.x1*window.innerWidth+40, value.y1*window.innerHeight);
    /*for(var s in streams){
      if(s.heady>=value.y1*window.innerHeight&&s.headx==value.x1*window.innerWidth){
        socket.emit('returnmsg',{sentence:s.sentence,username:username});
//        ic(s.sentence,username);
        break;
      }
    }*/
  }

  noStroke();
}

function Symbol(x, y, speed, first, opacity,value) {
  this.x = x;
  this.y = y;
  this.value=value;
  this.speed = speed;
  this.first = first;
  this.opacity = opacity;

  this.switchInterval = 100;

  this.rain = function() {
    this.y = (this.y >= height) ? 0 : this.y += this.speed;
   /*if(this.y <= height){
    this.y += this.speed;
    
   }*/
   
  }

}
function ic(sentence,username){
  socket.emit('returnmsg',{sentence:sentence,username:username});
}
function Stream(sentence,bot,myx) {
  this.symbols = [];
  this.totalSymbols = sentence.length;
  //round(random(5, 35));
  this.speed = 20;
  this.sentence=sentence;
  this.heady=0;
  this.headx=myx;
  //random(5, 22);

  this.generateSymbols = function(x, y) {
    var opacity = 255;
    var first = true;
    this.heady=y;
    for (var i =0; i <= this.totalSymbols; i++) {
      symbol = new Symbol(x,y,this.speed,first,opacity,sentence.charAt(i));
      //symbol.setToRandomSymbol();
      this.symbols.push(symbol);
      opacity -= (255 / this.totalSymbols) / fadeInterval;
      y -= symbolSize;
      
      first = false;
    }
  }

  this.render = function() {
    
    this.symbols.forEach(function(symbol) {
      if (symbol.first) {
        this.heady=symbol.y;
        console.log(sentence,this.heady);
        if(this.heady>window.innerHeight&&bot){
          //console.log(sentence, "reached bottom");
          //ic(sentence);
          bot=false;
        }
        fill(100,149,237, symbol.opacity);
      } else {
        fill(100,149,237, symbol.opacity);
      }
      text(symbol.value,symbol.x,symbol.y);
      symbol.rain();
      //symbol.setToRandomSymbol();
    });
  }
}

