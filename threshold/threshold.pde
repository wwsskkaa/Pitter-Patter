import org.openkinect.processing.*;
import java.util.Iterator;
// Kinect Library object
Kinect2 kinect2;

JSONObject json1;
JSONArray json;
Iterator a;

float minThresh = 2500;
float maxThresh = 4000;
PImage img;

int thresh = 100;
PFont f;
String message = "My name is bonnie My name is bonnie My name is bonnie";
int len = message.length();
int[] xpos;
ArrayList fallObj;
ArrayList<String> currentwords;
Letter myLetter;
boolean newword=false;
int Start;
boolean shown=true;
Drop[] drops=new Drop[100];
int totalDrop=0;
String currentnewest="";
int currentindex=0;
int bottom=0;
String[] splited;
float fullScreenScale;

void setup() {
  //size(512, 424);
  fullScreen(P3D); 
  noCursor();
  fullScreenScale = width / float(640);
  background(0);
  xpos= new int[width/5];
   currentindex=0;
   currentwords = new ArrayList<String>();
  /*a=json.keyIterator();
  while(a.hasNext()) {
      String key = (String)a.next();
        // loop to get the dynamic key
        String value = (String)json.get(key);
        currentwords.add(value);
        println(key+": "+value);
    }
    */
     json1 = loadJSONObject("https://socketio-chat-dgovgjmbmj.now.sh/words.json");

    json = json1.getJSONArray("1");
    for(int i=0;i<20;i++)
    {
      String value=(String)json.get(i);
      currentwords.add(value);
    }
    currentnewest=currentwords.get(0);
    message=(String)json.get(currentindex);
   // message=currentwords.get(0);
    splited= message.split("\\s+");
   len=splited.length;
   
  kinect2 = new Kinect2(this);
  kinect2.initDepth();
  kinect2.initDevice();
  println("hahhaha",kinect2.depthWidth,kinect2.depthHeight);
  img =createImage(kinect2.depthWidth, kinect2.depthHeight, RGB);
    scale(fullScreenScale, fullScreenScale);
    
  int Start = millis();
  f = createFont("Arial", 10, true);
  fill(0);
  textFont(f);
  int x = 20; 
  //while(x<width){
  for (int i = 0; x<width; i++) {
    int wordIndex = i % splited.length;
    //i < splited.length&&
    xpos[i] = x;
    x += textWidth(splited[wordIndex])+5;
  }
  //}
  fallObj = new ArrayList();
}

int indexCalc() {
  int iii = 0;
  int x = 20;
  for (; x<width; iii++) {
    int wordIndex = iii % splited.length;
    //i < splited.length&&
    xpos[iii] = x;
    x += textWidth(splited[wordIndex])+5;
  }
  return iii;
}

void draw() {
  background(0);
scale(fullScreenScale, fullScreenScale);
  img.loadPixels();
  if ((millis() - Start)%50 == 0) {
    json1 = loadJSONObject("https://socketio-chat-dgovgjmbmj.now.sh/words.json");

    json = json1.getJSONArray("1");
    if(!((String)json.get(0)).equals(currentnewest)){
    
    currentwords.clear();
    for(int i=0;i<20;i++)
    {
      String value=(String)json.get(i);
      currentwords.add(value);
    }
    //currentindex=-1;
    currentnewest=currentwords.get(0);
    newword=true;
    println(currentnewest);
    }
  }
  //minThresh = map(mouseX, 0, width, 0, 4500);
  //maxThresh = map(mouseY, 0, height, 0, 4500);
  

  // Get the raw depth as array of integers
  int[] depth = kinect2.getRawDepth();
  
  float sumX = 0;
  float sumY = 0;
  float totalPixels = 0;
  
  for (int x = 0; x < kinect2.depthWidth; x++) {
    for (int y = 0; y < kinect2.depthHeight; y++) {
      int offset = x + y * kinect2.depthWidth;
      int d = depth[offset];

      if (d > minThresh && d < maxThresh && x > 100) {
        img.pixels[offset] = color(193,209,230);
        //color(255, 0, 150);
         
        sumX += x;
        sumY += y;
        totalPixels++;
        
      } else {
        img.pixels[offset] = color(0);
      }  
    }
  }

  img.updatePixels();

  image(img, 0, 0);
  /*
  if ((millis() - Start)%40 == 0) {
    int index = int(random (len));
    //char newC = message.charAt(index);
    String newC = splited[index]; 
    int currentX = xpos[index];  
    myLetter = new Letter(newC, currentX);
    fallObj.add(myLetter);
  }*/
  int iii = 0;
  if(bottom==indexCalc()){
    currentindex++;
//    println(currentindex,currentwords.get(currentindex));
    if(currentindex>=19){
      currentindex=0;
    }
    if(newword){
      currentindex=0;
      newword=false;
    }
   message=currentwords.get(currentindex);
    splited= message.split("\\s+");
   len=splited.length;
   
  //int x = 20; 
  //for (; x<width; iii++) {
  //  int wordIndex = iii % splited.length;
  //  //i < splited.length&&
  //  xpos[iii] = x;
  //  x += textWidth(splited[wordIndex])+5;
  //}
  
  fallObj.clear();
  shown=true;
  bottom=0;
  }
  
if(shown){
  int maxIndex = indexCalc();
  for(int index=0;index<maxIndex;index++){
    String newC = splited[index % splited.length]; 
    int currentX = xpos[index];
    myLetter = new Letter(newC, currentX);
    fallObj.add(myLetter);
    shown=false;
  }
}

    
  for (int i = fallObj.size()-1; i >= 0; i--) {
    Letter current = (Letter) fallObj.get(i);
    int state = current.check();
    if (state == 1) {
      bottom+=1;
      fallObj.remove(i);
      break;
    }
    else{
      current.update();
    }
  }
  /*
   drops[totalDrop]=new Drop();
  totalDrop++;
  if(totalDrop>=drops.length){
    totalDrop=0;
  }  
  
  for(int i=0;i<totalDrop;i++){
    drops[i].move();
    drops[i].display();
  }
  */
  
  //float avgX = sumX / totalPixels;
  //float avgY = sumY / totalPixels;
  //fill(150,0,255);
  //ellipse(avgX, avgY, 64, 64);
  
  //fill(255);
  //textSize(32);
  //text(minThresh + " " + maxThresh, 10, 64);
  
  
}

class Letter {
  // function that keeps itself falling
  int yPos;
  //char currentLetter;
  String currentLetter;
  int xPos;
  boolean words=false;
  float alpha;
  float radius;

  /*Letter ( char ch, int X) {
    yPos = 0;
    xPos= X;
    currentLetter = ch;
    words=false;
    alpha=random(20,150);
  }*/
  Letter ( String ch, int X) {
    yPos = int(random(0,200));
    xPos= X;
    currentLetter = ch;
    words=false;
    alpha=random(40,150);
    radius=random(0.5,1.5);
  }

  void update () {
    // check if is in the black or the white and move accordingly
    //fill(0);
    if(words){
      fill(50,150,200);
      text(currentLetter, xPos, yPos-5);
    }
    else{
    fill(50,150,200,alpha);
    noStroke();
    
    //rainDrop shape
    for (int i = 2; i < 8; i++ ) {
      
      ellipse(xPos, yPos-40 + i*radius*1.5, i*radius, i*radius);
    }
    }
    
    //text(currentLetter, xPos, yPos-5);
    int locImage = xPos + yPos*img.width;
    int checkB = int(brightness(img.pixels[locImage]));
    if(!words||words){
    if ( checkB < thresh) {
      yPos++;
    }
    else if (yPos > 0 && checkB > thresh) {
      words=true;
      yPos--;
    }
    }
    else{
      yPos++;
    }
    
    
  }
  int check() {
    int locImage = xPos + yPos*img.width;
    if ((yPos > height) || (locImage >= img.pixels.length)){
      return 1;
    }
    else {
      return 0;
    }
    // remove the object if it has touched the bottom
  }
}