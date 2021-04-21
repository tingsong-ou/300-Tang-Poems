let poemSelector = function(){

    this._data = null;
    this._selection = null;
    this._size = null;
    
    let filteredData = null;
    let xScale = null;
    let yScale = null;


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


    //---------------------
    this.draw = function(){
        if(!filteredData){
            this.processData();
            filteredData = filteredData[10];
        }
        let core = [filteredData[0], filteredData[1]];
        
        let canvas = this._selection.append('g');
        canvas.attr('transform', `translate(${this._size.w/2}, ${this._size.h/2})`)

        let branchData = Array.from(d3.group(filteredData[2], d => d.poetEn));
        
        xScale = d3.scaleBand()
            .domain(branchData.map(d => d[0]))
            .range([-Math.PI/2, 1.5 * Math.PI]);
        
        yScale = d3.scaleSqrt()
            .domain(d3.extent(branchData, d => d[1].length))
            .range([60, 120]);
        
        let branchG = canvas.selectAll('.branch')
            .data(branchData)
            .join('g')
            .classed('branch', true)
            .call(g => {
                g.append('line')
                    .classed('branchLine', true)
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('x2', 0)
                    .attr('y2', 0)
                    .attr('stroke', 'black')
                    .transition()
                    .duration(500)
                    .attr('x2', d => Math.cos(xScale(d[0])) * yScale(d[1].length))
                    .attr('y2', d => Math.sin(xScale(d[0])) * yScale(d[1].length));

                g.append('circle')
                    .classed('branchCircle', true)
                    .attr('cx', 0)
                    .attr('cy', 0)
                    .attr('r', 2)
                    .attr('fill', 'white')
                    .attr('stroke', 'black')
                    .transition()
                    .duration(500)
                    .attr('r', 7)
                    .attr('cx', d => Math.cos(xScale(d[0])) * yScale(d[1].length))
                    .attr('cy', d => Math.sin(xScale(d[0])) * yScale(d[1].length));
            });

        this.branchCircleHover(branchG);
    }

    this.processData = function(mode = "types"){
        if(mode == 'types'){
            filteredData = Array.from(d3.group(this._data, d => d.categoryEn));
            filteredData.forEach(d => {
                let categoryCh = d[1][0].categoryCh;
                d.splice(1, 0, categoryCh)
            })
        } else if (mode == 'poets'){
            filteredData = Array.from(d3.group(this.data, d => 0))
        }
    }

    this.branchCircleHover = function(branchG){
        d3.selectAll('.branchCircle').on('mouseover', function(e){
            
            let leaveData = d3.select(this).data()[0];
            let radians = xScale(leaveData[0]);
            let leaveNum = leaveData[1].length;
            let offRange = [];

            if (leaveNum >= 5) offRange = [-Math.PI/4, Math.PI/4];
            else if (leaveNum < 5 && leaveNum > 2) offRange = [-Math.PI/6, Math.PI/6];
            else if (leaveNum == 2) offRange = [-Math.PI/8, Math.PI/8];
            else if (leaveNum == 1) offRange = [-0, 0];

            let xPos = Math.cos(radians) * yScale(leaveData[1].length);
            let yPos = Math.sin(radians) * yScale(leaveData[1].length);

            let leavesScaleX = d3.scaleBand()
                .domain(Array(leaveNum).keys())
                .range(offRange);

            let leavesG = branchG.selectAll('.leave')
                .data([1])
                .join('g')
                .attr('transform', `translate(${xPos}, ${yPos})`);
            
            leavesG
                .classed('leave', true)
                .call(g => {
                    g.selectAll('.poemLine')
                        .data(leaveData[1])
                        .join('line')
                        .classed('poemLine',true)
                        .attr('x1', (d, i) => xCoord(i, 7))
                        .attr('y1', (d, i) => yCoord(i, 7))
                        .attr('x2', (d, i) => xCoord(i, 7))
                        .attr('y2', (d, i) => yCoord(i, 7))
                        .transition()
                        .duration(300)
                        .attr('x2', (d, i) => xCoord(i, 100))
                        .attr('y2', (d, i) => yCoord(i, 100))
                        .attr('stroke', 'steelblue')
                })
                .call(g => {
                    g.selectAll('.poemCircle')
                        .data(leaveData[1])
                        .join('circle')
                        .classed('poemCircle',true)
                        .attr('cx', 0)
                        .attr('cy', 0)
                        .attr('r', 0)
                        .transition()
                        .duration(300)
                        .attr('r', 8)
                        .attr('cx', (d, i) => xCoord(i, 95))
                        .attr('cy', (d, i) => yCoord(i, 95))
                        .attr('stroke', 'steelblue')
                        .attr('fill', 'white')
                })
            
            function xCoord(i, r) {
                return Math.cos(radians + leavesScaleX(i) + leavesScaleX.bandwidth()/2) * r;
            }

            function yCoord(i, r) {
                return Math.sin(radians + leavesScaleX(i) + leavesScaleX.bandwidth()/2) * r;
            }
        })
    }
}