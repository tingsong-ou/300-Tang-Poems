//Visualization for Section 4; Poem Selector

let poemSelector = function(){

    //--------PROPERTIES--------
    this._data = null;
    this._selection = null;
    this._size = null;
    this._dispatch = null;
    
    let filteredData = null;
    let xScale = null;
    let yScale = null;
    let canvas = null;

    //--------SETTERS--------

    this.data = function(){
        if (arguments.length > 0){
            this._data = arguments[0];
            return this;
        } else return this._data;
    }

    this.selection = function(){
        if(arguments.length > 0){
            this._selection = arguments[0];
            return this;
        } else return this._selection;
    }

    this.size = function(){
        if(arguments.length > 0){
            this._size = arguments[0];
            return this;
        } else return this._size;
    }

    this.dispatch = function(){
        if(arguments.length > 0){
            this._dispatch = arguments[0];
            
            this._dispatch.on('updateChart', (value, mode) => {
                this.processData(mode);
                filteredData = filteredData.filter(d => d[0] == value)[0];
                canvas.selectAll('.leave').remove()
                this._hover = true;
                this.draw(mode);
            })
        
            return this;
        } else return this._dispatch;
    }


    //--------FUNCTIONS--------

    //creating visualization 
    this.draw = function(mode = 'types'){

        //processing data
        if(!filteredData){
            this.processData();
            filteredData = filteredData[0];
        }

        if(!canvas){
            canvas = this._selection.append('g')
                .classed('switch', true)
                .attr('transform', `translate(${this._size.w/2}, ${this._size.h/2})`);
        }

        let branchData;

        if(mode == 'types') branchData = Array.from(d3.group(filteredData[2], d => d.poetEn));
        else if(mode == 'poets') branchData = Array.from(d3.group(filteredData[2], d => d.categoryEn));
        
        //creating scales
        xScale = d3.scaleBand()
            .domain(branchData.map(d => d[0]))
            .range([0, 2 * Math.PI]);

        
        yScale = d3.scaleSqrt()
            .domain(d3.extent(branchData, d => d[1].length))
            .range([45, 100]);

        //drawing lines and circles
        let branchLn = canvas.selectAll('.branchLine')
            .data(branchData)
            .join('line')
            .classed('branchLine', true)
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', 0)
            .transition()
            .duration(500)
            .attr('x2', d => Math.cos(xScale(d[0])) * (yScale(d[1].length)-7))
            .attr('y2', d => Math.sin(xScale(d[0])) * (yScale(d[1].length)-7));

        let branchCr = canvas.selectAll('.branchCircle')
            .data(branchData)
            .join('circle')
            .classed('branchCircle',true)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 2)
            .attr('fill', colorPalatte[0])
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .transition()
            .duration(500)
            .attr('r', 7)
            .attr('cx', d => Math.cos(xScale(d[0])) * yScale(d[1].length))
            .attr('cy', d => Math.sin(xScale(d[0])) * yScale(d[1].length));

        canvas.selectAll('.center')
            .data([0])
            .join('circle')
            .classed('center', true)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 3)
            .attr('fill', 'black')

        this.branchCircleHover();
        this.initialize();
    }

    //data-processing function
    this.processData = function(mode = "types"){
        if(mode == 'types'){
            filteredData = Array.from(d3.group(this._data, d => d.categoryEn));
            filteredData.forEach(d => {
                let categoryCh = d[1][0].categoryCh;
                d.splice(1, 0, categoryCh)
            })
        } else if (mode == 'poets'){
            filteredData = Array.from(d3.group(this._data, d => d.poetEn));
            filteredData.forEach(d => {
                let poetCh = d[1][0].poetCh;
                d.splice(1, 0, poetCh);
            })
        }
    }

    //initialize show room function
    this.initialize = function(){
        //Drinking Alone Under the Moon
        let poemData = this._data.filter(d => d.title == 'Drinking Alone Under the Moon')[0];

        //poem html - Chinese
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

    //interactive(hover) function
    this.branchCircleHover = function(){
        d3.selectAll('.branchCircle').on('mouseover', function(e){

            let leaf = d3.select(this);
            let leafData = leaf.data()[0];
            let radians = xScale(leafData[0]);
            let leaveNum = leafData[1].length;
            let offRange = [];

            d3.selectAll('.branchCircle')
                .attr('stroke-width', d => {
                    if(d[0] == leafData[0]) return 3
                    else return 1
                })

            //controlling blossom angles
            if (leaveNum >= 5) offRange = [-Math.PI/4, Math.PI/4];
            else if (leaveNum < 5 && leaveNum > 2) offRange = [-Math.PI/6, Math.PI/6];
            else if (leaveNum == 2) offRange = [-Math.PI/8, Math.PI/8];
            else if (leaveNum == 1) offRange = [-0, 0];

            let xPos = Math.cos(radians) * yScale(leafData[1].length);
            let yPos = Math.sin(radians) * yScale(leafData[1].length);

            let leavesScaleX = d3.scaleBand()
                .domain(Array(leaveNum).keys())
                .range(offRange);

            let leavesG = canvas.selectAll('.leave')
                .data([1])
                .join('g')
                .attr('transform', `translate(${xPos}, ${yPos})`);
            
            //blossom
            leavesG
                .classed('leave', true)
                .call(g => {
                    g.selectAll('.poemLine')
                        .data(leafData[1])
                        .join('line')
                        .classed('poemLine',true)
                        .attr('x1', (d, i) => xCoord(i, 7))
                        .attr('y1', (d, i) => yCoord(i, 7))
                        .attr('x2', (d, i) => xCoord(i, 7))
                        .attr('y2', (d, i) => yCoord(i, 7))
                        .transition()
                        .duration(300)
                        .attr('x2', (d, i) => xCoord(i, 72))
                        .attr('y2', (d, i) => yCoord(i, 72))
                        .attr('stroke', 'black')
                })
                .call(g => {
                    g.selectAll('.poemCircle')
                        .data(leafData[1])
                        .join('circle')
                        .classed('poemCircle',true)
                        .attr('cx', 0)
                        .attr('cy', 0)
                        .attr('r', 0)
                        .transition()
                        .duration(300)
                        .attr('r', 8)
                        .attr('cx', (d, i) => xCoord(i, 80))
                        .attr('cy', (d, i) => yCoord(i, 80))
                        .attr('stroke', 'black')
                        .attr('stroke-width', 1)
                        .attr('fill', colorPalatte[2])
                })

            //legend
            let script = canvas.selectAll('.script')
                .data([leafData[0]])
                .join('text')
                .classed('script', true)
                .attr('x', 0)
                .attr('y', 200)
                .attr('text-anchor', 'middle')
                .text(d => d)
            
            //poping up selected poems
            d3.selectAll('.poemCircle').on('mouseover', function(e){

                d3.selectAll('.poemCircle')
                    .attr('stroke-width', 1)

                let circle = d3.select(this);
                let poemData = circle.data()[0];
                circle.attr('stroke-width', 3);

                //poem html - Chinese
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
            });

            //polar coordinate functions
            function xCoord(i, r) {
                return Math.cos(radians + leavesScaleX(i) + leavesScaleX.bandwidth()/2) * r;
            }

            function yCoord(i, r) {
                return Math.sin(radians + leavesScaleX(i) + leavesScaleX.bandwidth()/2) * r;
            }
        })
    }
}