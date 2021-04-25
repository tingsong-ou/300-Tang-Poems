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

//Variables for poet bar chart
let b_height = 220;
let b_width = document.querySelector('#info').clientWidth;
const b_size = {w: b_width, h: b_height};
const b_margin = {l: 40, t: 20, r: 40, b: 20};
const b_dispatch = d3.dispatch('updateBars');

const poetBarsG = d3.select('#poetBars')
    .append('svg')
    .attr('width', b_width)
    .attr('height', b_height);

//Variables for the poem show room
const s_height = 500;
const s_width = 500;
const s_size = {w: s_width, h: s_height};
const s_margin = {l: 10, t: 10, r: 10, b: 10};
const s_dispatch = d3.dispatch('updateChart')

const poemsG = d3.select('#poemsShowRoom')
    .append('svg')
    .attr('width', s_size.w)
    .attr('height', s_size.h)


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
        d.poetCh = d.poetCh.trim();
        d.poetEn = d.poetEn.trim();
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

    //INITIALIZING POET BARS
    let poetWorkTypes = new poetBar();

    poetWorkTypes.selection(poetBarsG)
        .data(poems)
        .margin(b_margin)
        .size(b_size)
        .dispatch(b_dispatch);
        //.draw();

    //CREATING POEM FILTER
    let mode = 'types';
    updateMenu(poems);
    let poemSel = new poemSelector();

    poemSel.selection(poemsG)
        .size(s_size)
        .data(poems)
        .dispatch(s_dispatch)
        .draw();


    //Updating menu
    d3.select('#options').on('change', function(){
        let value = d3.select(this).property('value')
        s_dispatch.call('updateChart', this, value, mode);
    })

    d3.selectAll('.mode').on('click', function(){
        d3.selectAll('.active').classed('active', false);
        let active = d3.select(this);
        active.classed('active', true);
        mode = active.property('value');

        updateMenu(poems, mode);

        //get the first value of the updated menu

        let opts = document.getElementById('options');
        let value = opts.options[opts.selectedIndex].value;

        s_dispatch.call('updateChart', this, value, mode);
    })

});

//------------------

function updateMenu(data, mode='types'){
    let list = [];

    if(mode == 'types'){
        list = Array.from(new Set(data.map(d => d.categoryEn + ' - ' + d.categoryCh)));
    } else {
        list = Array.from(new Set(data.map(d => d.poetEn + ' - ' + d.poetCh)))
    }

    let options = d3.select('#options');
    options.selectAll('.items')
        .data(list)
        .join('option')
        .classed('items', true)
        .text(d => d)
        .attr('value', d => d.split(' - ')[0])
        .property('selected', d => {
            if(d == list[0]) return d
        })
}