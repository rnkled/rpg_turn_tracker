class StarsBG {

    constructor() {
        this.canvas = createCanvas(window.innerWidth, window.innerHeight);
        this.canvas.id('canvas');
        this.canvas.style("z-index: -100");
        this.stars = [];
        for (let i = 0; i < 400; ++i) {
            this.stars.push([random(-width, width), random(-height, height)]);
        }
        this.angle = 0.01;
    }

    show() {
        push()
        translate(width / 2, height);
        rotate(this.angle);
        this.angle += 0.0002;
        stroke(255);
        strokeWeight(2);
        this.stars.forEach(star => {
            point(...star);
        });
        pop();
    }

}