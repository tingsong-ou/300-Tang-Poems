let poemSelector = function(){

    this._data = null;
    this._selection = null;
    this._size = null;
    
    let filteredData = null;


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
        this.processData();
        let defaultData = filteredData[0];
        let core = [defaultData[0], defaultData[1]];
        
        let canvas = this._selection.append('g');
        canvas.attr('transform', `translate(${this._size.w/2}, ${this._size.h/2})`)
        //console.log(filteredData)
        //console.log(this._selection.attr('width'))

        console.log(defaultData)
        let branchData = Array.from(d3.group(defaultData[2], d => d.poetEn));
        
        let xScale = d3.scaleBand()
            .domain(branchData.map(d => d[0]))
            .range([0, 2 * Math.PI]);
        
        console.log(branchData)

        let yScale = d3.scaleSqrt()
            .domain(d3.extent(branchData, d => d[1].length))
            .range([80, 140]);

        console.log(yScale.domain())
        
        let branchG = canvas.selectAll('.branch')
            .data(branchData)
            .join('g')
            .call((g, d) => {

                g.append('line')
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('x2', d => Math.cos(xScale(d[0])) * yScale(d[1].length))
                    .attr('y2', d => Math.sin(xScale(d[0])) * yScale(d[1].length))
                    .attr('stroke', 'black');

                g.append('circle')
                    .attr('cx', d => Math.cos(xScale(d[0])) * yScale(d[1].length))
                    .attr('cy', d => Math.sin(xScale(d[0])) * yScale(d[1].length))
                    .attr('r', 8)
                    .attr('fill', 'white')
                    .attr('stroke', 'black');
            });

    }

    this.processData = function(mode = "poets"){
        if(mode == 'poets'){
            filteredData = Array.from(d3.group(this._data, d => d.categoryEn));
            filteredData.forEach(d => {
                let categoryCh = d[1][0].categoryCh;
                d.splice(1, 0, categoryCh)
            })
        }
    }
}