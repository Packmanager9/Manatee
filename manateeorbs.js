
window.addEventListener('DOMContentLoaded', (event) =>{


    let waters = []
    let stars = []
    let keysPressed = {}

    document.addEventListener('keydown', (event) => {
        keysPressed[event.key] = true;
     });
     
     document.addEventListener('keyup', (event) => {
         delete keysPressed[event.key];
      });

    let tutorial_canvas = document.getElementById("tutorial");
    let tutorial_canvas_context = tutorial_canvas.getContext('2d');

    tutorial_canvas.style.background = "#000000"


    let flex = tutorial_canvas.getBoundingClientRect();

    // Add the event listeners for mousedown, mousemove, and mouseup
    let tip = {}
    let xs
    let ys
   
   
    
    window.addEventListener('mousedown', e => {

          flex = tutorial_canvas.getBoundingClientRect();
          xs = e.clientX - flex.left;
          ys = e.clientY - flex.top;
          tip.x = xs
          tip.y = ys
    
          tip.body = tip

     });
    
    

    class Triangle{
        constructor(x, y, color, length){
            this.x = x
            this.y = y
            this.color= color
            this.length = length
            this.x1 = this.x + this.length
            this.x2 = this.x - this.length
            this.tip = this.y - this.length*2
            this.accept1 = (this.y-this.tip)/(this.x1-this.x)
            this.accept2 = (this.y-this.tip)/(this.x2-this.x)

        }

        draw(){
            tutorial_canvas_context.strokeStyle = this.color
            tutorial_canvas_context.stokeWidth = 3
            tutorial_canvas_context.moveTo(this.x, this.y)
            tutorial_canvas_context.lineTo(this.x1, this.y)
            tutorial_canvas_context.lineTo(this.x, this.tip)
            tutorial_canvas_context.lineTo(this.x2, this.y)
            tutorial_canvas_context.lineTo(this.x, this.y)
            tutorial_canvas_context.stroke()
        }

        isPointInside(point){
            if(point.x <= this.x1){
                if(point.y >= this.tip){
                    if(point.y <= this.y){
                        if(point.x >= this.x2){
                            this.accept1 = (this.y-this.tip)/(this.x1-this.x)
                            this.accept2 = (this.y-this.tip)/(this.x2-this.x)
                            this.basey = point.y-this.tip
                            this.basex = point.x - this.x
                            if(this.basex == 0){
                                return true
                            }
                            this.slope = this.basey/this.basex
                            if(this.slope >= this.accept1){
                                return true
                            }else if(this.slope <= this.accept2){
                                return true
                            }
                        }
                    }
                }
            }
            return false
        }
    }


    class Rectangle {
        constructor(x, y, height, width, color) {
            this.x = x
            this.y = y
            this.height = height
            this.width = width
            this.color = color
            this.xmom = 0
            this.ymom = 0
        }
        draw(){
            tutorial_canvas_context.fillStyle = this.color
            tutorial_canvas_context.fillRect(this.x, this.y, this.width, this.height)
        }
        move(){
            this.x+=this.xmom
            this.y+=this.ymom
        }
        isPointInside(point){
            if(point.x >= this.x){
                if(point.y >= this.y){
                    if(point.x <= this.x+this.width){
                        if(point.y <= this.y+this.height){
                        return true
                        }
                    }
                }
            }
            return false
        }
    }
    class Circle{
        constructor(x, y, radius, color, xmom = 0, ymom = 0){

            this.height = 0
            this.width = 0
            this.x = x
            this.y = y
            this.radius = radius
            this.color = color
            this.xmom = xmom
            this.ymom = ymom
            this.xrepel = 0
            this.yrepel = 0
            this.lens = 0
        }       
         draw(){
            tutorial_canvas_context.lineWidth = 1
            tutorial_canvas_context.strokeStyle = this.color
            tutorial_canvas_context.beginPath();
            tutorial_canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI*2), true)
            tutorial_canvas_context.fillStyle = this.color
           tutorial_canvas_context.fill()
            tutorial_canvas_context.stroke(); 
        }
        move(){
            this.x += this.xmom
            this.y += this.ymom
            tutorial_canvas_context.translate(-this.xmom, -this.ymom)
            let wet = 0

            for(let t = 0; t<waters.length;t++){

                if(waters[t].isPointInside(this)){
                    wet = 1
                    }
            }
            if(wet==0){
            this.xmom*=.9999
            this.ymom*=.9999
            }else{

                this.xmom*=.97
                this.ymom*=.97
            }
        }
        isPointInside(point){
            this.areaY = point.y - this.y 
            this.areaX = point.x - this.x
            if(((this.areaX*this.areaX)+(this.areaY*this.areaY)) <= (this.radius*this.radius)){
                return true
            }
            return false
        }

        repelCheck(point){
            this.areaY = point.y - this.y 
            this.areaX = point.x - this.x
            if(((this.areaX*this.areaX)+(this.areaY*this.areaY)) <= (this.radius+point.radius)*(point.radius+this.radius)){
                return true
            }
            return false
        }
    }

    class Line{
        constructor(x,y, x2, y2, color, width){
            this.x1 = x
            this.y1 = y
            this.x2 = x2
            this.y2 = y2
            this.color = color
            this.width = width
        }
        hypotenuse(){
            let xdif = this.x1-this.x2
            let ydif = this.y1-this.y2
            let hypotenuse = (xdif*xdif)+(ydif*ydif)
            return Math.sqrt(hypotenuse)
        }
        draw(){
            tutorial_canvas_context.strokeStyle = this.color
            tutorial_canvas_context.lineWidth = this.width
            tutorial_canvas_context.beginPath()
            tutorial_canvas_context.moveTo(this.x1, this.y1)         
            tutorial_canvas_context.lineTo(this.x2, this.y2)
            tutorial_canvas_context.stroke()
            tutorial_canvas_context.lineWidth = 1
        }
    }

    class Spring{
        constructor(body = 0){
            if(body == 0){
                this.body = new Circle(350, 350, 5, "red",10,10)
                this.anchor = new Circle(this.body.x, this.body.y+5, 3, "red")
                this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", 5)
                this.length = 1
            }else{
                this.body = body
                this.length = .1
                this.anchor = new Circle(this.body.x-((Math.random()-.5)*10), this.body.y-((Math.random()-.5)*10), 3, "red")
                this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", 5)
            }

        }
        balance(){
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", 5)

                if(this.beam.hypotenuse() !=0){
            if(this.beam.hypotenuse() < this.length){
                    this.body.xmom += (this.body.x-this.anchor.x)/(this.length)/300
                    this.body.ymom += (this.body.y-this.anchor.y)/(this.length)/300
                    this.anchor.xmom -= (this.body.x-this.anchor.x)/(this.length)/300
                    this.anchor.ymom -= (this.body.y-this.anchor.y)/(this.length)/300
            }else if(this.beam.hypotenuse() > this.length){
                    this.body.xmom -= (this.body.x-this.anchor.x)/(this.length)/300
                    this.body.ymom -= (this.body.y-this.anchor.y)/(this.length)/300
                    this.anchor.xmom += (this.body.x-this.anchor.x)/(this.length)/300
                    this.anchor.ymom += (this.body.y-this.anchor.y)/(this.length)/300
            }

        }

        let xmomentumaverage 
        let ymomentumaverage
        xmomentumaverage = ((this.body.xmom)+this.anchor.xmom)/2
        ymomentumaverage = ((this.body.ymom)+this.anchor.ymom)/2

                this.body.xmom = ((this.body.xmom)+xmomentumaverage)/2
                this.body.ymom = ((this.body.ymom)+ymomentumaverage)/2
                this.anchor.xmom = ((this.anchor.xmom)+xmomentumaverage)/2
                this.anchor.ymom = ((this.anchor.ymom)+ymomentumaverage)/2
        }
        draw(){
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", 5)
            this.beam.draw()
            this.body.draw()
            this.anchor.draw()
        }
        move(){
                    this.body.move()
                    this.anchor.move()
        }

    }


    class Observer{
        constructor(){
            this.body = new Circle( 500, 500, 5, "white")
            this.ray = []
            this.rayrange = 220
            this.globalangle = Math.PI
            this.gapangle = Math.PI/8
            this.currentangle = 0
            this.obstacles = []
            this.raymake = 40
        }

        beam(){
            this.currentangle  = this.gapangle/2
            for(let k = 0; k<this.raymake; k++){
                this.currentangle+=(this.gapangle/Math.ceil(this.raymake/2))
                let ray = new Circle(this.body.x, this.body.y, 1, "white",((this.rayrange * (Math.cos(this.globalangle+this.currentangle))))/this.rayrange*2, ((this.rayrange * (Math.sin(this.globalangle+this.currentangle))))/this.rayrange*2 )
                ray.collided = 0
                ray.lifespan = this.rayrange-1
                this.ray.push(ray)
            }
            for(let f = 3; f<this.rayrange/2; f++){
                for(let t = 0; t<this.ray.length; t++){
                    if(this.ray[t].collided < 1){
                        this.ray[t].move()
                    for(let q = 0; q<this.obstacles.length; q++){
                        if(this.obstacles[q].isPointInside(this.ray[t])){
                            this.ray[t].collided = 1
                        }
                      }
                    }
                }
            }
        }

        draw(){
            this.beam()
            this.body.draw()
            tutorial_canvas_context.lineWidth = 1
            tutorial_canvas_context.fillStyle = "red"
            tutorial_canvas_context.strokeStyle = "red"
            tutorial_canvas_context.beginPath()
            tutorial_canvas_context.moveTo(this.body.x, this.body.y)
            for(let y = 0; y<this.ray.length; y++){
                    tutorial_canvas_context.lineTo(this.ray[y].x, this.ray[y].y)
                        tutorial_canvas_context.lineTo(this.body.x, this.body.y)
                }
            tutorial_canvas_context.stroke()
            tutorial_canvas_context.fill()
            this.ray =[]
        }

        control(){
            if(keysPressed['t']){
                this.globalangle += .05
            }
            if(keysPressed['r']){
                this.globalangle -= .05
            }
            if(keysPressed['w']){
                this.body.y-=2
            }
            if(keysPressed['d']){
                this.body.x+=2
            }
            if(keysPressed['s']){
                this.body.y+=2
            }
            if(keysPressed['a']){
                this.body.x-=2
            }
        }
    }

    class Shape{
        constructor(){
            this.circle = new Circle(360,350, 50, "red")
            this.circle2 = new Circle(320,350, 30, "red")
            this.circle3  = new Circle(400,350, 30, "red")
            this.rectangle = new Rectangle(300,140, 110, 110, "red")
            this.rectangle = new Rectangle(300,140, 110, 110, "red")
            this.triangle2 = new Triangle(340,350, "red", 40)
            this.triangle1 = new Triangle(380,350, "red", 50)
            this.triangle1.x2+=40
            this.triangle2.tip-=20

        }
        isPointInside(point){
            if(this.circle.isPointInside(point)){
                if(!this.circle2.isPointInside(point)){
                    // return true
                // if(this.rectangle.isPointInside(point)){
                    if(!this.circle3.isPointInside(point)){
                        return true
                    }
                // }
            }
        }
            return false
        }

    }
    class Manatee{
        constructor(){
            this.path = []
            this.body = new Circle(350, 350, 5, "red")
            this.head = new Circle(350, 351, 3, "yellow")
            this.globalangle = Math.PI
            this.trajectoyangle = 0
            this.gravity = .1
            this.combo = 0
            this.jumping = 0
            this.prevx = 350
            this.prevy = 350
            this.maxspeed = 300
        }
        draw(){
            for(let t= 0; t<this.path.length; t++){
                this.path[t].width = .25
                this.path[t].draw()
            }
            if(this.path.length>520){
                this.path.splice(0,2)
            }

            let wet = 0 

            for(let t = 0; t<waters.length; t++){

                if(waters[t].isPointInside(this.body)){
                    wet = 1
                    this.gravity = 0
                    if(this.jumping == 1){
                        // console.log(Rax(this.trajectoyangleflip), Rax(this.globalangle))
                        // if(this.)
    
                        if(Math.abs(((Rax(this.trajectoyangleflip)+90)%360) - ((Rax(this.globalangle)+90)%360)) < 20){
                            this.maxspeed-= 3
                            this.maxspeed*=.95
                            console.log(this.maxspeed)
                            if(this.maxspeed < 30){
                                this.maxspeed = 30
                            }
                        }else if(Math.abs(((Rax(this.trajectoyangleflip)+90)%360) - ((Rax(this.globalangle)+90)%360)) < 30){
                            this.maxspeed-= 2
                            console.log(this.maxspeed)
                            if(this.maxspeed < 33.5){
                                this.maxspeed = 33.5
                            }
                        }else if(Math.abs(((Rax(this.trajectoyangleflip)+90)%360) - ((Rax(this.globalangle)+90)%360)) < 40){
                            this.maxspeed-= 1
                            console.log(this.maxspeed)
                            if(this.maxspeed < 35){
                                this.maxspeed = 35
                            }
                        }
                        if(Math.abs(((Rax(this.trajectoyangleflip)+90)%360) - ((Rax(this.globalangle)+90)%360)) > 90){
                            this.maxspeed +=10
                            if(this.maxspeed > 300){
                                this.maxspeed = 300
                            }
                        }
                    }
                    this.jumping = 0
                }

            }

            
            if(wet == 0){
                this.jumping = 1
                this.gravity = .06 //.075
            }
            this.control()
            this.body.ymom+=this.gravity

            this.trajectoyangle =  Math.atan2(this.prevy - this.body.y, this.prevx - this.body.x)

            this.trajectoyangleflip =  Math.atan2(this.body.y -this.prevy ,  this.body.x - this.prevx)

            this.prevx = this.body.x
            this.prevy = this.body.y
            this.body.move()


            if(seabed.isPointInside(this.body)){
                if(this.body.ymom > 0){
                    this.body.ymom *= -1
                    this.maxspeed = 100
                    this.body.ymom*=.5
                    this.body.xmom*=.5
                }
            }
            if(seabed.isPointInside(this.head)){
                if(this.body.ymom > 0){
                    this.body.ymom *= -1
                }
            }
            this.body.draw()
            this.head.x = this.body.x + (Math.cos(this.globalangle)*30)
            this.head.y = this.body.y + (Math.sin(this.globalangle)*30)
            let redline = new Line(this.body.x, this.body.y,  (this.body.x + (Math.cos(this.globalangle)*30)),  (this.body.y + (Math.sin(this.globalangle)*30)), 'red', 2  )

            let cyanline = new Line(this.body.x, this.body.y,  (this.body.x + (Math.cos(this.trajectoyangle)*30)),  (this.body.y + (Math.sin(this.trajectoyangle)*30)), 'cyan', 1  )
        
            let whiteline = new Line(this.body.x, this.body.y,  (this.body.x + (Math.cos(this.trajectoyangleflip)*30)),  (this.body.y + (Math.sin(this.trajectoyangleflip)*30)), 'white', 1  )
            whiteline.draw()     
            cyanline.draw()  
                 redline.draw()

                 this.path.push(whiteline)
                 this.path.push(cyanline)
            this.head.draw()
        }


        control(){
            if(keysPressed['a']){
                this.globalangle -= .05
            }
            if(keysPressed['d']){
                this.globalangle += .05
            }
            // this.globalangle%=(Math.PI*2)
            if(keysPressed['w']){
                if(this.jumping == 0){
                    this.body.ymom += (this.head.y-this.body.y)/this.maxspeed
                    this.body.xmom += (this.head.x-this.body.x)/this.maxspeed
                }
            }
        }
    }

    let tune = new Manatee()
    water = new Rectangle(-100000000, 350, 900, 200000000, "#00AAFF44")
   waters.push(water)
   let  watexr = new Circle(0, 0, 150, "#00AAFF44")
   waters.push(watexr)
   let  wateyr = new Circle(0, -500, 150, "#00AAFF44")
   waters.push(wateyr)

    seabed = new Rectangle(-1000000, 1250, 1000000, 2000000, "#FFFFAA")
    // let wall = 

    for(let h = 0; h < 400000; h++){
        let a1 = new Rectangle(-350000+(Math.random()*tutorial_canvas.width*1000), (10*Math.random()*tutorial_canvas.height)-6650, ((Math.random()*6)+1.45),((Math.random()*6)+1.45), getRandomLightColor())

        if(Math.random()<.9){
            stars.push(a1)
        }

        if(Math.random()<.15){
        let drop = new Circle(a1.x, a1.y, 5*(a1.width*a1.height+1), "#00AAFF44")

        let wet = 0

        for(let t = 1; t<waters.length;t++){
            if(waters[t].repelCheck(drop)){
                wet = 1
            }
        }



        if(wet == 0){
            waters.push(drop)
        }
        }
        }


    window.setInterval(function(){ 
        tutorial_canvas_context.clearRect(-1000000000,-1000000000,tutorial_canvas.width*10000000, tutorial_canvas.height*10000000)
        tune.draw()
        seabed.draw()
        
        for(let t = 0; t<waters.length;t++){
        let link = new Line(tune.body.x, tune.body.y, waters[t].x, waters[t].y, "red", 1)
        // link.draw()
        if(link.hypotenuse() < 700){
            waters[t].draw()
        }
    }
    water.draw()
        
    for(let h = 0; h<stars.length; h++){
        let link = new Line(tune.body.x, tune.body.y, stars[h].x, stars[h].y, "red", 1)
        // link.draw()
        if(link.hypotenuse() < 1700){

            stars[h].draw()

        }
    }
    }, 14) 

    function Rax(isn){
        let out = isn*(180 / Math.PI)
        for(let i = 0;out<0;i++){
            out+=360
        }
        out = out%360
        // //console.log(out)
        return out
    }
    
    // random color that will be visible on  black background
function getRandomLightColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[(Math.floor(Math.random() * 15)+1)];
    }
    return color;
  }



        
})