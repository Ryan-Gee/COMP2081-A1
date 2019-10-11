//Custom, 100% original code solution for drawing physically simulated sparks
//This project uses HTML5 Canvas to draw and simulate numerous particles in the background of the page without significantly affecting performance (tested up to 200 simultaneous particles)
//The particles are affected by wind force as well as turbulence, using a white noise factor accumulated to the second derivative of their velocity (to simulate perlin noise or similar)
//The particles have a number of randomly generated attributes to create variation, including start position, size, colour, lifetime, etc
//This particular system has been created so that particles will always spawn at the bottom right corner of the screen and blow towards the top left
//All code is 100% original, written from scratch, specifically for the purpose of the assignment (although I'll probably keep it for future use!)

var canv = document.getElementById("particleCanvas");
var ctx = canv.getContext('2d');
var width = screen.width;
var height = screen.height;

canv.width = width;
canv.height = height;

//Container to hold all of the spawned particles
var particles = [];

//Strength of the turbulence affecting the particles (white noise turbulence)
var turbulenceStrength = 0.7;
//Strength of the wind on the particles (constant force, predefined direction)
var windStrength = 7;
windStrength = windStrength * (width/1500);
//Radius of the off-screen spawning area
var spawnSize = 100;

//Average rate at which particles spawn per frame
var spawnRate = 0.09;
//Stress testing, still runs smoothly with one particle spawned every frame!
//var spawnRate = 1;


//Base size of the particle
var baseSize = 5;
//How much the size of the particle varies
var sizeVariation = 2;
//Greatest start lifetime of the particle (before the particle begins to die)
var lifetime = 250;
//Death rate of the particle, the rate at which it disappears
var scaleSpeed = 0.1;


//Create a new particle with parameters based on the variables above
function newParticle() {
    var np = {}
    //Spawn the particle at a random place on the bottom right corner of the screen, within the spawn circle
    np.x = width + ((Math.random()) - 1) * spawnSize;
    np.y = height + ((Math.random()) - 1) * spawnSize;
    //Second derivative of the x position vector
    np.dx = 0;
    //Second derivative of the y position vector
    np.dy = 0;
    //Particle size
    np.r = baseSize + Math.random() * sizeVariation;
    //Particle colour (green component only)
    np.c = (Math.random()*100) + 30;
    //Particle age
    np.a = 0;
    //Random particle lifetime
    np.l = Math.random() * lifetime;
    return np;
}

//Takes a colour and brightens it a bit
function brightenColor (r, g, b, v) {
    v = Math.random() * v;
    return "rgb(" + r * v + ", " + g * v + ", " + b * v + ")";
}

//Start the animation sequence
function start() {
    window.requestAnimationFrame(update);
}

//This function runs every animation frame
function update() {
    //Clear the canvas
    ctx.clearRect(0,0,canv.width, canv.height);
    //Make sure it's using the additive drawing composite mode
    ctx.globalCompositeOperation = "lighter";

    //Randomly spawn new particles
    if (Math.random() > (1-spawnRate)) {
        particles.push(newParticle());
    }

    //For each particle, apply the animation
    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
    
        //Draw the actual particle
        drawSpark(p.x, p.y, p.c, p.r);

        //Apply movement (wind + second derivative)
        p.x -= windStrength + p.dx;
        //Scale y movement so it's always towards the opposite corner of the screen 
        p.y -= (windStrength * (height/width)) + p.dy;
        //Change the position derivative by adding white noise
        p.dx += (Math.random() - 0.5) * turbulenceStrength;
        p.dy += (Math.random() - 0.5) * turbulenceStrength;

        if (p.x > width || p.y > height) {
            //If the particle is out of bounds, destroy it
            particles.splice(i, 1);
        }

        //Increment the particle's age to keep track of how many frames it's been on screen
        p.a += 1;

        //If the particle is older than it's lifetime, begin shrinking it
        if (p.a > p.l) {
            p.r -= scaleSpeed;
        }

        //If the particle is small enough, destroy it
        if (p.r <= 0.1) {
            particles.splice(i, 1);
        }

    }
    //Continue the animation next frame
    window.requestAnimationFrame(update);
}

//Draws the spark as a gradient to the canvas, given position, colour, and radius
function drawSpark(x, y, c, r) {
    //Get ready to draw
    ctx.beginPath();
    //Create the gradient for the particle
    var gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    //Center of the particle is always white
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.1, "white");
    //Particle fades to colour (red component is always 100%, green component varies to create different hues leading to yellow, random opacity makes the spark flicker)
    gradient.addColorStop(0.4, "rgba(255, " + c + ", 0, " + Math.random() + ")");
    //Fade out the edges of the particle
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    //Draw the particle
    ctx.arc(x, y, r, Math.PI*2, false);
    //Fill the particle
    ctx.fill();
}

//Start the whole sequence
start();
