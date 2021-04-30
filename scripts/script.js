const colorOpacity = 0.8;
const colorPalatte = [
    `rgba(235,83,36, ${colorOpacity})`, //Jasper Red
    `rgba(245,142,132, ${colorOpacity})`,//Coral Red
    `rgba(253,191,104, ${colorOpacity})`,//Cream Yellow
    `rgba(252,199,155, ${colorOpacity})`,//Light Pinkish Cinnamon
    `rgba(193,196,148, ${colorOpacity})`,//Olive Buff
    `rgba(137,177,134, ${colorOpacity})`,//Chromium Buff
    `rgba(91,130,179, ${colorOpacity})`,//Olympic Blue
    `rgba(165,200,209, ${colorOpacity})`,//Light Glaucous Blue
    `rgba(185,132,175, ${colorOpacity})`,//Lilac
    `rgba(181,176,216, ${colorOpacity})`,//Grayish Lavender
    `rgba(245,142,132, ${colorOpacity})`,//Hermosa Pink
]

//Animation trigger
const aniDispatch = d3.dispatch('expandBars', 'expandMarks', 'expandPoets');

//Variables for timeline chart (Section 1)
const width = document.querySelector('#timelineChart').clientWidth;
const t_height = 280;
const t_size = {w: width, h:t_height};
const margin = {l: 100, t: 30, r: 100, b: 10};
const yPos = [20, 180];
const barHeight = 15;
const t_tooltip = d3.select('#timelineChart')
    .append('div')
    .classed('tooltip', true)
    .style('visibility', 'hidden');

const timelineG = d3.select('#timelineChart')
    .append('svg')
    .attr('width', t_size.w)
    .attr('height', t_size.h);


//Variables for pie chart (Section 2)
const p_height = 500;
const p_size = {w:width * 0.65, h:p_height};

const typesG = d3.select('#typesPieChart')
    .append('svg')
    .attr('width', p_size.w)
    .attr('height', p_size.h);


//Variables for poets list (Section 3, major)
let l_height = window.innerHeight;
if (l_height < 550) l_height = 550;
const l_size = {w:width * 0.65, h:l_height};
const l_margin = {l: 50, t: 50, r: 30, b: 20};

const poetsG = d3.select('#poetsChart')
    .append('svg')
    .attr('width', l_size.w)
    .attr('height', l_size.h);


//Variables for poet bar chart (Section 3, intro bar)
let b_height = 220;
let b_width = document.querySelector('#info').clientWidth;
const b_size = {w: b_width, h: b_height};
const b_margin = {l: 40, t: 20, r: 40, b: 20};
const b_dispatch = d3.dispatch('updateBars');

const poetBarsG = d3.select('#poetBars')
    .append('svg')
    .attr('width', b_width)
    .attr('height', b_height);


//Variables for the poem show room (Section 4, poem selector)
const s_height = 410;
const s_width = 410;
const s_size = {w: s_width, h: s_height};
const s_margin = {l: 10, t: 10, r: 10, b: 10};
const s_dispatch = d3.dispatch('updateChart');

const poemsG = d3.select('#selGraph')
    .append('svg')
    .attr('width', s_size.w)
    .attr('height', s_size.h)
    .attr('opacity', 1.0);


//--------VISUALIZATION--------

Promise.all([
    d3.csv('data/timeline-world.csv'),
    d3.csv('data/timeline-tang.csv'),
    d3.csv('data/poets.csv'),
    d3.csv('data/poems.csv'),
    d3.csv('data/category.csv')
]).then(function(data){

    let world = data[0];
    let tang = data[1];
    let poets = data[2];
    let poems = data[3];
    let category = data[4];

    poems.forEach(d => {
        d.categoryEn = d.categoryEn.trim();
        d.categoryCh = d.categoryCh.trim();
        d.poetCh = d.poetCh.trim();
        d.poetEn = d.poetEn.trim();
    });


    //CREATING TIMELINE CHART (SECTION 1)
    //REFER TO script/timeline.js
    let worldTimeline = new timeline();
    let timelineWorld = timelineG.append('g');
    worldTimeline.selection(timelineWorld)
        .data(world)
        .margin(margin)
        .size(t_size)
        .ypos(yPos[0])
        .barHeight(barHeight)
        .draw();

    let tangTimeline = new timeline();
    let timelineTang = timelineG.append('g');
    tangTimeline.selection(timelineTang)
        .data(tang)
        .margin(margin)
        .size(t_size)
        .ypos(yPos[1])
        .barHeight(barHeight)
        .delay(500)
        .hover(true)
        .tooltip(t_tooltip)
        .dispatch(aniDispatch);

    let callout = new calloutMark();
    let timelineCallout = timelineG.append('g');
    callout.selection(timelineCallout)
        .sourceData(world)
        .targetData(tang)
        .margin(margin)
        .size(t_size)
        .ypos(yPos)
        .barHeight(barHeight)
        .dispatch(aniDispatch);


    //CREATING POEM TYPES PIE CHART (SECTION 2)
    //REFER TO script/typespie.js
    let pieChart = new typesPie();
    pieChart.selection(typesG)
        .data(poems)
        .intro(category)
        .size(p_size)
        .draw();
    
    
    //CREATING POETS LIST (SECTION 3)
    //REFER TO script/poets.js
    let poetsChart = new poetsList();
    poetsChart.selection(poetsG)
        .data(poets)
        .margin(l_margin)
        .size(l_size)
        .dispatch(aniDispatch)
        .draw();

    let poetWorkTypes = new poetBar();

    poetWorkTypes.selection(poetBarsG)
        .data(poems)
        .margin(b_margin)
        .size(b_size)
        .dispatch(b_dispatch);


    //CREATING POEM SELECTOR (SECTION 4)
    //REFER TO script/poems.js
    let mode = 'types';
    updateMenu(poems);
    let poemSel = new poemSelector();

    poemSel.selection(poemsG)
        .size(s_size)
        .data(poems)
        .dispatch(s_dispatch)
        .draw();

    
    //UPDATING POEMS BY DROPDOWN MENU
    d3.select('#options').on('change', function(){
        let value = d3.select(this).property('value')
        if(mode != 'poems') s_dispatch.call('updateChart', this, value, mode);
        else{
            let poemData = poems.filter(d => d.title == value)[0];

            // //poem html - Chinese
            let titleCh = `<h3>${poemData.titleCh.trim()}<h3>`;
            let poetCh = `<p><b>${poemData.poetCh}</b></p>`;
            let bodyCh = `<p>${poemData.ch.trim()}</p>`;

            //poem html - English
            let titleEn = `<h3>${poemData.title.trim()}<h3>`;
            let poetEn = `<p><b>${poemData.poetEn}</b></p>`;
            let bodyEn = `<p>${poemData.en.trim()}</p>`;

            d3.select('#poemCh')
                .html(titleCh+poetCh+bodyCh)

            d3.select('#poemEn')
                .html(titleEn+poetEn+bodyEn)
        }
    })

    d3.selectAll('.mode').on('click', function(){

        d3.selectAll('.active').classed('active', false);
        d3.selectAll('.inactive').attr('visibility', 'hidden');
        d3.select('.switch').attr('opacity', 1);
        
        let active = d3.select(this);
        active.classed('active', true);
        mode = active.property('value');

        updateMenu(poems, mode);

        let opts = document.getElementById('options');
        let value = opts.options[opts.selectedIndex].value;
        
        if(mode != 'poems') s_dispatch.call('updateChart', this, value, mode);
        else{
            d3.select('.switch').attr('opacity', 0.3)

            let mask = poemsG.selectAll('.inactive')
                .data([0])
                .join('g')
                .classed('inactive', true)
                .attr('transform', `translate(${s_size.w/2}, ${s_size.h/2})`)
            
            mask.selectAll('.inactive')
                .data([0])
                .join('rect')
                .classed('inactive', true)
                .classed('mask', true)
                .attr('x', -225)
                .attr('y', -225)
                .attr('width', 450)
                .attr('height', 450)
                .attr('opacity', 0)
                .attr('visibility', 'visible');
            
            mask.selectAll('.inactive .info')
                .data([0])
                .join('text')
                .classed('inactive', true)
                .classed('info', true)
                .attr('x', 0)
                .attr('y', 0)
                .text('NOT AVALIABLE')
                .attr('font-weight', 800)
                .attr('text-anchor', 'middle')
                .attr('visibility', 'visible');
        }
    })


    //INITIALIZING SCROLL TRIGGER
    let aniTrigger = new ScrollActions();
    aniTrigger.dispatch(aniDispatch);
    aniTrigger.trigger();

});

//--------FUNCTION--------

//UPDATING DROPDOWN MENU
function updateMenu(data, mode='types'){
    let list = [];

    if(mode == 'types'){
        list = Array.from(new Set(data.map(d => d.categoryEn + ' - ' + d.categoryCh)));
    } else if (mode == 'poets'){
        list = Array.from(new Set(data.map(d => d.poetEn + ' - ' + d.poetCh)));
    } else if (mode == 'poems'){
        list = Array.from(new Set(data.map(d => {
            if(d) return d.title + ' - ' + d.titleCh;
        })));
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
        });
}