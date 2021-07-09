//Visualization for Section 3; Poet's Statistics (Right Side)

let poetBar = function(){

    //--------PROPERTIES--------
    this._selection = null;
    this._data = null;
    this._size = null;
    this._margin = null;
    this._dispatch = null;
    
    let canvasSize, filteredData, canvas;
    let bandWidth = 18;

    //--------SETTERS--------

    this.data = function(){
        if(arguments.length > 0){
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

    this.margin = function(){
        if(arguments.length > 0){
            this._margin = arguments[0];
            return this;
        } else return this._margin;
    }

    this.dispatch = function(){
        if(arguments.length > 0){
            this._dispatch = arguments[0];

            this._dispatch.on('updateBars', value => {
                filteredData = this._data.filter(d => d.poetEn == value);
                this.draw();
            })

            return this;
        } else return this._dispatch;
    }

    //--------FUNCTIONS--------

    //creating visualization
    this.draw = function(){

        //initializing canvas
        canvasSize = {
            w: this._size.w - this._margin.l - this._margin.r,
            h: this._size.h - this._margin.t - this._margin.b
        }

        if(!canvas){
            canvas = this._selection.append('g')
                .attr('transform', `translate(${this._size.w/2}, ${this._margin.t})`)
        }
        
        //drawing bars
        let poemByType = Array.from(d3.group(filteredData, d => d.categoryEn));
        
        let totalHeight = bandWidth * poemByType.length;

        let xScale = d3.scaleLinear()
            .domain([0, d3.max(poemByType, d => d[1].length)])
            .range([0, canvasSize.w/2])

        let yScale = d3.scaleBand()
            .domain(Array(poemByType.length).keys())
            .range([0, totalHeight])
            .padding(0.3)

        canvas.selectAll('.typesBar')
            .data(poemByType)
            .join('rect')
            .classed('typesBar', true)
            .attr('x', 0)
            .attr('y', (d, i) => yScale(i))
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('width', 0)
            .attr('height', yScale.bandwidth())
            .attr('fill', 'rgba(255, 255, 255, 0.3)')
            .transition()
            .duration(200)
            .attr('width', d => xScale(d[1].length));
        
        canvas.selectAll('.typesBarText')
            .data(poemByType)
            .join('text')
            .classed('typesBarText', true)
            .attr('x', d => xScale(d[1].length) + 8)
            .attr('y', (d, i) => yScale(i) + yScale.bandwidth())
            .text(d => d[1].length)
            .attr('opacity', 0.0)
            .attr('font-size', '10px')
            .transition()
            .duration(400)
            .attr('opacity', 1.0);
        
        canvas.selectAll('.barLabel')
            .data(poemByType)
            .join('text')
            .classed('barLabel', true)
            .attr('x', -6)
            .attr('y', (d, i) => yScale(i) + yScale.bandwidth()/2)
            .text(d => d[0])
            .attr('opacity', 0.0)
            .attr('font-size', '11px')
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .transition()
            .duration(400)
            .attr('opacity', 1.0);
    }
}