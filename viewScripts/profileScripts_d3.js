var scoreArrays = JSON.parse(document.getElementById('scoreArrays').innerText);
var lowestDate = 0, highestDate = 0, lowestScore = Infinity, highestScore = 0;

var height = 200;
var width = 640;
var padding = 10;

colors = ["red","orange","yellow","green","blue","indigo","violet"]

Object.keys(scoreArrays).forEach((quizName, index) => {
    scoreArrays[quizName].forEach((entry, index2) => {
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
Object.keys(scoreArrays).forEach(quizName => {

    ctx.strokeStyle = colors[selectedColor];
    ctx.lineCap = "round";
    ctx.font = '12px Times New Roman';
    ctx.beginPath();
    // ctx.moveTo(10, height-10);

    scoreArrays[quizName].forEach(quiz => {
        let xScaled = x(new Date(quiz.date));
        let yScaled = y(quiz.score);
        // console.log(quizName + ": xScaled=" + xScaled + ",yScaled=" + yScaled);
        ctx.lineTo(xScaled, yScaled+10);
        ctx.fillText(quiz.score, xScaled-10, yScaled+5);

    })


    ctx.moveTo(width-160, labelHeight - 5);
    ctx.lineTo(width-150, labelHeight - 5);
    ctx.stroke();

    ctx.fillText(quizName, width-140, labelHeight);
    labelHeight +=20;

    selectedColor++;


})

// SVG
const svg = d3.select('#quizGraphSVG');
svg.append('g')
   .attr("transform", "translate(" + padding + ", " + padding + ")")
   .call(yAxis)

svg.append('g')
   .attr("transform", "translate(0," + (height - padding) + ")")
   .call(xAxis)

selectedColor = 0;

Object.keys(scoreArrays).forEach(quizName => {

    // var xScaled = x(new Date(quiz.date));
    // var yScaled = y(quiz.score);
    var line = d3.line(scoreArrays[quizName])
        .x(quiz => x(new Date(quiz.date)))
        .y(quiz => y(quiz.score))
    


    svg.append("path")
        .datum(scoreArrays[quizName])
        .attr("d", line)
        .attr("transform", "translate(0, " + padding + ")")
        .attr("fill", "none")
        .attr("stroke", colors[selectedColor]);

    // svg.selectAll("text")
    //     .data(scoreArrays[quizName])
    //     .enter()
    //     .append("text")
    //     .text(quiz => (quiz.score))
    //     .attr("x", quiz => x(new Date(quiz.date)))
    //     .attr("y", quiz => y(quiz.score))
    //     .attr("fill", "black");
    
    selectedColor++;
});

// let quizGraphSVG = document.getElementById('quizGraphSVG');

// Object.keys(scoreArrays).forEach(quizName => {

//     scoreArrays[quizName].forEach(quiz => {
//         let label = document.createElement('text');
//         label.setAttribute('x', x(new Date(quiz.date)));
//         label.setAttribute('y', y(quiz.score));
//         label.setAttribute('fill', 'black');
//         label.innerText = quiz.score;

//         quizGraphSVG.append(label);
//     })
// })
