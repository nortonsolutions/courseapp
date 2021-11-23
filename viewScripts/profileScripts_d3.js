var scoreArrays = JSON.parse(document.getElementById('scoreArrays').innerText);
var lowestDate = 0, highestDate = 0, lowestScore = Infinity, highestScore = 0;

var height = 200;
var width = 400;
var padding = 10;

colors = ["red","orange","yellow","green","blue","indigo","violet"]

Object.keys(scoreArrays).forEach((courseName, index) => {
    scoreArrays[courseName].forEach((entry, index2) => {
        if (index == 0 && index2 == 0) {
            lowestDate = entry.date;
            highestDate = entry.date;
        } else {
            if (entry.date < lowestDate) lowestDate = entry.date;
            if (entry.date > highestDate) highestDate = entry.date;
        }

        if (entry.score < lowestScore) lowestScore = entry.score;
        if (entry.score > highestScore) highestScore = entry.score;
    })
})

var x = d3.scaleTime()
    .domain([new Date(lowestDate),new Date(highestDate)])
    .range([padding,width-padding]);

var y = d3.scaleLinear()
    .domain([lowestScore,highestScore])
    .range([height-padding*2,padding]);

const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y);

var canvas = document.getElementById('quizGraphCanvas');
var ctx = canvas.getContext('2d');


var selectedColor = 0;
var labelHeight = 20;

// CANVAS
Object.keys(scoreArrays).forEach(courseName => {

    ctx.strokeStyle = colors[selectedColor];
    ctx.lineCap = "round";
    ctx.font = '9px Times New Roman';
    ctx.beginPath();
    // ctx.moveTo(10, height-10);

    scoreArrays[courseName].forEach(quiz => {
        let xScaled = x(new Date(quiz.date));
        let yScaled = y(quiz.score);
        // console.log(quizName + ": xScaled=" + xScaled + ",yScaled=" + yScaled);
        ctx.lineTo(xScaled, yScaled+10);
        ctx.fillText(quiz.name + " " + quiz.score, xScaled-10, yScaled+5);

    })


    ctx.moveTo(width-160, labelHeight - 5);
    ctx.lineTo(width-150, labelHeight - 5);
    ctx.stroke();

    ctx.fillText(courseName, width-140, labelHeight);
    labelHeight +=20;

    selectedColor++;


})

// SVG
const svg = d3.select('#quizGraphSVG');

selectedColor = 0;

let masterArray = [];

Object.keys(scoreArrays).forEach(quizName => {

    var line = d3.line(scoreArrays[quizName])
        .x(quiz => x(new Date(quiz.date)))
        .y(quiz => y(quiz.score))

    svg.append("path")
        .datum(scoreArrays[quizName])
        .attr("d", line)
        .attr("transform", "translate(0, " + padding + ")")
        .attr("fill", "none")
        .attr("stroke", colors[selectedColor])
    
    selectedColor++;
    masterArray = [...masterArray, ...scoreArrays[quizName]];
});

// Add score labels:
svg.selectAll("text")
    .data(masterArray)
    .enter()
    .append("text")
    .text(d => (d.score))
    .attr('x', d => x(new Date(d.date)) + 5)
    .attr('y', d => y(d.score)+ 5)
    .attr("fill", "black")
    .style('font-size', '11px')

// Add labels with keycodes:
selectedColor = 0;

var xStart = 280;
var yStart = 20;

Object.keys(scoreArrays).forEach(quizName => {

    let lineArray = [[xStart,yStart],[xStart+15,yStart]];

    var line = d3.line(lineArray)
    svg.append("path")
       .datum(lineArray)
       .attr('d', line)
       .attr("fill", "none")
       .attr("stroke", colors[selectedColor])
       
    svg.append("text")
       .text(quizName)
       .attr('x', xStart+20)
       .attr('y', yStart+2)
       .attr("fill", "black")
       .style('font-size', '11px')

    selectedColor++;
    yStart += 20;
})

// Axes (must be added last)
svg.append('g')
    .attr("transform", "translate(" + padding + ", " + padding + ")")
    .call(yAxis)
 
svg.append('g')
    .attr("transform", "translate(0," + (height - padding) + ")")
    .call(xAxis)

let stage = document.getElementById('quizGraph');

var scaleX = stage.offsetWidth / canvas.width;
var scaleY = 1.0;

var scaleToFit = Math.min(scaleX, scaleY);
var scaleToCover = Math.max(scaleX, scaleY);

// stage.style.transformOrigin = top;
stage.style.transform = 'scale(' + scaleToCover + ') translateY(' + scaleToCover*0.3*scaleToCover + 'in)';
