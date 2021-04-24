let poetBar = function(){
    this._selection = null;
    this._data = null;
    this._size = null;
    this._margin = null;
    this._dispatch = null;
    
    let canvasSize, filteredData, canvas;
    let bandWidth = 18;

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


    this.draw = function(){

        canvasSize = {
            w: this._size.w - this._margin.l - this._margin.r,
            h: this._size.h - this._margin.t - this._margin.b
        }

        if(!canvas){
            canvas = this._selection.append('g')
                .attr('transform', `translate(${this._size.w/2}, ${this._margin.t})`)
        }
        
        let poemByType = Array.from(d3.group(filteredData, d => d.categoryCh));
        
        let totalHeight = bandWidth * poemByType.length;

        let yScale = d3.scaleBand()
            .domain(Array(poemByType.length).keys())
            .range([0, totalHeight])
            .padding(0.3)

        let xScale = d3.scaleLinear()
            .domain([0, d3.max(poemByType, d => d[1].length)])
            .range([0, canvasSize.w/2])

        canvas.selectAll('.typeBars')
            .data(poemByType)
            .join('rect')
            .classed('typeBars', true)
            .attr('x', 0)
            .attr('y', (d, i) => yScale(i))
            .attr('width', 0)
            .attr('height', yScale.bandwidth())
            .attr('fill', 'steelblue')
            .transition()
            .duration(200)
            .attr('width', d => xScale(d[1].length))
    }
}