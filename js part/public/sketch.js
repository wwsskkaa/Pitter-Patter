var input, button, greeting,neww,newh;
var ws;
var array = [];
var i=0;

var textPool = [''];
		//['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
var texts = [];
var textY = [];
var textSpeed = [];
var eachSpeed = [];

var numIndex;
var minSpeed = 0.2;
var maxSpeed = 1.0;
var tSize = 30;
var rectX=window.innerWidth/2;
var rectY = window.innerHeight-200;
var rectW = 100;
var rectH = 10;
var ellipseX = window.innerWidth-60;
var ellipseY = 60;
var ellipseSize = 70;

var socket;
function setup() {
  socket=io();
  socket.emit('add user','shuangzaizai');
  socket.on('addstring',Addstring);
  // create canvas
  document.body.style.overflow = "hidden";
  createCanvas(window.innerWidth,window.innerHeight);
  Addstring("累");
  Addstring("don't laugh at me for my disabilities");
  Addstring("what is this");
  Addstring("can't do this anymore.");
  Addstring("i love you so much");
  Addstring("do not leave me.");
  Addstring("i can't, i really can't");
  Addstring("future is scary");
  Addstring("please, love me. please.");
  Addstring("没 时间");

  rainStart(); 

  /*background(200,200,233);
  
  input = createInput();
  neww=windowWidth-200;
  newh=100;
  input.size(neww,newh);
  input.position((windowWidth-neww)/2, 100);

  button = createButton('Send');
  //button.position(input.x + input.width, 65);
  button.position((windowWidth-neww)/2+neww-50, 50);
  button.mousePressed(greet);

  greeting = createElement('h2', 'What do you want to tell me?');
  greeting.position((windowWidth-neww)/2, 25);

  //textAlign(CENTER);
  textSize(20);*/
}


function Addstring(data){
  textPool=textPool.concat(data.split(" "))
  //textPool.push(data);
  //console.log(data.split(" "));
  rainStart();
}
function draw() {
// console.log(frameRate());
  background(0,30);
 
  // restart button
  if (dist (ellipseX, ellipseY, mouseX, mouseY) < ellipseSize) {
    fill(70);
  } else {
    fill(30);
  }
  
  ellipse(ellipseX, ellipseY, ellipseSize, ellipseSize);
  fill(80);
  text("restart", window.innerWidth-85, 65);

  // rain catcher
  fill(255);
  rectX = constrain (mouseX, 0, width-rectW);
	//rectY = constrain (mouseY, 0, height-rectH);
  rect(rectX, rectY, rectW, rectH);  

  // text rains
  fill(100,149,237);
	var k=window.innerWidth/70;
  for (var i = 0; i < k; i++) {
    
      text(texts[i], i*70, textY[i]);
      if (i*70 > rectX-tSize/2 && i*70 < rectX+rectW-tSize/70 && textY[i] > rectY - maxSpeed && textY[i] < rectY + maxSpeed) {
        textSpeed[i] = 0;
      }
      if (i*70 < rectX-tSize/2 || i*70 > rectX+rectW-tSize/70) {             
        textSpeed[i] = eachSpeed[i];    
      } 
      textY[i]+=textSpeed[i];
   }
  
  fill(0);
  
}

function rainStart() {
  textSize(tSize);  
  noStroke();
		var k=window.innerWidth/70;

  for (var i = 0; i < k; i++) {
      // pick a random text
      numIndex = floor(random(textPool.length));
      texts[i] = textPool[numIndex];
      // append to the push array
      textY[i] = random(0, height/2); 
      eachSpeed[i] = random(minSpeed, maxSpeed);
      textSpeed[i] = eachSpeed[i];
  }
}

function mousePressed() {
  if (dist(mouseX, mouseY, ellipseX, ellipseY) < ellipseSize/2) {
    rainStart();
  }
}