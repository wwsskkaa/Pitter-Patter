class Drop{
  
  //data
  float x,y;
  float speed;
  color c;
  float r;
  
  //constructor
  Drop(){
    r=8;
    x=random(width);
    y=-r*4;
    speed=random(0.2,2);
    c=color(50,100,150);
  }
  
  //function
  void move(){
    y +=speed;
  }
  

  
  void display(){
    fill(50,150,random(50,255));
    noStroke();
    
    //rianDrop shape
    for (int i = 2; i < 8; i++ ) {
      ellipse(x, y + i*2, i*1.5, i*1.5);
    }
  }


//Drop[] drops=new Drop[500];
//int totalDrop=0;


void render(){
  //background(255);
   /* drops[totalDrop]=new Drop();
  totalDrop++;
  if(totalDrop>=drops.length){
    totalDrop=0;
  }  
  
  for(int i=0;i<totalDrop;i++){
    drops[i].move();
    drops[i].display();
 */ }
  
}