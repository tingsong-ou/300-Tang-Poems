//Visualization for Section 3; Poets List

let poetsList = function(){

    //--------PROPERTIES--------
    this._data = null;
    this._selection = null;
    this._size = null;
    this._margin = null;
    this._colorScale = null;
    this._canvasSize = null;
    let canvas = null;
    let xScale, yScale;  
    
    //--------SETTERS--------

    this.data = function(){
        if (arguments.length > 0){
            this._data = arguments[0];
            return this;
        } else return this._data;
    }

    this.selection = function(){
        if (arguments.length > 0){
            this._selection = arguments[0];
            return this;
        } else return this._selection;
    }

    this.size = function(){
        if (arguments.length > 0){
            this._size = arguments[0];
            return this;
        } else return this._size;
    }

    this.margin = function(){
        if (arguments.length > 0){
            this._margin = arguments[0];
            return this;
        } else return this._margin;
    }

    this.dispatch = function(){
        if(arguments.length > 0){
            this._dispatch = arguments[0];

            this._dispatch.on('expandPoets', () => {
                this.drawPoets();
            })

            return this;
        } else return this._dispatch;
    }

    //--------FUNCTIONS--------

    //creating visualizaton
    this.draw = function(){
        let [range, poets] = this.dataProcess();
        this._canvasSize = {w: this._size.w - this._margin.l - this._margin.r,
            h: this._size.h - this._margin.t - this._margin.b};
        
        canvas = this._selection.append('g')
            .attr('transform', `translate(${this._margin.l}, ${this._margin.t})`);
        
        xScale = d3.scaleLinear()
            .domain(range)
            .range([0, this._canvasSize.w]);

        yScale = d3.scaleBand()
            .domain(poets)
            .range([10, this._canvasSize.h])
            .padding(0.25);

        this.drawAxisX(xScale); //Only create axix when first loading the page
    }

    //processing data
    this.dataProcess = function(){
        this._data.sort((a, b) => a.born - b.born);
        let min = d3.min(this._data.map(d => +d.born)) - 5;
        let max = d3.max(this._data.map(d => +d.death)) + 25;
        let range = [min, max];
        let names = this._data.map(d => d.poetEn);
        return [range, names]
    }

    //placing axis
    this.drawAxisX = function(xScale){
        let axis = d3.axisTop(xScale)
            .tickSize(-this._canvasSize.h)
            .tickSizeOuter(0)

        let axisG = canvas.selectAll('.axisX')
            .data([0])
            .join('g')
            .classed('axisX', true)
            .call(axis);
    }

    //creating complete poet list
    this.drawPoets = function(){

        let rects = canvas.selectAll('.poetsRect')
            .data(this._data);
        
        rects.join('rect')
            .classed('poetsRect', true)
            .attr('x', 0)
            .attr('y', d => yScale(d.poetEn))
            .attr('width', 10)
            .attr('height', yScale.bandwidth())
            .attr('fill', d =>{
                if (d.poetEn == 'DU Qiuniang') return colorPalatte[0];
                else return colorPalatte[6];
            })
            .transition()
            .duration(500)
            .attr('x', d => xScale(+d.born))
            .delay((d, i) => i* 20)
            .transition()
            .duration(500)
            .attr('width', d => xScale(+d.death) - xScale(+d.born));
        
        let names = canvas.selectAll('.poetsName')
            .data(this._data);
        
        names.join('text')
            .classed('poetsName', true)
            .attr('x', d => xScale(+d.death) + 10)
            .attr('y', d => yScale(d.poetEn) + yScale.bandwidth()/2 + 1)
            .style('dominant-baseline', 'middle')
            .text(d => d.poetEn + ' - ' + d.poetCh)
            .attr('opacity', 0)
            .style('font-size', d => {
                if (this._canvasSize.h < 600) return '9px';
                else return '11px'
            })
            .transition()
            .duration(700)
            .delay((d, i) => i * 20 + 1000)
            .attr('opacity', 1.0)
        
        this.rectHover();
    }

    //interactive(hover) function
    this.rectHover = function(){
        d3.selectAll('.poetsRect').on('mouseover', function(e){

            let data = d3.select(this).data()[0];
            let value = data.poetEn;

            d3.selectAll('.poetsRect').attr('stroke-width', 1);
            d3.select(this).attr('stroke-width', '2px');

            d3.selectAll('.poetsName').style('font-weight', d => {
                if (d.poetEn === value) return 800;
                else return 100;
                })
                .attr('font-size', d => {
                    if (d.poetEn === value) return '12px';
                    else return '11px';
                });
            
            //generating poet introduction
            let html;

            if(data.img == 1) {html = `<h3>${data.poetEn}</h3><h3>${data.poetCh}</h3><img src="data/photos/${data.poetEn}.jpg" height="200px"><h3>${data.born} - ${data.death}</h3>
            <p>${data.introduction}</p><p>Source Link: <a href="${data.link}">${data.link}</a></p>`}
            else {html = `<h3>${data.poetEn}</h3><h3>${data.poetCh}</h3><img src="data/photos/noImage.jpg" height="200px"><h3>${data.born} - ${data.death}</h3>
            <p>${data.introduction}</p><p>Source Link: <a href="${data.link}">${data.link}</a></p>`};
            
            d3.select('.poetsIntro #info').html(html);

            //Use current data point to generate statistic barchart
            b_dispatch.call('updateBars', this, value);
        })
    }
}

