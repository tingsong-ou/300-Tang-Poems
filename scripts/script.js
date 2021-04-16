//Variables for timelines
const width = document.querySelector('#timelineChart').clientWidth;
const t_height = 280;
const t_size = {w: width, h:t_height}
const margin = {l: 100, t: 30, r: 100, b: 10}
const yPos = [20, 180];
const barHeight = 15;
const timelineG = d3.select('#timelineChart')
    .append('svg')
    .attr('width', t_size.w)
    .attr('height', t_size.h);


//Variables for pie chart
const p_height = 500;
const p_size = {w:width * 0.65, h:p_height}

const typesG = d3.select('#typesPieChart')
    .append('svg')
    .attr('width', p_size.w)
    .attr('height', p_size.h)

//Variables for poets list
let l_height = window.innerHeight;
if (l_height < 550) l_height = 550;
const l_size = {w:width * 0.65, h:l_height};
const l_margin = {l: 50, t: 50, r: 30, b: 20};

const poetsG = d3.select('#poetsChart')
    .append('svg')
    .attr('width', l_size.w)
    .attr('height', l_size.h)

Promise.all([
    d3.csv('data/timeline-world.csv'),
    d3.csv('data/timeline-tang.csv'),
    d3.csv('data/poets.csv'),
    d3.csv('data/poems.csv')
]).then(function(data){

    let world = data[0];
    let tang = data[1];
    let poets = data[2];
    let poems = data[3];

    poems.forEach(d => {
        d.categoryEn = d.categoryEn.trim();
        d.categoryCh = d.categoryCh.trim();
    });

    //CREATING TIMELINE CHART
    //REFER TO timeline.js
    let worldTimeline = new timeline();
    worldTimeline.selection(timelineG)
        .data(world)
        .margin(margin)
        .size(t_size)
        .ypos(yPos[0])
        .barHeight(barHeight)
        .draw();

    let tangTimeline = new timeline();
    tangTimeline.selection(timelineG)
        .data(tang)
        .margin(margin)
        .size(t_size)
        .ypos(yPos[1])
        .barHeight(barHeight)
        .delay(500)
        .draw();

    let callout = new calloutMark();
    callout.selection(timelineG)
        .sourceData(world)
        .targetData(tang)
        .margin(margin)
        .size(t_size)
        .ypos(yPos)
        .barHeight(barHeight)
        .draw()

    //CREATING POEM TYPES PIE CHART
    let pieChart = new typesPie();
    pieChart.selection(typesG)
        .data(poems)
        .size(p_size)
        .draw();
    
    //CREATING POETS LIST
    let poetsChart = new poetsList();
    poetsChart.selection(poetsG)
        .data(poets)
        .margin(l_margin)
        .size(l_size)
        .draw();
});